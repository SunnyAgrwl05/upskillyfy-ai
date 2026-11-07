import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  _id: { type: String, default: 'admin-privilege-mutations' },
  owner: { type: String, default: null },
  expiresAt: { type: Date, default: new Date(0) },
}, { versionKey: false })

export default mongoose.model('AdminMutationLock', schema)
