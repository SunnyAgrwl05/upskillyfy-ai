import mongoose from 'mongoose'

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  branch: { type: [String], default: ['All'] },
  skills: [String],
  stipend: { type: String, default: 'Unpaid' },
  duration: { type: String, required: true },
  mode: { type: String, enum: ['Remote', 'On-site', 'Hybrid', 'On-campus'], required: true },
  location: { type: String, default: 'Remote' },
  applyLink: { type: String, default: '' },
  deadline: { type: Date },
  status: { type: String, enum: ['Open', 'Closing Soon', 'Closed', 'New'], default: 'Open' },
  logo: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Internship', internshipSchema)