import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeAnalysis', default: null },
  status: { type: String, enum: ['completed', 'failed'], required: true },
  provider: { type: String, enum: ['openrouter', 'ollama'], default: null },
  errorCategory: { type: String, enum: ['AI_UNAVAILABLE', 'INVALID_AI_RESPONSE', 'UNSUPPORTED_AI_EVIDENCE', 'UNSUPPORTED_AI_CLAIM', 'RESUME_INVALID', 'RESUME_UNREADABLE', 'OTHER'], default: null },
}, { timestamps: { createdAt: true, updatedAt: false } })

schema.index({ createdAt: -1, _id: -1 })
schema.index({ owner: 1, createdAt: -1 })
schema.index({ status: 1, createdAt: -1 })

export default mongoose.model('ResumeAnalysisEvent', schema)
