import request from 'supertest'
import { jest } from '@jest/globals'
import { app, asUser, registerUser } from './helpers.js'
import AIProviderManager, { AIUnavailableError } from '../services/ai/AIProviderManager.js'
import { parseAndValidateAnalysis } from '../services/ai/resumeAnalysisSchema.js'

const source = 'Built API for 100 users. Reduced request time by 20%.'
const validResult = () => ({
  scores: {
    atsCompatibility: score(), skillsMatching: score(), keywordMatching: score(), experienceRelevance: score(),
    projectRelevance: score(), educationRelevance: score(), certificationRelevance: score(), formattingReadability: score(),
  },
  missingSkills: ['PostgreSQL'],
  missingKeywords: ['query optimization'],
  domainSuitability: { score: 70, explanation: 'The documented API work is relevant to backend roles.' },
  bestMatchingRoles: [{ role: 'Backend Developer', score: 75, reason: 'The resume documents API development.' }],
  jobDescriptionMatch: { score: 60, matchedKeywords: ['API'], missingKeywords: ['PostgreSQL'] },
  improvements: [{ section: 'Experience', issue: 'The bullet does not state its context.', suggestion: 'Clarify the API purpose while preserving existing facts.', evidence: 'Built API for 100 users.' }],
  bulletRewrites: [{ before: 'Built API for 100 users.', after: 'Built an API serving 100 users.', rationale: 'Improves readability without adding metrics.' }],
})
function score() { return { score: 75, rationale: 'The resume shows relevant backend implementation experience.', evidence: ['Built API for 100 users.'] } }

describe('resume analysis provider and response validation', () => {
  test('uses OpenRouter first and only calls Ollama after failure', async () => {
    const ollama = { name: 'ollama', configured: true, healthy: jest.fn().mockResolvedValue(true), generateJson: jest.fn().mockResolvedValue('{"source":"ollama"}') }
    const openRouter = { name: 'openrouter', configured: true, generateJson: jest.fn().mockResolvedValue('{"source":"openrouter"}') }
    const primary = await new AIProviderManager({ openRouter, ollama }).generateJson({})
    expect(primary.provider).toBe('openrouter')
    expect(ollama.healthy).not.toHaveBeenCalled()

    openRouter.generateJson.mockRejectedValueOnce(new Error('rate limited'))
    const fallback = await new AIProviderManager({ openRouter, ollama }).generateJson({})
    expect(fallback.provider).toBe('ollama')
    expect(ollama.healthy).toHaveBeenCalledTimes(1)
  })

  test('returns a clear unavailable error when no provider can run', async () => {
    const manager = new AIProviderManager({
      openRouter: { name: 'openrouter', configured: false },
      ollama: { name: 'ollama', configured: true, healthy: async () => false },
    })
    await expect(manager.generateJson({})).rejects.toBeInstanceOf(AIUnavailableError)
  })

  test('rejects unsupported evidence and invented metrics in AI output', () => {
    expect(parseAndValidateAnalysis(JSON.stringify(validResult()), source).scores.atsCompatibility.score).toBe(75)
    const unsupportedEvidence = validResult()
    unsupportedEvidence.scores.atsCompatibility.evidence = ['Managed a team of 12 people.']
    expect(() => parseAndValidateAnalysis(JSON.stringify(unsupportedEvidence), source)).toThrow(/unsupported evidence/i)

    const inventedMetric = validResult()
    inventedMetric.bulletRewrites[0].after = 'Built an API serving 1,000 users.'
    expect(() => parseAndValidateAnalysis(JSON.stringify(inventedMetric), source)).toThrow(/unsupported metric/i)
  })

  test('requires explicit consent and keeps provider keys behind the API', async () => {
    const user = await registerUser()
    const denied = await asUser(user.token).post('/api/resume-analysis/analyze').send({ targetRole: 'Backend Developer', projectId: 'private-project' })
    expect(denied.status).toBe(422)
    expect(denied.body.code).toBe('VALIDATION_ERROR')
    const providers = await request(app).get('/api/resume-analysis/providers')
    expect(providers.status).toBe(401)
  })
})
