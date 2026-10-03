import express from 'express'
import Internship from '../models/Internship.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Get all (with filters)
router.get('/', async (req, res) => {
  try {
    const { branch, mode, status, search } = req.query
    let query = { isVerified: true }
    if (branch && branch !== 'All') query.branch = { $in: [branch, 'All'] }
    if (mode && mode !== 'All Modes') query.mode = mode
    if (status && status !== 'All') query.status = status
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ]
    const internships = await Internship.find(query).sort({ createdAt: -1 })
    res.json(internships)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    )
    if (!internship) return res.status(404).json({ message: 'Not found' })
    res.json(internship)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const internship = await Internship.create(req.body)
    res.status(201).json(internship)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(internship)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Seed sample data
router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    await Internship.deleteMany({})
    const samples = [
      { title: 'SDE Intern — Backend', company: 'FinTech Startup', description: 'Build and ship APIs for a fast-growing fintech startup.', branch: ['CSE'], skills: ['Java', 'Spring Boot'], stipend: '₹10,000/mo', duration: '3 months', mode: 'Remote', status: 'Open', isVerified: true },
      { title: 'ML Research Intern', company: 'AI Lab', description: 'Assist in building ML models for healthcare analytics.', branch: ['CSE'], skills: ['Python', 'Scikit-learn'], stipend: '₹8,000/mo', duration: '2 months', mode: 'Remote', status: 'New', isVerified: true },
      { title: 'Frontend Developer Intern', company: 'EdTech Company', description: 'Build responsive UIs in React.', branch: ['CSE'], skills: ['React', 'Tailwind'], stipend: '₹6,000/mo', duration: '3 months', mode: 'Hybrid', status: 'Open', isVerified: true },
      { title: 'Embedded Systems Intern', company: 'IoT Startup', description: 'Work on firmware for smart-home devices.', branch: ['ECE'], skills: ['C/C++', 'Arduino'], stipend: '₹5,000/mo', duration: '6 months', mode: 'On-site', status: 'Open', isVerified: true },
      { title: 'Mechanical Design Intern', company: 'EV Manufacturer', description: 'CAD modelling for EV components.', branch: ['ME'], skills: ['SolidWorks', 'CAD'], stipend: '₹8,000/mo', duration: '3 months', mode: 'On-site', status: 'Open', isVerified: true },
      { title: 'Power Systems Intern', company: 'Renewable Energy Co.', description: 'Load analysis and simulation work.', branch: ['EE'], skills: ['MATLAB', 'Simulink'], stipend: '₹6,000/mo', duration: '3 months', mode: 'Remote', status: 'New', isVerified: true },
      { title: 'Campus Ambassador', company: 'Global EdTech Brand', description: 'Represent brand on your campus.', branch: ['All'], skills: ['Communication', 'Marketing'], stipend: 'Perks + Certificate', duration: 'Ongoing', mode: 'On-campus', status: 'Closing Soon', isVerified: true },
    ]
    const result = await Internship.insertMany(samples)
    res.json({ message: `${result.length} internships seeded!` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router