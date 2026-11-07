import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { protect, optionalAuth, ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../middleware/error.js'
import { authLimiter } from '../middleware/security.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
  googleLoginSchema,
} from '../validation/authSchemas.js'
import { env, isProduction } from '../config/env.js'
import { emailConfigured, sendEmail } from '../services/email.js'

const router = express.Router()
const ACCESS_TTL_MS = 15 * 60 * 1000
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000

function issueAuthentication(user, res) {
  const tokenVersion = user.tokenVersion || 0
  const accessToken = jwt.sign({ id: user._id, type: 'access', tokenVersion }, env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id: user._id, type: 'refresh', tokenVersion }, env.JWT_SECRET, { expiresIn: '30d' })
  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions(ACCESS_TTL_MS))
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(REFRESH_TTL_MS))
  return accessToken
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, branch: user.branch, role: user.role }
}

async function createEmailVerification(user) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  user.emailVerificationCodeHash = crypto.createHash('sha256').update(code).digest('hex')
  user.emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()
  let sent = false
  if (emailConfigured) {
    sent = await sendEmail({
      to: user.email,
      subject: 'Verify your Upskillyfy account',
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your Upskillyfy verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    })
  }
  return { code, sent }
}

/* ---------------------------------------------------------------- register */

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, branch, college, year, linkedin, github } = req.body

    const existing = await User.findOne({ email }).lean()
    if (existing) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
        code: 'EMAIL_TAKEN',
        errors: { email: 'This email is already registered.' },
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      branch,
      college,
      year,
      linkedin,
      github,
    })
    let verification
    try { verification = await createEmailVerification(user) } catch { console.error('[auth] verification email delivery failed') }

    const accessToken = issueAuthentication(user, res)
    res.status(201).json({
      token: accessToken,
      user: publicUser(user),
      emailVerificationRequired: true,
      ...(!emailConfigured && !isProduction && verification ? { devVerificationCode: verification.code } : {}),
    })
  }),
)

/* ---------------------------------------------------------------- login */

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        message: 'That email and password combination is incorrect.',
        code: 'INVALID_CREDENTIALS',
      })
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      return res.status(401).json({
        message: 'That email and password combination is incorrect.',
        code: 'INVALID_CREDENTIALS',
      })
    }

    if (user.isActive === false) return res.status(401).json({ message: 'This account is deactivated.', code: 'ACCOUNT_DEACTIVATED' })

    const accessToken = issueAuthentication(user, res)
    res.json({ token: accessToken, user: publicUser(user) })
  }),
)

/* ---------------------------------------------------------------- refresh */

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const incoming = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken

    if (!incoming) {
      return res.status(401).json({ message: 'No refresh token provided.', code: 'NO_REFRESH_TOKEN' })
    }

    let decoded
    try {
      decoded = jwt.verify(incoming, env.JWT_SECRET)
    } catch {
      return res.status(401).json({ message: 'Your session has expired.', code: 'INVALID_REFRESH' })
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type.', code: 'INVALID_REFRESH' })
    }

    const currentUser = await User.findById(decoded.id)
    if (!currentUser || currentUser.isActive === false) {
      return res.status(401).json({ message: 'Your session has expired.', code: 'INVALID_REFRESH' })
    }
    const expectedVersion = decoded.tokenVersion ?? currentUser.tokenVersion ?? 0
    const versionFilter = { _id: currentUser._id, $or: [{ tokenVersion: expectedVersion }] }
    if (expectedVersion === 0) versionFilter.$or.push({ tokenVersion: { $exists: false } })
    const user = await User.findOneAndUpdate(versionFilter, { $inc: { tokenVersion: 1 } }, { new: true })
    if (!user) return res.status(401).json({ message: 'Session invalidated. Please sign in again.', code: 'SESSION_INVALID' })
    const accessToken = issueAuthentication(user, res)
    res.json({ token: accessToken, user: publicUser(user) })
  }),
)

/* -------------------------------------------------------------------- me */

router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user)
  }),
)

router.post('/verify-email', protect, authLimiter, validate(emailVerificationSchema), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+emailVerificationCodeHash +emailVerificationExpiresAt')
  if (!user) return res.status(404).json({ message: 'User not found.', code: 'USER_NOT_FOUND' })
  if (user.emailVerifiedAt) return res.json({ message: 'Email is already verified.', emailVerified: true })
  const submittedHash = crypto.createHash('sha256').update(req.body.code).digest('hex')
  if (!user.emailVerificationCodeHash || user.emailVerificationExpiresAt <= new Date() || submittedHash !== user.emailVerificationCodeHash) {
    return res.status(400).json({ message: 'The verification code is invalid or expired.', code: 'INVALID_VERIFICATION_CODE' })
  }
  user.emailVerifiedAt = new Date()
  user.emailVerificationCodeHash = undefined
  user.emailVerificationExpiresAt = undefined
  await user.save()
  res.json({ message: 'Email verified successfully.', emailVerified: true })
}))

router.post('/resend-verification', protect, authLimiter, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) return res.status(404).json({ message: 'User not found.', code: 'USER_NOT_FOUND' })
  if (user.emailVerifiedAt) return res.json({ message: 'Email is already verified.', emailVerified: true })
  let verification
  try {
    verification = await createEmailVerification(user)
  } catch {
    console.error('[auth] verification email delivery failed')
    return res.status(503).json({ message: 'Verification email could not be sent. Try again shortly.', code: 'EMAIL_UNAVAILABLE' })
  }
  res.json({
    message: 'A verification code has been sent if email delivery is configured.',
    ...(!emailConfigured && !isProduction ? { devVerificationCode: verification.code } : {}),
  })
}))

router.post('/google', authLimiter, validate(googleLoginSchema), asyncHandler(async (req, res) => {
  if (!env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: 'Google sign-in is not configured.', code: 'GOOGLE_LOGIN_UNAVAILABLE' })
  let identity
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(req.body.idToken)}`, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error('Google rejected the credential')
    identity = await response.json()
  } catch {
    return res.status(401).json({ message: 'Google sign-in could not verify this account.', code: 'INVALID_GOOGLE_CREDENTIAL' })
  }
  const issuerValid = ['accounts.google.com', 'https://accounts.google.com'].includes(identity.iss)
  const tokenNotExpired = Number(identity.exp) * 1000 > Date.now()
  if (!issuerValid || identity.aud !== env.GOOGLE_CLIENT_ID || identity.email_verified !== 'true' || !identity.sub || !identity.email || !tokenNotExpired) {
    return res.status(401).json({ message: 'Google sign-in could not verify this account.', code: 'INVALID_GOOGLE_CREDENTIAL' })
  }
  const email = identity.email.toLowerCase()
  let user = await User.findOne({ googleId: identity.sub })
  if (!user) {
    user = await User.findOne({ email }).select('+googleId')
    if (user?.googleId && user.googleId !== identity.sub) return res.status(409).json({ message: 'This account is linked to a different Google identity.', code: 'GOOGLE_ACCOUNT_CONFLICT' })
    if (!user) {
      try {
        user = await User.create({ name: String(identity.name || email.split('@')[0]).slice(0, 80), email, googleId: identity.sub, emailVerifiedAt: new Date() })
      } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'An account already exists for this email. Sign in with that account first.', code: 'EMAIL_TAKEN' })
        throw error
      }
    } else {
      user.googleId = identity.sub
      user.emailVerifiedAt ||= new Date()
      await user.save()
    }
  }
  if (user.isActive === false) return res.status(401).json({ message: 'This account is deactivated.', code: 'ACCOUNT_DEACTIVATED' })
  const accessToken = issueAuthentication(user, res)
  res.json({ token: accessToken, user: publicUser(user) })
}))

/* ----------------------------------------------------------- forgot password */

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    const genericMessage = 'If an account exists for that address, we have sent a password reset link.'

    if (!user) {
      return res.json({ message: genericMessage })
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    user.resetTokenHash = hashedToken
    user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000)
    await user.save()

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`
    let sent = false
    if (emailConfigured) {
      try {
        sent = await sendEmail({
          to: email,
          subject: 'Reset your Upskillyfy password',
          text: `Use this link to reset your password. It expires in 30 minutes: ${resetUrl}`,
          html: `<p><a href="${resetUrl}">Reset your Upskillyfy password</a></p><p>This link expires in 30 minutes.</p>`,
        })
      } catch {
        console.error('[auth] password reset email delivery failed')
      }
    }
    res.json({ message: genericMessage, ...(!sent && !emailConfigured && !isProduction ? { devResetUrl: resetUrl } : {}) })
  }),
)

/* ------------------------------------------------------------- reset password */

router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { token, password } = req.body

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetTokenHash: hashedToken,
      resetTokenExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({
        message: 'This reset link is invalid or has expired.',
        code: 'INVALID_RESET_TOKEN',
      })
    }

    user.password = password
    user.resetTokenHash = undefined
    user.resetTokenExpires = undefined
    user.tokenVersion = (user.tokenVersion || 0) + 1
    await user.save()

    res.json({ message: 'Your password has been reset. You can sign in now.' })
  }),
)

/* -------------------------------------------------------------------- logout */

router.post(
  '/logout',
  optionalAuth,
  asyncHandler(async (req, res) => {
    let userId = req.user?._id
    if (!userId) {
      const refreshToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, env.JWT_SECRET)
          if (decoded.type === 'refresh') {
            const user = await User.findById(decoded.id)
            if (user && (decoded.tokenVersion || 0) === (user.tokenVersion || 0)) userId = user._id
          }
        } catch {
          // Clearing cookies remains successful even when both tokens expired.
        }
      }
    }
    if (userId) await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } })
    res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(0), maxAge: undefined })
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(0), maxAge: undefined })
    res.json({ message: 'Signed out.' })
  }),
)

export default router
