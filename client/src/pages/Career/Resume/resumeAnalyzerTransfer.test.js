import assert from 'node:assert/strict'
import test from 'node:test'
import { analysisToResumeDraft, ATS_RESUME_TEMPLATE_CHOICES } from './resumeAnalyzerTransfer.js'
import { makeProject, readProjects, upsertProject } from './ovStore.js'

test('confirmed analysis transfers only extracted claims into a fresh editable resume draft', () => {
  const draft = analysisToResumeDraft({
    name: 'Alex Morgan', email: 'alex@example.com', professionalSummary: 'Systems engineer.',
    education: [{ degree: 'BSc', institution: 'State University', dates: '2020' }],
    workExperience: [{ title: 'Engineer', employer: 'Example Co', dates: '2020–2024', bullets: ['Reduced latency by 20%.'] }],
    technicalSkills: ['Go'], softSkills: ['Mentoring'], links: ['https://example.com'],
  })
  assert.equal(draft.name, 'Alex Morgan')
  assert.equal(draft.experience[0].company, 'Example Co')
  assert.equal(draft.education[0].degree, 'BSc')
  assert.equal(draft.skills, 'Go, Mentoring')
  assert.equal(draft.links, 'https://example.com')
  assert.equal(draft.headline, '', 'a target role is never inferred')
  assert.equal(draft.jobDescription, '')
  assert.equal(analysisToResumeDraft({}).experience.length, 0)
})

test('resume builder offers each requested ATS layout', () => {
  assert.deepEqual(ATS_RESUME_TEMPLATE_CHOICES.map(({ id }) => id), [
    'ats-friendly-resume', 'fresher-resume', 'software-engineer-resume',
    'experienced-professional-resume', 'academic-cv',
  ])
})


test('creating a transferred resume project preserves existing local projects', () => {
  const previousStorage = globalThis.localStorage
  const values = new Map()
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  }
  try {
    const oldProject = { id: 'existing-local-resume', title: 'Existing draft', files: [{ name: 'main.tex', content: 'keep me' }] }
    values.set('upskillyfy-latex-projects-v1', JSON.stringify([oldProject]))
    const transferred = makeProject('Alex Morgan Resume', 'new source', { templateId: 'software-engineer-resume' })
    upsertProject(transferred)
    const projects = readProjects()
    assert.equal(projects.length, 2)
    assert.equal(projects.find((item) => item.id === oldProject.id).files[0].content, 'keep me')
    assert.equal(projects.find((item) => item.id === transferred.id).templateId, 'software-engineer-resume')
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = previousStorage
  }
})
