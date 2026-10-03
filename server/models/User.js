import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  branch: { type: String, default: '' },
  college: { type: String, default: '' },
  year: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  avatar: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
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