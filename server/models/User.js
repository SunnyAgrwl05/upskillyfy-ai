import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false, minlength: 6 },
  branch: { type: String, default: '' },
  college: { type: String, default: '' },
  year: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true, index: true },
  tokenVersion: { type: Number, default: 0, min: 0 },
  googleId: { type: String, unique: true, sparse: true, select: false },
  emailVerifiedAt: { type: Date, default: null },
  emailVerificationCodeHash: { type: String, default: null, select: false },
  emailVerificationExpiresAt: { type: Date, default: null, select: false },
  savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  avatar: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
}, { timestamps: true })

userSchema.index({ createdAt: -1 })
userSchema.index({ role: 1, isActive: 1 })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(password) {
  if (!password || !this.password) return false
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)
