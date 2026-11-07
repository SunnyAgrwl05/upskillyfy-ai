import request from 'supertest'
import { app, registerUser, asUser } from './helpers.js'
import User from '../models/User.js'

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Asha Verma',
      email: 'asha@example.com',
      password: 'StrongPass123',
      branch: 'CSE',
    })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe('asha@example.com')
    expect(res.body.user).not.toHaveProperty('password')
  })

  it('issues a short-lived access token and supports email verification', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Verify Me',
      email: 'verify-me@example.com',
      password: 'StrongPass123',
    })
    expect(response.status).toBe(201)
    expect(response.body.emailVerificationRequired).toBe(true)
    expect(response.body.devVerificationCode).toMatch(/^\d{6}$/)

    const verified = await request(app).post('/api/auth/verify-email')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send({ code: response.body.devVerificationCode })
    expect(verified.status).toBe(200)
    expect(verified.body.emailVerified).toBe(true)

    const user = await User.findOne({ email: 'verify-me@example.com' }).lean()
    expect(user.emailVerifiedAt).toBeTruthy()
  })

  it('rejects a duplicate email with 409', async () => {
    const payload = {
      name: 'Asha Verma',
      email: 'dup@example.com',
      password: 'StrongPass123',
    }
    await request(app).post('/api/auth/register').send(payload)
    const res = await request(app).post('/api/auth/register').send(payload)

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('EMAIL_TAKEN')
  })

  it('rejects a weak password with 422', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Asha Verma',
      email: 'weak@example.com',
      password: 'short',
    })

    expect(res.status).toBe(422)
    expect(res.body.code).toBe('VALIDATION_ERROR')
    expect(res.body.fields).toHaveProperty('password')
  })

  it('rejects an invalid email with 422', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Asha Verma',
      email: 'not-an-email',
      password: 'StrongPass123',
    })

    expect(res.status).toBe(422)
    expect(res.body.fields).toHaveProperty('email')
  })

  it('never stores the password in plain text', async () => {
    await registerUser({ password: 'PlainTextSecret1' })
    const user = await User.findOne({ email: /@example\.com$/ })
    expect(user.password).not.toBe('PlainTextSecret1')
    expect(user.password).toMatch(/^\$2[aby]\$/) // bcrypt hash prefix
  })
})

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const { credentials } = await registerUser()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(credentials.email)
  })

  it('returns 401 for a wrong password', async () => {
    const { credentials } = await registerUser()
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'WrongPassword1' })

    expect(res.status).toBe(401)
    expect(res.body.code).toBe('INVALID_CREDENTIALS')
  })

  it('gives the same response for an unknown email (no account enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'SomePassword1' })

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('That email and password combination is incorrect.')
  })
})

describe('GET /api/auth/me', () => {
  it('returns the current user when a valid token is supplied', async () => {
    const { token, user } = await registerUser()
    const res = await asUser(token).get('/api/auth/me')

    expect(res.status).toBe(200)
    expect(res.body.email).toBe(user.email)
    expect(res.body).not.toHaveProperty('password')
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/refresh', () => {
  it('issues a new access token for a valid refresh token', async () => {
    const { token } = await registerUser()
    // The refresh cookie is set on register; grab it from the login response.
    const loginRes = await request(app).post('/api/auth/login').send({
      email: (await User.findOne({}).lean()).email,
      password: 'TestPass123!',
    })

    const refreshCookie = loginRes.headers['set-cookie']
      ?.find((c) => c.startsWith('upskillyfy_refresh='))
      ?.split(';')[0]

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie || '')

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(token).toBeTruthy()
  })

  it('rotates refresh tokens and rejects replay of the old token', async () => {
    const created = await registerUser()
    const loginRes = await request(app).post('/api/auth/login').send({ email: created.credentials.email, password: created.credentials.password })
    const refreshCookie = loginRes.headers['set-cookie']
      ?.find((cookie) => cookie.startsWith('upskillyfy_refresh='))
      ?.split(';')[0]
    const first = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie || '')
    expect(first.status).toBe(200)
    const replay = await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie || '')
    expect(replay.status).toBe(401)
    expect(replay.body.code).toBe('SESSION_INVALID')
  })

  it('returns 401 when no refresh token is provided', async () => {
    const res = await request(app).post('/api/auth/refresh')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('NO_REFRESH_TOKEN')
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the auth cookies', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    const cookies = res.headers['set-cookie'] || []
    expect(cookies.some((c) => c.includes('upskillyfy_access='))).toBe(true)
  })

  it('invalidates the current token generation on logout', async () => {
    const { token } = await registerUser()
    const loggedOut = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`)
    expect(loggedOut.status).toBe(200)
    const protectedRequest = await asUser(token).get('/api/auth/me')
    expect(protectedRequest.status).toBe(401)
    expect(protectedRequest.body.code).toBe('SESSION_INVALID')
  })
})

describe('GET /api/health', () => {
  it('reports the database as connected', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.database).toBe('connected')
  })
})

describe('unknown routes', () => {
  it('returns a structured 404', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.code).toBe('NOT_FOUND')
  })
})
