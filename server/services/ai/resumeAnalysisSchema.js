import { z } from 'zod'

const score = z.object({
  score: z.number().int().min(0).max(100),
  rationale: z.string().trim().min(10).max(1200),
  evidence: z.array(z.string().trim().min(1).max(500)).max(4),
}).strict()

export const resumeAnalysisResultSchema = z.object({
  scores: z.object({
    atsCompatibility: score,
    skillsMatching: score,
    keywordMatching: score,
    experienceRelevance: score,
    projectRelevance: score,
    educationRelevance: score,
    certificationRelevance: score,
    formattingReadability: score,
  }).strict(),
  missingSkills: z.array(z.string().trim().min(1).max(100)).max(30),
  missingKeywords: z.array(z.string().trim().min(1).max(100)).max(50),
  domainSuitability: z.object({ score: z.number().int().min(0).max(100), explanation: z.string().trim().min(10).max(2000) }).strict(),
  bestMatchingRoles: z.array(z.object({ role: z.string().trim().min(2).max(120), score: z.number().int().min(0).max(100), reason: z.string().trim().min(10).max(1000) }).strict()).max(8),
  jobDescriptionMatch: z.object({ score: z.number().int().min(0).max(100), matchedKeywords: z.array(z.string().trim().min(1).max(100)).max(50), missingKeywords: z.array(z.string().trim().min(1).max(100)).max(50) }).strict(),
  improvements: z.array(z.object({ section: z.string().trim().min(1).max(80), issue: z.string().trim().min(3).max(1000), suggestion: z.string().trim().min(3).max(2000), evidence: z.string().max(1000) }).strict()).max(30),
  bulletRewrites: z.array(z.object({ before: z.string().trim().min(5).max(1200), after: z.string().trim().min(5).max(1600), rationale: z.string().trim().min(5).max(1000) }).strict()).max(20),
}).strict()

const normalizeEvidence = text => String(text).toLowerCase().replace(/\s+/g, ' ').trim()

export function parseAndValidateAnalysis(content, resumeText) {
  const json = String(content).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  let raw
  try { raw = JSON.parse(json) } catch { throw Object.assign(new Error('The AI provider returned an invalid structured response.'), { status: 502, code: 'INVALID_AI_RESPONSE' }) }
  const parsed = resumeAnalysisResultSchema.safeParse(raw)
  if (!parsed.success) throw Object.assign(new Error('The AI provider response did not match the required analysis format.'), { status: 502, code: 'INVALID_AI_RESPONSE' })
  const source = normalizeEvidence(resumeText)
  for (const [category, value] of Object.entries(parsed.data.scores)) {
    for (const evidence of value.evidence) {
      if (!source.includes(normalizeEvidence(evidence))) throw Object.assign(new Error(`The AI response included unsupported evidence for ${category}. Retry the analysis.`), { status: 502, code: 'UNSUPPORTED_AI_EVIDENCE' })
    }
  }
  for (const improvement of parsed.data.improvements) {
    if (improvement.evidence && !source.includes(normalizeEvidence(improvement.evidence))) throw Object.assign(new Error('The AI response included unsupported resume evidence. Retry the analysis.'), { status: 502, code: 'UNSUPPORTED_AI_EVIDENCE' })
  }
  for (const rewrite of parsed.data.bulletRewrites) {
    if (!source.includes(normalizeEvidence(rewrite.before))) throw Object.assign(new Error('A suggested rewrite does not match an original resume bullet.'), { status: 502, code: 'UNSUPPORTED_AI_EVIDENCE' })
    const originalNumbers = rewrite.before.match(/\b\d+(?:[.,]\d+)*%?\b/g) || []
    const suggestedNumbers = rewrite.after.match(/\b\d+(?:[.,]\d+)*%?\b/g) || []
    if (suggestedNumbers.some(number => !originalNumbers.includes(number))) throw Object.assign(new Error('A suggested rewrite added an unsupported metric.'), { status: 502, code: 'UNSUPPORTED_AI_CLAIM' })
  }
  return parsed.data
}
