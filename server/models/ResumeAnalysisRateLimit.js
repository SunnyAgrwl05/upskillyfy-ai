import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  _id: { type: String },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
})
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('ResumeAnalysisRateLimit', schema)
