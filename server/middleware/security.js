import rateLimit from 'express-rate-limit'

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
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage('Too many requests. Please try again shortly.', 'RATE_LIMITED'),
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count
  message: jsonMessage(
    'Too many attempts from this device. Please try again in a few minutes.',
    'RATE_LIMITED',
  ),
})

export const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: jsonMessage(
    'You have sent too many requests. Please try again later.',
    'RATE_LIMITED',
  ),
})
