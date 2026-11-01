/**
 * Shared test helpers.
 */
import request from 'supertest'
import { createApp } from '../app.js'
import User from '../models/User.js'

export const app = createApp()

/** Register a user and return { token, user, credentials }. */
export const registerUser = async (overrides = {}) => {
  const payload = {
    name: 'Test Student',
    email: `student${Date.now()}${Math.random().toString(36).slice(2, 6)}@example.com`,
    password: 'TestPass123!',
    ...overrides,
  }

  const res = await request(app).post('/api/auth/register').send(payload)
  return { res, token: res.body.token, user: res.body.user, credentials: payload }
}

/** Register a user and promote them to admin directly in the database. */
export const registerAdmin = async (overrides = {}) => {
  const created = await registerUser(overrides)
  await User.findByIdAndUpdate(created.user.id, { role: 'admin' })
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: created.credentials.email, password: created.credentials.password })
  return { ...created, token: res.body.token, user: res.body.user }
}

/** Authenticated request helper. */
export const asUser = (token) => ({
  get: (url) => request(app).get(url).set('Authorization', `Bearer ${token}`),
  post: (url) => request(app).post(url).set('Authorization', `Bearer ${token}`),
  put: (url) => request(app).put(url).set('Authorization', `Bearer ${token}`),
  delete: (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
})
