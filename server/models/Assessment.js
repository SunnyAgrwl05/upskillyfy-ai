import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, trim: true, maxlength: 2000 },
  type: { type: String, enum: ['single_choice', 'multiple_choice'], required: true },
  options: { type: [{ type: String, trim: true, maxlength: 500 }], required: true },
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true, select: false },
  explanation: { type: String, trim: true, maxlength: 2000, default: '' },
  points: { type: Number, min: 1, max: 100, default: 1 },
}, { timestamps: false })

const assessmentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  skills: { type: [{ type: String, trim: true, maxlength: 80 }], default: [] },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  durationMinutes: { type: Number, min: 1, max: 240, required: true },
  passPercent: { type: Number, min: 0, max: 100, default: null },
  attemptLimit: { type: Number, min: 1, max: 100, default: null },
  reviewAnswers: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  questions: { type: [questionSchema], default: [] },
}, { timestamps: true })

export default mongoose.model('Assessment', assessmentSchema)
