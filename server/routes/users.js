import express from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import ResumeProject from '../models/ResumeProject.js'
import Attempt from '../models/Attempt.js'
import Contact from '../models/Contact.js'
import Hackathon from '../models/Hackathon.js'
import HackathonTeam from '../models/HackathonTeam.js'
import HackathonRegistration from '../models/HackathonRegistration.js'
import HackathonSubmission from '../models/HackathonSubmission.js'
import HackathonAnnouncement from '../models/HackathonAnnouncement.js'
import Subscriber from '../models/Subscriber.js'
import ResumeAnalysis from '../models/ResumeAnalysis.js'
import ResumeAnalysisEvent from '../models/ResumeAnalysisEvent.js'
import { deleteStoredObject, r2Configured } from '../services/storage/r2.js'
import { protect, ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../middleware/error.js'
import { updateProfileSchema, accountDeletionSchema } from '../validation/authSchemas.js'
import { withAdminMutationLock } from '../services/adminSecurity.js'

const router = express.Router()

// Get profile
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password').populate('savedInternships')
    res.json(user)
  }),
)

// Update profile
router.put(
  '/profile',
  protect,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const { name, branch, college, year, linkedin, github } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, branch, college, year, linkedin, github },
      { new: true, select: '-password' },
    )
    res.json(user)
  }),
)

// Permanently remove an account and its private records. Atlas transactions
// make the cross-collection cleanup atomic; shared team work is reassigned.
router.delete('/account', protect, validate(accountDeletionSchema), asyncHandler(async (req, res) => {
  const topologyType = mongoose.connection.client?.topology?.description?.type
  const session = ['ReplicaSetWithPrimary', 'Sharded'].includes(topologyType) ? await mongoose.startSession() : null
  const fileKeysToDelete = new Set()
  try {
    const removeAccountData = async () => {
      const user = await User.findById(req.user._id).select('+password').session(session)
      if (!user) return
      if (user.password && (!req.body.password || !await user.comparePassword(req.body.password))) {
        const error = new Error('Confirm your password before deleting this account.')
        error.status = 401
        error.code = 'PASSWORD_CONFIRMATION_REQUIRED'
        throw error
      }

      const admin = await User.findOne({ role: 'admin', isActive: { $ne: false }, _id: { $ne: user._id } }).select('_id').session(session)
      if (user.role === 'admin' && !admin) {
        const error = new Error('The last active administrator cannot delete their account.')
        error.status = 409
        error.code = 'LAST_ACTIVE_ADMIN'
        throw error
      }
      const ownedHackathonCount = await Hackathon.countDocuments({ createdBy: user._id }).session(session)
      if (ownedHackathonCount && !admin) {
        const error = new Error('Transfer or remove your organizer-owned hackathons before deleting this account.')
        error.status = 409
        error.code = 'OWNED_HACKATHONS_REMAIN'
        throw error
      }

      const registrations = await HackathonRegistration.find({ userId: user._id, status: { $ne: 'cancelled' } }).select('hackathonId domainId').session(session).lean()
      await HackathonRegistration.deleteMany({ userId: user._id }, { session })
      const affectedDomains = new Map(registrations.map(registration => [`${registration.hackathonId}:${registration.domainId}`, registration]))
      for (const registration of affectedDomains.values()) {
        const activeCount = await HackathonRegistration.countDocuments({ hackathonId: registration.hackathonId, domainId: registration.domainId, status: { $ne: 'cancelled' } }).session(session)
        await Hackathon.updateOne(
          { _id: registration.hackathonId },
          { $set: { 'domains.$[domain].seatsTaken': activeCount } },
          { session, arrayFilters: [{ 'domain.domainId': registration.domainId }] },
        )
      }

      const teams = await HackathonTeam.find({ members: user._id }).session(session)
      for (const team of teams) {
        const remainingMembers = team.members.filter(member => String(member) !== String(user._id))
        if (String(team.leader) === String(user._id) && remainingMembers.length) team.leader = remainingMembers[0]
        team.members = remainingMembers
        if (remainingMembers.length) {
          await team.save({ session })
        } else {
          const teamSubmissions = await HackathonSubmission.find({ teamId: team._id }).select('files.key').session(session).lean()
          teamSubmissions.forEach(submission => submission.files.forEach(file => fileKeysToDelete.add(file.key)))
          await HackathonSubmission.deleteMany({ teamId: team._id }, { session })
          await HackathonTeam.deleteOne({ _id: team._id }, { session })
          await HackathonRegistration.updateMany({ teamId: team._id }, { $unset: { teamId: 1, teamName: 1 }, $set: { status: 'registered' } }, { session })
        }
      }

      if (admin) {
        await Hackathon.updateMany({ createdBy: user._id }, { $set: { createdBy: admin._id } }, { session })
        await HackathonAnnouncement.updateMany({ authorId: user._id }, { $set: { authorId: admin._id } }, { session })
      } else {
        await HackathonAnnouncement.deleteMany({ authorId: user._id }, { session })
      }
      await Hackathon.updateMany({ organiserEmail: user.email }, { $unset: { organiserEmail: 1 } }, { session })
      const uploadedFiles = await HackathonSubmission.find({ 'files.uploadedBy': user._id }).select('files.key files.uploadedBy').session(session).lean()
      uploadedFiles.forEach(submission => submission.files.filter(file => String(file.uploadedBy) === String(user._id)).forEach(file => fileKeysToDelete.add(file.key)))
      await HackathonSubmission.updateMany(
        { $or: [{ submittedBy: user._id }, { 'scores.judgeId': user._id }, { 'files.uploadedBy': user._id }] },
        { $set: { submittedBy: null }, $pull: { scores: { judgeId: user._id }, files: { uploadedBy: user._id } } },
        { session },
      )

      await ResumeProject.deleteMany({ owner: user._id }, { session })
      await ResumeAnalysis.deleteMany({ owner: user._id }, { session })
      await ResumeAnalysisEvent.deleteMany({ owner: user._id }, { session })
      await Attempt.deleteMany({ user: user._id }, { session })
      await Contact.deleteMany({ email: user.email }, { session })
      await Subscriber.deleteMany({ email: user.email }, { session })
      await User.deleteOne({ _id: user._id }, { session })
    }
    const removeWithConsistency = () => session ? session.withTransaction(removeAccountData) : removeAccountData()
    if (req.user.role === 'admin') await withAdminMutationLock(removeWithConsistency)
    else await removeWithConsistency()
    if (r2Configured && fileKeysToDelete.size) {
      const deletions = await Promise.allSettled([...fileKeysToDelete].map(key => deleteStoredObject(key)))
      if (deletions.some(result => result.status === 'rejected')) console.error('[account] some private files could not be removed')
    }
    res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(0), maxAge: undefined })
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(0), maxAge: undefined })
    res.status(204).end()
  } finally {
    if (session) await session.endSession()
  }
}))

// Save/unsave internship
router.post(
  '/save-internship/:id',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    const internshipId = req.params.id
    // `savedInternships` holds ObjectIds, so compare their string form
    // against the request param rather than using indexOf on the raw value.
    const idx = user.savedInternships.findIndex(
      (saved) => String(saved) === String(internshipId),
    )
    if (idx > -1) {
      user.savedInternships.splice(idx, 1)
    } else {
      user.savedInternships.push(internshipId)
    }
    await user.save()
    res.json({ saved: idx === -1, savedInternships: user.savedInternships })
  }),
)

export default router
