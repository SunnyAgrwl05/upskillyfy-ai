import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Not authorized' })
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
  try {
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ message: 'Not authorized' })
    next()
  } catch (err) {
    next(err)
  }
}

export const optionalAuth = async (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return next()
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return next()
  }
  try {
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    next(err)
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  next()
}