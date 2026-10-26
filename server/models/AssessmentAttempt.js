import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: mongoose.Schema.Types.Mixed, default: null },
  markedForReview: { type: Boolean, default: false },
}, { _id: false })

const questionSnapshotSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  prompt: { type: String, required: true },
  type: { type: String, enum: ['single_choice', 'multiple_choice'], required: true },
  options: { type: [{ type: String }], required: true },
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true, select: false },
  explanation: { type: String, default: '' },
  points: { type: Number, required: true },
}, { _id: false })

const assessmentAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  status: { type: String, enum: ['in_progress', 'completed', 'timed_out'], default: 'in_progress' },
  answers: { type: [answerSchema], default: [] },
  questionSnapshot: { type: [questionSnapshotSchema], default: [] },
  assessmentSnapshot: {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    passPercent: { type: Number, default: null },
    reviewAnswers: { type: Boolean, default: false },
  },
  answerVersion: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  submittedAt: { type: Date, default: null },
  score: { type: Number, default: null },
  maxScore: { type: Number, default: null },
  percentage: { type: Number, default: null },
  correctCount: { type: Number, default: null },
  incorrectCount: { type: Number, default: null },
  unansweredCount: { type: Number, default: null },
  passed: { type: Boolean, default: null },
}, { timestamps: true })

assessmentAttemptSchema.index(
  { userId: 1, assessmentId: 1 },
  { unique: true, partialFilterExpression: { status: 'in_progress' } },
)
assessmentAttemptSchema.index({ userId: 1, submittedAt: -1 })

export default mongoose.model('AssessmentAttempt', assessmentAttemptSchema)
