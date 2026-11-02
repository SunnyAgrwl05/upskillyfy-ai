import mongoose from 'mongoose'

const studentDocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documentType: {
    type: String,
    enum: ['OFFER_LETTER', 'INTERNSHIP_COMPLETION_LETTER', 'EXPERIENCE_LETTER'],
    required: true,
    index: true,
  },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  company: { type: String, default: '', trim: true, maxlength: 120 },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fileName: { type: String, required: true, trim: true, maxlength: 180 },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE', index: true },
  revokedAt: Date,
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revocationReason: { type: String, default: '', maxlength: 500 },
}, { timestamps: true })

export default mongoose.model('StudentDocument', studentDocumentSchema)
