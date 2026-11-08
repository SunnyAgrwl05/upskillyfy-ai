import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import Certificate from '../models/Certificate.js'
import CertificateAuditLog from '../models/CertificateAuditLog.js'
import User from '../models/User.js'
import courseApiService from './courseApiService.js'
import { DEFAULT_CERTIFICATE_TEMPLATE } from './certificateTemplates.js'
import { generateCertificatePdf } from './pdfGenerator.js'
import {
  createVerificationToken,
  createVerificationUrl,
  decryptVerificationToken,
  encryptVerificationToken,
  hashVerificationToken,
} from './qrService.js'
import { deleteFile, uploadFile } from './storageService.js'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function parseCompletionDate(value) {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) {
    throw Object.assign(new Error('completionDate must use YYYY-MM-DD format.'), { status: 422 })
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw Object.assign(new Error('completionDate is not a valid calendar date.'), { status: 422 })
  }
  if (date.getTime() > Date.now()) {
    throw Object.assign(new Error('completionDate cannot be in the future.'), { status: 422 })
  }
  return date
}

function cleanText(value, label, maxLength) {
  if (typeof value !== 'string') {
    throw Object.assign(new Error(`${label} must be a string.`), { status: 422 })
  }
  const text = value.trim()
  if (text.length > maxLength) throw Object.assign(new Error(`${label} is too long.`), { status: 422 })
  return text
}

function certificateNumber(year) {
  return `UPSK-${year}-${randomBytes(6).toString('hex').toUpperCase()}`
}

export async function issueCourseCertificate(input, dependencies = {}) {
  const {
    userId,
    courseSlug,
    completionDate,
    issuedBy,
    verificationSource = 'ADMIN_REVIEW',
    adminNotes = '',
  } = input
  const UserModel = dependencies.UserModel || User
  const CertificateModel = dependencies.CertificateModel || Certificate
  const AuditLogModel = dependencies.AuditLogModel || CertificateAuditLog
  const courseProvider = dependencies.courseProvider || courseApiService
  const pdfGenerator = dependencies.pdfGenerator || generateCertificatePdf
  const fileUploader = dependencies.fileUploader || uploadFile
  const fileDeleter = dependencies.fileDeleter || deleteFile
  const tokenFactory = dependencies.tokenFactory || createVerificationToken
  const tokenHasher = dependencies.tokenHasher || hashVerificationToken
  const tokenEncryptor = dependencies.tokenEncryptor || encryptVerificationToken
  const verificationUrlFactory = dependencies.verificationUrlFactory || createVerificationUrl
  if (!mongoose.isValidObjectId(userId)) {
    throw Object.assign(new Error('A valid student userId is required.'), { status: 422 })
  }
  if (typeof courseSlug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,119}$/i.test(courseSlug)) {
    throw Object.assign(new Error('A valid courseSlug is required.'), { status: 422 })
  }
  if (verificationSource !== 'ADMIN_REVIEW') {
    throw Object.assign(new Error('Only manual admin review is currently supported.'), { status: 422 })
  }
  const completion = parseCompletionDate(completionDate)
  const notes = cleanText(adminNotes, 'adminNotes', 1000)
  const student = await UserModel.findById(userId).select('name role')
  if (!student || student.role !== 'student') {
    throw Object.assign(new Error('Student account was not found.'), { status: 404 })
  }

  let courses
  try {
    courses = await courseProvider.getLicensedCourses()
  } catch (error) {
    throw Object.assign(new Error('The course catalog is currently unavailable.'), { status: 503, cause: error })
  }
  const rawCourse = courses.find((course) => course.slug === courseSlug)
  if (!rawCourse) throw Object.assign(new Error('Course not found in the licensed course catalog.'), { status: 404 })
  const course = courseProvider.transformCourse(rawCourse)
  if (!course?.title || !course?.slug) {
    throw Object.assign(new Error('Course catalog returned incomplete course details.'), { status: 503 })
  }

  const token = tokenFactory()
  const verificationUrl = verificationUrlFactory(token)
  const issuedAt = new Date()
  const certificateId = certificateNumber(issuedAt.getUTCFullYear())
  const templateVersion = DEFAULT_CERTIFICATE_TEMPLATE
  const pdfBuffer = await pdfGenerator({
    recipientName: student.name,
    courseTitle: course.title,
    certificateNumber: certificateId,
    completionDate: completion.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    issueDate: issuedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    verificationUrl,
    templateVersion,
  })

  const fileId = await fileUploader(pdfBuffer, {
    purpose: 'course-certificate',
    certificateNumber: certificateId,
    contentType: 'application/pdf',
  })

  let certificate
  try {
    certificate = await CertificateModel.create({
      user: student._id,
      recipientName: student.name,
      courseSlug: course.slug,
      courseTitle: course.title,
      certificateNumber: certificateId,
      verificationTokenHash: tokenHasher(token),
      verificationTokenEncrypted: tokenEncryptor(token),
      completionDate: completion,
      issuedAt,
      issuedBy,
      templateVersion,
      fileId,
      verificationSource,
      adminNotes: notes,
    })
  } catch (error) {
    try {
      await fileDeleter(fileId)
    } catch (cleanupError) {
      console.error('Failed to clean up an unlinked certificate PDF:', cleanupError)
    }
    if (error.code === 11000) {
      throw Object.assign(new Error('A certificate has already been issued for this student and course.'), { status: 409, code: 'CERTIFICATE_ALREADY_ISSUED' })
    }
    throw error
  }

  try {
    await AuditLogModel.create({
      action: 'ISSUED',
      certificate: certificate._id,
      actor: issuedBy,
      metadata: { templateVersion, courseSlug: course.slug },
    })
  } catch (error) {
    try {
      await CertificateModel.deleteOne({ _id: certificate._id })
      await fileDeleter(fileId)
    } catch (cleanupError) {
      console.error('Failed to roll back a certificate after audit logging failed:', cleanupError)
    }
    throw Object.assign(new Error('Certificate issuance was rolled back because its audit record could not be saved.'), { status: 503, cause: error })
  }
  return { certificate, verificationUrl }
}

export async function listCertificatesForUser(userId) {
  const certificates = await Certificate.find({ user: userId })
    .select('+verificationTokenEncrypted')
    .sort({ issuedAt: -1 })
    .lean()
  return certificates.map((certificate) => ({
    id: String(certificate._id),
    recipientName: certificate.recipientName,
    courseSlug: certificate.courseSlug,
    courseTitle: certificate.courseTitle,
    certificateNumber: certificate.certificateNumber,
    completionDate: certificate.completionDate,
    issuedAt: certificate.issuedAt,
    templateVersion: certificate.templateVersion,
    status: certificate.status,
    verificationUrl: createVerificationUrl(decryptVerificationToken(certificate.verificationTokenEncrypted)),
  }))
}

export async function getCertificateById(id, user, dependencies = {}) {
  const CertificateModel = dependencies.CertificateModel || Certificate
  const tokenDecryptor = dependencies.tokenDecryptor || decryptVerificationToken
  const verificationUrlFactory = dependencies.verificationUrlFactory || createVerificationUrl
  if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error('Invalid certificate identifier.'), { status: 400 })
  const certificate = await CertificateModel.findById(id)
    .select('+verificationTokenEncrypted')
    .lean()
  if (!certificate) throw Object.assign(new Error('Certificate not found.'), { status: 404 })
  if (user.role !== 'admin' && String(certificate.user) !== String(user._id)) {
    throw Object.assign(new Error('You do not have access to this certificate.'), { status: 403 })
  }

  return {
    id: String(certificate._id),
    recipientName: certificate.recipientName,
    courseSlug: certificate.courseSlug,
    courseTitle: certificate.courseTitle,
    certificateNumber: certificate.certificateNumber,
    completionDate: certificate.completionDate,
    issuedAt: certificate.issuedAt,
    templateVersion: certificate.templateVersion,
    status: certificate.status,
    verificationUrl: verificationUrlFactory(tokenDecryptor(certificate.verificationTokenEncrypted)),
    ...(user.role === 'admin' ? { adminNotes: certificate.adminNotes, userId: String(certificate.user) } : {}),
  }
}

export async function revokeCertificate({ id, revokedBy, reason }, dependencies = {}) {
  const CertificateModel = dependencies.CertificateModel || Certificate
  const AuditLogModel = dependencies.AuditLogModel || CertificateAuditLog
  if (!mongoose.isValidObjectId(id)) throw Object.assign(new Error('Invalid certificate identifier.'), { status: 400 })
  const revocationReason = cleanText(reason, 'reason', 500)
  if (revocationReason.length < 5) throw Object.assign(new Error('A revocation reason of at least 5 characters is required.'), { status: 422 })
  const revokedAt = new Date()
  const certificate = await CertificateModel.findOneAndUpdate(
    { _id: id, status: 'ISSUED' },
    { $set: { status: 'REVOKED', revokedAt, revokedBy, revocationReason } },
    { new: true, runValidators: true },
  )
  if (!certificate) {
    const exists = await CertificateModel.exists({ _id: id })
    if (!exists) throw Object.assign(new Error('Certificate not found.'), { status: 404 })
    throw Object.assign(new Error('Certificate has already been revoked.'), { status: 409 })
  }
  try {
    await AuditLogModel.create({
      action: 'REVOKED',
      certificate: certificate._id,
      actor: revokedBy,
      reason: revocationReason,
    })
  } catch (error) {
    try {
      await CertificateModel.findOneAndUpdate(
        { _id: certificate._id, status: 'REVOKED', revokedBy, revokedAt },
        { $set: { status: 'ISSUED' }, $unset: { revokedAt: 1, revokedBy: 1, revocationReason: 1 } },
      )
    } catch (rollbackError) {
      console.error('Failed to roll back certificate revocation after audit logging failed:', rollbackError)
    }
    throw Object.assign(new Error('Certificate revocation was rolled back because its audit record could not be saved.'), { status: 503, cause: error })
  }
  return certificate
}

export async function verifyCertificateToken(token, dependencies = {}) {
  const CertificateModel = dependencies.CertificateModel || Certificate
  const tokenHasher = dependencies.tokenHasher || hashVerificationToken
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return { valid: false, status: 'INVALID', certificate: null }
  }
  const certificate = await CertificateModel.findOne({ verificationTokenHash: tokenHasher(token) })
    .select('+verificationTokenHash')
    .lean()
  if (!certificate) return { valid: false, status: 'INVALID', certificate: null }
  return {
    valid: certificate.status === 'ISSUED',
    status: certificate.status,
    certificate: {
      recipientName: certificate.recipientName,
      courseTitle: certificate.courseTitle,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
      issuer: process.env.CERTIFICATE_ISSUER_NAME || 'Upskillyfy AI',
    },
  }
}

export async function renderCertificatePreview({ userId, courseSlug, completionDate }) {
  if (!mongoose.isValidObjectId(userId)) throw Object.assign(new Error('A valid student userId is required.'), { status: 422 })
  const completion = parseCompletionDate(completionDate)
  const student = await User.findById(userId).select('name role')
  if (!student || student.role !== 'student') throw Object.assign(new Error('Student account was not found.'), { status: 404 })
  let courses
  try {
    courses = await courseApiService.getLicensedCourses()
  } catch (error) {
    throw Object.assign(new Error('The course catalog is currently unavailable.'), { status: 503, cause: error })
  }
  const rawCourse = courses.find((course) => course.slug === courseSlug)
  if (!rawCourse) throw Object.assign(new Error('Course not found in the licensed course catalog.'), { status: 404 })
  const course = courseApiService.transformCourse(rawCourse)
  if (!course?.title || !course?.slug) {
    throw Object.assign(new Error('Course catalog returned incomplete course details.'), { status: 503 })
  }
  const token = createVerificationToken()
  return generateCertificatePdf({
    recipientName: student.name,
    courseTitle: course.title,
    certificateNumber: 'PREVIEW - NOT ISSUED',
    completionDate: completion.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    issueDate: 'Preview',
    verificationUrl: createVerificationUrl(token),
    templateVersion: DEFAULT_CERTIFICATE_TEMPLATE,
  })
}
