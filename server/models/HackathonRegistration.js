import mongoose from 'mongoose'

const hackathonRegistrationSchema = new mongoose.Schema({
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  domainId: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonTeam', default: null },
  status: { type: String, enum: ['registered', 'team_formed', 'submitted', 'cancelled'], default: 'registered' },
  participant: { name: String, email: String, college: String, institution: String, skills: [String] },
  teamName: String,
  project: { title: String, description: String },
  submission: { title: String, description: String, repoUrl: String, demoUrl: String, submittedAt: Date },
}, { timestamps: true })
hackathonRegistrationSchema.index({ hackathonId: 1, userId: 1 }, { unique: true })
hackathonRegistrationSchema.index({ hackathonId: 1, createdAt: -1 })
hackathonRegistrationSchema.index({ hackathonId: 1, status: 1, createdAt: -1 })
export default mongoose.model('HackathonRegistration', hackathonRegistrationSchema)
