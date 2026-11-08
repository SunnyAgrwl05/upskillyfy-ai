import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateCertificatePdf } from '../services/pdfGenerator.js'
import { DEFAULT_CERTIFICATE_TEMPLATE } from '../services/certificateTemplates.js'

const demoVerificationUrl = 'http://localhost:5173/verify/DEMO-NOT-A-REAL-CREDENTIAL'
const previewDirectory = path.join(tmpdir(), 'upskillyfy-credential-previews')
const previewPath = path.join(previewDirectory, 'DEMO-NOT-VALID-course-certificate.pdf')

export async function createCertificatePreview() {
  const pdf = await generateCertificatePdf({
    recipientName: 'Jordan Sample (DEMO)',
    courseTitle: 'Sample Full-Stack Web Development',
    certificateNumber: 'DEMO-NOT-VALID-001',
    completionDate: '12 October 2026',
    issueDate: '13 October 2026',
    verificationUrl: demoVerificationUrl,
    templateVersion: DEFAULT_CERTIFICATE_TEMPLATE,
    isDemo: true,
  })

  await mkdir(previewDirectory, { recursive: true })
  await writeFile(previewPath, pdf)
  return previewPath
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createCertificatePreview()
    .then((filePath) => {
      console.log(`Created DEMO / NOT VALID certificate preview: ${filePath}`)
      console.log(`The QR points to a demo-only route and cannot verify against the production database: ${demoVerificationUrl}`)
      console.log('No database, storage, or certificate issuance service was used.')
    })
    .catch((error) => {
      console.error('Could not generate the demo certificate preview:', error)
      process.exitCode = 1
    })
}
