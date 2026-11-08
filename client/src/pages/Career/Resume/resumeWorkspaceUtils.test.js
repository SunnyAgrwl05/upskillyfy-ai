import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LOCAL_RESUME_TEMPLATES,
  filterLocalTemplates,
  findLocalTemplate,
  fromResumeProjectPayload,
  getCurrentUserId,
  isValidTexUpload,
  isValidZipUpload,
  normalizeTemplate,
  toResumeProjectPayload,
} from './resumeWorkspaceUtils.js'

test('offline template catalogue has all categories and the required resume templates', () => {
  assert.equal(LOCAL_RESUME_TEMPLATES.length, 18)
  assert.ok(LOCAL_RESUME_TEMPLATES.some(template => template.id === 'ats-friendly-resume'))
  assert.ok(LOCAL_RESUME_TEMPLATES.some(template => template.id === 'fresher-resume'))
  assert.ok(LOCAL_RESUME_TEMPLATES.some(template => template.id === 'software-engineer-resume'))
})

test('normalizes API files while retaining the selected main TeX file and assets', () => {
  const template = normalizeTemplate({
    id: 'project-template', title: 'Project template', mainFile: 'src/resume.tex',
    files: [
      { path: 'src/resume.tex', content: '\\documentclass{article}', isBinary: false },
      { path: 'assets/photo.png', content: 'aGVsbG8=', isBinary: true },
    ],
  })
  assert.equal(template.source, '\\documentclass{article}')
  assert.equal(template.mainFile, 'src/resume.tex')
  assert.deepEqual(template.files.map(file => file.name), ['src/resume.tex', 'assets/photo.png'])
  assert.equal(template.files[1].isBinary, true)
  assert.equal(normalizeTemplate({}), null)
})

test('legacy IDs resolve offline and filters handle search, kind, and category together', () => {
  assert.equal(findLocalTemplate('ats-resume').id, 'ats-friendly-resume')
  assert.equal(findLocalTemplate('software-engineer').id, 'software-engineer-resume')
  const results = filterLocalTemplates('entry-level', 'Templates', 'CVs and Résumés')
  assert.deepEqual(results.map(template => template.id), ['fresher-resume'])
  assert.deepEqual(filterLocalTemplates('missing-query'), [])
})

test('project adapters preserve the frontend shape while matching backend API fields', () => {
  const input = {
    id: 'project-identifier-123', title: 'A resume', mainFile: 'main.tex', templateId: 'ats-friendly-resume',
    files: [{ name: 'main.tex', content: 'source', isBinary: false }], tags: ['job search'], archived: true, trashed: false,
  }
  const payload = toResumeProjectPayload(input)
  assert.equal(payload.name, 'A resume')
  assert.equal(payload.files[0].path, 'main.tex')
  assert.equal(payload.archived, true)
  const local = fromResumeProjectPayload({ ...payload, createdAt: '2026-01-01', updatedAt: '2026-01-02' }, 'user-1')
  assert.equal(local.title, 'A resume')
  assert.equal(local.files[0].name, 'main.tex')
  assert.equal(local.cloudOwner, 'user-1')
  assert.equal(local.cloudSaved, true)
})

test('extracts the signed-in account ID and validates supported import sizes', () => {
  const token = `header.${Buffer.from(JSON.stringify({ id: 'user-123' })).toString('base64url')}.signature`
  assert.equal(getCurrentUserId(token), 'user-123')
  assert.equal(getCurrentUserId('invalid'), null)
  assert.equal(isValidTexUpload({ name: 'resume.tex', size: 100 }), true)
  assert.equal(isValidTexUpload({ name: 'resume.tex', size: 2 * 1024 * 1024 + 1 }), false)
  assert.equal(isValidZipUpload({ name: 'project.zip', size: 100 }), true)
  assert.equal(isValidZipUpload({ name: 'project.zip', size: 5 * 1024 * 1024 + 1 }), false)
})
