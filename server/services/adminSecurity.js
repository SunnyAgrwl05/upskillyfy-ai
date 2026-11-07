import { randomUUID } from 'node:crypto'
import AdminMutationLock from '../models/AdminMutationLock.js'

const LOCK_ID = 'admin-privilege-mutations'
const LOCK_TTL_MS = 30_000

/** Serialize all admin membership changes across API workers. */
export async function withAdminMutationLock(operation) {
  const owner = randomUUID()
  const deadline = Date.now() + 5_000
  let acquired = false
  while (!acquired && Date.now() < deadline) {
    const now = new Date()
    try {
      const lock = await AdminMutationLock.findOneAndUpdate(
        { _id: LOCK_ID, expiresAt: { $lte: now } },
        { $set: { owner, expiresAt: new Date(now.getTime() + LOCK_TTL_MS) } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      acquired = lock?.owner === owner
    } catch (error) {
      // Concurrent first-time upserts may contend on the singleton _id.
      if (error.code !== 11000) throw error
    }
    if (!acquired) await new Promise(resolve => setTimeout(resolve, 50))
  }
  if (!acquired) {
    const error = new Error('Admin privilege changes are busy. Retry shortly.')
    error.status = 503
    error.code = 'ADMIN_MUTATION_BUSY'
    throw error
  }
  const heartbeat = setInterval(() => {
    AdminMutationLock.updateOne({ _id: LOCK_ID, owner }, { $set: { expiresAt: new Date(Date.now() + LOCK_TTL_MS) } }).catch(() => {})
  }, Math.floor(LOCK_TTL_MS / 3))
  heartbeat.unref?.()
  try {
    return await operation()
  } finally {
    clearInterval(heartbeat)
    await AdminMutationLock.updateOne({ _id: LOCK_ID, owner }, { $set: { owner: null, expiresAt: new Date(0) } })
  }
}

export async function writeAdminAudit(req, { action, targetType, targetId, beforeSummary = null, afterSummary = null }) {
  const { default: AdminAuditLog } = await import('../models/AdminAuditLog.js')
  const ip = String(req.ip || req.socket?.remoteAddress || '').slice(0, 64)
  const userAgent = String(req.get('user-agent') || '').slice(0, 500)
  return AdminAuditLog.create({ actorId: req.user._id, action, targetType, targetId: String(targetId), beforeSummary, afterSummary, ip, userAgent })
}
