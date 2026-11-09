import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  college: { type: String, default: '', trim: true },
  branch: { type: String, default: '', trim: true },
  year: { type: String, default: '', trim: true },
  avatar: { type: String, default: '' },
  linkedin: { type: String, default: '', trim: true },
  github: { type: String, default: '', trim: true },
  privacyConsents: {
    termsAcceptedAt: { type: Date, default: null },
    privacyAcceptedAt: { type: Date, default: null },
    policyVersion: { type: String, default: '2026-11-09' },
    marketingEmails: { type: Boolean, default: false },
  },

  // Learning state
  enrolledCourses: [{ type: String }],
  completedLessons: [{
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now }
  }],

  // Career state
  savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }]
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)