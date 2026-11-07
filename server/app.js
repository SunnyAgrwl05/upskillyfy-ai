// Must be the first import — dotenv loads .env before config/env.js validates variables.
import './config/dotenv.js'

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { apiLimiter } from './middleware/security.js'
import { errorHandler, notFound, asyncHandler } from './middleware/error.js'
import { isProduction, corsOrigins } from './config/env.js'

import authRoutes from './routes/auth.js'
import internshipRoutes from './routes/internships.js'
import contactRoutes from './routes/contact.js'
import userRoutes from './routes/users.js'
import communityRoutes from './routes/community.js'
import newsletterRoutes from './routes/newsletter.js'
import assessmentRoutes from './routes/assessments.js'
import resumeProjectRoutes from './routes/resumeProjects.js'
import latexTemplateRoutes from './routes/latexTemplates.js'
import hackathonRoutes from './routes/hackathons.js'
import resumeAnalysisRoutes from './routes/resumeAnalysis.js'
import adminRoutes from './routes/admin.js'
import { adminLimiter } from './middleware/security.js'

/**
 * Builds the Express application.
 *
 * Kept separate from `index.js` (which owns the listener, database connection
 * and shutdown handling) so tests can mount the app without opening a port.
 */
export const createApp = () => {
  const app = express()

  /* ------------------------------------------------------------- security */

  // Trust the first proxy hop so rate limiting sees the real client IP
  // when running behind Nginx / a load balancer.
  app.set('trust proxy', 1)

  // Sensible defaults for every response. CSP is tightened for the API since
  // it serves JSON, not HTML.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'"],
          scriptSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  )

  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin / server-to-server calls that send no Origin header.
        if (!origin) return callback(null, true)
        if (corsOrigins.includes(origin)) return callback(null, true)
        return callback(new Error(`Origin ${origin} is not allowed by CORS`))
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      exposedHeaders: ['X-Compiler-Log'],
    }),
  )

  // Project source is text validated to 6 MB and requires authentication.
  app.use('/api/resume-projects', express.json({ limit: '15mb' }))

  // Strict body size limits for the rest of the API.
  app.use(express.json({ limit: '100kb' }))
  app.use(express.urlencoded({ extended: true, limit: '100kb' }))
  app.use(cookieParser())

  // Lightweight request logging. Swap for morgan/winston at scale.
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint()
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - startedAt) / 1e6
      if (!req.originalUrl.startsWith('/api/health')) {
        // Query values can contain email addresses, search terms, or tokens.
        console.log(`${req.method} ${req.path} ${res.statusCode} ${ms.toFixed(1)}ms`)
      }
    })
    next()
  })

  /* --------------------------------------------------------------- routes */

  app.use('/api', apiLimiter)
  app.use('/api/auth', authRoutes)
  app.use('/api/internships', internshipRoutes)
  app.use('/api/contact', contactRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/community', communityRoutes)
  app.use('/api/newsletter', newsletterRoutes)
  app.use('/api/assessments', assessmentRoutes)
  app.use('/api/latex-templates', latexTemplateRoutes)
  app.use('/api/resume-projects', resumeProjectRoutes)
  app.use('/api/hackathons', hackathonRoutes)
  app.use('/api/resume-analysis', resumeAnalysisRoutes)
  app.use('/api/admin', adminLimiter, adminRoutes)

  /* --------------------------------------------------------------- health */

  const healthHandler = asyncHandler(async (_req, res) => {
    // Imported lazily to keep this module free of a hard DB dependency.
    const { default: mongoose } = await import('mongoose')
    const dbState = mongoose.connection.readyState
    const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState]
    res.status(dbState === 1 ? 200 : 503).json({
      status: dbState === 1 ? 'ok' : 'degraded',
      message: 'Upskillyfy-ai API running 🚀',
      database: dbStatus,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    })
  })
  app.get('/health', healthHandler)
  app.get('/api/health', healthHandler)

  /* ----------------------------------------------- 404 + error handler (last) */

  app.use(notFound)
  app.use(errorHandler)

  return app
}

export default createApp
