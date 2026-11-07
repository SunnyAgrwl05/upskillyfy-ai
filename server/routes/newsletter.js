import express from 'express'
import { z } from 'zod'
import Subscriber from '../models/Subscriber.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { writeLimiter, adminExportLimiter } from '../middleware/security.js'
import { csvCell } from '../services/csv.js'
import { writeAdminAudit } from '../services/adminSecurity.js'

const router = express.Router()
const emailSchema = z.object({ email: z.string().trim().email().max(320).transform(value => value.toLowerCase()) }).strict()
const parseEmail = (req, res) => {
  const parsed = emailSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ message: 'Enter a valid email address.', code: 'VALIDATION_ERROR', fields: { email: 'Enter a valid email address.' } })
    return null
  }
  return parsed.data.email
}

router.post('/subscribe', writeLimiter, asyncHandler(async (req, res) => {
  const email = parseEmail(req, res)
  if (!email) return
  try {
    const existing = await Subscriber.findOne({ email }).select('isActive').lean()
    if (existing?.isActive) return res.status(200).json({ message: 'Already subscribed! Stay tuned.', alreadyExists: true })
    await Subscriber.updateOne(
      { email },
      { $set: { email, isActive: true, subscribedAt: new Date() } },
      { upsert: true, runValidators: true },
    )
    res.status(existing ? 200 : 201).json({ message: 'Subscribed successfully! Welcome to Upskillyfy. 🚀', alreadyExists: false })
  } catch (error) {
    if (error.code === 11000) return res.status(200).json({ message: 'Already subscribed! Stay tuned.', alreadyExists: true })
    throw error
  }
}))

router.post('/unsubscribe', writeLimiter, asyncHandler(async (req, res) => {
  const email = parseEmail(req, res)
  if (!email) return
  await Subscriber.updateOne({ email, isActive: true }, { $set: { isActive: false } })
  // Same response whether the address exists or is already unsubscribed.
  res.json({ message: 'If this address was subscribed, it has been unsubscribed.' })
}))

router.get('/export.csv', protect, adminOnly, adminExportLimiter, asyncHandler(async (req, res) => {
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"', 'Cache-Control': 'no-store' })
  res.write('Email,Status,Subscribed At,Updated At\r\n')
  const cursor = Subscriber.find({}).select('email isActive subscribedAt updatedAt').sort({ _id: 1 }).lean().cursor({ batchSize: 250 })
  try {
    for await (const row of cursor) {
      const line = [row.email, row.isActive ? 'active' : 'unsubscribed', row.subscribedAt?.toISOString(), row.updatedAt?.toISOString()].map(csvCell).join(',') + '\r\n'
      if (!res.write(line)) await new Promise(resolve => res.once('drain', resolve))
    }
    await writeAdminAudit(req, { action: 'newsletter.csv_exported', targetType: 'newsletter', targetId: 'subscribers', afterSummary: { exportedRows: 'streamed' } })
    res.end()
  } finally {
    await cursor.close()
  }
}))

// Subscriber administration is private and bounded; old clients can continue
// using the same `count` and `subscribers` fields.
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const querySchema = z.object({ page: z.string().regex(/^[1-9]\d{0,6}$/).optional(), limit: z.string().regex(/^[1-9]\d{0,2}$/).optional(), search: z.string().trim().max(100).optional(), status: z.enum(['active', 'unsubscribed', 'all']).optional() }).strict()
  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success || Number(parsed.data.limit || 25) > 100) return res.status(400).json({ message: 'Invalid query parameters.', code: 'INVALID_QUERY' })
  const page = Number(parsed.data.page || 1)
  const limit = Number(parsed.data.limit || 25)
  const filter = parsed.data.status === 'all' ? {} : { isActive: parsed.data.status !== 'unsubscribed' }
  if (parsed.data.search) filter.email = { $regex: parsed.data.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
  const [subscribers, count] = await Promise.all([
    Subscriber.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).select('email isActive subscribedAt createdAt updatedAt').lean(),
    Subscriber.countDocuments(filter),
  ])
  res.json({ count, subscribers, pagination: { page, limit, total: count, pages: Math.max(1, Math.ceil(count / limit)) } })
}))

export default router
