import { getDocument, PasswordException } from 'pdfjs-dist/legacy/build/pdf.mjs'

const MAX_PAGES = 30
const MAX_TEXT_CHARACTERS = 80_000

export async function extractPdfText(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 16 || buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw Object.assign(new Error('The upload is not a valid PDF file.'), { status: 422, code: 'INVALID_PDF' })
  }
  if (!/%%EOF\s*$/.test(buffer.subarray(Math.max(0, buffer.length - 2048)).toString('latin1'))) {
    throw Object.assign(new Error('The PDF appears incomplete or malformed.'), { status: 422, code: 'INVALID_PDF' })
  }
  if (/\/Encrypt\b/.test(buffer.toString('latin1'))) {
    throw Object.assign(new Error('Password-protected PDFs are not supported. Remove the password and upload again.'), { status: 422, code: 'PDF_ENCRYPTED' })
  }

  let document
  let loadingTask
  try {
    loadingTask = getDocument({
      data: new Uint8Array(buffer),
      password: '',
      isEvalSupported: false,
      useSystemFonts: false,
      stopAtErrors: true,
      verbosity: 0,
    })
    document = await loadingTask.promise
    if (!Number.isInteger(document.numPages) || document.numPages < 1 || document.numPages > MAX_PAGES) {
      throw Object.assign(new Error(`The PDF must have between 1 and ${MAX_PAGES} pages.`), { status: 422, code: 'PDF_PAGE_LIMIT' })
    }
    const pages = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent({ includeMarkedContent: false })
      pages.push(content.items.map((item) => typeof item.str === 'string' ? item.str : '').filter(Boolean).join(' '))
      if (pages.join('\n').length > MAX_TEXT_CHARACTERS) {
        throw Object.assign(new Error('The extracted PDF text exceeds the supported size.'), { status: 413, code: 'PDF_TEXT_TOO_LARGE' })
      }
    }
    const text = pages.join('\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim()
    if (text.replace(/\s/g, '').length < 20) {
      throw Object.assign(new Error('No readable text was found. This may be a scanned PDF; OCR is required before analysis.'), { status: 422, code: 'OCR_REQUIRED' })
    }
    return { text, pageCount: document.numPages }
  } catch (error) {
    if (error?.code) throw error
    if ((PasswordException && error instanceof PasswordException) || error?.name === 'PasswordException') {
      throw Object.assign(new Error('Password-protected PDFs are not supported. Remove the password and upload again.'), { status: 422, code: 'PDF_ENCRYPTED' })
    }
    throw Object.assign(new Error('The PDF is damaged, encrypted, or uses an unsupported format.'), { status: 422, code: 'INVALID_PDF' })
  } finally {
    await loadingTask?.destroy().catch(() => {})
  }
}

export const PDF_TEXT_LIMITS = Object.freeze({ maxPages: MAX_PAGES, maxCharacters: MAX_TEXT_CHARACTERS })
