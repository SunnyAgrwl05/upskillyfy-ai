import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import AdmZip from 'adm-zip'
import resumeProjects from '../routes/resumeProjects.js'
import User from '../models/User.js'
import ResumeProject from '../models/ResumeProject.js'

const testMongoUri = process.env.TEST_MONGODB_URI
const isolatedTestDb = (() => {
  if (!testMongoUri) return false
  try {
    const parsed = new URL(testMongoUri)
    return ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)
      && /resume_builder_test/i.test(parsed.pathname)
      && !process.env.MONGODB_URI
  } catch { return false }
})()
const app = express()
app.use(express.json({ limit: '8mb' }))
app.use('/api/resume-projects', resumeProjects)
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }))
let server
let origin
let owner
let other
let token
let otherToken

before(async () => {
  if (!isolatedTestDb) return
  process.env.JWT_SECRET = 'resume-builder-test-only-secret'
  await mongoose.connect(testMongoUri)
  owner = await User.create({ name: 'Resume API Test Owner', email: `resume-owner-${Date.now()}@example.test`, password: 'test-password-123' })
  other = await User.create({ name: 'Resume API Test Other', email: `resume-other-${Date.now()}@example.test`, password: 'test-password-123' })
  token = jwt.sign({ id: String(owner._id) }, process.env.JWT_SECRET)
  otherToken = jwt.sign({ id: String(other._id) }, process.env.JWT_SECRET)
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      origin = `http://127.0.0.1:${server.address().port}/api/resume-projects`
      resolve()
    })
  })
})

after(async () => {
  if (!isolatedTestDb) return
  await ResumeProject.deleteMany({ owner: { $in: [owner?._id, other?._id].filter(Boolean) } })
  await User.deleteMany({ _id: { $in: [owner?._id, other?._id].filter(Boolean) } })
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
})

const auth = (value = token) => ({ Authorization: `Bearer ${value}` })
const projectBody = (id, extra = {}) => ({
  id, name: 'Resume API test project', mainFile: 'src/main.tex',
  files: [{ path: 'src/main.tex', content: '\\documentclass{article}\\begin{document}Hi\\end{document}', isBinary: false }],
  ...extra,
})

test('project API enforces auth, ownership, validation, CRUD, archive import, and safe compiler availability', { skip: !isolatedTestDb && 'Set TEST_MONGODB_URI to an isolated local resume_builder_test database; no default application database is used.' }, async () => {
  const unauthenticated = await fetch(origin)
  assert.equal(unauthenticated.status, 401)

  const projectId = `resume-test-${Date.now()}`
  const create = await fetch(origin, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(projectId, { tags: ['job search'], archived: true })) })
  assert.equal(create.status, 201)
  const created = (await create.json()).project
  assert.equal(created.id, projectId)
  assert.equal(created.tags[0], 'job search')
  assert.equal(created.archived, true)

  const list = await fetch(origin, { headers: auth() })
  assert.ok((await list.json()).projects.some((project) => project.id === projectId))
  const forbiddenRead = await fetch(`${origin}/${projectId}`, { headers: auth(otherToken) })
  assert.equal(forbiddenRead.status, 404)

  const update = await fetch(`${origin}/${projectId}`, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(projectId, { name: 'Renamed resume' })) })
  assert.equal(update.status, 200)
  const updated = (await update.json()).project
  assert.equal(updated.name, 'Renamed resume')
  assert.equal(updated.archived, true, 'omitted lifecycle properties remain backward compatible')

  const traversal = await fetch(`${origin}/${projectId}`, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(projectId, { files: [{ path: '../escape.tex', content: 'x', isBinary: false }] })) })
  assert.equal(traversal.status, 422)

  const zip = new AdmZip()
  zip.addFile('nested/main.tex', Buffer.from('\\documentclass{article}'))
  const form = new FormData()
  form.append('archive', new Blob([zip.toBuffer()], { type: 'application/zip' }), 'project.zip')
  const imported = await fetch(`${origin}/import-zip`, { method: 'POST', headers: auth(), body: form })
  assert.equal(imported.status, 200)
  assert.equal((await imported.json()).mainFile, 'nested/main.tex')

  const oldImage = process.env.LATEX_COMPILER_IMAGE
  delete process.env.LATEX_COMPILER_IMAGE
  try {
    const unavailable = await fetch(`${origin}/compile`, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(projectId)) })
    assert.equal(unavailable.status, 503)
    assert.equal((await unavailable.json()).code, 'COMPILER_UNAVAILABLE')
  } finally {
    if (oldImage !== undefined) process.env.LATEX_COMPILER_IMAGE = oldImage
  }

  const remove = await fetch(`${origin}/${projectId}`, { method: 'DELETE', headers: auth() })
  assert.equal(remove.status, 204)
  assert.equal((await fetch(`${origin}/${projectId}`, { headers: auth() })).status, 404)
})
