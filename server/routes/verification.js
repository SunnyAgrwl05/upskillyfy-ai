import express from 'express'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../middleware/error.js'
import { verifyCertificateToken } from '../services/certificateService.js'

const router = express.Router()
const verificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Verification rate limit reached. Try again shortly.', code: 'RATE_LIMITED' },
})

router.get('/:token', verificationLimiter, asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Verification is temporarily unavailable.', code: 'DATABASE_UNAVAILABLE' })
  }
  res.json(await verifyCertificateToken(req.params.token))
}))

export default router
