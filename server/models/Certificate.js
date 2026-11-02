import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientName: { type: String, required: true, trim: true },
  courseSlug: { type: String, required: true, trim: true },
  courseTitle: { type: String, required: true, trim: true },
  certificateNumber: { type: String, required: true, unique: true, index: true },
  verificationTokenHash: { type: String, required: true, unique: true, select: false },
  verificationTokenEncrypted: { type: String, required: true, select: false },
  completionDate: { type: Date, required: true },
  issuedAt: { type: Date, required: true, default: Date.now },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateVersion: { type: String, required: true, default: 'course-v1' },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['ISSUED', 'REVOKED'], default: 'ISSUED', index: true },
  verificationSource: { type: String, enum: ['ADMIN_REVIEW'], default: 'ADMIN_REVIEW' },
  adminNotes: { type: String, default: '', maxlength: 1000 },
  revokedAt: Date,
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revocationReason: { type: String, maxlength: 500 },
}, { timestamps: true })

certificateSchema.index({ user: 1, courseSlug: 1 }, { unique: true })

export default mongoose.model('Certificate', certificateSchema)
