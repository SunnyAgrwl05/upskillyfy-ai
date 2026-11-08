import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import express from 'express'
import latexTemplates from '../routes/latexTemplates.js'

const app = express()
app.use('/api/latex-templates', latexTemplates)
let server
let origin

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      origin = `http://127.0.0.1:${server.address().port}`
      resolve()
    })
  })
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
})

test('template listing returns paginated template data and prevents empty 304 responses', async () => {
  const response = await fetch(`${origin}/api/latex-templates?page=1&limit=6`)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('cache-control'), /no-store/)
  const result = await response.json()
  assert.equal(result.templates.length, 6)
  assert.equal(result.pagination.total, 18)
  assert.equal(result.pagination.pages, 3)

  const conditional = await fetch(`${origin}/api/latex-templates?page=1&limit=6`, {
    headers: { 'If-None-Match': '"client-cache-validator"' },
  })
  assert.equal(conditional.status, 200)
  assert.equal((await conditional.json()).templates.length, 6)
})

test('template detail, aliases, missing IDs, filters, and query validation work', async () => {
  const detail = await fetch(`${origin}/api/latex-templates/ats-friendly-resume`)
  assert.equal(detail.status, 200)
  assert.equal((await detail.json()).template.id, 'ats-friendly-resume')

  const alias = await fetch(`${origin}/api/latex-templates/ats-resume`)
  assert.equal(alias.status, 200)
  assert.equal((await alias.json()).template.id, 'ats-friendly-resume')

  const filtered = await fetch(`${origin}/api/latex-templates?search=fresher&limit=50`)
  assert.deepEqual((await filtered.json()).templates.map((item) => item.id), ['fresher-resume'])

  assert.equal((await fetch(`${origin}/api/latex-templates/not-a-template`)).status, 404)
  const invalid = await fetch(`${origin}/api/latex-templates?page=0`)
  assert.equal(invalid.status, 422)
  assert.equal((await invalid.json()).code, 'INVALID_QUERY')
})
