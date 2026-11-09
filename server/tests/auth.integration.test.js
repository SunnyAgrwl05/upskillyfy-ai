import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import mongoose from 'mongoose'
import authRoutes from '../routes/auth.js'
import User from '../models/User.js'

const canRun = Boolean(process.env.MONGODB_URI && process.env.JWT_SECRET)
const email = `auth-test-${Date.now()}@example.test`

test('authentication integration', { skip: !canRun }, async (t) => {
  await mongoose.connect(process.env.MONGODB_URI)
  const app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)
  const server = app.listen(0)
  await new Promise(resolve => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  try {
    let cookie = ''
    await t.test('signup persists user and issues HttpOnly cookie', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Auth Test', email, password: 'SecurePass123!', termsAccepted: true }),
      })
      assert.equal(response.status, 201)
      const body = await response.json()
      assert.equal(body.user.email, email)
      assert.equal('token' in body, false)
      const setCookie = response.headers.get('set-cookie') || ''
      assert.match(setCookie, /upskillyfy_token=/)
      assert.match(setCookie, /HttpOnly/i)
      cookie = setCookie.split(';')[0]
      const persisted = await User.findOne({ email })
      assert.ok(persisted)
      assert.notEqual(persisted.password, 'SecurePass123!')
    })

    await t.test('session cookie authenticates /me and logout clears it', async () => {
      const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } })
      assert.equal(me.status, 200)
      assert.equal((await me.json()).email, email)
      const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST', headers: { cookie, origin: 'http://localhost:5173' } })
      assert.equal(logout.status, 200)
      assert.match(logout.headers.get('set-cookie') || '', /upskillyfy_token=;/)
    })

    await t.test('login rejects invalid password and accepts correct password', async () => {
      const invalid = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password: 'wrong-password' }),
      })
      assert.equal(invalid.status, 401)
      const valid = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password: 'SecurePass123!' }),
      })
      assert.equal(valid.status, 200)
      assert.match(valid.headers.get('set-cookie') || '', /HttpOnly/i)
    })
  } finally {
    await User.deleteOne({ email })
    await mongoose.disconnect()
    await new Promise(resolve => server.close(resolve))
  }
})
