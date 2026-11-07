import mongoose from 'mongoose'

const scoreSchema = new mongoose.Schema({
  score: { type: Number, required: true, min: 0, max: 100 },
  rationale: { type: String, required: true, maxlength: 1200 },
  evidence: { type: [String], default: [] },
}, { _id: false })

const resumeAnalysisSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceType: { type: String, enum: ['upload', 'project'], required: true },
  sourceProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeProject', default: null },
  targetRole: { type: String, required: true, maxlength: 120 },
  targetDomain: { type: String, default: '', maxlength: 100 },
  jobDescription: { type: String, default: '', maxlength: 10000 },
  provider: { type: String, enum: ['openrouter', 'ollama'], required: true },
  scores: {
    atsCompatibility: { type: scoreSchema, required: true },
    skillsMatching: { type: scoreSchema, required: true },
    keywordMatching: { type: scoreSchema, required: true },
    experienceRelevance: { type: scoreSchema, required: true },
    projectRelevance: { type: scoreSchema, required: true },
    educationRelevance: { type: scoreSchema, required: true },
    certificationRelevance: { type: scoreSchema, required: true },
    formattingReadability: { type: scoreSchema, required: true },
  },
  missingSkills: { type: [String], default: [] },
  missingKeywords: { type: [String], default: [] },
  domainSuitability: { score: { type: Number, min: 0, max: 100 }, explanation: { type: String, maxlength: 2000 } },
  bestMatchingRoles: [{ role: { type: String, maxlength: 120 }, score: { type: Number, min: 0, max: 100 }, reason: { type: String, maxlength: 1000 } }],
  jobDescriptionMatch: { score: { type: Number, min: 0, max: 100 }, matchedKeywords: [String], missingKeywords: [String] },
  improvements: [{ section: { type: String, maxlength: 80 }, issue: { type: String, maxlength: 1000 }, suggestion: { type: String, maxlength: 2000 }, evidence: { type: String, maxlength: 1000 } }],
  bulletRewrites: [{ before: { type: String, maxlength: 1200 }, after: { type: String, maxlength: 1600 }, rationale: { type: String, maxlength: 1000 } }],
  atsEstimateDisclaimer: { type: String, default: 'ATS scores are estimates and do not guarantee the result from any employer’s ATS.' },
}, { timestamps: true })

resumeAnalysisSchema.index({ owner: 1, createdAt: -1 })
resumeAnalysisSchema.index({ owner: 1, sourceProjectId: 1, createdAt: -1 })
resumeAnalysisSchema.index({ createdAt: -1 })

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema)
