import { Worker } from 'node:worker_threads'

const PARSE_TIMEOUT_MS = 12_000
const MAX_CONCURRENT_PARSERS = 2
let activeParsers = 0

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
  if (activeParsers >= MAX_CONCURRENT_PARSERS) {
    throw Object.assign(new Error('Resume PDF processing is busy. Please try again shortly.'), { status: 503, code: 'PDF_PROCESSING_BUSY' })
  }

  activeParsers += 1
  const transferable = Uint8Array.from(buffer).buffer
  let worker
  try {
    worker = new Worker(new URL('./pdfTextWorker.js', import.meta.url), {
      workerData: transferable,
      transferList: [transferable],
      resourceLimits: { maxOldGenerationSizeMb: 96, maxYoungGenerationSizeMb: 32, stackSizeMb: 4 },
    })
  } catch {
    activeParsers -= 1
    throw Object.assign(new Error('The PDF processing service is temporarily unavailable.'), { status: 503, code: 'PDF_PROCESSING_UNAVAILABLE' })
  }

  try {
    return await new Promise((resolve, reject) => {
      let settled = false
      const finish = (error, value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (error) reject(error)
        else resolve(value)
      }
      const timer = setTimeout(() => {
        worker.terminate()
        finish(Object.assign(new Error('PDF processing exceeded the time limit. Try a smaller or simpler PDF.'), { status: 422, code: 'PDF_PARSE_TIMEOUT' }))
      }, PARSE_TIMEOUT_MS)
      worker.once('message', (message) => {
        if (message?.ok) return finish(null, { text: message.text, pageCount: message.pageCount })
        finish(Object.assign(new Error(message?.message || 'The PDF could not be read.'), {
          status: message?.code === 'PDF_TEXT_TOO_LARGE' ? 413 : 422,
          code: message?.code || 'INVALID_PDF',
        }))
      })
      worker.once('error', () => finish(Object.assign(new Error('The PDF could not be processed safely.'), { status: 422, code: 'INVALID_PDF' })))
      worker.once('exit', (code) => {
        if (!settled && code !== 0) finish(Object.assign(new Error('The PDF could not be processed safely.'), { status: 422, code: 'INVALID_PDF' }))
      })
    })
  } finally {
    activeParsers -= 1
    await worker.terminate().catch(() => {})
  }
}

export const PDF_TEXT_LIMITS = Object.freeze({ maxPages: 30, maxCharacters: 80_000, maxConcurrent: MAX_CONCURRENT_PARSERS })
