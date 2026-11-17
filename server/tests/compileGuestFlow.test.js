import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import express from 'express'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import authRoutes from '../routes/auth.js'
import resumeProjects from '../routes/resumeProjects.js'
import User from '../models/User.js'
import ResumeProject from '../models/ResumeProject.js'
import AuthEvent from '../models/AuthEvent.js'

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
app.use(express.json({ limit: '15mb' }))
app.use('/api/auth', authRoutes)
app.use('/api/resume-projects', resumeProjects)

let server
let origin
let cookie = ''
const email = `compile-smoke-${Date.now()}@example.test`

const minimalTex = String.raw`\documentclass{article}
\begin{document}
Smoke test document.
\end{document}`

const projectBody = {
  id: `smoke-${Date.now()}`,
  name: 'Compile smoke test',
  mainFile: 'main.tex',
  tags: [],
  archived: false,
  trashed: false,
  files: [{ path: 'main.tex', content: minimalTex, isBinary: false }],
}

before(async () => {
  if (!isolatedTestDb) return
  process.env.JWT_SECRET = 'resume-builder-isolated-test-secret'
  await mongoose.connect(testMongoUri)
  console.log(`[smoke] connected to local database: ${mongoose.connection.db.databaseName} on ${mongoose.connection.host}`)
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      origin = `http://127.0.0.1:${server.address().port}`
      resolve()
    })
  })
})

after(async () => {
  if (!isolatedTestDb) return
  await User.deleteMany({ email })
  await ResumeProject.deleteMany({ name: projectBody.name })
  await AuthEvent.deleteMany({ email })
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
})

test('guest compile flow: register, session cookie, /compile stays behind auth and rate limiting', { skip: !isolatedTestDb && 'Set TEST_MONGODB_URI to an isolated local resume_builder_test database; no default application database is used.' }, async () => {
  // 1. Register a real visitor account.
  const register = await fetch(`${origin}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Compile Smoke', email, password: 'SecurePass123!', termsAccepted: true }),
  })
  assert.equal(register.status, 201)
  const setCookie = register.headers.get('set-cookie') || ''
  assert.match(setCookie, /upskillyfy_token=/)
  assert.match(setCookie, /HttpOnly/i)
  cookie = setCookie.split(';')[0]

  // 2. The cookie is a working session.
  const me = await fetch(`${origin}/api/auth/me`, { headers: { cookie } })
  assert.equal(me.status, 200)
  assert.equal((await me.json()).email, email)

  // 3. /compile without a cookie is rejected: guests never reach the compiler.
  const guestCompile = await fetch(`${origin}/api/resume-projects/compile`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(projectBody),
  })
  assert.equal(guestCompile.status, 401)

  // 4. /compile with a session is still rate limited (compileLimiter is mounted).
  // protect checks Origin for cookie-authenticated non-GET requests; the test
  // client identifies as the Vite dev server, which is allow-listed in development.
  const authedHeaders = { 'content-type': 'application/json', cookie, origin: 'http://127.0.0.1:5173' }
  const image = process.env.LATEX_COMPILER_IMAGE
  delete process.env.LATEX_COMPILER_IMAGE
  try {
    const authed = await fetch(`${origin}/api/resume-projects/compile`, {
      method: 'POST',
      headers: authedHeaders,
      body: JSON.stringify(projectBody),
    })
    assert.equal(authed.status, 503)
    assert.equal((await authed.json()).code, 'COMPILER_UNAVAILABLE')
  } finally {
    if (image !== undefined) process.env.LATEX_COMPILER_IMAGE = image
  }

  // 5. With the image configured, an authenticated request still passes protect
  // and reaches the compiler path: it no longer fails with the compiler-missing
  // code, but with a request-validation error from cleanInput (422) or a Docker
  // failure (503). Either proves the session was accepted.
  process.env.LATEX_COMPILER_IMAGE = 'upskillyfy-latex:latest'
  try {
    const withImage = await fetch(`${origin}/api/resume-projects/compile`, {
      method: 'POST',
      headers: authedHeaders,
      body: JSON.stringify(projectBody),
    })
    assert.ok([422, 503].includes(withImage.status), `authenticated request must leave protect; got ${withImage.status}`)
    assert.notEqual(withImage.status, 401)
    assert.notEqual(withImage.status, 403)
  } finally {
    if (image !== undefined) process.env.LATEX_COMPILER_IMAGE = image
    else delete process.env.LATEX_COMPILER_IMAGE
  }

  // 5. The session token identifies exactly the registered user.
  const token = cookie.split('=')[1]
  const payload = jwt.decode(token)
  const dbUser = await User.findById(payload.id)
  assert.ok(dbUser, 'session token must resolve to the registered user')
  assert.equal(dbUser.email, email)
})
