import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, before, test } from 'node:test'
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'
import ResumeAnalysis from '../models/ResumeAnalysis.js'
import ResumeAnalysisRateLimit from '../models/ResumeAnalysisRateLimit.js'
import resumeAnalysisRoutes from '../routes/resumeAnalysis.js'

const testMongoUri = process.env.TEST_MONGODB_URI
const isolatedTestDb = (() => {
  if (!testMongoUri || process.env.MONGODB_URI) return false
  try {
    const parsed = new URL(testMongoUri)
    return ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname) && /resume_builder_test/i.test(parsed.pathname)
  } catch { return false }
})()
const app = express()
const request = globalThis.fetch
app.use(express.json())
app.use('/api/resume-analysis', resumeAnalysisRoutes)
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message, code: err.code || null }))
let server
let origin
let owner
let other
let ownerToken
let otherToken
let fixturePdf

before(async () => {
  if (!isolatedTestDb) return
  process.env.JWT_SECRET = 'resume-analyzer-test-only-secret'
  await mongoose.connect(testMongoUri)
  await ResumeAnalysisRateLimit.deleteMany({ _id: /^guest:/ })
  owner = await User.create({ name: 'Analysis Test Owner', email: `analysis-owner-${Date.now()}@example.test`, password: 'test-password-123' })
  other = await User.create({ name: 'Analysis Test Other', email: `analysis-other-${Date.now()}@example.test`, password: 'test-password-123' })
  ownerToken = jwt.sign({ id: String(owner._id) }, process.env.JWT_SECRET)
  otherToken = jwt.sign({ id: String(other._id) }, process.env.JWT_SECRET)
  fixturePdf = await readFile(new URL('../../client/public/resume-templates/ats-friendly-resume.pdf', import.meta.url))
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => { origin = `http://127.0.0.1:${server.address().port}/api/resume-analysis`; resolve() })
  })
})

after(async () => {
  if (!isolatedTestDb) return
  await ResumeAnalysis.deleteMany({ owner: { $in: [owner?._id, other?._id].filter(Boolean) } })
  await User.deleteMany({ _id: { $in: [owner?._id, other?._id].filter(Boolean) } })
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
})

const auth = (token = ownerToken) => ({ Authorization: `Bearer ${token}` })
function mockAI() {
  const value = {
    extractedData: { name: 'Alex Morgan', email: 'alex@example.com', phone: '+1 555 010 2233', professionalSummary: 'Experienced engineer with a strong background in systems.' },
    strengths: ['Clear contact details'], missingInformation: [], improvementSuggestions: [], potentialInconsistencies: [],
    grammarAndClarity: [], formattingIssues: [], suspiciousLinks: [], dateConsistency: { summary: 'No obvious conflicts.', findings: [] }, confidenceLevels: {},
  }
  const previous = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(value) } }] }) })
  process.env.OPENAI_API_KEY = 'resume-analyzer-test-key'
  return () => { globalThis.fetch = previous; delete process.env.OPENAI_API_KEY }
}

test('upload, review confirmation, ownership, retention, history, and deletion work end-to-end', { skip: !isolatedTestDb && 'Set TEST_MONGODB_URI to an isolated local resume_builder_test database; no default application database is used.' }, async () => {
  const unauthHistory = await request(origin)
  assert.equal(unauthHistory.status, 401)

  const malformedForm = new FormData()
  malformedForm.append('resume', new Blob([Buffer.from('%PDF-1.4\ntruncated')], { type: 'application/pdf' }), 'bad.pdf')
  const malformed = await request(origin, { method: 'POST', body: malformedForm })
  assert.equal(malformed.status, 422)
  assert.equal((await malformed.json()).code, 'INVALID_PDF')

  const wrongMime = new FormData()
  wrongMime.append('resume', new Blob(['not PDF'], { type: 'text/plain' }), 'resume.txt')
  assert.equal((await request(origin, { method: 'POST', body: wrongMime })).status, 415)

  const oversized = new FormData()
  oversized.append('resume', new Blob([Buffer.alloc(10 * 1024 * 1024 + 1, 65)], { type: 'application/pdf' }), 'large.pdf')
  const tooLarge = await request(origin, { method: 'POST', body: oversized })
  assert.equal(tooLarge.status, 413)
  assert.equal((await tooLarge.json()).code, 'UPLOAD_TOO_LARGE')
  assert.equal((await request(origin, { method: 'POST' })).status, 422)
  const sixthGuestAttempt = await request(origin, { method: 'POST' })
  assert.equal(sixthGuestAttempt.status, 429)
  assert.equal((await sixthGuestAttempt.json()).code, 'RATE_LIMITED')

  const previousFetch = globalThis.fetch
  process.env.OPENAI_API_KEY = 'resume-analyzer-test-key'
  globalThis.fetch = async () => ({ ok: false, status: 503 })
  try {
    const providerFailureForm = new FormData()
    providerFailureForm.append('resume', new Blob([fixturePdf], { type: 'application/pdf' }), 'provider-failure.pdf')
    const providerFailure = await request(origin, { method: 'POST', headers: auth(), body: providerFailureForm })
    assert.equal(providerFailure.status, 503)
    assert.equal((await ResumeAnalysis.countDocuments({ owner: owner._id })), 0, 'failed provider calls do not create a fabricated analysis')
  } finally {
    globalThis.fetch = previousFetch
    delete process.env.OPENAI_API_KEY
  }

  const restoreAI = mockAI()
  let created
  try {
    const form = new FormData()
    form.append('resume', new Blob([fixturePdf], { type: 'application/pdf' }), 'resume.pdf')
    form.append('jobDescription', 'React engineer')
    form.append('saveToHistory', 'true')
    const response = await request(origin, { method: 'POST', headers: auth(), body: form })
    assert.equal(response.status, 201)
    const result = await response.json()
    created = result.analysis
    assert.ok(created.id)
    assert.match(result.retention, /PDF and extracted raw text are discarded/)
    assert.equal(created.feedback.pageCount, 1)
    assert.equal(created.feedback.verificationNotice.includes('does not verify'), true)
    assert.equal(JSON.stringify(created).includes('rawText'), false)
  } finally { restoreAI() }

  const page = await request(`${origin}?page=1&limit=10`, { headers: auth() })
  assert.equal(page.status, 200)
  assert.equal((await page.json()).pagination.total, 1)
  assert.equal((await request(`${origin}/${created.id}`, { headers: auth(otherToken) })).status, 404)

  const incomplete = await request(`${origin}/${created.id}/review`, {
    method: 'PATCH', headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ extractedData: created.extractedData, confirmedSections: ['contact'], reviewComplete: true }),
  })
  assert.equal(incomplete.status, 422)
  assert.equal((await incomplete.json()).code, 'REVIEW_INCOMPLETE')

  const sections = ['contact', 'summary', 'education', 'workExperience', 'skills', 'projects', 'certifications', 'achievements', 'links']
  const review = await request(`${origin}/${created.id}/review`, {
    method: 'PATCH', headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      extractedData: { ...created.extractedData, name: 'Alex M. (corrected)' },
      confirmedSections: sections, markedIncorrectSections: ['contact'], reviewComplete: true,
    }),
  })
  assert.equal(review.status, 200)
  assert.equal((await review.json()).analysis.reviewComplete, true)
  assert.equal((await request(`${origin}/${created.id}`, { headers: auth() })).status, 200)

  assert.equal((await request(`${origin}/${created.id}`, { method: 'DELETE', headers: auth(otherToken) })).status, 404)
  assert.equal((await request(`${origin}/${created.id}`, { method: 'DELETE', headers: auth() })).status, 204)
  assert.equal((await request(`${origin}/${created.id}`, { headers: auth() })).status, 404)
})
