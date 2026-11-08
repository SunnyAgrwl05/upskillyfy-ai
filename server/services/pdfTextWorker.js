import { parentPort, workerData } from 'node:worker_threads'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

const MAX_PAGES = 30
const MAX_TEXT_CHARACTERS = 80_000

let loadingTask
try {
  loadingTask = getDocument({
    data: new Uint8Array(workerData),
    password: '',
    isEvalSupported: false,
    useSystemFonts: false,
    stopAtErrors: true,
    verbosity: 0,
  })
  const document = await loadingTask.promise
  if (!Number.isInteger(document.numPages) || document.numPages < 1 || document.numPages > MAX_PAGES) {
    throw Object.assign(new Error(`The PDF must have between 1 and ${MAX_PAGES} pages.`), { code: 'PDF_PAGE_LIMIT' })
  }
  const pages = []
  let characterCount = 0
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent({ includeMarkedContent: false })
    const pageText = content.items.map((item) => typeof item.str === 'string' ? item.str : '').filter(Boolean).join(' ')
    characterCount += pageText.length
    if (characterCount > MAX_TEXT_CHARACTERS) throw Object.assign(new Error('The extracted PDF text exceeds the supported size.'), { code: 'PDF_TEXT_TOO_LARGE' })
    pages.push(pageText)
  }
  const text = pages.join('\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ').trim()
  if (text.replace(/\s/g, '').length < 20) throw Object.assign(new Error('No readable text was found. This may be a scanned PDF; OCR is required before analysis.'), { code: 'OCR_REQUIRED' })
  parentPort.postMessage({ ok: true, text, pageCount: document.numPages })
} catch (error) {
  const encrypted = error?.name === 'PasswordException'
  parentPort.postMessage({
    ok: false,
    code: encrypted ? 'PDF_ENCRYPTED' : error?.code || 'INVALID_PDF',
    message: encrypted ? 'Password-protected PDFs are not supported. Remove the password and upload again.' : error?.code ? error.message : 'The PDF is damaged, encrypted, or uses an unsupported format.',
  })
} finally {
  await loadingTask?.destroy().catch(() => {})
}
