import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import Certificate from '../models/Certificate.js'
import StudentDocument from '../models/StudentDocument.js'
import User from '../models/User.js'
import { protect, adminOnly } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { issueCourseCertificate, renderCertificatePreview, revokeCertificate } from '../services/certificateService.js'
import { createStudentDocument, revokeStudentDocument } from '../services/documentService.js'
import courseApiService from '../services/courseApiService.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
})
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

router.use(protect, adminOnly)

router.get('/students', asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  if (search.length < 2) return res.json({ students: [] })
  const matcher = new RegExp(escapeRegex(search), 'i')
  const students = await User.find({
    role: 'student',
    $or: [{ name: matcher }, { email: matcher }],
  }).select('name email').sort({ name: 1 }).limit(20).lean()
  res.json({
    students: students.map((student) => ({ id: String(student._id), name: student.name, email: student.email })),
  })
}))

router.get('/courses', asyncHandler(async (_req, res) => {
  const courses = await courseApiService.getLicensedCourses()
  res.json({
    courses: courses.map((rawCourse) => {
      const course = courseApiService.transformCourse(rawCourse)
      return { slug: course.slug, title: course.title }
    }),
  })
}))

router.get('/certificates', asyncHandler(async (req, res) => {
  const certificates = await Certificate.find()
    .select('-fileId -verificationTokenHash -verificationTokenEncrypted')
    .populate('user', 'name email')
    .sort({ issuedAt: -1 })
    .limit(100)
    .lean()
  res.json({
    certificates: certificates.map((certificate) => ({
      id: String(certificate._id),
      recipientName: certificate.recipientName,
      user: certificate.user ? { id: String(certificate.user._id), name: certificate.user.name, email: certificate.user.email } : null,
      courseSlug: certificate.courseSlug,
      courseTitle: certificate.courseTitle,
      certificateNumber: certificate.certificateNumber,
      completionDate: certificate.completionDate,
      issuedAt: certificate.issuedAt,
      status: certificate.status,
      templateVersion: certificate.templateVersion,
    })),
  })
}))

router.post('/certificates/preview', asyncHandler(async (req, res) => {
  const pdf = await renderCertificatePreview(req.body)
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="certificate-preview.pdf"',
    'Cache-Control': 'no-store',
  })
  res.send(pdf)
}))

router.post('/certificates', asyncHandler(async (req, res) => {
  const result = await issueCourseCertificate({ ...req.body, issuedBy: req.user._id })
  res.status(201).json({
    certificate: {
      id: String(result.certificate._id),
      recipientName: result.certificate.recipientName,
      courseTitle: result.certificate.courseTitle,
      courseSlug: result.certificate.courseSlug,
      certificateNumber: result.certificate.certificateNumber,
      completionDate: result.certificate.completionDate,
      issuedAt: result.certificate.issuedAt,
      status: result.certificate.status,
    },
    verificationUrl: result.verificationUrl,
  })
}))

router.patch('/certificates/:id/revoke', asyncHandler(async (req, res) => {
  const certificate = await revokeCertificate({
    id: req.params.id,
    revokedBy: req.user._id,
    reason: req.body.reason,
  })
  res.json({
    certificate: {
      id: String(certificate._id),
      certificateNumber: certificate.certificateNumber,
      status: certificate.status,
      revokedAt: certificate.revokedAt,
    },
  })
}))

router.get('/documents', asyncHandler(async (_req, res) => {
  const documents = await StudentDocument.find()
    .select('-fileId')
    .populate('user', 'name email')
    .sort({ issuedAt: -1 })
    .limit(100)
    .lean()
  res.json({
    documents: documents.map((document) => ({
      id: String(document._id),
      user: document.user ? { id: String(document.user._id), name: document.user.name, email: document.user.email } : null,
      documentType: document.documentType,
      title: document.title,
      company: document.company,
      applicationId: document.application ? String(document.application) : null,
      fileName: document.fileName,
      issuedAt: document.issuedAt,
      status: document.status,
    })),
  })
}))

router.post('/documents', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file || req.file.mimetype !== 'application/pdf' || !req.file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    return res.status(422).json({ message: 'Upload a valid PDF document.', code: 'INVALID_DOCUMENT' })
  }
  const document = await createStudentDocument({
    ...req.body,
    issuedBy: req.user._id,
    file: req.file,
  })
  res.status(201).json({
    document: {
      id: String(document._id),
      userId: String(document.user),
      documentType: document.documentType,
      title: document.title,
      company: document.company,
      issuedAt: document.issuedAt,
      status: document.status,
    },
  })
}))

router.patch('/documents/:id/revoke', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid document identifier.', code: 'INVALID_ID' })
  }
  const document = await revokeStudentDocument({ id: req.params.id, revokedBy: req.user._id, reason: req.body.reason })
  res.json({ document: { id: String(document._id), status: document.status, revokedAt: document.revokedAt } })
}))

export default router
