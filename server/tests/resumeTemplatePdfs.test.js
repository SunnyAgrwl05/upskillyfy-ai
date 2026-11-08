import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { after, before, test } from 'node:test'
import express from 'express'
import latexTemplates from '../routes/latexTemplates.js'
import { LATEX_TEMPLATES } from '../data/latexTemplates.js'
import { extractPdfText } from '../services/pdfTextService.js'

const ids = ['ats-friendly-resume', 'fresher-resume', 'software-engineer-resume', 'experienced-professional-resume', 'academic-cv']
const manifest = JSON.parse(await readFile(new URL('../../client/public/resume-templates/manifest.json', import.meta.url), 'utf8'))
const app = express()
app.use('/api/latex-templates', latexTemplates)
let server
let origin
const hash = (value) => createHash('sha256').update(value).digest('hex')

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => { origin = `http://127.0.0.1:${server.address().port}`; resolve() })
  })
})
after(async () => { if (server) await new Promise((resolve) => server.close(resolve)) })

for (const id of ids) {
  test(`${id}: compiled preview is valid, selectable, and matches the current source`, async () => {
    const template = LATEX_TEMPLATES.find((item) => item.id === id)
    const source = template.files.find((item) => item.path === template.mainFile).content
    assert.equal(manifest[id].sourceSha256, hash(source), 'compiled PDF must use the current catalog source')
    const response = await fetch(`${origin}/api/latex-templates/${id}/preview.pdf`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'application/pdf')
    assert.equal(response.headers.get('x-resume-template-source-sha256'), hash(source))
    const pdf = Buffer.from(await response.arrayBuffer())
    assert.equal(hash(pdf), manifest[id].pdfSha256)
    const conditional = await fetch(`${origin}/api/latex-templates/${id}/preview.pdf`, { headers: { 'If-None-Match': response.headers.get('etag') } })
    assert.equal(conditional.status, 200, 'preview requests always include a PDF body for XHR clients')
    assert.equal(hash(Buffer.from(await conditional.arrayBuffer())), manifest[id].pdfSha256)
    const extracted = await extractPdfText(pdf)
    assert.ok(extracted.pageCount >= 1)
    assert.ok(extracted.text.length > 100, 'PDF contains selectable resume text')
    const expectedName = {
      'ats-friendly-resume': 'ALEX MORGAN',
      'fresher-resume': 'Priya Sharma',
      'software-engineer-resume': 'Jordan Ellis',
      'experienced-professional-resume': 'Samuel Okonkwo',
      'academic-cv': 'Dr. Elena Novak',
    }[id]
    assert.ok(extracted.text.includes(expectedName))
  })
}
