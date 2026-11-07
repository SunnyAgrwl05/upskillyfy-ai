import mongoose from 'mongoose'

const domainSchema = new mongoose.Schema({
  domainId: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sampleProblemStatements: { type: [String], default: [] },
  domainDeadline: Date,
  teamSizeMin: { type: Number, default: 1, min: 1 },
  teamSizeMax: { type: Number, default: 4, min: 1 },
  seatsTotal: { type: Number, default: 0, min: 0 },
  seatsTaken: { type: Number, default: 0, min: 0 },
  prizes: { type: String, default: '' },
}, { _id: false })

const hackathonSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, maxlength: 12000 },
  logo: { type: String, default: '' },
  organiser: { type: String, default: '' },
  organiserEmail: { type: String, default: '' },
  mode: { type: String, enum: ['Virtual', 'Hybrid', 'In Person'], default: 'Virtual' },
  isFree: { type: Boolean, default: true },
  fee: { type: Number, default: 0, min: 0 },
  registrationStart: Date,
  registrationDeadline: Date,
  startDate: Date,
  endDate: Date,
  domains: { type: [domainSchema], default: [] },
  rounds: { type: [new mongoose.Schema({ roundId: String, title: String, description: String, startDate: Date, endDate: Date, isCompleted: { type: Boolean, default: false } }, { _id: false })], default: [] },
  eligibility: { type: String, default: '' },
  rules: { type: String, default: '' },
  timeline: { type: String, default: '' },
  judges: { type: [mongoose.Schema.Types.Mixed], default: [] },
  mentors: { type: [mongoose.Schema.Types.Mixed], default: [] },
  partners: { type: [mongoose.Schema.Types.Mixed], default: [] },
  faqs: { type: [mongoose.Schema.Types.Mixed], default: [] },
  status: { type: String, enum: ['draft', 'published', 'registration_open', 'live', 'ended', 'results_published'], default: 'draft' },
  isPublished: { type: Boolean, default: false },
  resultsPublishedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

hackathonSchema.index({ isPublished: 1, status: 1, registrationDeadline: 1 })
hackathonSchema.index({ createdAt: -1 })
hackathonSchema.index({ title: 'text', description: 'text' })

export default mongoose.model('Hackathon', hackathonSchema)
