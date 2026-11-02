import mongoose from 'mongoose'

const certificateAuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['ISSUED', 'REVOKED', 'DOWNLOADED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_REVOKED'],
    required: true,
    index: true,
  },
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate', default: null, index: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentDocument', default: null, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '', maxlength: 500 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

export default mongoose.model('CertificateAuditLog', certificateAuditLogSchema)
