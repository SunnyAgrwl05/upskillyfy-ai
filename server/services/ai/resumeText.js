import path from 'node:path'
import AdmZip from 'adm-zip'

const MAX_TEXT_LENGTH = 50_000
const ALLOWED = new Map([
  ['.pdf', new Set(['application/pdf'])],
  ['.docx', new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'])],
])

export function validateResumeFile(file) {
  if (!file) return { valid: false, message: 'Upload a PDF or DOCX resume.' }
  const extension = path.extname(file.originalname || '').toLowerCase()
  if (!ALLOWED.get(extension)?.has(file.mimetype)) return { valid: false, message: 'Upload a PDF or DOCX resume with a matching file type.' }
  return { valid: true }
}

function normalizeExtractedText(text) {
  return String(text).replace(/\u0000/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim().slice(0, MAX_TEXT_LENGTH)
}

async function extractPdf(buffer) {
  if (buffer.length < 5 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') throw Object.assign(new Error('The selected PDF is invalid or unreadable.'), { status: 422, code: 'INVALID_RESUME_FILE' })
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const document = await getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, useSystemFonts: true }).promise
  if (document.numPages > 120) throw Object.assign(new Error('The PDF has too many pages to analyze.'), { status: 413, code: 'RESUME_TOO_LARGE' })
  const pages = []
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str || '').join(' '))
    if (pages.join('\n').length > MAX_TEXT_LENGTH) break
  }
  return normalizeExtractedText(pages.join('\n'))
}

function decodeXml(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity) => {
    const lower = entity.toLowerCase()
    if (lower === 'amp') return '&'
    if (lower === 'lt') return '<'
    if (lower === 'gt') return '>'
    if (lower === 'quot') return '"'
    if (lower === 'apos') return "'"
    const code = lower.startsWith('#x') ? Number.parseInt(lower.slice(2), 16) : Number.parseInt(lower.slice(1), 10)
    return Number.isFinite(code) ? String.fromCodePoint(code) : match
  })
}

function extractDocx(buffer) {
  if (buffer.length < 4 || buffer.subarray(0, 2).toString('hex') !== '504b') throw Object.assign(new Error('The selected DOCX is invalid or unreadable.'), { status: 422, code: 'INVALID_RESUME_FILE' })
  let archive
  try { archive = new AdmZip(buffer) } catch { throw Object.assign(new Error('The selected DOCX is invalid or unreadable.'), { status: 422, code: 'INVALID_RESUME_FILE' }) }
  const entry = archive.getEntry('word/document.xml')
  if (!entry || entry.header.size > 20 * 1024 * 1024) throw Object.assign(new Error('The DOCX document content could not be read safely.'), { status: 422, code: 'INVALID_RESUME_FILE' })
  const xml = entry.getData().toString('utf8')
  const text = xml.replace(/<w:tab\b[^>]*\/>/g, ' ').replace(/<\/w:p>/g, '\n').replace(/<[^>]+>/g, ' ')
  return normalizeExtractedText(decodeXml(text))
}

export async function extractResumeText(file) {
  const valid = validateResumeFile(file)
  if (!valid.valid) throw Object.assign(new Error(valid.message), { status: 422, code: 'INVALID_RESUME_FILE' })
  const extension = path.extname(file.originalname).toLowerCase()
  return extension === '.pdf' ? extractPdf(file.buffer) : extractDocx(file.buffer)
}

export function extractProjectText(project) {
  const source = (project.files || [])
    .filter(file => !file.isBinary && /\.(?:tex|txt|md)$/i.test(file.path))
    .map(file => `\n${file.path}\n${file.content}`)
    .join('\n')
  // Remove common LaTeX control syntax while retaining the section text.
  return normalizeExtractedText(source.replace(/%.*$/gm, '').replace(/\\(?:begin|end)\{[^}]+\}/g, ' ').replace(/\\[a-zA-Z@]+\*?(?:\[[^\]]*\])?/g, ' ').replace(/[{}]/g, ' '))
}
