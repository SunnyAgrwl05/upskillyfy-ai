import express from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import User from '../models/User.js'
import Hackathon from '../models/Hackathon.js'
import HackathonRegistration from '../models/HackathonRegistration.js'
import HackathonTeam from '../models/HackathonTeam.js'
import HackathonSubmission from '../models/HackathonSubmission.js'
import HackathonAnnouncement from '../models/HackathonAnnouncement.js'
import ResumeAnalysis from '../models/ResumeAnalysis.js'
import ResumeAnalysisEvent from '../models/ResumeAnalysisEvent.js'
import Subscriber from '../models/Subscriber.js'
import AdminAuditLog from '../models/AdminAuditLog.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { adminPrivilegeLimiter, adminExportLimiter } from '../middleware/security.js'
import { withAdminMutationLock, writeAdminAudit } from '../services/adminSecurity.js'
import { csvCell } from '../services/csv.js'

const router = express.Router()
const roles = ['student', 'admin']
const objectId = z.string().regex(/^[a-f\d]{24}$/i)
const sortFields = ['createdAt', 'updatedAt', 'email', 'name', 'role']
const parsePage = (query, { sorts = sortFields, filters = [] } = {}) => {
  const schema = z.object({
    page: z.string().regex(/^[1-9]\d{0,6}$/).optional(),
    limit: z.string().regex(/^[1-9]\d{0,2}$/).optional(),
    search: z.string().trim().max(100).optional(),
    sort: z.enum(sorts).optional(),
    order: z.enum(['asc', 'desc']).optional(),
    ...Object.fromEntries(filters),
  }).strict()
  const parsed = schema.safeParse(query)
  if (!parsed.success) return { error: parsed.error }
  const values = parsed.data
  if (values.sort && !sorts.includes(values.sort)) return { error: new Error('Unsupported sort field.') }
  const page = Number(values.page || 1)
  const limit = Number(values.limit || 25)
  if (limit > 100) return { error: new Error('Limit cannot exceed 100.') }
  return { value: { ...values, page, limit, skip: (page - 1) * limit, sort: values.sort || 'createdAt', order: values.order || 'desc' } }
}
const badQuery = (res, message = 'Invalid query parameters.') => res.status(400).json({ message, code: 'INVALID_QUERY' })
const badInput = (res, message = 'Invalid request body.') => res.status(422).json({ message, code: 'VALIDATION_ERROR' })
const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const userDTO = user => ({
  id: String(user._id), name: user.name, email: user.email, role: user.role,
  isActive: user.isActive !== false, college: user.college || '', branch: user.branch || '', year: user.year || '',
  emailVerifiedAt: user.emailVerifiedAt || null, createdAt: user.createdAt, updatedAt: user.updatedAt,
})
const healthDTO = () => {
  const state = mongoose.connection.readyState
  return {
    database: ({ 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' })[state] || 'unknown',
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    memoryUsage: { rss: process.memoryUsage().rss, heapUsed: process.memoryUsage().heapUsed },
  }
}

router.use(protect, adminOnly)

let dashboardCache = null
let dashboardCacheExpiresAt = 0
async function loadDashboard() {
  const now = Date.now()
  if (dashboardCache && dashboardCacheExpiresAt > now) return dashboardCache
  const recentSince = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const [users, recentUsers, hackathons, registrations, recentRegistrations, teams, submissions, analyses, analysisFailures, newsletter, activeNewsletter] = await Promise.all([
    User.countDocuments({}), User.countDocuments({ createdAt: { $gte: recentSince } }), Hackathon.countDocuments({}),
    HackathonRegistration.countDocuments({ status: { $ne: 'cancelled' } }), HackathonRegistration.countDocuments({ status: { $ne: 'cancelled' }, createdAt: { $gte: recentSince } }), HackathonTeam.countDocuments({}), HackathonSubmission.countDocuments({}),
    ResumeAnalysis.countDocuments({}), ResumeAnalysisEvent.countDocuments({ status: 'failed' }), Subscriber.countDocuments({}), Subscriber.countDocuments({ isActive: true }),
  ])
  dashboardCache = { users: { total: users, recent7Days: recentUsers }, hackathons: { total: hackathons }, registrations: { total: registrations, recent7Days: recentRegistrations }, teams: { total: teams }, submissions: { total: submissions }, resumeAnalyzer: { completed: analyses, failed: analysisFailures, total: analyses + analysisFailures }, newsletter: { total: newsletter, active: activeNewsletter, unsubscribed: newsletter - activeNewsletter }, health: healthDTO() }
  dashboardCacheExpiresAt = now + 45_000
  return dashboardCache
}

router.get('/dashboard', asyncHandler(async (_req, res) => res.json(await loadDashboard())))
router.get('/health', (_req, res) => res.json(healthDTO()))

router.get('/users', asyncHandler(async (req, res) => {
  const parsed = parsePage(req.query, {
    sorts: ['createdAt', 'updatedAt', 'email', 'name', 'role'],
    filters: [['role', z.enum(roles).optional()], ['status', z.enum(['active', 'inactive']).optional()]],
  })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, search, sort, order, role, status } = parsed.value
  const filter = {}
  if (role) filter.role = role
  if (status === 'active') filter.isActive = { $ne: false }
  if (status === 'inactive') filter.isActive = false
  if (search) { const literal = escaped(search); filter.$or = [{ name: { $regex: literal, $options: 'i' } }, { email: { $regex: literal, $options: 'i' } }] }
  const [rows, total] = await Promise.all([
    User.find(filter).select('name email role isActive college branch year emailVerifiedAt createdAt updatedAt').sort({ [sort]: order === 'asc' ? 1 : -1, _id: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ])
  res.json({ users: rows.map(userDTO), pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

router.get('/users/:userId', asyncHandler(async (req, res) => {
  if (!objectId.safeParse(req.params.userId).success) return res.status(400).json({ message: 'Invalid user ID.', code: 'INVALID_ID' })
  const user = await User.findById(req.params.userId).select('name email role isActive college branch year emailVerifiedAt createdAt updatedAt').lean()
  if (!user) return res.status(404).json({ message: 'User not found.', code: 'NOT_FOUND' })
  res.json({ user: userDTO(user) })
}))

router.patch('/users/:userId/role', adminPrivilegeLimiter, asyncHandler(async (req, res) => {
  if (!objectId.safeParse(req.params.userId).success) return res.status(400).json({ message: 'Invalid user ID.', code: 'INVALID_ID' })
  const body = z.object({ role: z.enum(roles) }).strict().safeParse(req.body)
  if (!body.success) return badInput(res, 'Provide only a valid role.')
  const targetId = req.params.userId
  const outcome = await withAdminMutationLock(async () => {
    const before = await User.findById(targetId).select('role isActive').lean()
    if (!before) return { status: 404, message: 'User not found.', code: 'NOT_FOUND' }
    if (String(req.user._id) === targetId && body.data.role !== 'admin') return { status: 409, message: 'Administrators cannot demote their own account.', code: 'SELF_DEMOTION' }
    if (before.role === body.data.role) return { user: await User.findById(targetId).select('name email role isActive college branch year emailVerifiedAt createdAt updatedAt').lean(), before, changed: false }
    if (before.role === 'admin' && before.isActive !== false && body.data.role !== 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: { $ne: false } })
      if (activeAdmins <= 1) return { status: 409, message: 'The last active administrator cannot be demoted.', code: 'LAST_ACTIVE_ADMIN' }
    }
    const activeFilter = before.isActive === false ? { isActive: false } : { isActive: { $ne: false } }
    const updated = await User.findOneAndUpdate({ _id: targetId, role: before.role, ...activeFilter }, { $set: { role: body.data.role }, $inc: { tokenVersion: 1 } }, { new: true, runValidators: true }).select('name email role isActive college branch year emailVerifiedAt createdAt updatedAt').lean()
    return updated ? { user: updated, before, changed: true } : { status: 409, message: 'User changed concurrently. Reload and retry.', code: 'CONCURRENT_CHANGE' }
  })
  if (outcome.status) return res.status(outcome.status).json({ message: outcome.message, code: outcome.code })
  if (outcome.changed) await writeAdminAudit(req, { action: 'user.role_changed', targetType: 'user', targetId, beforeSummary: { role: outcome.before.role }, afterSummary: { role: outcome.user.role } })
  res.json({ user: userDTO(outcome.user) })
}))

router.patch('/users/:userId/status', adminPrivilegeLimiter, asyncHandler(async (req, res) => {
  if (!objectId.safeParse(req.params.userId).success) return res.status(400).json({ message: 'Invalid user ID.', code: 'INVALID_ID' })
  const body = z.object({ isActive: z.boolean() }).strict().safeParse(req.body)
  if (!body.success) return badInput(res, 'Provide only a boolean isActive value.')
  const targetId = req.params.userId
  const outcome = await withAdminMutationLock(async () => {
    const before = await User.findById(targetId).select('role isActive').lean()
    if (!before) return { status: 404, message: 'User not found.', code: 'NOT_FOUND' }
    if (String(req.user._id) === targetId && !body.data.isActive) return { status: 409, message: 'Administrators cannot deactivate their own account.', code: 'SELF_DEACTIVATION' }
    const currentlyActive = before.isActive !== false
    if (currentlyActive === body.data.isActive) return { user: await User.findById(targetId).select('name email role isActive college branch year emailVerifiedAt createdAt updatedAt').lean(), before, changed: false }
    if (before.role === 'admin' && currentlyActive && !body.data.isActive) {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: { $ne: false } })
      if (activeAdmins <= 1) return { status: 409, message: 'The last active administrator cannot be deactivated.', code: 'LAST_ACTIVE_ADMIN' }
    }
    const activeFilter = currentlyActive ? { isActive: { $ne: false } } : { isActive: false }
    const updated = await User.findOneAndUpdate({ _id: targetId, role: before.role, ...activeFilter }, { $set: { isActive: body.data.isActive }, $inc: { tokenVersion: 1 } }, { new: true, runValidators: true }).select('name email role isActive college branch year emailVerifiedAt createdAt updatedAt').lean()
    return updated ? { user: updated, before: { ...before, isActive: currentlyActive }, changed: true } : { status: 409, message: 'User changed concurrently. Reload and retry.', code: 'CONCURRENT_CHANGE' }
  })
  if (outcome.status) return res.status(outcome.status).json({ message: outcome.message, code: outcome.code })
  if (outcome.changed) await writeAdminAudit(req, { action: body.data.isActive ? 'user.activated' : 'user.deactivated', targetType: 'user', targetId, beforeSummary: { role: outcome.before.role, isActive: outcome.before.isActive }, afterSummary: { role: outcome.user.role, isActive: outcome.user.isActive } })
  res.json({ user: userDTO(outcome.user) })
}))

const hackathonDTO = h => ({ id: String(h._id), slug: h.slug, title: h.title, status: h.status, isPublished: h.isPublished, registrationDeadline: h.registrationDeadline, createdAt: h.createdAt, updatedAt: h.updatedAt, organiser: h.organiser, domains: (h.domains || []).map(d => ({ domainId: d.domainId, name: d.name, seatsTotal: d.seatsTotal, seatsTaken: d.seatsTaken })) })
router.get('/hackathons', asyncHandler(async (req, res) => {
  const parsed = parsePage(req.query, { sorts: ['createdAt', 'updatedAt', 'title', 'registrationDeadline'], filters: [['status', z.enum(['draft', 'published', 'registration_open', 'live', 'ended', 'results_published']).optional()]] })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, search, sort, order, status } = parsed.value
  const filter = status ? { status } : {}
  if (search) filter.title = { $regex: escaped(search), $options: 'i' }
  const [rows, total] = await Promise.all([Hackathon.find(filter).select('-organiserEmail -createdBy -judges -mentors -partners -faqs -rules').sort({ [sort]: order === 'asc' ? 1 : -1, _id: -1 }).skip(skip).limit(limit).lean(), Hackathon.countDocuments(filter)])
  const ids = rows.map(row => row._id)
  const [registrationCounts, teamCounts, submissionCounts] = await Promise.all([
    HackathonRegistration.aggregate([{ $match: { hackathonId: { $in: ids }, status: { $ne: 'cancelled' } } }, { $group: { _id: '$hackathonId', count: { $sum: 1 } } }]),
    HackathonTeam.aggregate([{ $match: { hackathonId: { $in: ids } } }, { $group: { _id: '$hackathonId', count: { $sum: 1 } } }]),
    HackathonSubmission.aggregate([{ $match: { hackathonId: { $in: ids } } }, { $group: { _id: '$hackathonId', count: { $sum: 1 } } }]),
  ])
  const counts = values => new Map(values.map(item => [String(item._id), item.count]))
  const registrations = counts(registrationCounts), teams = counts(teamCounts), submissions = counts(submissionCounts)
  res.json({ hackathons: rows.map(row => ({ ...hackathonDTO(row), registrations: registrations.get(String(row._id)) || 0, teams: teams.get(String(row._id)) || 0, submissions: submissions.get(String(row._id)) || 0 })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

const parseHackathonId = async (req, res) => {
  if (!objectId.safeParse(req.params.hackathonId).success) { res.status(400).json({ message: 'Invalid hackathon ID.', code: 'INVALID_ID' }); return null }
  const hackathon = await Hackathon.findById(req.params.hackathonId).select('_id slug title status isPublished createdAt updatedAt domains').lean()
  if (!hackathon) { res.status(404).json({ message: 'Hackathon not found.', code: 'NOT_FOUND' }); return null }
  return hackathon
}
router.get('/hackathons/:hackathonId/registrations', asyncHandler(async (req, res) => {
  const hackathon = await parseHackathonId(req, res); if (!hackathon) return
  const parsed = parsePage(req.query, { sorts: ['createdAt', 'updatedAt', 'teamName'], filters: [['status', z.enum(['registered', 'team_formed', 'submitted', 'cancelled']).optional()]] })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, search, sort, order, status } = parsed.value
  const filter = { hackathonId: hackathon._id }
  if (status) filter.status = status
  if (search) filter.$or = [{ teamName: { $regex: escaped(search), $options: 'i' } }, { 'participant.name': { $regex: escaped(search), $options: 'i' } }, { 'participant.email': { $regex: escaped(search), $options: 'i' } }]
  const [rows, total] = await Promise.all([HackathonRegistration.find(filter).select('userId domainId teamId status participant.name participant.email participant.college participant.institution teamName project.title submission.title createdAt updatedAt').sort({ [sort]: order === 'asc' ? 1 : -1, _id: -1 }).skip(skip).limit(limit).lean(), HackathonRegistration.countDocuments(filter)])
  res.json({ registrations: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))
router.get('/hackathons/:hackathonId/submissions', asyncHandler(async (req, res) => {
  const hackathon = await parseHackathonId(req, res); if (!hackathon) return
  const parsed = parsePage(req.query, { sorts: ['createdAt', 'updatedAt', 'submittedAt', 'title'], filters: [['status', z.enum(['draft', 'submitted']).optional()]] })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, sort, order, status } = parsed.value
  const filter = { hackathonId: hackathon._id }
  if (status) filter.isDraft = status === 'draft'
  const [rows, total] = await Promise.all([
    HackathonSubmission.find(filter).select('teamId domainId title description techStack repoUrl demoUrl videoUrl isDraft submittedAt submittedBy scores.innovation scores.impact scores.technicalDepth scores.design scores.presentation scores.average scores.isPublished createdAt updatedAt files.fileName files.contentType files.size files.uploadedAt').populate('teamId', 'teamName').sort({ [sort]: order === 'asc' ? 1 : -1, _id: -1 }).skip(skip).limit(limit).lean(),
    HackathonSubmission.countDocuments(filter),
  ])
  res.json({ submissions: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

router.get('/resume-analyses/stats', asyncHandler(async (_req, res) => {
  const [complete, completedByProvider, errors, total] = await Promise.all([
    ResumeAnalysis.countDocuments({}),
    ResumeAnalysis.aggregate([{ $group: { _id: '$provider', count: { $sum: 1 } } }]),
    ResumeAnalysisEvent.aggregate([{ $match: { status: 'failed' } }, { $group: { _id: '$errorCategory', count: { $sum: 1 } } }]),
    ResumeAnalysisEvent.countDocuments({}),
  ])
  const failuresByCategory = Object.fromEntries(errors.map(row => [row._id || 'OTHER', row.count]))
  res.json({ completed: complete, attempts: complete + total, completedByProvider: Object.fromEntries(completedByProvider.map(row => [row._id, row.count])), failuresByCategory, failures: Object.values(failuresByCategory).reduce((a, b) => a + b, 0) })
}))
router.get('/resume-analyses', asyncHandler(async (req, res) => {
  const parsed = parsePage(req.query, { sorts: ['createdAt'], filters: [['status', z.enum(['completed', 'failed']).optional()], ['userId', objectId.optional()], ['errorCategory', z.enum(['AI_UNAVAILABLE', 'INVALID_AI_RESPONSE', 'UNSUPPORTED_AI_EVIDENCE', 'UNSUPPORTED_AI_CLAIM', 'RESUME_INVALID', 'RESUME_UNREADABLE', 'OTHER']).optional()]] })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, order, status, userId, errorCategory } = parsed.value
  const matchEvents = { status: status === 'completed' ? 'completed' : 'failed', ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}), ...(errorCategory ? { errorCategory } : {}) }
  if (status === 'completed') matchEvents._id = { $exists: false }
  const matchAnalyses = { ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}), ...(status === 'failed' || errorCategory ? { _id: { $exists: false } } : {}) }
  const rows = await ResumeAnalysis.aggregate([
    { $match: matchAnalyses },
    { $project: { _id: 1, userId: '$owner', status: { $literal: 'completed' }, createdAt: 1, errorCategory: { $literal: null } } },
    { $unionWith: { coll: ResumeAnalysisEvent.collection.name, pipeline: [{ $match: matchEvents }, { $project: { _id: 1, userId: '$owner', status: 1, createdAt: 1, errorCategory: 1 } }] } },
    { $sort: { createdAt: order === 'asc' ? 1 : -1, _id: -1 } }, { $skip: skip }, { $limit: limit },
  ])
  const [analysisCount, eventCount] = await Promise.all([ResumeAnalysis.countDocuments(matchAnalyses), ResumeAnalysisEvent.countDocuments(matchEvents)])
  const total = analysisCount + eventCount
  res.json({ analyses: rows.map(row => ({ id: String(row._id), userId: String(row.userId), status: row.status, createdAt: row.createdAt, errorCategory: row.errorCategory || null })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

async function streamSubscriberCsv(req, res) {
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"', 'Cache-Control': 'no-store' })
  res.write('Email,Status,Subscribed At,Updated At\r\n')
  const cursor = Subscriber.find({}).select('email isActive subscribedAt updatedAt').sort({ _id: 1 }).lean().cursor({ batchSize: 250 })
  try {
    for await (const row of cursor) {
      const line = [row.email, row.isActive ? 'active' : 'unsubscribed', row.subscribedAt?.toISOString(), row.updatedAt?.toISOString()].map(csvCell).join(',') + '\r\n'
      if (!res.write(line)) await new Promise(resolve => res.once('drain', resolve))
    }
    await writeAdminAudit(req, { action: 'newsletter.csv_exported', targetType: 'newsletter', targetId: 'subscribers', afterSummary: { exportedRows: 'streamed' } })
    res.end()
  } finally { await cursor.close() }
}
router.get('/newsletter', asyncHandler(async (req, res) => {
  const parsed = parsePage(req.query, { sorts: ['createdAt', 'updatedAt', 'email'], filters: [['status', z.enum(['active', 'unsubscribed', 'all']).optional()]] })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, search, sort, order, status = 'active' } = parsed.value
  const filter = status === 'all' ? {} : { isActive: status === 'active' }
  if (search) filter.email = { $regex: escaped(search), $options: 'i' }
  const [rows, total] = await Promise.all([Subscriber.find(filter).select('email isActive subscribedAt createdAt updatedAt').sort({ [sort]: order === 'asc' ? 1 : -1, _id: -1 }).skip(skip).limit(limit).lean(), Subscriber.countDocuments(filter)])
  res.json({ subscribers: rows.map(row => ({ id: String(row._id), email: row.email, isActive: row.isActive, subscribedAt: row.subscribedAt, createdAt: row.createdAt, updatedAt: row.updatedAt })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))
router.get('/newsletter/export.csv', adminExportLimiter, asyncHandler(streamSubscriberCsv))

router.get('/audit-logs', asyncHandler(async (req, res) => {
  const parsed = parsePage(req.query, { sorts: ['createdAt'], filters: [['action', z.string().trim().min(1).max(100).optional()], ['targetType', z.string().trim().min(1).max(80).optional()]] })
  if (parsed.error) return badQuery(res)
  const { page, limit, skip, order, action, targetType } = parsed.value
  const filter = { ...(action ? { action } : {}), ...(targetType ? { targetType } : {}) }
  const [rows, total] = await Promise.all([AdminAuditLog.find(filter).sort({ createdAt: order === 'asc' ? 1 : -1, _id: -1 }).skip(skip).limit(limit).lean(), AdminAuditLog.countDocuments(filter)])
  res.json({ logs: rows.map(row => ({ id: String(row._id), actorId: String(row.actorId), action: row.action, targetType: row.targetType, targetId: row.targetId, beforeSummary: row.beforeSummary, afterSummary: row.afterSummary, ip: row.ip, userAgent: row.userAgent, createdAt: row.createdAt })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
}))

export default router
