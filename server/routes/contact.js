import express from 'express'
import Contact from '../models/Contact.js'
import { validate } from '../middleware/validate.js'
import { asyncHandler } from '../middleware/error.js'
import { writeLimiter } from '../middleware/security.js'
import { contactSchema } from '../validation/authSchemas.js'

const router = express.Router()

/**
 * Submit a contact message.
 *
 * Rate limited because this endpoint sends email and is a common spam target.
 */
router.post(
  '/',
  writeLimiter,
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    const { name, email, branch, subject, message } = req.body

    const contact = await Contact.create({ name, email, branch, subject, message })

    res.status(201).json({
      message: 'Message sent successfully! We will reply within 24-48 hours.',
      id: contact._id,
    })
  }),
)

/** List all messages — admin only. */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  }),
)

export default router