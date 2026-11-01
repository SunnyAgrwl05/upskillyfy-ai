// Must be the first import — dotenv loads .env before config/env.js validates variables.
import './config/dotenv.js'

import mongoose from 'mongoose'
import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

/* --------------------------------------------------------------- database */

/**
 * Connects with retry/backoff. A cold start racing with the database
 * becoming available should not crash the process.
 */
const connectWithRetry = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 20,
        minPoolSize: 2,
        retryWrites: true,
        writeConcern: { w: 'majority' },
      })
      console.log('✅ MongoDB connected')
      return
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`)
      if (attempt === retries) throw err
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
    }
  }
}

/* --------------------------------------------------------------- lifecycle */

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Upskillyfy-ai Server: http://localhost:${env.PORT}`)
  console.log(`   Environment: ${env.NODE_ENV}`)
})

/** Drain in-flight requests before exiting. */
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`)
  server.close(async () => {
    try {
      await mongoose.connection.close()
      console.log('✅ Database connection closed')
    } catch (err) {
      console.error('Error closing database connection:', err.message)
    }
    process.exit(0)
  })

  // Force-exit if something refuses to close in time.
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout')
    process.exit(1)
  }, 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason)
  shutdown('unhandledRejection')
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  shutdown('uncaughtException')
})

connectWithRetry().catch((err) => {
  console.error('❌ Could not connect to MongoDB:', err.message)
  process.exit(1)
})

export default app
