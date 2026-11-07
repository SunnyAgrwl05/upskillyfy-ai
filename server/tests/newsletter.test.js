import request from 'supertest'
import { app, asUser, registerAdmin, registerUser } from './helpers.js'
import Subscriber from '../models/Subscriber.js'

describe('newsletter subscription API', () => {
  test('validates and normalizes email, prevents duplicates, and supports unsubscribe', async () => {
    const invalid = await request(app).post('/api/newsletter/subscribe').send({ email: 'not-an-email' })
    expect(invalid.status).toBe(422)

    const first = await request(app).post('/api/newsletter/subscribe').send({ email: 'News@example.com ' })
    expect(first.status).toBe(201)
    expect(await Subscriber.countDocuments({ email: 'news@example.com', isActive: true })).toBe(1)

    const duplicate = await request(app).post('/api/newsletter/subscribe').send({ email: 'NEWS@example.com' })
    expect(duplicate.status).toBe(200)
    expect(duplicate.body.alreadyExists).toBe(true)

    const unsubscribe = await request(app).post('/api/newsletter/unsubscribe').send({ email: 'news@example.com' })
    expect(unsubscribe.status).toBe(200)
    expect(await Subscriber.countDocuments({ email: 'news@example.com', isActive: true })).toBe(0)
  })

  test('protects subscriber listing and CSV export with admin authorization', async () => {
    const user = await registerUser()
    const admin = await registerAdmin()
    await Subscriber.create({ email: 'private@example.com' })

    expect((await request(app).get('/api/newsletter')).status).toBe(401)
    expect((await asUser(user.token).get('/api/newsletter')).status).toBe(403)

    const page = await asUser(admin.token).get('/api/newsletter').query({ page: 1, limit: 1 })
    expect(page.status).toBe(200)
    expect(page.body.subscribers).toHaveLength(1)
    expect(page.body.pagination.total).toBe(1)

    const csv = await asUser(admin.token).get('/api/newsletter/export.csv')
    expect(csv.status).toBe(200)
    expect(csv.headers['content-type']).toContain('text/csv')
    expect(csv.text).toContain('private@example.com')
  })
})
