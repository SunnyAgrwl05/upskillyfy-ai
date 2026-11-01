import express from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { protect, ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../middleware/error.js'
import { authLimiter } from '../middleware/security.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/authSchemas.js'
import { env, isProduction } from '../config/env.js'

const router = express.Router()

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

    const accessToken = jwt.sign({ id: user._id, type: 'access' }, env.JWT_SECRET, { expiresIn: '30d' })
    const refreshToken = jwt.sign({ id: user._id, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '30d' })

    res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions(30 * 24 * 60 * 60 * 1000))
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(30 * 24 * 60 * 60 * 1000))

    res.status(201).json({ token: accessToken, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      role: user.role,
    } })
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

    const accessToken = jwt.sign({ id: user._id, type: 'access' }, env.JWT_SECRET, { expiresIn: '30d' })
    const refreshToken = jwt.sign({ id: user._id, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '30d' })

    res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions(30 * 24 * 60 * 60 * 1000))
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(30 * 24 * 60 * 60 * 1000))

    res.json({ token: accessToken, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      role: user.role,
    } })
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

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'Your session has expired.', code: 'INVALID_REFRESH' })
    }

    const accessToken = jwt.sign({ id: user._id, type: 'access' }, env.JWT_SECRET, { expiresIn: '30d' })
    const refreshToken = jwt.sign({ id: user._id, type: 'refresh' }, env.JWT_SECRET, { expiresIn: '30d' })

    res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions(30 * 24 * 60 * 60 * 1000))
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(30 * 24 * 60 * 60 * 1000))

    res.json({ token: accessToken, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      role: user.role,
    } })
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

    console.log(`[auth] password reset link for ${email}: ${resetUrl}`)

    res.json({ message: genericMessage, ...(isProduction ? {} : { devResetUrl: resetUrl }) })
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
  asyncHandler(async (req, res) => {
    res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions(0), maxAge: undefined })
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(0), maxAge: undefined })
    res.json({ message: 'Signed out.' })
  }),
)

export default router