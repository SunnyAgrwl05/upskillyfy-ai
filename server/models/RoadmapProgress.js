import mongoose from 'mongoose'

const roadmapProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roadmapId: { type: String, required: true, trim: true },
  masteredSkills: { type: [String], default: [] },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true })

roadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true })

export default mongoose.model('RoadmapProgress', roadmapProgressSchema)
