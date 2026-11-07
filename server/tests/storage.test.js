import { validateUpload } from '../services/storage/r2.js'

describe('private upload validation', () => {
  test('accepts supported file types up to 20 MB', () => {
    expect(validateUpload({ fileName: 'resume.pdf', contentType: 'application/pdf', size: 2 * 1024 * 1024 })).toEqual({ valid: true })
    expect(validateUpload({ fileName: 'project.zip', contentType: 'application/zip', size: 20 * 1024 * 1024 })).toEqual({ valid: true })
    expect(validateUpload({ fileName: 'deck.pptx', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 1 })).toEqual({ valid: true })
  })

  test('rejects unsupported, mismatched, oversized, and traversing file names', () => {
    expect(validateUpload({ fileName: 'payload.exe', contentType: 'application/octet-stream', size: 1 }).valid).toBe(false)
    expect(validateUpload({ fileName: 'resume.docx', contentType: 'application/pdf', size: 1 }).valid).toBe(false)
    expect(validateUpload({ fileName: '../resume.pdf', contentType: 'application/pdf', size: 1 }).valid).toBe(false)
    expect(validateUpload({ fileName: 'large.zip', contentType: 'application/zip', size: 20 * 1024 * 1024 + 1 }).valid).toBe(false)
  })
})
