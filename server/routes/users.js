import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../middleware/error.js'
import { updateProfileSchema } from '../validation/authSchemas.js'

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