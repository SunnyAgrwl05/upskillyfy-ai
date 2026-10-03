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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Upskillyfy API running 🚀', time: new Date() })
})

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err.message))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Upskillyfy Server: http://localhost:${PORT}`)
})
