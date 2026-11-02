import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.')
  if (!email) throw new Error('Set ADMIN_EMAIL to the existing account to promote.')

  await mongoose.connect(process.env.MONGODB_URI)
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'admin' } },
    { new: true, runValidators: true },
  ).select('email role')
  if (!user) throw new Error('No existing account matches ADMIN_EMAIL.')
  console.log(`Administrator role granted to ${user.email}.`)
}

promoteAdmin()
  .catch((error) => {
    console.error('Admin promotion failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  })
