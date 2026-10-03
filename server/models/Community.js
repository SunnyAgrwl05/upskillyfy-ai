import mongoose from 'mongoose'

const communitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Event', 'Hackathon', 'Webinar', 'Workshop', 'Summit'], required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
  registrationLink: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Community', communitySchema)