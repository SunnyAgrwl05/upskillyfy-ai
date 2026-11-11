import mongoose from 'mongoose'
import Application from '../models/Application.js'
import CertificateAuditLog from '../models/CertificateAuditLog.js'
import StudentDocument from '../models/StudentDocument.js'
import User from '../models/User.js'
import { deleteFile, uploadFile } from './storageService.js'

const DOCUMENT_TYPES = new Set(['OFFER_LETTER', 'INTERNSHIP_COMPLETION_LETTER', 'EXPERIENCE_LETTER'])

export async function createStudentDocument(
  { userId, documentType, title, company = '', applicationId = '', file, issuedBy },
  dependencies = {},
) {
  const UserModel = dependencies.UserModel || User
  const ApplicationModel = dependencies.ApplicationModel || Application
  const DocumentModel = dependencies.DocumentModel || StudentDocument
  const AuditLogModel = dependencies.AuditLogModel || CertificateAuditLog
  const fileUploader = dependencies.fileUploader || uploadFile
  const fileDeleter = dependencies.fileDeleter || deleteFile
  if (!mongoose.isValidObjectId(userId)) throw Object.assign(new Error('A valid student userId is required.'), { status: 422 })
  if (!DOCUMENT_TYPES.has(documentType)) throw Object.assign(new Error('Unsupported student document type.'), { status: 422 })
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) {
    throw Object.assign(new Error('title is required and must be at most 160 characters.'), { status: 422 })
  }
  if (!file || file.mimetype !== 'application/pdf' || !file.buffer?.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw Object.assign(new Error('Only valid PDF documents are accepted.'), { status: 422 })
  }
  const student = await UserModel.findById(userId).select('_id role email')
  if (!student || student.role !== 'student') throw Object.assign(new Error('Student account was not found.'), { status: 404 })

  let application = null
  if (applicationId) {
    const applicationQuery = mongoose.isValidObjectId(applicationId)
      ? { _id: applicationId }
      : { applicationId }
    application = await ApplicationModel.findOne(applicationQuery).select('_id user email')
    if (!application) throw Object.assign(new Error('Internship application was not found.'), { status: 404 })
    const belongsToStudent = String(application.user || '') === String(student._id)
      || (application.email && student.email === application.email)
    if (!belongsToStudent) throw Object.assign(new Error('The internship application does not belong to this student.'), { status: 422 })
  }

  const fileName = file.originalname.replace(/[^\w .()-]/g, '_').slice(0, 180) || 'student-document.pdf'
  const fileId = await fileUploader(file.buffer, {
    fileName,
    purpose: 'student-document',
    documentType,
    contentType: 'application/pdf',
  })
  let document
  try {
    document = await DocumentModel.create({
      user: student._id,
      documentType,
      title: title.trim(),
      company: typeof company === 'string' ? company.trim().slice(0, 120) : '',
      application: application?._id || null,
      fileId,
      fileName,
      issuedBy,
    })
  } catch (error) {
    try {
      await fileDeleter(fileId)
    } catch (cleanupError) {
      console.error('Failed to clean up an unlinked student document:', cleanupError)
    }
    throw error
  }

  try {
    await AuditLogModel.create({
      action: 'DOCUMENT_UPLOADED',
      document: document._id,
      actor: issuedBy,
      metadata: { documentType, userId: String(student._id) },
    })
  } catch (error) {
    try {
      await DocumentModel.deleteOne({ _id: document._id })
      await fileDeleter(fileId)
    } catch (cleanupError) {
      console.error('Failed to roll back a student document after audit logging failed:', cleanupError)
    }
    throw Object.assign(new Error('Document upload was rolled back because its audit record could not be saved.'), { status: 503, cause: error })
  }
  return document
}

export async function listDocumentsForUser(userId) {
  const documents = await StudentDocument.find({ user: userId })
    .select('-fileId')
    .sort({ issuedAt: -1 })
    .lean()
  return documents.map((document) => ({
    id: String(document._id),
    documentType: document.documentType,
    title: document.title,
    company: document.company,
    applicationId: document.application ? String(document.application) : null,
    fileName: document.fileName,
    issuedAt: document.issuedAt,
    status: document.status,
  }))
}

export async function getDocumentForUser(id, user, dependencies = {}) {
  const DocumentModel = dependencies.DocumentModel || StudentDocument
  if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error('Invalid document identifier.'), { status: 400 })
  const document = await DocumentModel.findById(id).select('-fileId').lean()
  if (!document) throw Object.assign(new Error('Document not found.'), { status: 404 })
  if (user.role !== 'admin' && String(document.user) !== String(user._id)) {
    throw Object.assign(new Error('You do not have access to this document.'), { status: 403 })
  }
  return document
}

export async function revokeStudentDocument({ id, revokedBy, reason }, dependencies = {}) {
  const DocumentModel = dependencies.DocumentModel || StudentDocument
  const AuditLogModel = dependencies.AuditLogModel || CertificateAuditLog
  if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error('Invalid document identifier.'), { status: 400 })
  if (typeof reason !== 'string' || reason.trim().length < 5 || reason.trim().length > 500) {
    throw Object.assign(new Error('A revocation reason between 5 and 500 characters is required.'), { status: 422 })
  }
  const revocationReason = reason.trim()
  const revokedAt = new Date()
  const document = await DocumentModel.findOneAndUpdate(
    { _id: id, status: 'ACTIVE' },
    { $set: { status: 'REVOKED', revokedAt, revokedBy, revocationReason } },
    { new: true, runValidators: true },
  )
  if (!document) {
    const exists = await DocumentModel.exists({ _id: id })
    if (!exists) throw Object.assign(new Error('Document not found.'), { status: 404 })
    throw Object.assign(new Error('Document has already been revoked.'), { status: 409 })
  }
  try {
    await AuditLogModel.create({
      action: 'DOCUMENT_REVOKED',
      document: document._id,
      actor: revokedBy,
      reason: revocationReason,
    })
  } catch (error) {
    try {
      await DocumentModel.findOneAndUpdate(
        { _id: document._id, status: 'REVOKED', revokedBy, revokedAt },
        { $set: { status: 'ACTIVE' }, $unset: { revokedAt: 1, revokedBy: 1, revocationReason: 1 } },
      )
    } catch (rollbackError) {
      console.error('Failed to roll back document revocation after audit logging failed:', rollbackError)
    }
    throw Object.assign(new Error('Document revocation was rolled back because its audit record could not be saved.'), { status: 503, cause: error })
  }
  return document
}
