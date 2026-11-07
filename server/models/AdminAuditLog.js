import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, maxlength: 100, index: true },
  targetType: { type: String, required: true, maxlength: 80 },
  targetId: { type: String, required: true, maxlength: 100 },
  beforeSummary: { type: mongoose.Schema.Types.Mixed, default: null },
  afterSummary: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String, maxlength: 64, default: '' },
  userAgent: { type: String, maxlength: 500, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false }, strict: true })

schema.index({ createdAt: -1, _id: -1 })
schema.index({ targetType: 1, targetId: 1, createdAt: -1 })
schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete'], function() {
  throw new Error('Admin audit logs are append-only.')
})

export default mongoose.model('AdminAuditLog', schema)
