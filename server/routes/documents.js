import express from 'express'
import { pipeline } from 'node:stream/promises'
import CertificateAuditLog from '../models/CertificateAuditLog.js'
import StudentDocument from '../models/StudentDocument.js'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { getDocumentForUser, listDocumentsForUser } from '../services/documentService.js'
import { getFileStream } from '../services/storageService.js'

const router = express.Router()
router.use(protect)

router.get('/my', asyncHandler(async (req, res) => {
  res.json({ documents: await listDocumentsForUser(req.user._id) })
}))

router.get('/:id/download', asyncHandler(async (req, res) => {
  const document = await getDocumentForUser(req.params.id, req.user)
  if (document.status !== 'ACTIVE') {
    return res.status(410).json({ message: 'This document is no longer available.', code: 'DOCUMENT_REVOKED' })
  }
  const stored = await StudentDocument.findById(req.params.id).select('fileId fileName')
  await CertificateAuditLog.create({
    action: 'DOCUMENT_DOWNLOADED',
    document: stored._id,
    actor: req.user._id,
  })
  const safeFileName = stored.fileName.replace(/["\\\r\n]/g, '_')
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${safeFileName}"`,
    'Cache-Control': 'private, no-store',
  })
  await pipeline(getFileStream(stored.fileId), res)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const document = await getDocumentForUser(req.params.id, req.user)
  res.json({
    document: {
      id: String(document._id),
      documentType: document.documentType,
      title: document.title,
      company: document.company,
      applicationId: document.application ? String(document.application) : null,
      fileName: document.fileName,
      issuedAt: document.issuedAt,
      status: document.status,
    },
  })
}))

export default router
