import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import MongoRateLimitStore from '../services/MongoRateLimitStore.js'

/**
 * Rate limiters.
 *
 * `authLimiter` is deliberately strict — credential stuffing is the most
 * common attack against a login endpoint, so it gets the tightest budget.
 */

const jsonMessage = (message, code) => ({ message, code })

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  store: new MongoRateLimitStore('api'),
  skip: req => req.path === '/health',
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many requests. Please try again shortly.', 'RATE_LIMITED'),
})

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  store: new MongoRateLimitStore('auth'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown')
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 320) : '<missing-email>'
    return `${ip}:${email}`
  },
  message: jsonMessage(
    'Too many attempts from this device. Please try again in a few minutes.',
    'RATE_LIMITED',
  ),
})

export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  store: new MongoRateLimitStore('write'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage(
    'You have sent too many requests. Please try again later.',
    'RATE_LIMITED',
  ),
})

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  store: new MongoRateLimitStore('admin'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Admin request limit reached. Please retry shortly.', 'RATE_LIMITED'),
})

export const adminPrivilegeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  store: new MongoRateLimitStore('admin-privilege'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Privilege change limit reached. Please retry shortly.', 'RATE_LIMITED'),
})

export const adminExportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  store: new MongoRateLimitStore('admin-export'),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Export limit reached. Please retry later.', 'RATE_LIMITED'),
})
