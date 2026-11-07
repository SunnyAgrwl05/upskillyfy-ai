import AdmZip from 'adm-zip'
import request from 'supertest'
import { asUser, app, registerUser } from './helpers.js'

describe('LaTeX template catalogue', () => {
  test('lists filtered templates with pagination metadata', async () => {
    const response = await request(app)
      .get('/api/latex-templates')
      .query({ category: 'CVs and Résumés', kind: 'Templates', limit: 2 })

    expect(response.status).toBe(200)
    expect(response.body.templates.length).toBeLessThanOrEqual(2)
    expect(response.body.templates.every((template) => template.category === 'CVs and Résumés')).toBe(true)
    expect(response.body.templates[0].files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: expect.any(String), content: expect.any(String) }),
    ]))
    expect(response.body.pagination.total).toBeGreaterThan(0)
  })

  test('returns a template by id and a structured 404 for an unknown id', async () => {
    const found = await request(app).get('/api/latex-templates/ats-friendly-resume')
    expect(found.status).toBe(200)
    expect(found.body.template.mainFile).toBe('main.tex')

    const missing = await request(app).get('/api/latex-templates/does-not-exist')
    expect(missing.status).toBe(404)
    expect(missing.body.code).toBe('TEMPLATE_NOT_FOUND')
  })
})

describe('resume project persistence', () => {
  let owner
  let stranger

  beforeEach(async () => {
    owner = await registerUser()
    stranger = await registerUser()
  })

  const document = (id = 'resume-project-123') => ({
    id,
    name: 'My resume',
    mainFile: 'main.tex',
    templateId: null,
    files: [{ path: 'main.tex', content: '\\documentclass{article}\\begin{document}Hello\\end{document}' }],
  })

  test('creates, lists, updates, and deletes only the signed-in user’s project', async () => {
    const created = await asUser(owner.token).post('/api/resume-projects').send(document())
    expect(created.status).toBe(201)
    expect(created.body.project.id).toBe('resume-project-123')

    const listed = await asUser(owner.token).get('/api/resume-projects')
    expect(listed.status).toBe(200)
    expect(listed.body.projects).toHaveLength(1)

    const hidden = await asUser(stranger.token).get('/api/resume-projects/resume-project-123')
    expect(hidden.status).toBe(404)

    const updated = await asUser(owner.token).put('/api/resume-projects/resume-project-123').send({
      ...document(), name: 'Updated resume',
    })
    expect(updated.status).toBe(200)
    expect(updated.body.project.name).toBe('Updated resume')

    const removed = await asUser(owner.token).delete('/api/resume-projects/resume-project-123')
    expect(removed.status).toBe(204)
  })

  test('rejects unsafe paths and missing main documents', async () => {
    const unsafe = await asUser(owner.token).post('/api/resume-projects').send({
      ...document('unsafe-project-123'), files: [{ path: '../main.tex', content: 'bad' }],
    })

    expect(unsafe.status).toBe(422)

    const missingMain = await asUser(owner.token).post('/api/resume-projects').send({
      ...document('missing-main-123'), mainFile: 'missing.tex',
    })
    expect(missingMain.status).toBe(422)
  })

  test('persists lifecycle state, duplicates only within the owner scope, and rejects stale revisions', async () => {
    const created = await asUser(owner.token).post('/api/resume-projects').send(document('lifecycle-project-123'))
    expect(created.status).toBe(201)
    expect(created.body.project.status).toBe('active')
    expect(created.body.project.revision).toBe(1)

    const archived = await asUser(owner.token).post('/api/resume-projects/lifecycle-project-123/archive').send({ archived: true })
    expect(archived.status).toBe(200)
    expect(archived.body.project.archived).toBe(true)
    expect(archived.body.project.status).toBe('archived')

    const trashed = await asUser(owner.token).post('/api/resume-projects/lifecycle-project-123/trash').send()
    expect(trashed.status).toBe(200)
    expect(trashed.body.project.status).toBe('trashed')

    const restored = await asUser(owner.token).post('/api/resume-projects/lifecycle-project-123/restore').send()
    expect(restored.status).toBe(200)
    expect(restored.body.project.trashed).toBe(false)
    expect(restored.body.project.status).toBe('active')

    const duplicate = await asUser(owner.token).post('/api/resume-projects/lifecycle-project-123/duplicate').send()
    expect(duplicate.status).toBe(201)
    expect(duplicate.body.project.id).not.toBe('lifecycle-project-123')
    expect(duplicate.body.project.files).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'main.tex' }),
    ]))

    const hiddenDuplicate = await asUser(stranger.token).get(`/api/resume-projects/${duplicate.body.project.id}`)
    expect(hiddenDuplicate.status).toBe(404)

    const stale = await asUser(owner.token).put('/api/resume-projects/lifecycle-project-123')
      .send({ ...document('lifecycle-project-123'), revision: 1 })
    expect(stale.status).toBe(409)
    expect(stale.body.code).toBe('REVISION_CONFLICT')
  })

  test('imports a ZIP project without allowing traversal entries', async () => {
    const archive = new AdmZip()
    archive.addFile('main.tex', Buffer.from('\\documentclass{article}\\begin{document}Safe\\end{document}'))
    archive.addFile('refs/references.bib', Buffer.from('@book{sample, title={Sample}}'))
    const valid = await asUser(owner.token).post('/api/resume-projects/import-zip')
      .attach('archive', archive.toBuffer(), 'resume.zip')
    expect(valid.status).toBe(200)
    expect(valid.body.mainFile).toBe('main.tex')
    expect(valid.body.files).toHaveLength(2)

    const traversal = new AdmZip()
    traversal.addFile('main.tex', Buffer.from('unsafe'))
    const maliciousZip = traversal.toBuffer()
    const safeName = Buffer.from('main.tex')
    const traversalName = Buffer.from('../x.tex')
    for (let offset = 0; ; ) {
      offset = maliciousZip.indexOf(safeName, offset)
      if (offset < 0) break
      traversalName.copy(maliciousZip, offset)
      offset += traversalName.length
    }
    const invalid = await asUser(owner.token).post('/api/resume-projects/import-zip')
      .attach('archive', maliciousZip, 'unsafe.zip')
    expect(invalid.status).toBe(422)
  })

  test('returns a real PDF or a structured compiler error, never a placeholder PDF', async () => {
    const previous = process.env.LATEX_COMPILER_IMAGE
    delete process.env.LATEX_COMPILER_IMAGE
    let response
    try {
      response = await asUser(owner.token).post('/api/resume-projects/compile').send(document('compile-project-123'))
    } finally {
      if (previous !== undefined) process.env.LATEX_COMPILER_IMAGE = previous
    }
    if (response.status === 200) {
      expect(response.headers['content-type']).toMatch(/application\/pdf/)
      expect(Buffer.from(response.body).subarray(0, 5).toString('ascii')).toBe('%PDF-')
    } else {
      expect([422, 503, 504]).toContain(response.status)
      expect(['COMPILE_FAILED', 'COMPILER_UNAVAILABLE', 'COMPILE_TIMEOUT']).toContain(response.body.code)
    }
  })
})
