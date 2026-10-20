import mongoose from 'mongoose'

const questionOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    html: { type: String },
  },
  { _id: false }
)

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    text: { type: String, required: true },
    options: { type: [questionOptionSchema], required: true },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Index of the correct option (protected server-side)',
      required: true,
    },
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0.25 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic: { type: String },
    explanation: { type: String },
  },
  { _id: false }
)

const assessmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    branchId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration: { type: Number, required: true, description: 'Duration in minutes' },
    totalMarks: { type: Number, required: true },
    questionsCount: { type: Number, required: true },
    isLive: { type: Boolean, default: true },
    markingScheme: {
      positive: { type: Number, default: 1 },
      negative: { type: Number, default: 0.25 },
      description: { type: String, default: '+1 for correct, -0.25 for incorrect, 0 for unattempted' },
    },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
)

// Do not expose correct answers through default serialization
assessmentSchema.set('toJSON', {
  transform(_doc, ret, _opts) {
    if (ret.questions && Array.isArray(ret.questions)) {
      ret.questions = ret.questions.map((q) => {
        const { correctAnswer, ...safe } = q
        return safe
      })
    }
    return ret
  },
})

export default mongoose.model('Assessment', assessmentSchema)
