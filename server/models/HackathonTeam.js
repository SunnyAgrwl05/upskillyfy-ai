import mongoose from 'mongoose'

const hackathonTeamSchema = new mongoose.Schema({
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true, index: true },
  domainId: { type: String, required: true },
  teamName: { type: String, required: true, trim: true, maxlength: 80 },
  inviteCode: { type: String, required: true, unique: true, index: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxSize: { type: Number, required: true, min: 1 },
}, { timestamps: true })
hackathonTeamSchema.index({ hackathonId:  1, members: 1 })
hackathonTeamSchema.index({ hackathonId: 1, teamName: 1 }, { unique: true })
export default mongoose.model('HackathonTeam', hackathonTeamSchema)
