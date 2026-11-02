import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import mongoose from 'mongoose'
import { adminOnly } from '../middleware/auth.js'
import { getCertificateById, issueCourseCertificate, revokeCertificate, verifyCertificateToken } from '../services/certificateService.js'
import { createStudentDocument, getDocumentForUser, revokeStudentDocument } from '../services/documentService.js'
import { generateCertificatePdf, renderCertificateHtml } from '../services/pdfGenerator.js'
import { createVerificationToken, hashVerificationToken } from '../services/qrService.js'

const userId = new mongoose.Types.ObjectId()
const issuedBy = new mongoose.Types.ObjectId()
const certificateId = new mongoose.Types.ObjectId()
const token = randomBytes(32).toString('base64url')

function createIssueDependencies() {
  const saved = []
  const audits = []
  const deletedFiles = []
  const student = { _id: userId, name: 'Avery <Student>', role: 'student' }
  const courseProvider = {
    getLicensedCourses: async () => [{ slug: 'web-development' }],
    transformCourse: () => ({ slug: 'web-development', title: 'Web Development' }),
  }
  const dependencies = {
    UserModel: { findById: () => ({ select: async () => student }) },
    CourseProvider: courseProvider,
    courseProvider,
    CertificateModel: {
      create: async (certificate) => {
        if (saved.some((item) => String(item.user) === String(certificate.user) && item.courseSlug === certificate.courseSlug)) {
          throw Object.assign(new Error('duplicate key'), { code: 11000 })
        }
        const created = { ...certificate, _id: certificateId, status: 'ISSUED' }
        saved.push(created)
        return created
      },
      deleteOne: async ({ _id }) => {
        const index = saved.findIndex((item) => String(item._id) === String(_id))
        if (index >= 0) saved.splice(index, 1)
      },
    },
    AuditLogModel: { create: async (record) => audits.push(record) },
    pdfGenerator: async () => Buffer.from('%PDF-test'),
    fileUploader: async () => new mongoose.Types.ObjectId(),
    fileDeleter: async (fileId) => deletedFiles.push(fileId),
    tokenFactory: () => token,
    tokenHasher: hashVerificationToken,
    tokenEncryptor: (value) => `encrypted:${value}`,
    verificationUrlFactory: (value) => `https://example.test/verify/${value}`,
  }
  return { dependencies, saved, audits, deletedFiles }
}

test('creates a dynamically populated certificate and audit record', async () => {
  const { dependencies, saved, audits } = createIssueDependencies()
  const result = await issueCourseCertificate({
    userId: String(userId),
    courseSlug: 'web-development',
    completionDate: '2026-01-15',
    issuedBy,
    adminNotes: 'Reviewed assessment evidence.',
  }, dependencies)

  assert.equal(result.certificate.recipientName, 'Avery <Student>')
  assert.equal(result.certificate.courseTitle, 'Web Development')
  assert.equal(result.certificate.verificationSource, 'ADMIN_REVIEW')
  assert.equal(result.verificationUrl, `https://example.test/verify/${token}`)
  assert.equal(saved.length, 1)
  assert.equal(audits[0].action, 'ISSUED')
})

test('rejects duplicate issuance and removes the newly uploaded PDF', async () => {
  const { dependencies, deletedFiles } = createIssueDependencies()
  const input = {
    userId: String(userId),
    courseSlug: 'web-development',
    completionDate: '2026-01-15',
    issuedBy,
  }
  await issueCourseCertificate(input, dependencies)
  await assert.rejects(issueCourseCertificate(input, dependencies), { status: 409, code: 'CERTIFICATE_ALREADY_ISSUED' })
  assert.equal(deletedFiles.length, 1)
})

test('rolls back the certificate record and file if issuance audit logging fails', async () => {
  const { dependencies, saved, deletedFiles } = createIssueDependencies()
  dependencies.AuditLogModel.create = async () => { throw new Error('audit unavailable') }
  await assert.rejects(issueCourseCertificate({
    userId: String(userId),
    courseSlug: 'web-development',
    completionDate: '2026-01-15',
    issuedBy,
  }, dependencies), { status: 503 })
  assert.equal(saved.length, 0)
  assert.equal(deletedFiles.length, 1)
})

test('requires a valid student and licensed course before creating a certificate', async () => {
  const { dependencies, saved } = createIssueDependencies()
  dependencies.courseProvider.getLicensedCourses = async () => []
  await assert.rejects(issueCourseCertificate({
    userId: String(userId),
    courseSlug: 'not-licensed',
    completionDate: '2026-01-15',
    issuedBy,
  }, dependencies), { status: 404 })
  assert.equal(saved.length, 0)
})

test('enforces certificate ownership and allows administrators', async () => {
  const record = {
    _id: certificateId,
    user: userId,
    recipientName: 'Avery Student',
    courseSlug: 'web-development',
    courseTitle: 'Web Development',
    certificateNumber: 'UPSK-2026-TEST',
    completionDate: new Date('2026-01-15T00:00:00Z'),
    issuedAt: new Date('2026-01-16T00:00:00Z'),
    templateVersion: 'course-v1',
    status: 'ISSUED',
    verificationTokenEncrypted: 'encrypted-token',
  }
  const dependencies = {
    CertificateModel: {
      findById: () => ({ select: () => ({ lean: async () => record }) }),
    },
    tokenDecryptor: () => token,
    verificationUrlFactory: (value) => `https://example.test/verify/${value}`,
  }
  await assert.rejects(
    getCertificateById(String(certificateId), { _id: new mongoose.Types.ObjectId(), role: 'student' }, dependencies),
    { status: 403 },
  )
  const adminView = await getCertificateById(String(certificateId), { _id: issuedBy, role: 'admin' }, dependencies)
  assert.equal(adminView.adminNotes, undefined)
  assert.equal(adminView.userId, String(userId))
})

test('enforces student document ownership', async () => {
  const document = { _id: certificateId, user: userId, status: 'ACTIVE' }
  const dependencies = {
    DocumentModel: {
      findById: () => ({ select: () => ({ lean: async () => document }) }),
    },
  }
  await assert.rejects(
    getDocumentForUser(String(certificateId), { _id: new mongoose.Types.ObjectId(), role: 'student' }, dependencies),
    { status: 403 },
  )
  assert.equal(
    await getDocumentForUser(String(certificateId), { _id: userId, role: 'student' }, dependencies),
    document,
  )
})

test('stores an authorized PDF student document and audit record', async () => {
  const uploaded = []
  const audits = []
  const student = { _id: userId, role: 'student' }
  const document = { _id: certificateId, user: userId, documentType: 'OFFER_LETTER', title: 'Offer', status: 'ACTIVE' }
  const result = await createStudentDocument({
    userId: String(userId),
    documentType: 'OFFER_LETTER',
    title: 'Offer',
    file: { mimetype: 'application/pdf', originalname: 'offer.pdf', buffer: Buffer.from('%PDF-test') },
    issuedBy,
  }, {
    UserModel: { findById: () => ({ select: async () => student }) },
    DocumentModel: { create: async () => document },
    AuditLogModel: { create: async (record) => audits.push(record) },
    fileUploader: async (buffer) => { uploaded.push(buffer); return new mongoose.Types.ObjectId() },
    fileDeleter: async () => {},
  })
  assert.equal(result, document)
  assert.equal(uploaded.length, 1)
  assert.equal(audits[0].action, 'DOCUMENT_UPLOADED')
})

test('rejects unsupported student document types and non-PDF content', async () => {
  await assert.rejects(createStudentDocument({
    userId: String(userId),
    documentType: 'COURSE_CERTIFICATE',
    title: 'Not a separate document',
    file: { mimetype: 'application/pdf', originalname: 'x.pdf', buffer: Buffer.from('%PDF-test') },
    issuedBy,
  }), { status: 422 })
  await assert.rejects(createStudentDocument({
    userId: String(userId),
    documentType: 'OFFER_LETTER',
    title: 'Offer',
    file: { mimetype: 'application/pdf', originalname: 'x.pdf', buffer: Buffer.from('not pdf') },
    issuedBy,
  }), { status: 422 })
})

test('rejects an internship application belonging to another student', async () => {
  let uploaded = false
  const otherStudentId = new mongoose.Types.ObjectId()
  await assert.rejects(createStudentDocument({
    userId: String(userId),
    documentType: 'OFFER_LETTER',
    title: 'Offer',
    applicationId: 'application-123',
    file: { mimetype: 'application/pdf', originalname: 'offer.pdf', buffer: Buffer.from('%PDF-test') },
    issuedBy,
  }, {
    UserModel: { findById: () => ({ select: async () => ({ _id: userId, role: 'student', email: 'student@example.test' }) }) },
    ApplicationModel: { findOne: () => ({ select: async () => ({ _id: certificateId, user: otherStudentId, email: 'other@example.test' }) }) },
    fileUploader: async () => { uploaded = true; return new mongoose.Types.ObjectId() },
    fileDeleter: async () => {},
  }), { status: 422 })
  assert.equal(uploaded, false)
})

test('rolls back document revocation if audit logging fails', async () => {
  let updateCount = 0
  const queries = []
  const dependencies = {
    DocumentModel: {
      findOneAndUpdate: async (filter, update) => {
        queries.push({ filter, update })
        updateCount += 1
        return updateCount === 1 ? { _id: certificateId } : null
      },
    },
    AuditLogModel: { create: async () => { throw new Error('audit unavailable') } },
  }
  await assert.rejects(revokeStudentDocument({
    id: String(certificateId),
    revokedBy: issuedBy,
    reason: 'Record was uploaded in error.',
  }, dependencies), { status: 503 })
  assert.equal(updateCount, 2)
  assert.equal(queries[1].update.$set.status, 'ACTIVE')
  assert.deepEqual(Object.keys(queries[1].update.$unset), ['revokedAt', 'revokedBy', 'revocationReason'])
})

test('returns public valid, revoked, and invalid verification responses without private fields', async () => {
  let status = 'ISSUED'
  const certificate = {
    recipientName: 'Avery Student',
    courseTitle: 'Web Development',
    certificateNumber: 'UPSK-2026-TEST',
    issuedAt: new Date('2026-01-16T00:00:00Z'),
    status,
    user: userId,
    adminNotes: 'private review note',
  }
  const dependencies = {
    CertificateModel: {
      findOne: () => ({ select: () => ({ lean: async () => ({ ...certificate, status }) }) }),
    },
    tokenHasher: hashVerificationToken,
  }
  const valid = await verifyCertificateToken(token, dependencies)
  assert.equal(valid.status, 'ISSUED')
  assert.equal(valid.valid, true)
  assert.equal('user' in valid.certificate, false)
  status = 'REVOKED'
  const revoked = await verifyCertificateToken(token, dependencies)
  assert.equal(revoked.status, 'REVOKED')
  assert.equal(revoked.valid, false)
  const invalid = await verifyCertificateToken('invalid', dependencies)
  assert.deepEqual(invalid, { valid: false, status: 'INVALID', certificate: null })
})

test('rolls back certificate revocation when its audit record cannot be saved', async () => {
  let updateCount = 0
  const updates = []
  const dependencies = {
    CertificateModel: {
      findOneAndUpdate: async (filter, update) => {
        updates.push({ filter, update })
        updateCount += 1
        return updateCount === 1 ? { _id: certificateId } : null
      },
    },
    AuditLogModel: { create: async () => { throw new Error('audit unavailable') } },
  }
  await assert.rejects(revokeCertificate({
    id: String(certificateId),
    revokedBy: issuedBy,
    reason: 'Record was issued in error.',
  }, dependencies), { status: 503 })
  assert.equal(updateCount, 2)
  assert.equal(updates[1].update.$set.status, 'ISSUED')
  assert.deepEqual(Object.keys(updates[1].update.$unset), ['revokedAt', 'revokedBy', 'revocationReason'])
})

test('admin middleware rejects a student with HTTP 403', () => {
  let status
  let body
  let passed = false
  const response = {
    status(code) { status = code; return this },
    json(value) { body = value; return this },
  }
  adminOnly({ user: { role: 'student' } }, response, () => { passed = true })
  assert.equal(status, 403)
  assert.match(body.message, /Admin privileges/)
  assert.equal(passed, false)
})

test('renders certificate data as escaped HTML with an embedded QR code', async () => {
  const html = await renderCertificateHtml({
    recipientName: '<script>alert(1)</script>',
    courseTitle: 'A & B',
    certificateNumber: 'UPSK-2026-TEST',
    completionDate: '15 January 2026',
    issueDate: '16 January 2026',
    verificationUrl: 'https://example.test/verify/token',
    templateVersion: 'course-v1',
  })
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(html, /A &amp; B/)
  assert.match(html, /data:image\/png;base64,/)
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/)
})

test('marks development certificate previews as demo while regular certificates stay unmarked', async () => {
  const data = {
    recipientName: 'Jordan Sample',
    courseTitle: 'Sample course',
    certificateNumber: 'DEMO-NOT-VALID-001',
    completionDate: '12 October 2026',
    issueDate: '13 October 2026',
    verificationUrl: 'http://localhost:5173/verify/DEMO-NOT-A-REAL-CREDENTIAL',
    templateVersion: 'course-v1',
  }
  const demoHtml = await renderCertificateHtml({ ...data, isDemo: true })
  const realHtml = await renderCertificateHtml(data)
  assert.match(demoHtml, /DEMO - NOT A VALID CREDENTIAL/)
  assert.match(demoHtml, /certificate__demo-watermark is-demo/)
  assert.match(demoHtml, /data:image\/png;base64,/)
  assert.doesNotMatch(realHtml, /DEMO - NOT A VALID CREDENTIAL/)
})

test('generates a landscape A4 PDF snapshot', async () => {
  const pdf = await generateCertificatePdf({
    recipientName: 'Avery Student',
    courseTitle: 'Web Development',
    certificateNumber: 'UPSK-2026-TEST',
    completionDate: '15 January 2026',
    issueDate: '16 January 2026',
    verificationUrl: 'https://example.test/verify/token',
    templateVersion: 'course-v1',
  })
  assert.equal(Buffer.isBuffer(pdf), true)
  assert.equal(Buffer.from(pdf).toString('ascii', 0, 5), '%PDF-')
  assert.ok(pdf.length > 1000)
})

test('generates unpredictable URL-safe verification tokens', () => {
  const first = createVerificationToken()
  const second = createVerificationToken()
  assert.match(first, /^[A-Za-z0-9_-]{43}$/)
  assert.notEqual(first, second)
  assert.notEqual(hashVerificationToken(first), first)
})
