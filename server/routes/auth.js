import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw Object.assign(new Error('Authentication is unavailable until JWT_SECRET is configured.'), { status: 503 })
  }
  return process.env.JWT_SECRET
}
const signToken = (id) => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    getJwtSecret()
    const { name, email, password, role, branch, college, year, termsAccepted, marketingConsent } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    if (termsAccepted !== true) {\n      return res.status(400).json({ message: 'Please accept the Terms of Service and Privacy Policy to create an account.' })\n    }\n    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role && ['student', 'faculty'].includes(role) ? role : 'student',
      branch: branch || '',
      college: college || '',
      year: year || ''
    })

    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        college: user.college,
        year: user.year,
        enrolledCourses: user.enrolledCourses || [],
        savedInternships: user.savedInternships || []
      }
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Failed to register account' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    getJwtSecret()
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user._id)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        college: user.college,
        year: user.year,
        enrolledCourses: user.enrolledCourses || [],
        savedInternships: user.savedInternships || []
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Failed to login' })
  }
})

// GET /api/auth/me (Current user session)
router.get('/me', protect, async (req, res) => {
  res.json(req.user)
})

export default router