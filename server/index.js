import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import internshipRoutes from './routes/internships.js'
import contactRoutes from './routes/contact.js'
import userRoutes from './routes/users.js'
import communityRoutes from './routes/community.js'
import newsletterRoutes from './routes/newsletter.js'
import learningRoutes from './routes/learning.js'
import assessmentRoutes from './routes/assessments.js'
import { ensureSeedAssessments } from './data/seedAssessments.js'
import CourseProgress from './models/CourseProgress.js'
import RoadmapProgress from './models/RoadmapProgress.js'
import Assessment from './models/Assessment.js'
import AssessmentAttempt from './models/AssessmentAttempt.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/internships', internshipRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/users', userRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/learning', learningRoutes)
app.use('/api/assessments', assessmentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upskillyfy API running 🚀', time: new Date() })
})

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
    await mongoose.connect(process.env.MONGODB_URI)
    await Promise.all([
      CourseProgress.init(),
      RoadmapProgress.init(),
      Assessment.init(),
      AssessmentAttempt.init(),
    ])
    await ensureSeedAssessments()
    console.log('✅ MongoDB Connected')
    app.listen(PORT, () => {
      console.log(`🚀 Upskillyfy Server: http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Unable to start Upskillyfy API:', error.message)
    process.exitCode = 1
  }
}

startServer()
