import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, branch, college, year } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })
    const user = await User.create({ name, email, password, branch, college, year })
    const token = signToken(user._id)
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, branch: user.branch, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })
    const token = signToken(user._id)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, branch: user.branch, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user)
})

export default router