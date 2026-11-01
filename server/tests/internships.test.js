import request from 'supertest'
import { app, registerUser, registerAdmin, asUser } from './helpers.js'
import Internship from '../models/Internship.js'

const validInternship = {
  title: 'Backend Engineer Intern',
  company: 'Acme Corp',
  description: 'Work on our Node.js and MongoDB services.',
  branch: ['CSE'],
  skills: ['Node.js', 'MongoDB'],
  stipend: '₹15,000/mo',
  duration: '6 months',
  mode: 'Remote',
  status: 'Open',
  isVerified: true,
}

describe('GET /api/internships', () => {
  it('returns only verified internships', async () => {
    await Internship.create([
      { ...validInternship, title: 'Verified Role' },
      { ...validInternship, title: 'Unverified Role', isVerified: false },
    ])

    const res = await request(app).get('/api/internships')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Verified Role')
  })

  it('filters by branch', async () => {
    await Internship.create([
      { ...validInternship, title: 'CSE Role', branch: ['CSE'] },
      { ...validInternship, title: 'ECE Role', branch: ['ECE'] },
      { ...validInternship, title: 'Open Role', branch: ['All'] },
    ])

    const res = await request(app).get('/api/internships?branch=CSE')

    const titles = res.body.map((i) => i.title)
    expect(titles).toContain('CSE Role')
    expect(titles).toContain('Open Role') // 'All' matches every branch
    expect(titles).not.toContain('ECE Role')
  })

  it('filters by mode and status', async () => {
    await Internship.create([
      { ...validInternship, title: 'Remote Open', mode: 'Remote', status: 'Open' },
      { ...validInternship, title: 'Onsite Closed', mode: 'On-site', status: 'Closed' },
    ])

    const res = await request(app).get('/api/internships?mode=Remote&status=Open')
    const titles = res.body.map((i) => i.title)

    expect(titles).toContain('Remote Open')
    expect(titles).not.toContain('Onsite Closed')
  })

  it('searches by title and company', async () => {
    await Internship.create([
      { ...validInternship, title: 'Frontend Intern', company: 'PixelWorks' },
      { ...validInternship, title: 'Backend Intern', company: 'DataCorp' },
    ])

    const res = await request(app).get('/api/internships?search=PixelWorks')
    expect(res.body).toHaveLength(1)
    expect(res.body[0].company).toBe('PixelWorks')
  })
})

describe('GET /api/internships/:id', () => {
  it('returns a single internship and increments the view counter', async () => {
    const created = await Internship.create(validInternship)

    const first = await request(app).get(`/api/internships/${created._id}`)
    expect(first.status).toBe(200)
    expect(first.body.views).toBe(1)

    const second = await request(app).get(`/api/internships/${created._id}`)
    expect(second.body.views).toBe(2)
  })

  it('returns 404 for a missing internship', async () => {
    const res = await request(app).get('/api/internships/507f1f77bcf86cd799439011')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/internships (admin)', () => {
  it('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/internships').send(validInternship)
    expect(res.status).toBe(401)
  })

  it('rejects a non-admin user with 403', async () => {
    const { token } = await registerUser()
    const res = await asUser(token).post('/api/internships').send(validInternship)
    expect(res.status).toBe(403)
  })

  it('creates the internship for an admin', async () => {
    const { token } = await registerAdmin()
    const res = await asUser(token).post('/api/internships').send(validInternship)

    expect(res.status).toBe(201)
    expect(res.body.title).toBe(validInternship.title)
  })

  it('rejects a payload that fails validation with 422', async () => {
    const { token } = await registerAdmin()
    const res = await asUser(token)
      .post('/api/internships')
      .send({ title: '', company: 'X', description: 'short', mode: 'Teleport' })

    expect(res.status).toBe(422)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('PUT /api/internships/:id', () => {
  it('updates an internship for an admin', async () => {
    const created = await Internship.create(validInternship)
    const { token } = await registerAdmin()

    const res = await asUser(token)
      .put(`/api/internships/${created._id}`)
      .send({ title: 'Updated Title' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated Title')
  })

  it('rejects a non-admin user with 403', async () => {
    const created = await Internship.create(validInternship)
    const { token } = await registerUser()

    const res = await asUser(token)
      .put(`/api/internships/${created._id}`)
      .send({ title: 'Hacked' })

    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/internships/:id', () => {
  it('deletes an internship for an admin', async () => {
    const created = await Internship.create(validInternship)
    const { token } = await registerAdmin()

    const res = await asUser(token).delete(`/api/internships/${created._id}`)
    expect(res.status).toBe(200)

    const remaining = await Internship.findById(created._id)
    expect(remaining).toBeNull()
  })
})
