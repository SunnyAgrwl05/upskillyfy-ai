import request from 'supertest'
import Hackathon from '../models/Hackathon.js'
import HackathonRegistration from '../models/HackathonRegistration.js'
import { app, asUser, registerAdmin, registerUser } from './helpers.js'
import { r2Configured } from '../services/storage/r2.js'

const createHackathon = async (admin, overrides = {}) => {
  const now = Date.now()
  const response = await asUser(admin.token).post('/api/hackathons').send({
    slug: `test-event-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Test event', description: 'A test hackathon', status: 'registration_open', isPublished: true,
    registrationStart: new Date(now - 60_000), registrationDeadline: new Date(now + 86_400_000),
    domains: [{ domainId: 'web', name: 'Web', teamSizeMin: 1, teamSizeMax: 4, seatsTotal: 3 }],
    ...overrides,
  })
  expect(response.status).toBe(201)
  return response.body.data
}

describe('hackathon portal API', () => {
  test('lists published events with bounded pagination and hides drafts', async () => {
    const admin = await registerAdmin()
    await createHackathon(admin)
    await createHackathon(admin, { title: 'Private draft', isPublished: false, status: 'draft' })
    const response = await request(app).get('/api/hackathons').query({ page: 1, limit: 1 })
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.pagination.total).toBe(1)
  })

  test('persists a registration, rejects duplicates, and paginates organizer data', async () => {
    const admin = await registerAdmin()
    const participant = await registerUser()
    const event = await createHackathon(admin)
    const registered = await asUser(participant.token).post(`/api/hackathons/${event.slug}/register`).send({ domainId: 'web' })
    expect(registered.status).toBe(201)
    expect(await HackathonRegistration.countDocuments({ hackathonId: event._id })).toBe(1)
    const duplicate = await asUser(participant.token).post(`/api/hackathons/${event.slug}/register`).send({ domainId: 'web' })
    expect(duplicate.status).toBe(409)
    const page = await asUser(admin.token).get(`/api/hackathons/${event.slug}/registrations`).query({ page: 1, limit: 1 })
    expect(page.status).toBe(200)
    expect(page.body.pagination.total).toBe(1)
    expect(page.body.data[0].userId.email).toBe(participant.credentials.email.toLowerCase())
  })

  test('enforces organizer ownership and team membership rules', async () => {
    const admin = await registerAdmin()
    const owner = await registerUser()
    const participant = await registerUser()
    const stranger = await registerUser()
    const event = await createHackathon(admin)
    const forbidden = await asUser(owner.token).get(`/api/hackathons/${event.slug}/registrations`)
    expect(forbidden.status).toBe(403)
    await asUser(participant.token).post(`/api/hackathons/${event.slug}/register`).send({ domainId: 'web' })
    const created = await asUser(participant.token).post(`/api/hackathons/${event.slug}/team`).send({ domainId: 'web', teamName: 'Builders' })
    expect(created.status).toBe(201)
    const joinedWithoutRegistration = await asUser(stranger.token).post(`/api/hackathons/${event.slug}/team/join`).send({ inviteCode: created.body.data.inviteCode })
    expect(joinedWithoutRegistration.status).toBe(403)
    await asUser(stranger.token).post(`/api/hackathons/${event.slug}/register`).send({ domainId: 'web' })
    const joined = await asUser(stranger.token).post(`/api/hackathons/${event.slug}/team/join`).send({ inviteCode: created.body.data.inviteCode })
    expect(joined.status).toBe(200)
    const outsider = await asUser(owner.token).get(`/api/hackathons/${event.slug}/team`)
    expect(outsider.status).toBe(404)
  })

  test('rejects registration after the registration deadline', async () => {
    const admin = await registerAdmin()
    const participant = await registerUser()
    const event = await createHackathon(admin, { registrationDeadline: new Date(Date.now() - 1000) })
    const response = await asUser(participant.token).post(`/api/hackathons/${event.slug}/register`).send({ domainId: 'web' })
    expect(response.status).toBe(409)
    expect(response.body.code).toBe('REGISTRATION_CLOSED')
  })

  test('reports private storage as unavailable when R2 credentials are not configured', async () => {
    if (r2Configured) return
    const participant = await registerUser()
    const response = await asUser(participant.token).post('/api/hackathons/demo/submissions/upload-url').send({
      fileName: 'deck.pptx',
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 1024,
    })
    expect(response.status).toBe(503)
    expect(response.body.code).toBe('STORAGE_UNAVAILABLE')
  })
})
