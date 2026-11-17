import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import express from 'express'
import { createServer } from 'node:http'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import AdmZip from 'adm-zip'
import User from '../models/User.js'
import ResumeProject from '../models/ResumeProject.js'

const testMongoUri = process.env.TEST_MONGODB_URI
const isolatedTestDb = (() => {
  if (!testMongoUri) return false
  try {
    const parsed = new URL(testMongoUri)
    return ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)
      && /resume_builder_test/i.test(parsed.pathname)
      && (!process.env.MONGODB_URI || process.env.MONGODB_URI === testMongoUri)
  } catch { return false }
})()
const app = express()
let server
let origin
let objectServer
const storedObjects = new Map()
let owner
let other
let token
let otherToken

before(async () => {
  if (!isolatedTestDb) return
  process.env.NODE_ENV = 'test'
  process.env.MONGODB_URI = testMongoUri
  process.env.JWT_SECRET = 'resume-builder-isolated-test-secret'
  await mongoose.connect(testMongoUri)
  objectServer = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname
    const key = decodeURIComponent(pathname.replace(/^\/[^/]+\//, ''))
    if (req.method === 'PUT') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      storedObjects.set(key, Buffer.concat(chunks))
      res.writeHead(200, { ETag: '"isolated-test-object"' }).end()
      return
    }
    if (req.method === 'GET' && storedObjects.has(key)) {
      const body = storedObjects.get(key)
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': body.length, ETag: '"isolated-test-object"' }).end(body)
      return
    }
    res.writeHead(404).end()
  })
  await new Promise(resolve => objectServer.listen(0, '127.0.0.1', resolve))
  process.env.R2_ENDPOINT = `http://127.0.0.1:${objectServer.address().port}`
  process.env.R2_ACCESS_KEY_ID = 'isolated-test-key'
  process.env.R2_SECRET_ACCESS_KEY = 'isolated-test-secret'
  process.env.R2_BUCKET_NAME = 'resume-builder-test-bucket'
  const { default: resumeProjects } = await import('../routes/resumeProjects.js')
  app.use(express.json({ limit: '8mb' }))
  app.use('/api/resume-projects', resumeProjects)
  app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }))
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
  if (objectServer) await new Promise((resolve) => objectServer.close(resolve))
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
  const invalidId = await fetch(origin, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody('bad/id')) })
  assert.equal(invalidId.status, 422)
  const create = await fetch(origin, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(projectId, { tags: ['job search'], archived: true })) })
  assert.equal(create.status, 201)
  const created = (await create.json()).project
  assert.equal(created.id, projectId)
  assert.equal(created.tags[0], 'job search')
  assert.equal(created.archived, true)
  const ownerRead = await fetch(`${origin}/${projectId}`, { headers: auth() })
  assert.equal(ownerRead.status, 200)
  assert.equal((await ownerRead.json()).project.files[0].path, 'src/main.tex')

  const list = await fetch(origin, { headers: auth() })
  assert.ok((await list.json()).projects.some((project) => project.id === projectId))
  const forbiddenRead = await fetch(`${origin}/${projectId}`, { headers: auth(otherToken) })
  assert.equal(forbiddenRead.status, 404)
  assert.equal((await fetch(`${origin}/missing-project-id`, { headers: auth() })).status, 404)
  assert.equal((await fetch(`${origin}/${projectId}/pdf`, { headers: auth(otherToken) })).status, 404)
  assert.equal((await fetch(`${origin}/${projectId}/pdf`)).status, 401)

  const revisedTex = '\\documentclass{article}\\begin{document}Revised version\\end{document}'
  const update = await fetch(`${origin}/${projectId}`, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(projectId, { name: 'Renamed resume', files: [{ path: 'src/main.tex', content: revisedTex, isBinary: false }] })) })
  assert.equal(update.status, 200)
  const updated = (await update.json()).project
  assert.equal(updated.name, 'Renamed resume')
  assert.equal(updated.archived, true, 'omitted lifecycle properties remain backward compatible')
  const history = await fetch(`${origin}/${projectId}/history`, { headers: auth() })
  assert.equal(history.status, 200)
  assert.equal((await history.json()).versions[0].files[0].content.includes('Hi'), true)
  const forbiddenHistory = await fetch(`${origin}/${projectId}/history`, { headers: auth(otherToken) })
  assert.equal(forbiddenHistory.status, 404)
  const restore = await fetch(`${origin}/${projectId}/history/0/restore`, { method: 'POST', headers: auth() })
  assert.equal(restore.status, 200)
  assert.equal((await restore.json()).project.files[0].content.includes('Hi'), true)

  const invalidAsset = await fetch(origin, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(`resume-invalid-asset-${Date.now()}`, { files: [
    { path: 'src/main.tex', content: revisedTex, isBinary: false },
    { path: 'assets/photo.png', content: Buffer.from('not a png').toString('base64'), isBinary: true },
  ] })) })
  assert.equal(invalidAsset.status, 422)
  const unsupportedAsset = await fetch(origin, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(`resume-unsupported-asset-${Date.now()}`, { files: [
    { path: 'src/main.tex', content: revisedTex, isBinary: false },
    { path: 'assets/program.exe', content: Buffer.from('executable').toString('base64'), isBinary: true },
  ] })) })
  assert.equal(unsupportedAsset.status, 422)
  const validSignatureAsset = await fetch(origin, { method: 'POST', headers: { ...auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(projectBody(`resume-valid-asset-${Date.now()}`, { files: [
    { path: 'src/main.tex', content: revisedTex, isBinary: false },
    { path: 'assets/photo.png', content: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64'), isBinary: true },
  ] })) })
  assert.equal(validSignatureAsset.status, 201)

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

test('isolated compiler writes a persistent PDF and failed recompilation preserves the last successful version', { skip: !isolatedTestDb || !process.env.LATEX_COMPILER_IMAGE ? 'Requires isolated MongoDB and LATEX_COMPILER_IMAGE.' : false }, async () => {
  const projectId = `resume-compile-${Date.now()}`
  const tex = String.raw`\documentclass{article}
\usepackage{fontspec}
\setmainfont{STIXGeneral}
\begin{document}
Unicode — en – quote “text” bullet •
\end{document}`
  const compile = async source => fetch(`${origin}/compile`, {
    method: 'POST',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify(projectBody(projectId, { files: [{ path: 'src/main.tex', content: source, isBinary: false }] })),
  })
  const success = await compile(tex)
  assert.equal(success.status, 200, await success.clone().text())
  const pdf = Buffer.from(await success.arrayBuffer())
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
  assert.equal(storedObjects.size, 1, 'successful PDF was stored by the configured private-storage client')

  const ownerDownload = await fetch(`${origin}/${projectId}/pdf?download=1`, { headers: auth() })
  assert.equal(ownerDownload.status, 200)
  assert.deepEqual(Buffer.from(await ownerDownload.arrayBuffer()), pdf)
  assert.match(ownerDownload.headers.get('content-disposition'), /attachment; filename=/)
  assert.equal((await fetch(`${origin}/${projectId}/pdf`, { headers: auth(otherToken) })).status, 404)

  const failed = await compile(String.raw`\documentclass{article}\usepackage{package-that-does-not-exist}\begin{document}No\end{document}`)
  assert.equal(failed.status, 422)
  const retained = await fetch(`${origin}/${projectId}/pdf`, { headers: auth() })
  assert.deepEqual(Buffer.from(await retained.arrayBuffer()), pdf)
  const project = await fetch(`${origin}/${projectId}`, { headers: auth() })
  const projectData = (await project.json()).project
  assert.equal(projectData.compileStatus, 'failed')
  assert.equal(projectData.hasPdf, true)
  assert.equal(projectData.pdfVersion, 1)
  assert.equal(Object.hasOwn(projectData.pdfVersions[0], 'key'), false, 'private storage keys are not exposed by project APIs')
})
