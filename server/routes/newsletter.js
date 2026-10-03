import express from 'express'
import Subscriber from '../models/Subscriber.js'

const router = express.Router()

// Subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !email.includes('@'))
      return res.status(400).json({ message: 'Valid email required' })

    const existing = await Subscriber.findOne({ email })
    if (existing)
      return res.status(200).json({ message: 'Already subscribed! Stay tuned.', alreadyExists: true })

    await Subscriber.create({ email })
    res.status(201).json({ message: 'Subscribed successfully! Welcome to Upskillyfy. 🚀' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body
    await Subscriber.findOneAndUpdate({ email }, { isActive: false })
    res.json({ message: 'Unsubscribed successfully.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all subscribers (admin)
router.get('/', async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 })
    res.json({ count: subscribers.length, subscribers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
