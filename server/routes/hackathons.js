import express from 'express'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { protect, adminOnly } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { writeLimiter, adminExportLimiter } from '../middleware/security.js'
import { csvCell } from '../services/csv.js'
import { writeAdminAudit } from '../services/adminSecurity.js'
import Hackathon from '../models/Hackathon.js'
import HackathonTeam from '../models/HackathonTeam.js'
import HackathonRegistration from '../models/HackathonRegistration.js'
import HackathonSubmission from '../models/HackathonSubmission.js'
import HackathonAnnouncement from '../models/HackathonAnnouncement.js'
import { createUploadUrl, createDownloadUrl, getStoredObjectMetadata, deleteStoredObject, r2Configured, validateUpload } from '../services/storage/r2.js'

const router = express.Router()
const send = (res, data, status = 200, extra = {}) => res.status(status).json({ success: true, data, ...extra })
const fail = (res, status, message, code) => res.status(status).json({ success: false, message, code })
const id = (value) => String(value)
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90)
const isManager = (req, hackathon) => req.user.role === 'admin' || id(hackathon.createdBy) === id(req.user._id)
const managerOnly = asyncHandler(async (req, res, next) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug })
  if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  if (!isManager(req, hackathon)) return fail(res, 403, 'Organizer access required.', 'FORBIDDEN')
  req.hackathon = hackathon
  next()
})
const validPayload = (schema, req, res) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const fields = Object.fromEntries(result.error.issues.map(issue => [issue.path.join('.'), issue.message]))
    res.status(422).json({ success: false, message: 'Please correct the highlighted fields.', code: 'VALIDATION_ERROR', fields })
    return null
  }
  return result.data
}
async function removeMemberFromTeam(hackathonId, userId) {
  const team = await HackathonTeam.findOne({ hackathonId, members: userId })
  if (!team) return
  const remainingMembers = team.members.filter(member => id(member) !== id(userId))
  if (remainingMembers.length) {
    if (id(team.leader) === id(userId)) team.leader = remainingMembers[0]
    team.members = remainingMembers
    await team.save()
  } else {
    await HackathonSubmission.deleteMany({ teamId: team._id })
    await HackathonTeam.deleteOne({ _id: team._id })
  }
}
const hackathonInput = z.object({
  title: z.string().trim().min(3).max(180), description: z.string().trim().min(1).max(12000),
  slug: z.string().trim().min(2).max(90).regex(/^[a-z0-9-]+$/).optional(), logo: z.string().max(500).optional(),
  organiser: z.string().max(180).optional(), organiserEmail: z.string().email().or(z.literal('')).optional(),
  mode: z.enum(['Virtual', 'Hybrid', 'In Person']).optional(), isFree: z.boolean().optional(), fee: z.number().min(0).optional(),
  registrationStart: z.coerce.date().optional(), registrationDeadline: z.coerce.date().optional(), startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional(),
  domains: z.array(z.object({ domainId: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(100), description: z.string().max(2000).optional(), sampleProblemStatements: z.array(z.string().max(1000)).max(30).optional(), domainDeadline: z.coerce.date().optional(), teamSizeMin: z.number().int().min(1).max(20).optional(), teamSizeMax: z.number().int().min(1).max(20).optional(), seatsTotal: z.number().int().min(0).optional(), prizes: z.string().max(1000).optional() })).max(30).optional(),
  rounds: z.array(z.object({ roundId: z.string().optional(), title: z.string().max(180), description: z.string().max(2000).optional(), startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional() })).max(30).optional(),
  eligibility: z.string().max(5000).optional(), rules: z.string().max(10000).optional(), timeline: z.string().max(5000).optional(),
  status: z.enum(['draft', 'published', 'registration_open', 'live', 'ended', 'results_published']).optional(), isPublished: z.boolean().optional(),
}).strict()
const httpUrl = z.string().url().refine(value => /^https?:\/\//i.test(value), 'URL must use HTTP or HTTPS')
const submissionInput = z.object({ title: z.string().trim().min(2).max(180), description: z.string().max(10000).optional(), techStack: z.array(z.string().max(60)).max(30).optional(), repoUrl: httpUrl.or(z.literal('')).optional(), demoUrl: httpUrl.or(z.literal('')).optional(), videoUrl: httpUrl.or(z.literal('')).optional() }).strict()
const uploadInput = z.object({ fileName: z.string().min(1).max(255), contentType: z.string().min(1).max(150), size: z.number().int().min(1).max(20 * 1024 * 1024) }).strict()
const confirmUploadInput = uploadInput.extend({ key: z.string().min(1).max(1024) }).strict()

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1))
  const limit = Math.max(1, Math.min(50, Number.parseInt(req.query.limit, 10) || 12))
  const filter = { isPublished: true }
  const statusAliases = { Open: 'registration_open', Live: 'live', Ended: 'ended', open: 'registration_open', live: 'live', ended: 'ended' }
  if (statusAliases[req.query.status]) filter.status = statusAliases[req.query.status]
  else if (['published', 'registration_open', 'results_published'].includes(req.query.status)) filter.status = req.query.status
  if (['Virtual', 'Hybrid', 'In Person'].includes(req.query.mode)) filter.mode = req.query.mode
  const freeFilter = req.query.isFree ?? req.query.free
  if (freeFilter === 'true') filter.isFree = true
  if (freeFilter === 'false') filter.isFree = false
  if (typeof req.query.domain === 'string' && req.query.domain.length <= 100) filter['domains.domainId'] = req.query.domain
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : ''
  if (search) { const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ title: { $regex: escaped, $options: 'i' } }, { description: { $regex: escaped, $options: 'i' } }] }
  const [items, total] = await Promise.all([Hackathon.find(filter).select('-organiserEmail -createdBy').sort({ startDate: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Hackathon.countDocuments(filter)])
  send(res, items, 200, { pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } })
}))

router.get('/my/registrations', protect, asyncHandler(async (req, res) => {
  const rows = await HackathonRegistration.find({ userId: req.user._id, status: { $ne: 'cancelled' } }).populate('hackathonId', 'slug title status startDate endDate logo').populate('teamId', 'teamName inviteCode').sort({ createdAt: -1 }).lean()
  send(res, rows)
}))

router.get('/:slug/results', asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true, status: 'results_published' }).select('-organiserEmail -createdBy').lean()
  if (!hackathon) return fail(res, 404, 'Results are not available.', 'RESULTS_UNAVAILABLE')
  const submissions = await HackathonSubmission.find({ hackathonId: hackathon._id, isDraft: false }).select('title description techStack repoUrl demoUrl scores teamId domainId').populate('teamId', 'teamName').lean()
  const results = submissions.map(({ scores = [], ...submission }) => ({ ...submission, score: scores.filter(s => s.isPublished).reduce((sum, s) => sum + (s.average || 0), 0) }))
    .sort((a, b) => b.score - a.score)
  send(res, { hackathon, results })
}))

router.get('/:slug', asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true }).select('-organiserEmail -createdBy').lean()
  if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const announcements = await HackathonAnnouncement.find({ hackathonId: hackathon._id, isPublished: true }).sort({ publishedAt: -1 }).limit(20).lean()
  send(res, { ...hackathon, announcements })
}))

router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const input = validPayload(hackathonInput, req, res); if (!input) return
  const slug = input.slug || slugify(input.title)
  if (input.domains?.some(domain => domain.teamSizeMin && domain.teamSizeMax < domain.teamSizeMin)) return fail(res, 422, 'Maximum team size must be at least minimum team size.', 'VALIDATION_ERROR')
  const hackathon = await Hackathon.create({ ...input, slug, createdBy: req.user._id })
  await writeAdminAudit(req, { action: 'hackathon.created', targetType: 'hackathon', targetId: hackathon._id, afterSummary: { title: hackathon.title, slug: hackathon.slug, status: hackathon.status, isPublished: hackathon.isPublished } })
  send(res, hackathon, 201)
}))

router.put('/:slug', protect, managerOnly, asyncHandler(async (req, res) => {
  const input = validPayload(hackathonInput, req, res); if (!input) return
  if (input.domains?.some(domain => domain.teamSizeMin && domain.teamSizeMax < domain.teamSizeMin)) return fail(res, 422, 'Maximum team size must be at least minimum team size.', 'VALIDATION_ERROR')
  const before = { title: req.hackathon.title, slug: req.hackathon.slug, status: req.hackathon.status, isPublished: req.hackathon.isPublished }
  Object.assign(req.hackathon, input); await req.hackathon.save()
  await writeAdminAudit(req, { action: 'hackathon.updated', targetType: 'hackathon', targetId: req.hackathon._id, beforeSummary: before, afterSummary: { title: req.hackathon.title, slug: req.hackathon.slug, status: req.hackathon.status, isPublished: req.hackathon.isPublished } })
  send(res, req.hackathon)
}))

router.delete('/:slug', protect, managerOnly, asyncHandler(async (req, res) => {
  const summary = { title: req.hackathon.title, slug: req.hackathon.slug, status: req.hackathon.status }
  await Promise.all([HackathonRegistration.deleteMany({ hackathonId: req.hackathon._id }), HackathonTeam.deleteMany({ hackathonId: req.hackathon._id }), HackathonSubmission.deleteMany({ hackathonId: req.hackathon._id }), HackathonAnnouncement.deleteMany({ hackathonId: req.hackathon._id })])
  await req.hackathon.deleteOne()
  await writeAdminAudit(req, { action: 'hackathon.deleted', targetType: 'hackathon', targetId: req.hackathon._id, beforeSummary: summary })
  send(res, { deleted: true })
}))

router.post('/:slug/register', protect, writeLimiter, asyncHandler(async (req, res) => {
  const parsed = z.object({ domainId: z.string().trim().min(1).max(80) }).safeParse(req.body)
  if (!parsed.success) return fail(res, 422, 'Choose a valid hackathon domain.', 'VALIDATION_ERROR')
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true })
  if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const domain = hackathon.domains.find(item => item.domainId === parsed.data.domainId)
  if (!domain) return fail(res, 422, 'That domain is not available.', 'INVALID_DOMAIN')
  const now = new Date()
  if (hackathon.registrationStart && now < hackathon.registrationStart || hackathon.registrationDeadline && now > hackathon.registrationDeadline || !['registration_open', 'published'].includes(hackathon.status)) return fail(res, 409, 'Registration is closed.', 'REGISTRATION_CLOSED')
  let registration
  try {
    registration = await HackathonRegistration.create({ hackathonId: hackathon._id, userId: req.user._id, domainId: domain.domainId, participant: { name: req.user.name, email: req.user.email, college: req.user.college || '', institution: req.user.college || '', skills: [] } })
  } catch (error) {
    if (error.code === 11000) return fail(res, 409, 'You are already registered for this hackathon.', 'DUPLICATE_REGISTRATION')
    throw error
  }
  if (domain.seatsTotal > 0) {
    let reserved = false
    for (let attempt = 0; attempt < 4 && !reserved; attempt += 1) {
      const current = await Hackathon.findById(hackathon._id).select('domains').lean()
      const currentDomain = current?.domains.find(item => item.domainId === domain.domainId)
      if (!currentDomain || currentDomain.seatsTaken >= currentDomain.seatsTotal) break
      const result = await Hackathon.updateOne({ _id: hackathon._id, domains: { $elemMatch: { domainId: domain.domainId, seatsTaken: currentDomain.seatsTaken, seatsTotal: currentDomain.seatsTotal } } }, { $inc: { 'domains.$.seatsTaken': 1 } })
      reserved = result.modifiedCount === 1
    }
    if (!reserved) { await registration.deleteOne(); return fail(res, 409, 'No seats remain in this domain.', 'DOMAIN_FULL') }
  } else await Hackathon.updateOne({ _id: hackathon._id, 'domains.domainId': domain.domainId }, { $inc: { 'domains.$.seatsTaken': 1 } })
  send(res, registration, 201)
}))

router.delete('/:slug/register', protect, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const registration = await HackathonRegistration.findOneAndDelete({ hackathonId: hackathon._id, userId: req.user._id })
  if (!registration) return fail(res, 404, 'Registration not found.', 'NOT_FOUND')
  await Hackathon.updateOne({ _id: hackathon._id, domains: { $elemMatch: { domainId: registration.domainId, seatsTaken: { $gt: 0 } } } }, { $inc: { 'domains.$.seatsTaken': -1 } })
  await removeMemberFromTeam(hackathon._id, req.user._id)
  send(res, { cancelled: true })
}))

router.post('/:slug/team', protect, writeLimiter, asyncHandler(async (req, res) => {
  const parsed = z.object({ domainId: z.string().min(1).max(80), teamName: z.string().trim().min(2).max(80) }).safeParse(req.body)
  if (!parsed.success) return fail(res, 422, 'Enter a team name and domain.', 'VALIDATION_ERROR')
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const domain = hackathon.domains.find(item => item.domainId === parsed.data.domainId); if (!domain) return fail(res, 422, 'That domain is not available.', 'INVALID_DOMAIN')
  const registration = await HackathonRegistration.findOne({ hackathonId: hackathon._id, userId: req.user._id })
  if (!registration || registration.domainId !== domain.domainId) return fail(res, 403, 'Register for this domain before creating a team.', 'REGISTRATION_REQUIRED')
  if (await HackathonTeam.exists({ hackathonId: hackathon._id, members: req.user._id })) return fail(res, 409, 'You already belong to a team.', 'ALREADY_IN_TEAM')
  let team
  try {
    team = await HackathonTeam.create({ hackathonId: hackathon._id, domainId: domain.domainId, teamName: parsed.data.teamName, inviteCode: randomBytes(6).toString('hex').toUpperCase(), leader: req.user._id, members: [req.user._id], maxSize: domain.teamSizeMax || 4 })
  } catch (error) {
    if (error.code === 11000) return fail(res, 409, 'You already belong to a team or that team name is taken.', 'TEAM_CONFLICT')
    throw error
  }
  registration.teamId = team._id; registration.teamName = team.teamName; registration.status = 'team_formed'; await registration.save()
  send(res, team, 201)
}))

router.post('/:slug/team/join', protect, writeLimiter, asyncHandler(async (req, res) => {
  const code = typeof req.body?.inviteCode === 'string' ? req.body.inviteCode.trim().toUpperCase() : ''
  if (!/^[A-F0-9]{12}$/.test(code)) return fail(res, 422, 'Enter a valid invite code.', 'VALIDATION_ERROR')
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, inviteCode: code }); if (!team) return fail(res, 404, 'Team invite was not found.', 'NOT_FOUND')
  const registration = await HackathonRegistration.findOne({ hackathonId: hackathon._id, userId: req.user._id })
  if (!registration || registration.domainId !== team.domainId) return fail(res, 403, 'Register for the team domain before joining.', 'REGISTRATION_REQUIRED')
  if (await HackathonTeam.exists({ hackathonId: hackathon._id, members: req.user._id })) return fail(res, 409, 'You already belong to a team.', 'ALREADY_IN_TEAM')
  const updated = await HackathonTeam.findOneAndUpdate({ _id: team._id, members: { $ne: req.user._id }, $expr: { $lt: [{ $size: '$members' }, '$maxSize'] } }, { $addToSet: { members: req.user._id } }, { new: true })
  if (!updated) return fail(res, 409, 'This team is full.', 'TEAM_FULL')
  registration.teamId = team._id; registration.teamName = team.teamName; registration.status = 'team_formed'; await registration.save()
  send(res, updated)
}))

router.get('/:slug/team', protect, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }).populate('members', 'name avatar college branch').lean()
  if (!team) return fail(res, 404, 'You are not in a team for this hackathon.', 'NOT_FOUND')
  send(res, team)
}))

router.post('/:slug/team/leave', protect, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }); if (!team) return fail(res, 404, 'Team not found.', 'NOT_FOUND')
  await removeMemberFromTeam(hackathon._id, req.user._id)
  await HackathonRegistration.updateOne({ hackathonId: hackathon._id, userId: req.user._id }, { $unset: { teamId: 1, teamName: 1 }, $set: { status: 'registered' } })
  send(res, { left: true })
}))

router.delete('/:slug/team/member/:userId', protect, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, leader: req.user._id }); if (!team) return fail(res, 403, 'Only the team leader can remove members.', 'FORBIDDEN')
  if (id(team.leader) === req.params.userId) return fail(res, 422, 'The team leader cannot be removed.', 'INVALID_MEMBER')
  const changed = await HackathonTeam.updateOne({ _id: team._id, members: req.params.userId }, { $pull: { members: req.params.userId } })
  if (!changed.modifiedCount) return fail(res, 404, 'Team member not found.', 'NOT_FOUND')
  await HackathonRegistration.updateOne({ hackathonId: hackathon._id, userId: req.params.userId, teamId: team._id }, { $unset: { teamId: 1, teamName: 1 }, $set: { status: 'registered' } })
  send(res, { removed: true })
}))

router.post('/:slug/submissions', protect, asyncHandler(async (req, res) => {
  const input = validPayload(submissionInput, req, res); if (!input) return
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }); if (!team) return fail(res, 403, 'Only a registered team member can submit.', 'REGISTRATION_REQUIRED')
  const domain = hackathon.domains.find(item => item.domainId === team.domainId); if (domain?.domainDeadline && new Date() > domain.domainDeadline) return fail(res, 409, 'The submission deadline has passed.', 'DEADLINE_PASSED')
  let submission
  try {
    submission = await HackathonSubmission.findOneAndUpdate({ hackathonId: hackathon._id, teamId: team._id, isDraft: true }, { $set: { ...input, hackathonId: hackathon._id, teamId: team._id, domainId: team.domainId } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true })
  } catch (error) {
    if (error.code === 11000) return fail(res, 409, 'Your team already submitted a final entry.', 'SUBMISSION_FINALIZED')
    throw error
  }
  send(res, submission, 201)
}))

router.post('/:slug/submissions/upload-url', protect, writeLimiter, asyncHandler(async (req, res) => {
  const input = validPayload(uploadInput, req, res); if (!input) return
  const validation = validateUpload(input)
  if (!validation.valid) return fail(res, 422, validation.message, 'INVALID_UPLOAD')
  if (!r2Configured) return fail(res, 503, 'Private file storage is not configured.', 'STORAGE_UNAVAILABLE')
  const hackathon = await Hackathon.findOne({ slug: req.params.slug, isPublished: true })
  if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }).select('_id domainId')
  if (!team) return fail(res, 403, 'Only a registered team member can upload a submission file.', 'REGISTRATION_REQUIRED')
  const domain = hackathon.domains.find(item => item.domainId === team.domainId)
  if (domain?.domainDeadline && new Date() > domain.domainDeadline) return fail(res, 409, 'The submission deadline has passed.', 'DEADLINE_PASSED')
  const upload = await createUploadUrl({ userId: req.user._id, ...input })
  send(res, upload)
}))

router.post('/:slug/submissions/:submissionId/files/confirm', protect, writeLimiter, asyncHandler(async (req, res) => {
  const input = validPayload(confirmUploadInput, req, res); if (!input) return
  const validation = validateUpload(input)
  if (!validation.valid) return fail(res, 422, validation.message, 'INVALID_UPLOAD')
  if (!input.key.startsWith(`uploads/${req.user._id}/`)) return fail(res, 403, 'You can only attach files uploaded by your account.', 'FORBIDDEN')
  const hackathon = await Hackathon.findOne({ slug: req.params.slug })
  if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }).select('_id domainId')
  if (!team) return fail(res, 403, 'Only a registered team member can attach submission files.', 'REGISTRATION_REQUIRED')
  const domain = hackathon.domains.find(item => item.domainId === team.domainId)
  if (domain?.domainDeadline && new Date() > domain.domainDeadline) return fail(res, 409, 'The submission deadline has passed.', 'DEADLINE_PASSED')
  const submission = await HackathonSubmission.findOne({ _id: req.params.submissionId, hackathonId: hackathon._id, teamId: team._id, isDraft: true })
  if (!submission) return fail(res, 404, 'Draft submission not found.', 'NOT_FOUND')
  if (!r2Configured) return fail(res, 503, 'Private file storage is not configured.', 'STORAGE_UNAVAILABLE')
  const stored = await getStoredObjectMetadata(input.key)
  if (stored.size !== input.size || stored.contentType !== input.contentType) {
    try { await deleteStoredObject(input.key) } catch { /* A lifecycle rule can remove invalid uploads later. */ }
    return fail(res, 422, 'Uploaded file metadata does not match the requested upload.', 'UPLOAD_MISMATCH')
  }
  if (!submission.files.some(file => file.key === input.key)) {
    submission.files.push({ key: input.key, fileName: input.fileName, contentType: input.contentType, size: stored.size, uploadedBy: req.user._id })
    await submission.save()
  }
  send(res, { file: submission.files.find(file => file.key === input.key) })
}))

router.get('/:slug/submissions/:submissionId/files/:fileId/download', protect, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug })
  if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const submission = await HackathonSubmission.findOne({ _id: req.params.submissionId, hackathonId: hackathon._id, 'files._id': req.params.fileId }).select('teamId files')
  if (!submission) return fail(res, 404, 'File not found.', 'NOT_FOUND')
  const member = await HackathonTeam.exists({ _id: submission.teamId, members: req.user._id })
  if (!member && !isManager(req, hackathon)) return fail(res, 403, 'You cannot access this file.', 'FORBIDDEN')
  const file = submission.files.id(req.params.fileId)
  const downloadUrl = await createDownloadUrl(file.key)
  res.set('Cache-Control', 'no-store')
  send(res, { downloadUrl, expiresIn: 300, fileName: file.fileName })
}))

router.put('/:slug/submissions/:submissionId', protect, asyncHandler(async (req, res) => {
  const input = validPayload(submissionInput, req, res); if (!input) return
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }); if (!team) return fail(res, 403, 'Only a registered team member can edit this submission.', 'FORBIDDEN')
  const submission = await HackathonSubmission.findOneAndUpdate({ _id: req.params.submissionId, hackathonId: hackathon._id, teamId: team._id, isDraft: true }, { $set: input }, { new: true, runValidators: true })
  if (!submission) return fail(res, 404, 'Draft submission not found.', 'NOT_FOUND')
  send(res, submission)
}))

router.post('/:slug/submissions/:submissionId/submit', protect, writeLimiter, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }); if (!team) return fail(res, 403, 'Only a registered team member can submit.', 'FORBIDDEN')
  const domain = hackathon.domains.find(item => item.domainId === team.domainId); if (domain?.domainDeadline && new Date() > domain.domainDeadline) return fail(res, 409, 'The submission deadline has passed.', 'DEADLINE_PASSED')
  const submission = await HackathonSubmission.findOneAndUpdate({ _id: req.params.submissionId, hackathonId: hackathon._id, teamId: team._id, isDraft: true }, { $set: { isDraft: false, submittedAt: new Date(), submittedBy: req.user._id } }, { new: true })
  if (!submission) return fail(res, 404, 'Draft submission not found.', 'NOT_FOUND')
  await HackathonRegistration.updateMany(
    { hackathonId: hackathon._id, teamId: team._id },
    { $set: { status: 'submitted', submission: { title: submission.title, description: submission.description, repoUrl: submission.repoUrl, demoUrl: submission.demoUrl, submittedAt: submission.submittedAt } } },
  )
  send(res, submission)
}))

router.get('/:slug/submissions/my', protect, asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findOne({ slug: req.params.slug }); if (!hackathon) return fail(res, 404, 'Hackathon not found.', 'NOT_FOUND')
  const team = await HackathonTeam.findOne({ hackathonId: hackathon._id, members: req.user._id }); if (!team) return send(res, [])
  send(res, await HackathonSubmission.find({ hackathonId: hackathon._id, teamId: team._id }).lean())
}))

router.get('/:slug/registrations', protect, managerOnly, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1), limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 25))
  const filter = { hackathonId: req.hackathon._id, status: { $ne: 'cancelled' } }
  if (typeof req.query.domainId === 'string' && req.query.domainId) filter.domainId = req.query.domainId
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : ''
  if (search) { const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ 'participant.name': { $regex: escaped, $options: 'i' } }, { 'participant.email': { $regex: escaped, $options: 'i' } }, { teamName: { $regex: escaped, $options: 'i' } }] }
  const [items, total] = await Promise.all([HackathonRegistration.find(filter).populate('userId', 'name email college branch year').populate('teamId', 'teamName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), HackathonRegistration.countDocuments(filter)])
  send(res, items, 200, { pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } })
}))

router.get('/:slug/registrations/export.csv', protect, managerOnly, adminExportLimiter, asyncHandler(async (req, res) => {
  const filter = { hackathonId: req.hackathon._id, status: { $ne: 'cancelled' } }
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${req.hackathon.slug}-registrations.csv"`, 'Cache-Control': 'no-store' })
  res.write('Name,Email,College,Branch,Year,Domain,Team,Status,Registered At\r\n')
  const cursor = HackathonRegistration.find(filter).populate('userId', 'name email college branch year').populate('teamId', 'teamName').sort({ _id: 1 }).lean().cursor({ batchSize: 250 })
  try {
    for await (const row of cursor) {
      const line = [row.userId?.name, row.userId?.email, row.userId?.college, row.userId?.branch, row.userId?.year, row.domainId, row.teamId?.teamName, row.status, row.createdAt?.toISOString()].map(csvCell).join(',') + '\r\n'
      if (!res.write(line)) await new Promise(resolve => res.once('drain', resolve))
    }
    await writeAdminAudit(req, { action: 'hackathon.registrations_csv_exported', targetType: 'hackathon', targetId: req.hackathon._id, afterSummary: { exportedRows: 'streamed' } })
    res.end()
  } finally {
    await cursor.close()
  }
}))

router.get('/:slug/submissions', protect, managerOnly, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
  const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 25))
  const filter = { hackathonId: req.hackathon._id }
  const [submissions, total] = await Promise.all([
    HackathonSubmission.find(filter).populate('teamId', 'teamName domainId').sort({ submittedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    HackathonSubmission.countDocuments(filter),
  ])
  send(res, submissions, 200, { pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } })
}))

router.post('/:slug/submissions/:submissionId/score', protect, managerOnly, asyncHandler(async (req, res) => {
  const schema = z.object({ innovation: z.number().min(1).max(10), impact: z.number().min(1).max(10), technicalDepth: z.number().min(1).max(10), design: z.number().min(1).max(10), presentation: z.number().min(1).max(10), comments: z.string().max(3000).optional() })
  const score = validPayload(schema, req, res); if (!score) return
  const submission = await HackathonSubmission.findOne({ _id: req.params.submissionId, hackathonId: req.hackathon._id, isDraft: false }); if (!submission) return fail(res, 404, 'Submission not found.', 'NOT_FOUND')
  const average = Number(((score.innovation + score.impact + score.technicalDepth + score.design + score.presentation) / 5).toFixed(2))
  submission.scores = [...submission.scores.filter(item => id(item.judgeId) !== id(req.user._id)), { ...score, average, judgeId: req.user._id, isPublished: false }]
  await submission.save()
  await writeAdminAudit(req, { action: 'hackathon.submission_scored', targetType: 'submission', targetId: submission._id, afterSummary: { hackathonId: String(req.hackathon._id), average } })
  send(res, { scored: true, average })
}))

router.post('/:slug/announcements', protect, managerOnly, asyncHandler(async (req, res) => {
  const schema = z.object({ title: z.string().trim().min(2).max(180), content: z.string().trim().min(1).max(10000), isPublished: z.boolean().optional() })
  const input = validPayload(schema, req, res); if (!input) return
  const announcement = await HackathonAnnouncement.create({ ...input, hackathonId: req.hackathon._id, authorId: req.user._id, publishedAt: input.isPublished ? new Date() : undefined })
  await writeAdminAudit(req, { action: 'hackathon.announcement_created', targetType: 'announcement', targetId: announcement._id, afterSummary: { title: announcement.title, isPublished: announcement.isPublished, hackathonId: String(req.hackathon._id) } })
  send(res, announcement, 201)
}))

router.put('/:slug/announcements/:announcementId', protect, managerOnly, asyncHandler(async (req, res) => {
  const schema = z.object({ title: z.string().trim().min(2).max(180).optional(), content: z.string().trim().min(1).max(10000).optional(), isPublished: z.boolean().optional() }).strict()
  const input = validPayload(schema, req, res); if (!input) return
  if (input.isPublished === true) input.publishedAt = new Date()
  const existing = await HackathonAnnouncement.findOne({ _id: req.params.announcementId, hackathonId: req.hackathon._id }).select('title isPublished').lean()
  if (!existing) return fail(res, 404, 'Announcement not found.', 'NOT_FOUND')
  const announcement = await HackathonAnnouncement.findOneAndUpdate({ _id: req.params.announcementId, hackathonId: req.hackathon._id }, { $set: input }, { new: true, runValidators: true })
  if (!announcement) return fail(res, 404, 'Announcement not found.', 'NOT_FOUND')
  await writeAdminAudit(req, { action: 'hackathon.announcement_updated', targetType: 'announcement', targetId: announcement._id, beforeSummary: { title: existing.title, isPublished: existing.isPublished }, afterSummary: { title: announcement.title, isPublished: announcement.isPublished, hackathonId: String(req.hackathon._id) } })
  send(res, announcement)
}))

router.post('/:slug/publish-results', protect, managerOnly, asyncHandler(async (req, res) => {
  const submissions = await HackathonSubmission.find({ hackathonId: req.hackathon._id, isDraft: false })
  for (const submission of submissions) submission.scores.forEach(score => { score.isPublished = true })
  await Promise.all(submissions.map(item => item.save()))
  req.hackathon.status = 'results_published'; req.hackathon.isPublished = true; req.hackathon.resultsPublishedAt = new Date(); await req.hackathon.save()
  await writeAdminAudit(req, { action: 'hackathon.results_published', targetType: 'hackathon', targetId: req.hackathon._id, beforeSummary: { status: 'results_pending' }, afterSummary: { status: 'results_published', submissionCount: submissions.length } })
  send(res, { published: true, submissions: submissions.length })
}))

export default router
