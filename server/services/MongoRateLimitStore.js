import mongoose from 'mongoose'
import { createHash } from 'node:crypto'

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  totalHits: { type: Number, required: true, min: 0 },
  expiresAt: { type: Date, required: true },
}, { versionKey: false, timestamps: false, collection: 'rate_limit_counters' })

counterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'rate_limit_expiry' })
const RateLimitCounter = mongoose.models.RateLimitCounter || mongoose.model('RateLimitCounter', counterSchema)

/**
 * Shared express-rate-limit store backed by the application's existing MongoDB.
 * The update pipeline makes fixed-window increments atomic across API workers.
 */
export default class MongoRateLimitStore {
  constructor(namespace) {
    this.namespace = `rl:${namespace}:`
    this.prefix = this.namespace
    this.localKeys = false
    this.windowMs = 60_000
    this.indexPromise = null
  }

  ensureIndex() {
    if (!this.indexPromise) {
      this.indexPromise = RateLimitCounter.collection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0, name: 'rate_limit_expiry' },
      )
      this.indexPromise.catch(() => { this.indexPromise = null })
    }
    return this.indexPromise
  }

  init(options) {
    this.windowMs = options.windowMs
    this.ensureIndex()
  }

  keyFor(key) {
    const digest = createHash('sha256').update(String(key)).digest('hex')
    return `${this.namespace}${digest}`
  }

  async increment(key) {
    await this.ensureIndex()
    const id = this.keyFor(key)
    const now = new Date()
    const nextReset = new Date(now.getTime() + this.windowMs)
    const update = [{ $set: {
      totalHits: { $cond: [{ $gt: ['$expiresAt', now] }, { $add: [{ $ifNull: ['$totalHits', 0] }, 1] }, 1] },
      expiresAt: { $cond: [{ $gt: ['$expiresAt', now] }, '$expiresAt', nextReset] },
    } }]
    let record
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        record = await RateLimitCounter.findOneAndUpdate({ _id: id }, update, { upsert: true, new: true, lean: true })
        break
      } catch (error) {
        // A TTL deletion can race with an upsert and briefly contend on _id.
        if (error.code !== 11000 || attempt === 2) throw error
      }
    }
    return { totalHits: record.totalHits, resetTime: record.expiresAt }
  }

  async decrement(key) {
    const id = this.keyFor(key)
    const record = await RateLimitCounter.findOneAndUpdate(
      { _id: id, totalHits: { $gt: 0 }, expiresAt: { $gt: new Date() } },
      [{ $set: { totalHits: { $max: [0, { $subtract: ['$totalHits', 1] }] } } }],
      { new: true, lean: true },
    )
    if (record?.totalHits === 0) await RateLimitCounter.deleteOne({ _id: id, totalHits: 0 })
  }

  async get(key) {
    const record = await RateLimitCounter.findOne({ _id: this.keyFor(key), expiresAt: { $gt: new Date() } }).select('totalHits expiresAt').lean()
    return record ? { totalHits: record.totalHits, resetTime: record.expiresAt } : undefined
  }

  async resetKey(key) {
    await RateLimitCounter.deleteOne({ _id: this.keyFor(key) })
  }

  async resetAll() {
    const escaped = this.namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    await RateLimitCounter.deleteMany({ _id: { $regex: `^${escaped}` } })
  }
}

export { RateLimitCounter }
