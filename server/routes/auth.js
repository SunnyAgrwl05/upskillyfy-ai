import express from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { rateLimit } from 'express-rate-limit'
import User from '../models/User.js'
import AuthEvent from '../models/AuthEvent.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many authentication attempts. Please try again later.' } })
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) throw Object.assign(new Error('Authentication is unavailable until JWT_SECRET is configured.'), { status: 503 })
  return process.env.JWT_SECRET
}
const signToken = id => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' })
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api',
  maxAge: 30 * 24 * 60 * 60 * 1000,
})
const issueSession = (res, user) => {
  res.cookie('upskillyfy_token', signToken(user._id), cookieOptions())
}
const clearSession = res => res.clearCookie('upskillyfy_token', { ...cookieOptions(), maxAge: undefined })
async function logEvent(req, { action, provider = 'password', status, user = null, email = '', failureCode = '' }) {
  try {
    await AuthEvent.create({
      action, provider, status, user: user?._id || null,
      email: String(email || user?.email || '').toLowerCase().trim(),
      ipAddress: String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim().slice(0, 64),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
      failureCode: String(failureCode).slice(0, 80),
    })
  } catch (error) { console.error('Auth audit log error:', error.message) }
}
const payload = user => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
  branch: user.branch, college: user.college, year: user.year,
  enrolledCourses: user.enrolledCourses || [], savedInternships: user.savedInternships || [],
})

router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password, role, branch, college, year, termsAccepted, marketingConsent } = req.body
  try {
    getJwtSecret()
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' })
    if (termsAccepted !== true) return res.status(400).json({ message: 'Please accept the Terms of Service and Privacy Policy to create an account.' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' })
    const normalized = email.toLowerCase().trim()
    if (await User.findOne({ email: normalized })) {
      await logEvent(req, { action: 'signup', status: 'failure', email: normalized, failureCode: 'EMAIL_ALREADY_EXISTS' })
      return res.status(409).json({ message: 'An account with this email already exists' })
    }
    const user = await User.create({
      name: name.trim(), email: normalized, password,
      role: ['student', 'faculty'].includes(role) ? role : 'student',
      branch: branch || '', college: college || '', year: year || '',
      authProviders: ['password'],
      privacyConsents: { termsAcceptedAt: new Date(), privacyAcceptedAt: new Date(), policyVersion: '2026-11-09', marketingEmails: marketingConsent === true },
    })
    await logEvent(req, { action: 'signup', status: 'success', user })
    issueSession(res, user)
    res.status(201).json({ user: payload(user) })
  } catch (error) {
    console.error('Registration error:', error)
    await logEvent(req, { action: 'signup', status: 'failure', email, failureCode: error.code || 'REGISTRATION_ERROR' })
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Failed to register account' })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  try {
    getJwtSecret()
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const normalized = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalized })
    if (!user || !(await user.comparePassword(password))) {
      await logEvent(req, { action: 'login', status: 'failure', email: normalized, failureCode: 'INVALID_CREDENTIALS' })
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.authProviders.includes('password')) { user.authProviders.push('password'); await user.save() }
    await logEvent(req, { action: 'login', status: 'success', user })
    issueSession(res, user)
    res.json({ user: payload(user) })
  } catch (error) {
    console.error('Login error:', error)
    await logEvent(req, { action: 'login', status: 'failure', email, failureCode: error.code || 'LOGIN_ERROR' })
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Failed to login' })
  }
})

router.post('/google', authLimiter, async (req, res) => {
  const { credential, intent = 'login', role = 'student', branch = '', college = '', year = '', termsAccepted } = req.body
  let email = ''
  let createdAccount = false
  try {
    getJwtSecret()
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: 'Google sign-in is not configured yet.' })
    if (!credential) return res.status(400).json({ message: 'Google credential is required.' })
    if (!['login', 'signup'].includes(intent)) return res.status(400).json({ message: 'Invalid Google authentication intent.' })
    if (intent === 'signup' && termsAccepted !== true) return res.status(400).json({ message: 'Please accept the Terms of Service and Privacy Policy to create an account.' })
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
    const profile = ticket.getPayload()
    if (!profile?.sub || !profile.email || !profile.email_verified) {
      await logEvent(req, { action: intent, provider: 'google', status: 'failure', email, failureCode: 'GOOGLE_EMAIL_NOT_VERIFIED' })
      return res.status(401).json({ message: 'Google account email could not be verified.' })
    }
    email = profile.email.toLowerCase().trim()
    let user = await User.findOne({ googleId: profile.sub })
    if (!user) {
      const emailOwner = await User.findOne({ email })
      if (emailOwner) {
        await logEvent(req, { action: intent, provider: 'google', status: 'failure', email, failureCode: 'EXPLICIT_LINK_REQUIRED' })
        return res.status(409).json({ message: 'An account already exists with this email. Sign in using your existing method first; Google linking must be completed from account settings.' })
      }
      if (intent !== 'signup') return res.status(404).json({ message: 'No account found. Please sign up first.' })
      user = await User.create({
        name: profile.name || email.split('@')[0], email, googleId: profile.sub,
        password: undefined, avatar: profile.picture || '',
        role: ['student', 'faculty'].includes(role) ? role : 'student',
        branch, college, year, authProviders: ['google'],
        privacyConsents: { termsAcceptedAt: new Date(), privacyAcceptedAt: new Date(), policyVersion: '2026-11-09', marketingEmails: false },
      })
      createdAccount = true
    } else {
      if (intent === 'signup') return res.status(409).json({ message: 'A Google account is already registered. Please sign in instead.' })
      if (!user.authProviders.includes('google')) { user.authProviders.push('google'); await user.save() }
    }
    await logEvent(req, { action: createdAccount ? 'signup' : 'login', provider: 'google', status: 'success', user })
    issueSession(res, user)
    res.json({ user: payload(user), isNewUser: createdAccount })
  } catch (error) {
    console.error('Google authentication error:', error.message)
    await logEvent(req, { action: intent === 'signup' ? 'signup' : 'login', provider: 'google', status: 'failure', email, failureCode: error.code || 'GOOGLE_AUTH_ERROR' })
    res.status(error.status || 401).json({ message: error.status ? error.message : 'Google authentication failed. Please try again.' })
  }
})

router.post('/logout', (req, res) => {
  clearSession(res)
  res.json({ message: 'Logged out successfully.' })
})
router.get('/me', protect, async (req, res) => res.json(payload(req.user)))
export default router
