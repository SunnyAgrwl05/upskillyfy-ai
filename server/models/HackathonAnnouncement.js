import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  content: { type: String, required: true, maxlength: 10000 },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true })
export default mongoose.model('HackathonAnnouncement', schema)
