import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env, isProduction } from '../config/env.js'

export const ACCESS_COOKIE = 'upskillyfy_access'
export const REFRESH_COOKIE = 'upskillyfy_refresh'

/**
 * Cookie attributes for the access token.
 *
 * The access token is sent with every API request, so it is scoped to `/`.
 */
export const accessCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: maxAgeMs,
})

/**
 * Cookie attributes for the refresh token.
 *
 * Scoped to `/api/auth` so it is only ever transmitted to the endpoints that
 * need it — this limits the blast radius if the cookie is ever leaked.
 */
export const refreshCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: maxAgeMs,
})

/**
 * Verify a JWT access token and attach the user to `req.user`.
 *
 * Supports both the Bearer header (mobile/CLI clients) and the HttpOnly
 * cookie (browsers).
 */
export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1]
    if (!token && req.cookies) token = req.cookies[ACCESS_COOKIE]
    if (!token) return res.status(401).json({ message: 'Not authorized', code: 'NO_TOKEN' })

    const decoded = jwt.verify(token, env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please sign in again.', code: 'USER_NOT_FOUND' })
    }

    // If tokenVersion was bumped (e.g. after a password reset), previously
    // issued tokens are no longer valid.
    if (
      user.tokenVersion !== undefined &&
      decoded.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({ message: 'Session invalidated. Please sign in again.', code: 'SESSION_INVALID' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.', code: 'TOKEN_EXPIRED' })
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please sign in again.', code: 'INVALID_TOKEN' })
    }
    res.status(401).json({ message: 'Not authorized', code: 'AUTH_ERROR' })
  }
}

/**
 * Role-based access control middleware.
 * Usage: router.get('/admin-only', protect, adminOnly, handler)
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized', code: 'NO_TOKEN' })
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only', code: 'FORBIDDEN' })
  }
  next()
}

/**
 * Optional auth — attaches the user if a valid token is present, otherwise
 * continues unauthenticated. Used by endpoints that work for both guests and
 * signed-in users (e.g. starting an assessment attempt).
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1]
    if (!token && req.cookies) token = req.cookies[ACCESS_COOKIE]
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')
      if (user) req.user = user
    }
  } catch {
    // Swallow — the request continues unauthenticated.
  }
  next()
}
