import mongoose from 'mongoose'

const projectFileSchema = new mongoose.Schema({
  path: { type: String, required: true, maxlength: 240 },
  content: { type: String, default: '', maxlength: 7_000_000 },
  isBinary: { type: Boolean, default: false },
}, { _id: false })

const resumeProjectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  clientId: { type: String, required: true, maxlength: 64 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  mainFile: { type: String, required: true, maxlength: 240 },
  templateId: { type: String, default: null, maxlength: 120 },
  files: { type: [projectFileSchema], required: true, validate: [(files) => files.length > 0 && files.length <= 100, 'A project must contain 1–100 files.'] },
  tags: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
  archived: { type: Boolean, default: false },
  trashed: { type: Boolean, default: false },
}, { timestamps: true })

resumeProjectSchema.index({ owner: 1, updatedAt: -1 })
resumeProjectSchema.index({ owner: 1, clientId: 1 }, { unique: true })

export default mongoose.model('ResumeProject', resumeProjectSchema)
