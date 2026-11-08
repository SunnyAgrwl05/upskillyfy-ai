import mongoose from 'mongoose'

const resumeAnalysisSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  extractedData: { type: mongoose.Schema.Types.Mixed, required: true },
  feedback: { type: mongoose.Schema.Types.Mixed, required: true },
  scoring: { type: mongoose.Schema.Types.Mixed, required: true },
  confirmedSections: { type: [String], default: [] },
  markedIncorrectSections: { type: [String], default: [] },
  reviewComplete: { type: Boolean, default: false },
}, { timestamps: true, minimize: false })

resumeAnalysisSchema.index({ owner: 1, createdAt: -1 })

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema)
