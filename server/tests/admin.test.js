import request from 'supertest'
import { app, registerAdmin, registerUser } from './helpers.js'
import User from '../models/User.js'
import Hackathon from '../models/Hackathon.js'
import ResumeAnalysis from '../models/ResumeAnalysis.js'
import ResumeAnalysisEvent from '../models/ResumeAnalysisEvent.js'
import Subscriber from '../models/Subscriber.js'
import AdminAuditLog from '../models/AdminAuditLog.js'

const auth = token => ({ Authorization: `Bearer ${token}` })
const forbiddenKeys = /password|token|secret|otp|reset/i
const assertNoSensitiveKeys = value => {
  if (!value || typeof value !== 'object') return
  for (const [key, nested] of Object.entries(value)) {
    expect(key).not.toMatch(forbiddenKeys)
    assertNoSensitiveKeys(nested)
  }
}

describe('admin backend hardening', () => {
  test('requires admin auth on dashboard, users, analyzer, newsletter, and audit APIs', async () => {
    const admin = await registerAdmin()
    const normal = await registerUser()
    const hackathon = await Hackathon.create({ title: 'Admin Authorization Event', description: 'Test event', slug: `admin-auth-${Date.now()}`, createdBy: admin.user.id })
    const paths = [
      '/api/admin/dashboard', '/api/admin/health', '/api/admin/users', `/api/admin/users/${normal.user.id}`,
      '/api/admin/hackathons', `/api/admin/hackathons/${hackathon._id}/registrations`, `/api/admin/hackathons/${hackathon._id}/submissions`,
      '/api/admin/resume-analyses', '/api/admin/resume-analyses/stats', '/api/admin/newsletter', '/api/admin/audit-logs', '/api/admin/newsletter/export.csv',
    ]
    for (const path of paths) {
      expect((await request(app).get(path)).status).toBe(401)
      expect((await request(app).get(path).set(auth(normal.token))).status).toBe(403)
      const response = await request(app).get(path).set(auth(admin.token))
      expect(response.status).toBe(200)
      if (response.type.includes('json')) assertNoSensitiveKeys(response.body)
    }
    for (const [path, payload] of [[`/api/admin/users/${normal.user.id}/role`, { role: 'student' }], [`/api/admin/users/${normal.user.id}/status`, { isActive: true }]]) {
      expect((await request(app).patch(path).send(payload)).status).toBe(401)
      expect((await request(app).patch(path).set(auth(normal.token)).send(payload)).status).toBe(403)
      expect((await request(app).patch(path).set(auth(admin.token)).send(payload)).status).toBe(200)
    }
  })

  test('health reveals only approved system categories and user DTOs omit secrets', async () => {
    const admin = await registerAdmin()
    const user = await registerUser()
    await User.findByIdAndUpdate(user.user.id, { $set: { passwordResetToken: 'must-not-leak', otpCode: '123456' } })
    const health = await request(app).get('/api/admin/health').set(auth(admin.token))
    expect(Object.keys(health.body).sort()).toEqual(['database', 'memoryUsage', 'nodeVersion', 'uptimeSeconds'].sort())
    expect(Object.keys(health.body.memoryUsage).sort()).toEqual(['heapUsed', 'rss'])
    const listed = await request(app).get('/api/admin/users').set(auth(admin.token))
    expect(listed.status).toBe(200)
    expect(listed.body.users.find(item => item.id === user.user.id)).toMatchObject({ email: user.credentials.email, isActive: true })
    assertNoSensitiveKeys(listed.body)
    const detail = await request(app).get(`/api/admin/users/${user.user.id}`).set(auth(admin.token))
    assertNoSensitiveKeys(detail.body)
  })

  test('rejects NoSQL query objects and invalid pagination/sort; treats regex syntax literally', async () => {
    const admin = await registerAdmin()
    await User.create({ name: 'Literal [admin] marker', email: 'literal-marker@example.test', password: 'SecretPass123!' })
    const injected = await request(app).get('/api/admin/users?search[$ne]=x').set(auth(admin.token))
    expect(injected.status).toBe(400)
    expect((await request(app).get('/api/admin/users?page=0').set(auth(admin.token))).status).toBe(400)
    expect((await request(app).get('/api/admin/users?limit=101').set(auth(admin.token))).status).toBe(400)
    expect((await request(app).get('/api/admin/users?sort=password').set(auth(admin.token))).status).toBe(400)
    const literal = await request(app).get('/api/admin/users?search=%5Badmin%5D').set(auth(admin.token))
    expect(literal.body.users.map(row => row.email)).toEqual(['literal-marker@example.test'])
  })

  test('rejects self privilege changes, protects last active admin, and rejects mass assignment', async () => {
    const admin = await registerAdmin()
    const otherAdmin = await registerAdmin({ email: `second-${Date.now()}@example.test` })
    const user = await registerUser()
    const selfDemote = await request(app).patch(`/api/admin/users/${admin.user.id}/role`).set(auth(admin.token)).send({ role: 'student' })
    expect(selfDemote.status).toBe(409)
    expect(selfDemote.body.code).toBe('SELF_DEMOTION')
    const selfDeactivate = await request(app).patch(`/api/admin/users/${admin.user.id}/status`).set(auth(admin.token)).send({ isActive: false })
    expect(selfDeactivate.status).toBe(409)
    expect(selfDeactivate.body.code).toBe('SELF_DEACTIVATION')
    const invalidExtra = await request(app).patch(`/api/admin/users/${user.user.id}/role`).set(auth(admin.token)).send({ role: 'admin', email: 'attacker@example.test' })
    expect(invalidExtra.status).toBe(422)
    expect((await User.findById(user.user.id)).email).toBe(user.credentials.email)
    const promote = await request(app).patch(`/api/admin/users/${user.user.id}/role`).set(auth(admin.token)).send({ role: 'admin' })
    expect(promote.status).toBe(200)
    const demoteOther = await request(app).patch(`/api/admin/users/${user.user.id}/role`).set(auth(admin.token)).send({ role: 'student' })
    expect(demoteOther.status).toBe(200)
    const disableOther = await request(app).patch(`/api/admin/users/${otherAdmin.user.id}/status`).set(auth(admin.token)).send({ isActive: false })
    expect(disableOther.status).toBe(200)
    expect(await AdminAuditLog.countDocuments({ action: 'user.role_changed' })).toBe(2)
    expect(await AdminAuditLog.countDocuments({ action: 'user.deactivated' })).toBe(1)
    const lastAdminDemotion = await request(app).patch(`/api/admin/users/${admin.user.id}/role`).set(auth(admin.token)).send({ role: 'student' })
    expect(lastAdminDemotion.status).toBe(409)
    expect(lastAdminDemotion.body.code).toBe('SELF_DEMOTION')
    const lastAdminDeactivation = await request(app).patch(`/api/admin/users/${admin.user.id}/status`).set(auth(admin.token)).send({ isActive: false })
    expect(lastAdminDeactivation.status).toBe(409)
    expect(lastAdminDeactivation.body.code).toBe('SELF_DEACTIVATION')
  })

  test('concurrent role/status changes serialize and never remove the final active admin', async () => {
    const actor = await registerAdmin()
    const first = await registerAdmin({ email: `first-${Date.now()}@example.test` })
    const second = await registerAdmin({ email: `second-${Date.now()}@example.test` })
    const outcomes = await Promise.all([
      request(app).patch(`/api/admin/users/${first.user.id}/role`).set(auth(actor.token)).send({ role: 'student' }),
      request(app).patch(`/api/admin/users/${second.user.id}/status`).set(auth(actor.token)).send({ isActive: false }),
    ])
    expect(outcomes.every(response => [200, 409].includes(response.status))).toBe(true)
    expect(await User.countDocuments({ role: 'admin', isActive: { $ne: false } })).toBeGreaterThanOrEqual(1)
  })

  test('deactivation invalidates issued access and refresh tokens', async () => {
    const admin = await registerAdmin()
    const user = await registerUser()
    const login = await request(app).post('/api/auth/login').send(user.credentials)
    const refresh = login.headers['set-cookie']?.find(cookie => cookie.startsWith('upskillyfy_refresh='))?.split(';')[0]
    expect(refresh).toBeDefined()
    const disabled = await request(app).patch(`/api/admin/users/${user.user.id}/status`).set(auth(admin.token)).send({ isActive: false })
    expect(disabled.status).toBe(200)
    expect((await request(app).get('/api/users/profile').set(auth(login.body.token))).status).toBe(401)
    expect((await request(app).post('/api/auth/refresh').set('Cookie', refresh)).status).toBe(401)
  })

  test('analyzer admin records expose metadata only, and failed categories are summarized', async () => {
    const admin = await registerAdmin()
    const user = await registerUser()
    const analysis = await ResumeAnalysis.create({
      owner: user.user.id, sourceType: 'upload', targetRole: 'Backend Developer', provider: 'openrouter',
      scores: Object.fromEntries(['atsCompatibility','skillsMatching','keywordMatching','experienceRelevance','projectRelevance','educationRelevance','certificationRelevance','formattingReadability'].map(key => [key, { score: 70, rationale: 'A sufficiently detailed rationale for this score.', evidence: ['Private resume content'] }])),
      domainSuitability: { score: 70, explanation: 'A sufficiently detailed explanation for the suitability score.' },
      jobDescriptionMatch: { score: 0, matchedKeywords: [], missingKeywords: [] },
      privateResumeText: 'VERY_PRIVATE_RESUME_TEXT',
    })
    await ResumeAnalysisEvent.create({ owner: user.user.id, status: 'failed', errorCategory: 'AI_UNAVAILABLE' })
    const response = await request(app).get('/api/admin/resume-analyses').set(auth(admin.token))
    expect(response.status).toBe(200)
    expect(response.body.analyses).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: String(analysis._id), userId: user.user.id, status: 'completed', errorCategory: null }),
      expect.objectContaining({ userId: user.user.id, status: 'failed', errorCategory: 'AI_UNAVAILABLE' }),
    ]))
    const serialized = JSON.stringify(response.body)
    expect(serialized).not.toContain('VERY_PRIVATE_RESUME_TEXT')
    expect(serialized).not.toContain('Private resume content')
    expect(Object.keys(response.body.analyses[0]).sort()).toEqual(['id', 'userId', 'status', 'createdAt', 'errorCategory'].sort())
    expect((await request(app).get('/api/admin/resume-analyses/stats').set(auth(admin.token))).body.failuresByCategory.AI_UNAVAILABLE).toBe(1)
  })

  test('hackathon changes, results, announcements, and exports write append-only audit entries', async () => {
    const admin = await registerAdmin()
    const create = await request(app).post('/api/hackathons').set(auth(admin.token)).send({ title: 'Audit Hackathon', description: 'Test event', slug: `audit-${Date.now()}`, status: 'draft', domains: [] })
    expect(create.status).toBe(201)
    const slug = create.body.data.slug
    const update = await request(app).put(`/api/hackathons/${slug}`).set(auth(admin.token)).send({ title: 'Audit Hackathon Updated', description: 'Updated details', status: 'published', isPublished: true })
    expect(update.status).toBe(200)
    const announcement = await request(app).post(`/api/hackathons/${slug}/announcements`).set(auth(admin.token)).send({ title: 'Schedule', content: 'Final date announced', isPublished: false })
    expect(announcement.status).toBe(201)
    expect((await request(app).put(`/api/hackathons/${slug}/announcements/${announcement.body.data._id}`).set(auth(admin.token)).send({ isPublished: true })).status).toBe(200)
    expect((await request(app).post(`/api/hackathons/${slug}/publish-results`).set(auth(admin.token)).send({})).status).toBe(200)
    expect((await request(app).delete(`/api/hackathons/${slug}`).set(auth(admin.token))).status).toBe(200)
    const logs = await AdminAuditLog.find({}).lean()
    expect(logs.map(log => log.action)).toEqual(expect.arrayContaining(['hackathon.updated', 'hackathon.announcement_created', 'hackathon.announcement_updated', 'hackathon.results_published', 'hackathon.deleted']))
    expect(logs.every(log => String(log.actorId) === admin.user.id)).toBe(true)
    expect(logs.some(log => JSON.stringify(log).includes('Final date announced'))).toBe(false)
    expect(AdminAuditLog.schema.path('createdAt')).toBeDefined()
    expect(AdminAuditLog.schema.path('updatedAt')).toBeUndefined()
    expect((await request(app).put(`/api/admin/audit-logs/${logs[0]._id}`).set(auth(admin.token)).send({ action: 'rewrite' })).status).toBe(404)
    expect((await request(app).delete(`/api/admin/audit-logs/${logs[0]._id}`).set(auth(admin.token))).status).toBe(404)
    await expect(AdminAuditLog.updateOne({ _id: logs[0]._id }, { $set: { action: 'tampered' } })).rejects.toThrow(/append-only/i)
  })

  test('newsletter admin CSV streams rows, escapes formulas and CSV syntax, audits export, and throttles exports', async () => {
    const admin = await registerAdmin()
    await Subscriber.insertMany([
      { email: '=SUM(1,2)', isActive: true }, { email: '+cmd', isActive: true }, { email: '-cmd', isActive: false },
      { email: '@cmd', isActive: true },
      ...Array.from({ length: 260 }, (_, index) => ({ email: `stream-${index}@example.test`, isActive: true })),
    ])
    await Subscriber.collection.insertOne({ email: ' \t=1,"quoted"\nnext', isActive: true, subscribedAt: new Date(), createdAt: new Date(), updatedAt: new Date() })
    const exportOnce = () => request(app).get('/api/admin/newsletter/export.csv').set(auth(admin.token)).set('X-Forwarded-For', '198.51.100.88')
    const csv = await exportOnce()
    expect(csv.status).toBe(200)
    expect(csv.text).toContain("\"'=sum(1,2)\"")
    expect(csv.text).toContain("\"'+cmd\"")
    expect(csv.text).toContain("\"'-cmd\"")
    expect(csv.text).toContain("\"'@cmd\"")
    expect(csv.text).toContain(`"' \t=1,""quoted""\nnext"`)
    expect(csv.text.match(/\r\n/g).length).toBe(266)
    expect(await AdminAuditLog.countDocuments({ action: 'newsletter.csv_exported' })).toBe(1)
    const statuses = []
    for (let i = 0; i < 6; i++) {
      const alias = i % 2 ? '/api/newsletter/export.csv' : '/api/admin/newsletter/export.csv'
      statuses.push((await request(app).get(alias).set(auth(admin.token)).set('X-Forwarded-For', '198.51.100.89')).status)
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200])
    expect(statuses[5]).toBe(429)
  })
})
