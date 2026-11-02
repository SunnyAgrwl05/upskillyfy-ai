import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'

const getJwtSecret = () => process.env.JWT_SECRET

/**
 * Protect routes: requires valid Bearer JWT token
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please login.' })
  }
  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) return res.status(401).json({ message: 'Authentication required. Please login.' })
  const secret = getJwtSecret()
  if (!secret) {
    return res.status(503).json({ message: 'Authentication is unavailable until JWT_SECRET is configured.', code: 'AUTH_NOT_CONFIGURED' })
  }

  try {
    const decoded = jwt.verify(token, secret)
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'MongoDB is unavailable.', code: 'DATABASE_UNAVAILABLE' })
    }

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User account not found' })
    }

    req.user = user
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token. Please login again.' })
    }
    return next(err)
  }
  next()
}

/**
 * Restrict to administrators
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required.' })
  }
  next()
}

/**
 * Optional authentication: attaches user if valid token exists, but doesn't block if missing
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const secret = getJwtSecret()
    if (secret && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, secret)
      const user = await User.findById(decoded.id).select('-password')
      if (user) req.user = user
    }
  } catch {
    // Continue without user if token is invalid or expired
  }
  next()
}