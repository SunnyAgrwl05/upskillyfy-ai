import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('savedInternships')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, branch, college, year, linkedin, github } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, branch, college, year, linkedin, github },
      { new: true, select: '-password' }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Save/unsave internship
router.post('/save-internship/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const internshipId = req.params.id
    const idx = user.savedInternships.indexOf(internshipId)
    if (idx > -1) {
      user.savedInternships.splice(idx, 1)
    } else {
      user.savedInternships.push(internshipId)
    }
    await user.save()
    res.json({ saved: idx === -1, savedInternships: user.savedInternships })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router