import express from 'express'
import { pipeline } from 'node:stream/promises'
import Certificate from '../models/Certificate.js'
import CertificateAuditLog from '../models/CertificateAuditLog.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { getCertificateById, listCertificatesForUser } from '../services/certificateService.js'
import { getFileStream } from '../services/storageService.js'

const router = express.Router()
router.use(protect)

router.get('/my', asyncHandler(async (req, res) => {
  res.json({ certificates: await listCertificatesForUser(req.user._id) })
}))

router.get('/:id/download', asyncHandler(async (req, res) => {
  const certificate = await getCertificateById(req.params.id, req.user)
  const stored = await Certificate.findById(req.params.id).select('fileId certificateNumber')
  await CertificateAuditLog.create({
    action: 'DOWNLOADED',
    certificate: stored._id,
    actor: req.user._id,
  })
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${stored.certificateNumber}.pdf"`,
    'Cache-Control': 'private, no-store',
  })
  await pipeline(getFileStream(stored.fileId), res)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ certificate: await getCertificateById(req.params.id, req.user) })
}))

export default router
