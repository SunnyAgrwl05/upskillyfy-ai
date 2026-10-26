import mongoose from 'mongoose'

const courseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true, trim: true },
  completedLessons: { type: [String], default: [] },
  lastLessonId: { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true })

courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export default mongoose.model('CourseProgress', courseProgressSchema)
