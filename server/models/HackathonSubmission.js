import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
  key: { type: String, required: true, maxlength: 1024 },
  fileName: { type: String, required: true, maxlength: 255 },
  contentType: { type: String, required: true, maxlength: 150 },
  size: { type: Number, required: true, min: 1, max: 20 * 1024 * 1024 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
})

const hackathonSubmissionSchema = new mongoose.Schema({
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true, index: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonTeam', required: true, index: true },
  domainId: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, default: '', maxlength: 10000 },
  techStack: { type: [String], default: [] },
  repoUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  files: { type: [fileSchema], default: [] },
  isDraft: { type: Boolean, default: true },
  submittedAt: Date,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scores: [{ judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, innovation: Number, impact: Number, technicalDepth: Number, design: Number, presentation: Number, average: Number, comments: String, isPublished: Boolean }],
}, { timestamps: true })
hackathonSubmissionSchema.index({ hackathonId: 1, teamId: 1 }, { unique: true })
hackathonSubmissionSchema.index({ hackathonId: 1, submittedAt: -1 })
export default mongoose.model('HackathonSubmission', hackathonSubmissionSchema)
