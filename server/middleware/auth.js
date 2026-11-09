import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'

const getJwtSecret = () => process.env.JWT_SECRET

const getCookieToken = (req) => {
  const cookieHeader = req.headers.cookie || ''
  const entry = cookieHeader.split(';').map(part => part.trim()).find(part => part.startsWith('upskillyfy_token='))
  if (!entry) return null
  try { return decodeURIComponent(entry.slice('upskillyfy_token='.length)) } catch { return null }
}

const isAllowedCookieOrigin = (origin) => {
  const configured = [
    ...(process.env.CLIENT_URL || '').split(','),
    ...(process.env.EXTRA_CORS_ORIGINS || '').split(','),
    ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []),
  ].map(value => value.trim()).filter(Boolean)
  return Boolean(origin) && configured.includes(origin)
}

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
  const cookieToken = getCookieToken(req)
  const token = bearerToken || cookieToken
  if (cookieToken && !bearerToken && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!isAllowedCookieOrigin(req.headers.origin)) {
      return res.status(403).json({ message: 'Request origin is not allowed.' })
    }
  }
  if (!token) return res.status(401).json({ message: 'Authentication required. Please login.' })
  const secret = getJwtSecret()
  if (!secret) return res.status(503).json({ message: 'Authentication is unavailable until JWT_SECRET is configured.', code: 'AUTH_NOT_CONFIGURED' })

  try {
    const decoded = jwt.verify(token, secret)
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is unavailable.', code: 'DATABASE_UNAVAILABLE' })
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User account not found' })
    req.user = user
    return next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Invalid or expired token. Please login again.' })
    return next(err)
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Access denied: Admin privileges required.' })
  next()
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : getCookieToken(req)
    const secret = getJwtSecret()
    if (secret && token) {
      const decoded = jwt.verify(token, secret)
      const user = await User.findById(decoded.id).select('-password')
      if (user) req.user = user
    }
  } catch {}
  next()
}
