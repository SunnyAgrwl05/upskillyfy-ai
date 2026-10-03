import express from 'express'
import Community from '../models/Community.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const events = await Community.find({ isActive: true }).sort({ createdAt: -1 })
    res.json(events)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/seed', async (req, res) => {
  try {
    await Community.deleteMany({})
    const events = [
      { title: 'DSA Bootcamp', type: 'Workshop', description: 'Intensive 2-week DSA training with live sessions.', date: 'July 2026', mode: 'Online', isActive: true },
      { title: 'HackUpskillyfy 2026', type: 'Hackathon', description: '48-hour hackathon. Cash prizes + internship offers.', date: 'August 2026', mode: 'Hybrid', isActive: true },
      { title: 'Placement Prep Webinar', type: 'Webinar', description: 'Weekly sessions on aptitude, coding and HR rounds.', date: 'Every Saturday', mode: 'Online', isActive: true },
      { title: 'Web Dev Workshop', type: 'Workshop', description: 'Hands-on React.js workshop. Build 3 projects in 3 days.', date: 'July 2026', mode: 'Online', isActive: true },
      { title: 'AI for Students Summit', type: 'Summit', description: 'Industry leaders on AI careers and opportunities.', date: 'September 2026', mode: 'Hybrid', isActive: true },
    ]
    await Community.insertMany(events)
    res.json({ message: 'Community events seeded!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router