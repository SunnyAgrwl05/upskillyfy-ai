import mongoose from 'mongoose'

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

subscriberSchema.index({ isActive: 1, createdAt: -1 })

export default mongoose.model('Subscriber', subscriberSchema)
