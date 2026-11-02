export const credentialsDemoMode = import.meta.env.DEV
  && import.meta.env.VITE_CREDENTIALS_DEMO === 'true'

export const DEMO_VERIFICATION_URL = '/verify/DEMO-NOT-A-REAL-CREDENTIAL'

export const DEMO_STUDENT = Object.freeze({
  id: 'demo-student-01',
  name: 'Jordan Sample',
  email: 'jordan.sample@example.test',
  role: 'student',
})

export const DEMO_ADMIN = Object.freeze({
  id: 'demo-admin-preview-only',
  name: 'Preview Administrator',
  email: 'demo-admin@example.test',
  role: 'admin',
})

export const DEMO_STUDENTS = Object.freeze([
  DEMO_STUDENT,
  { id: 'demo-student-02', name: 'Taylor Example', email: 'taylor.example@example.test', role: 'student' },
  { id: 'demo-student-03', name: 'Casey Preview', email: 'casey.preview@example.test', role: 'student' },
])

export const DEMO_COURSES = Object.freeze([
  { slug: 'demo-web-development', title: 'Sample Full-Stack Web Development' },
  { slug: 'demo-data-analytics', title: 'Sample Data Analytics Foundations' },
  { slug: 'demo-cloud-engineering', title: 'Sample Cloud Engineering' },
])

const initialCertificates = [
  {
    id: 'demo-certificate-web',
    kind: 'certificate',
    user: DEMO_STUDENTS[0],
    recipientName: DEMO_STUDENTS[0].name,
    courseSlug: DEMO_COURSES[0].slug,
    courseTitle: DEMO_COURSES[0].title,
    certificateNumber: 'DEMO-NOT-VALID-001',
    completionDate: '2026-10-12T00:00:00.000Z',
    issuedAt: '2026-10-13T00:00:00.000Z',
    templateVersion: 'course-v1 (demo)',
    status: 'ISSUED',
    verificationUrl: DEMO_VERIFICATION_URL,
  },
  {
    id: 'demo-certificate-revoked',
    kind: 'certificate',
    user: DEMO_STUDENTS[0],
    recipientName: DEMO_STUDENTS[0].name,
    courseSlug: DEMO_COURSES[1].slug,
    courseTitle: DEMO_COURSES[1].title,
    certificateNumber: 'DEMO-NOT-VALID-002',
    completionDate: '2026-09-04T00:00:00.000Z',
    issuedAt: '2026-09-05T00:00:00.000Z',
    templateVersion: 'course-v1 (demo)',
    status: 'REVOKED',
    verificationUrl: DEMO_VERIFICATION_URL,
  },
]

const initialDocuments = [
  {
    id: 'demo-offer-letter',
    kind: 'document',
    user: DEMO_STUDENTS[0],
    documentType: 'OFFER_LETTER',
    title: 'Sample Software Engineering Internship Offer',
    company: 'Example Company (demo)',
    fileName: 'DEMO-NOT-VALID-offer-letter.pdf',
    issuedAt: '2026-10-20T00:00:00.000Z',
    status: 'ACTIVE',
  },
  {
    id: 'demo-internship-completion',
    kind: 'document',
    user: DEMO_STUDENTS[0],
    documentType: 'INTERNSHIP_COMPLETION_LETTER',
    title: 'Sample Internship Completion Letter',
    company: 'Example Company (demo)',
    fileName: 'DEMO-NOT-VALID-internship-letter.pdf',
    issuedAt: '2026-08-30T00:00:00.000Z',
    status: 'ACTIVE',
  },
]

const initialAdminDocuments = [
  ...initialDocuments,
  {
    id: 'demo-completion-example',
    kind: 'document',
    user: DEMO_STUDENTS[1],
    documentType: 'INTERNSHIP_COMPLETION_LETTER',
    title: 'Sample Frontend Internship Completion Letter',
    company: 'Demo Studio (sample)',
    fileName: 'DEMO-NOT-VALID-completion-letter.pdf',
    issuedAt: '2026-07-12T00:00:00.000Z',
    status: 'ACTIVE',
  },
]

let certificates = initialCertificates.map((record) => ({ ...record }))
let documents = initialAdminDocuments.map((record) => ({ ...record }))
let nextDemoId = 3
let studentViewState = 'records'

export function getDemoCertificates() {
  return certificates.map((record) => ({ ...record, user: { ...record.user } }))
}

export function getDemoDocuments() {
  return documents.map((record) => ({ ...record, user: { ...record.user } }))
}

export function getDemoCertificate(id) {
  return certificates.find((certificate) => certificate.id === id) || null
}

export function getDemoStudentViewState() {
  return studentViewState
}

export function setDemoStudentViewState(state) {
  studentViewState = state
}

export function issueDemoCertificate({ student, course, completionDate }) {
  const demoSequence = nextDemoId++
  const certificate = {
    id: `demo-issued-${demoSequence}`,
    kind: 'certificate',
    user: { ...student },
    recipientName: student.name,
    courseSlug: course.slug,
    courseTitle: course.title,
    certificateNumber: `DEMO-NOT-VALID-${String(demoSequence).padStart(3, '0')}`,
    completionDate: `${completionDate}T00:00:00.000Z`,
    issuedAt: new Date().toISOString(),
    templateVersion: 'course-v1 (demo)',
    status: 'ISSUED',
    verificationUrl: DEMO_VERIFICATION_URL,
  }
  certificates = [certificate, ...certificates]
  return { ...certificate }
}

export function revokeDemoCertificate(id) {
  certificates = certificates.map((certificate) => (
    certificate.id === id ? { ...certificate, status: 'REVOKED' } : certificate
  ))
}

export function addDemoDocument({ student, documentType, title, company, fileName }) {
  const document = {
    id: `demo-document-${nextDemoId++}`,
    kind: 'document',
    user: { ...student },
    documentType,
    title,
    company: company || 'Example Company (demo)',
    fileName: `DEMO-NOT-VALID-${fileName || 'sample-document.pdf'}`,
    issuedAt: new Date().toISOString(),
    status: 'ACTIVE',
  }
  documents = [document, ...documents]
  return { ...document }
}

export function revokeDemoDocument(id) {
  documents = documents.map((document) => (
    document.id === id ? { ...document, status: 'REVOKED' } : document
  ))
}

export function resetCredentialDemoState() {
  certificates = initialCertificates.map((record) => ({ ...record }))
  documents = initialAdminDocuments.map((record) => ({ ...record }))
  nextDemoId = 3
  studentViewState = 'records'
}

function pdfText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/[\\()]/g, '\\$&')
}

function textCommand(text, x, y, size, font = 'F1', color = '0.09 0.22 0.39') {
  return `${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfText(text)}) Tj ET`
}

export function createDemoPdfBlob(item) {
  const isCertificate = item.kind === 'certificate'
  const title = isCertificate ? item.courseTitle : item.title
  const content = [
    'q',
    '0.96 0.97 0.99 rg 0 0 842 595 re f',
    '1 1 1 rg 28 28 786 539 re f',
    '0.09 0.23 0.44 RG 2 w 36 36 770 523 re S',
    '0.75 0.59 0.29 RG 1 w 44 44 754 507 re S',
    textCommand('UPSKILLYFY AI  -  PREVIEW', 295, 535, 15, 'F2'),
    textCommand(isCertificate ? 'CERTIFICATE OF COMPLETION' : 'SAMPLE OFFICIAL DOCUMENT', 265, 495, 11, 'F2', '0.69 0.51 0.20'),
    textCommand(isCertificate ? 'This sample is presented to' : 'Sample document for', 316, 428, 13),
    textCommand(item.recipientName || item.user?.name || DEMO_STUDENT.name, 240, 377, 28, 'F2'),
    textCommand(isCertificate ? 'for the sample course' : 'document type', 342, 340, 11, 'F1', '0.35 0.41 0.49'),
    textCommand(title, 220, 302, 18, 'F2'),
    textCommand(`Status: ${item.status} (DEMO ONLY)`, 330, 258, 10, 'F1'),
    textCommand(`Sample ID: ${item.certificateNumber || item.fileName}`, 90, 92, 9),
    textCommand('DEMO VERIFICATION - NOT CONNECTED TO PRODUCTION', 90, 75, 8, 'F2', '0.70 0.12 0.12'),
    '0.92 0.91 0.88 rg 712 74 58 58 re f',
    '0.75 0.10 0.10 rg BT /F2 10 Tf 1 0 0 1 721 104 Tm (DEMO) Tj ET',
    '0.75 0.10 0.10 rg BT /F1 6 Tf 1 0 0 1 717 90 Tm (QR SAMPLE) Tj ET',
    'Q',
    'q 0.88 0.12 0.12 rg BT /F2 46 Tf 0.87 0.50 -0.50 0.87 155 246 Tm (DEMO - NOT VALID) Tj ET Q',
  ].join('\n')

  const contentLength = new TextEncoder().encode(content).length
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
  ]

  let document = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(document).length)
    document += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = new TextEncoder().encode(document).length
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    document += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([document], { type: 'application/pdf' })
}
