import './config/dotenv.js'
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
import assessmentRoutes from './routes/assessments.js'
import courseRoutes from './routes/courses.js'
import resourceRoutes from './routes/resources.js'
import resumeProjectRoutes from './routes/resumeProjects.js'
import resumeAnalysisRoutes from './routes/resumeAnalysis.js'
import latexTemplateRoutes from './routes/latexTemplates.js'
import roadmapRoutes from './routes/roadmaps.js'
import certificateRoutes from './routes/certificates.js'
import documentRoutes from './routes/documents.js'
import verificationRoutes from './routes/verification.js'
import adminCredentialRoutes from './routes/adminCredentials.js'
import hackathonRoutes from './routes/hackathons.js'
import { errorHandler, notFound } from './middleware/error.js'

dotenv.config()

const app = express()

const clientUrlEnv = process.env.CLIENT_URL || ''
const configuredOrigins = clientUrlEnv.split(',').map(u => u.trim()).filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like server-to-server, Postman, mobile)
    if (!origin) return callback(null, true)

    // Allow configured URLs, all Vercel preview/production deployments, and localhost
    if (
      configuredOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('upskillyfy')
    ) {
      return callback(null, true)
    }

    return callback(null, true)
  },
  credentials: true
}))
app.use('/api/resume-projects', express.json({ limit: '15mb' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/internships', internshipRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/users', userRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/latex-templates', latexTemplateRoutes)
app.use('/api/resume-projects', resumeProjectRoutes)
app.use('/api/resume-analysis', resumeAnalysisRoutes)
app.use('/api/roadmaps', roadmapRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/verification', verificationRoutes)
app.use('/api/admin/credentials', adminCredentialRoutes)
app.use('/api/hackathons', hackathonRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upskillyfy API running 🚀', time: new Date() })
})

app.use(notFound)
app.use(errorHandler)

// MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err.message))
} else {
  console.log('⚠️ MONGODB_URI not set. Running server without database connection.')
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Upskillyfy Server: http://localhost:${PORT}`)
})
