import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    selectedOption: { type: Number },
    isMarkedForReview: { type: Boolean, default: false },
    visited: { type: Boolean, default: true },
    answered: { type: Boolean, default: false },
  },
  { _id: false }
)

const resultSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
    unanswered: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
  },
  { _id: false }
)

const attemptSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    assessmentId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    startedAt: { type: Date, required: true },
    deadline: { type: Date, required: true },
    submittedAt: { type: Date },
    isSubmitted: { type: Boolean, default: false },
    currentQuestionIndex: { type: Number, default: 0 },
    answers: { type: [answerSchema], default: [] },
    visitedCount: { type: Number, default: 0 },
    answeredCount: { type: Number, default: 0 },
    markedCount: { type: Number, default: 0 },
    result: { type: resultSchema },
  },
  { timestamps: true }
)

export default mongoose.model('Attempt', attemptSchema)
