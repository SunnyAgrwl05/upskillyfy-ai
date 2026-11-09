import './config/dotenv.js'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { corsOrigins, isProduction } from './config/env.js'
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
const allowedOrigins = new Set([
  ...corsOrigins,
  ...(!isProduction ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []),
])

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS'))
  },
  credentials: true,
}))
app.use('/api/resume-projects', express.json({ limit: '15mb' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

app.get('/api/health', (req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'ok' : 'degraded',
    database,
    message: 'Upskillyfy API',
    time: new Date(),
  })
})

app.use(notFound)
app.use(errorHandler)

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is required; refusing to start without persistent storage.')
}
await mongoose.connect(process.env.MONGODB_URI)
console.log('✅ MongoDB Connected')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Upskillyfy Server: http://localhost:${PORT}`))
