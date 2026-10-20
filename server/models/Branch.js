import mongoose from 'mongoose'

const branchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: '#1a73e8' },
    description: { type: String },
    testCount: { type: Number, default: 0 },
    isLive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Branch', branchSchema)
