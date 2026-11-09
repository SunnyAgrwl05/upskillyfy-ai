import express from 'express'
import { createHash } from 'node:crypto'
import multer from 'multer'
import mongoose from 'mongoose'
import { z } from 'zod'
import { optionalAuth, protect } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import ResumeAnalysis from '../models/ResumeAnalysis.js'
import ResumeAnalysisRateLimit from '../models/ResumeAnalysisRateLimit.js'
import { extractPdfText } from '../services/pdfTextService.js'
import { analyzeResumeText, extractedResumeSchema, RESUME_ANALYSIS_SECTIONS } from '../services/resumeAnalysisService.js'

const router = express.Router()
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_ACTIVE_ANALYSES = 2
let activeAnalyses = 0
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 1, parts: 2 },
  fileFilter: (req, file, callback) => file.mimetype === 'application/pdf'
    ? callback(null, true)
    : callback(Object.assign(new Error('Upload a PDF file.'), { status: 415, code: 'UNSUPPORTED_FILE_TYPE' })),
})

const jobDescriptionSchema = z.string().trim().max(12_000).optional().default('')
const reviewSchema = z.object({
  extractedData: extractedResumeSchema,
  confirmedSections: z.array(z.enum(RESUME_ANALYSIS_SECTIONS)).max(RESUME_ANALYSIS_SECTIONS.length),
  markedIncorrectSections: z.array(z.enum(RESUME_ANALYSIS_SECTIONS)).max(RESUME_ANALYSIS_SECTIONS.length).default([]),
  reviewComplete: z.boolean().default(false),
}).strict()

function analysisAdmission(req, res, next) {
  if (activeAnalyses >= MAX_ACTIVE_ANALYSES) {
    res.set('Retry-After', '5')
    return res.status(503).json({ message: 'Resume analysis is busy. Please retry shortly.', code: 'ANALYSIS_BUSY' })
  }
  activeAnalyses += 1
  let released = false
  const release = () => {
    if (released) return
    released = true
    activeAnalyses = Math.max(0, activeAnalyses - 1)
  }
  res.once('finish', release)
  res.once('close', release)
  next()
}

async function analysisRateLimit(req, res, next) {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Resume analysis is temporarily unavailable.', code: 'DATABASE_UNAVAILABLE' })
  const windowStart = Math.floor(Date.now() / (60 * 60 * 1000))
  const identity = req.user?._id ? String(req.user._id) : `guest:${createHash('sha256').update(req.ip || 'unknown').digest('hex')}`
  const key = `${identity}:${windowStart}`
  try {
    const counter = await ResumeAnalysisRateLimit.findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((windowStart + 2) * 60 * 60 * 1000) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    res.set('RateLimit-Limit', '3')
    res.set('RateLimit-Remaining', String(Math.max(0, 3 - counter.count)))
    if (counter.count > 3) return res.status(429).json({ message: 'Resume analysis limit reached. Try again later.', code: 'RATE_LIMITED' })
    next()
  } catch (error) {
    if (error?.code === 11000) return analysisRateLimit(req, res, next)
    next(error)
  }
}

function receiveResumeUpload(req, res, next) {
  upload.single('resume')(req, res, (error) => {
    if (!error) return next()
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'PDF files must be 10 MB or smaller.', code: 'UPLOAD_TOO_LARGE' })
    if (error instanceof multer.MulterError) return res.status(422).json({ message: 'Upload one PDF file only.', code: 'INVALID_UPLOAD' })
    return next(error)
  })
}

const publicAnalysis = (item) => ({
  id: String(item._id),
  extractedData: item.extractedData,
  feedback: item.feedback,
  scoring: item.scoring,
  confirmedSections: item.confirmedSections,
  markedIncorrectSections: item.markedIncorrectSections,
  reviewComplete: item.reviewComplete,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

router.post('/', analysisAdmission, optionalAuth, analysisRateLimit, receiveResumeUpload, asyncHandler(async (req, res) => {
  if (!req.file) return res.status(422).json({ message: 'Choose a PDF resume to analyze.', code: 'RESUME_REQUIRED' })
  if (req.file.mimetype !== 'application/pdf' || req.file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    return res.status(422).json({ message: 'The file content is not a PDF.', code: 'INVALID_PDF' })
  }
  const jobDescription = jobDescriptionSchema.safeParse(req.body.jobDescription || '')
  if (!jobDescription.success) return res.status(422).json({ message: 'Target job description must be 12,000 characters or fewer.', code: 'INVALID_JOB_DESCRIPTION' })
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Resume analysis is temporarily unavailable. Please try again later.', code: 'DATABASE_UNAVAILABLE' })

  const extracted = await extractPdfText(req.file.buffer)
  const result = await analyzeResumeText(extracted.text, { jobDescription: jobDescription.data })
  const feedback = {
    strengths: result.strengths,
    missingInformation: result.missingInformation,
    improvementSuggestions: result.improvementSuggestions,
    potentialInconsistencies: result.potentialInconsistencies,
    grammarAndClarity: result.grammarAndClarity,
    formattingIssues: result.formattingIssues,
    dateConsistency: result.dateConsistency,
    suspiciousLinks: result.suspiciousLinks,
    confidenceLevels: result.confidenceLevels,
    pageCount: extracted.pageCount,
    keywordCoverage: result.scoring.keywordCoverage,
    verificationNotice: 'AI analysis reviews text only. It does not verify the authenticity of education, employment, certifications, or achievements.',
  }
  const saveToHistory = Boolean(req.user && req.body.saveToHistory === 'true')
  const saved = saveToHistory ? await ResumeAnalysis.create({
    owner: req.user._id,
    extractedData: result.extractedData,
    feedback,
    scoring: result.scoring,
  }) : null
  const analysis = saved ? publicAnalysis(saved) : {
    id: null, extractedData: result.extractedData, feedback, scoring: result.scoring,
    confirmedSections: [], markedIncorrectSections: [], reviewComplete: false,
  }
  res.status(201).json({
    analysis,
    retention: saved
      ? 'Structured analysis is saved to your account until you delete it. The uploaded PDF and extracted raw text are discarded after this request.'
      : req.user
        ? 'This analysis was not saved. Choose Save to history if you want to keep it in your account. The uploaded PDF and extracted raw text are discarded after this request.'
        : 'This guest analysis remains in this browser session only. Sign in and explicitly choose Save to history to keep it. The uploaded PDF and extracted raw text are discarded after this request.',
  })
}))

router.use(protect)

router.get('/', asyncHandler(async (req, res) => {
  const pageValue = String(req.query.page || '1')
  const limitValue = String(req.query.limit || '10')
  if (!/^[1-9]\d{0,4}$/.test(pageValue) || !/^[1-9]\d{0,2}$/.test(limitValue) || Number(limitValue) > 30) {
    return res.status(422).json({ message: 'Page must be positive and limit must be between 1 and 30.', code: 'INVALID_PAGINATION' })
  }
  const page = Number(pageValue)
  const limit = Number(limitValue)
  const filter = { owner: req.user._id }
  const [items, total] = await Promise.all([
    ResumeAnalysis.find(filter).select('-feedback -extractedData').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ResumeAnalysis.countDocuments(filter),
  ])
  res.json({ analyses: items.map(publicAnalysis), pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } })
}))

router.get('/:analysisId', asyncHandler(async (req, res) => {
  const item = await ResumeAnalysis.findOne({ _id: req.params.analysisId, owner: req.user._id })
  if (!item) return res.status(404).json({ message: 'Analysis not found.', code: 'ANALYSIS_NOT_FOUND' })
  res.json({ analysis: publicAnalysis(item) })
}))

router.patch('/:analysisId/review', asyncHandler(async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ message: 'The reviewed resume data is invalid.', code: 'INVALID_REVIEW' })
  const uniqueConfirmed = [...new Set(parsed.data.confirmedSections)]
  const complete = RESUME_ANALYSIS_SECTIONS.every((section) => uniqueConfirmed.includes(section))
  if (parsed.data.reviewComplete && !complete) {
    return res.status(422).json({ message: 'Review every extracted section before confirming this analysis.', code: 'REVIEW_INCOMPLETE' })
  }
  const item = await ResumeAnalysis.findOneAndUpdate({ _id: req.params.analysisId, owner: req.user._id }, {
    $set: {
      extractedData: parsed.data.extractedData,
      confirmedSections: uniqueConfirmed,
      markedIncorrectSections: [...new Set(parsed.data.markedIncorrectSections)],
      reviewComplete: parsed.data.reviewComplete && complete,
    },
  }, { new: true, runValidators: true })
  if (!item) return res.status(404).json({ message: 'Analysis not found.', code: 'ANALYSIS_NOT_FOUND' })
  res.json({ analysis: publicAnalysis(item) })
}))

router.delete('/:analysisId', asyncHandler(async (req, res) => {
  const item = await ResumeAnalysis.findOneAndDelete({ _id: req.params.analysisId, owner: req.user._id })
  if (!item) return res.status(404).json({ message: 'Analysis not found.', code: 'ANALYSIS_NOT_FOUND' })
  res.status(204).end()
}))

export default router
