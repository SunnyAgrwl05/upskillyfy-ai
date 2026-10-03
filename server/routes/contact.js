import express from 'express'
import Contact from '../models/Contact.js'

const router = express.Router()

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, branch, subject, message } = req.body
    if (!name || !email || !subject || !message)
      return res.status(400).json({ message: 'All fields required' })
    const contact = await Contact.create({ name, email, branch, subject, message })
    res.status(201).json({ message: 'Message sent successfully! We will reply within 24-48 hours.', id: contact._id })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all messages (admin)
router.get('/', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router