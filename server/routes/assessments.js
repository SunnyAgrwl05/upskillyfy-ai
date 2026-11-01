import express from 'express'
import { protect, optionalAuth } from '../middleware/auth.js'
import { validate, validateParams } from '../middleware/validate.js'
import { asyncHandler } from '../middleware/error.js'
import { objectIdSchema } from '../validation/assessmentSchemas.js'
import Assessment from '../models/Assessment.js'
import Attempt from '../models/Attempt.js'
import Branch from '../models/Branch.js'
import { seedAssessments } from '../data/assessmentsSeed.js'

const router = express.Router()

/* --------------------------------------------------------- helpers */

const buildSafeAssessment = (assessment) => {
  const questions = assessment.questions.map((q) => {
    const { correctAnswer, explanation, ...safe } = q.toObject ? q.toObject() : q
    return safe
  })
  return {
    id: assessment.id,
    branchId: assessment.branchId,
    title: assessment.title,
    description: assessment.description,
    difficulty: assessment.difficulty,
    duration: assessment.duration,
    totalMarks: assessment.totalMarks,
    questionsCount: assessment.questionsCount,
    markingScheme: assessment.markingScheme,
    questions,
  }
}

const buildSafeAssessmentSummary = (assessment) => ({
  id: assessment.id,
  branchId: assessment.branchId,
  title: assessment.title,
  description: assessment.description,
  difficulty: assessment.difficulty,
  duration: assessment.duration,
  totalMarks: assessment.totalMarks,
  questionsCount: assessment.questionsCount,
  markingScheme: assessment.markingScheme,
})

const computeScore = (questions, answers) => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]))
  let score = 0
  let correct = 0
  let incorrect = 0
  let unanswered = 0

  for (const q of questions) {
    const selected = answerMap.get(q.questionId ?? q.id)
    if (selected === null || selected === undefined) {
      unanswered++
      continue
    }
    const correctAnswer = q.correctAnswer
    if (selected === correctAnswer) {
      score += q.marks
      correct++
    } else {
      score -= q.negativeMarks
      incorrect++
    }
  }

  return { score, correct, incorrect, unanswered }
}

/* --------------------------------------------------------- routes */

// GET /assessments/branches — list all branches with test counts
router.get(
  '/branches',
  asyncHandler(async (req, res) => {
    try {
      const branches = await Branch.find({ isLive: true }).sort({ order: 1 }).lean()
      const withCounts = await Promise.all(branches.map(async (b) => {
        const testCount = await Assessment.countDocuments({ branchId: b.id, isLive: true })
        return { ...b, testCount }
      }))
      res.json({ success: true, data: withCounts })
    } catch {
      // Fallback to seed data if DB not ready
      const { branchesWithCounts } = seedAssessments()
      res.json({ success: true, data: branchesWithCounts })
    }
  }),
)

// GET /assessments/branches/:branchId — single branch
router.get(
  '/branches/:branchId',
  validateParams(objectIdSchema),
  asyncHandler(async (req, res) => {
    try {
      const branch = await Branch.findOne({ id: req.params.branchId, isLive: true }).lean()
      if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' })
      const testCount = await Assessment.countDocuments({ branchId: branch.id, isLive: true })
      res.json({ success: true, data: { ...branch, testCount } })
    } catch {
      const { branches } = seedAssessments()
      const branch = branches.find((b) => b.id === req.params.branchId)
      if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' })
      const testCount = branches.length // fallback
      res.json({ success: true, data: { ...branch, testCount } })
    }
  }),
)

// GET /assessments/branches/:branchId/tests — list tests for branch (no correct answers)
router.get(
  '/branches/:branchId/tests',
  validateParams(objectIdSchema),
  asyncHandler(async (req, res) => {
    try {
      const assessments = await Assessment.find({ branchId: req.params.branchId, isLive: true })
        .sort({ createdAt: -1 })
        .lean()
      res.json({ success: true, data: assessments.map(buildSafeAssessmentSummary) })
    } catch {
      const { assessmentsByBranch } = seedAssessments()
      const branchTests = assessmentsByBranch(req.params.branchId)
      if (!branchTests) return res.status(404).json({ success: false, message: 'Branch not found' })
      res.json({ success: true, data: branchTests.map(buildSafeAssessmentSummary) })
    }
  }),
)

// GET /assessments/tests/:testId — test details with questions (no correct answers)
router.get(
  '/tests/:testId',
  validateParams(objectIdSchema),
  asyncHandler(async (req, res) => {
    try {
      const assessment = await Assessment.findOne({ id: req.params.testId, isLive: true }).lean()
      if (!assessment) return res.status(404).json({ success: false, message: 'Test not found' })
      res.json({ success: true, data: buildSafeAssessment(assessment) })
    } catch {
      const { assessments } = seedAssessments()
      const test = assessments.find((a) => a.id === req.params.testId)
      if (!test) return res.status(404).json({ success: false, message: 'Test not found' })
      res.json({ success: true, data: buildSafeAssessment(test) })
    }
  }),
)

// GET /assessments/tests/:testId/questions — questions only (no correct answers)
router.get(
  '/tests/:testId/questions',
  validateParams(objectIdSchema),
  asyncHandler(async (req, res) => {
    try {
      const assessment = await Assessment.findOne({ id: req.params.testId, isLive: true }).lean()
      if (!assessment) return res.status(404).json({ success: false, message: 'Test not found' })
      const safeQuestions = assessment.questions.map((q) => {
        const { correctAnswer, explanation, ...safe } = q
        return safe
      })
      res.json({ success: true, data: safeQuestions })
    } catch {
      const { assessments } = seedAssessments()
      const test = assessments.find((a) => a.id === req.params.testId)
      if (!test) return res.status(404).json({ success: false, message: 'Test not found' })
      const safeQuestions = test.questions.map((q) => {
        const { correctAnswer, explanation, ...safe } = q
        return safe
      })
      res.json({ success: true, data: safeQuestions })
    }
  }),
)

// POST /assessments/attempts/start — start a new attempt (stores in DB)
router.post(
  '/attempts/start',
  optionalAuth, // allow guest attempts too
  asyncHandler(async (req, res) => {
    const { testId } = req.body
    if (!testId) return res.status(400).json({ success: false, message: 'testId is required' })

    let assessment
    try {
      assessment = await Assessment.findOne({ id: testId, isLive: true }).lean()
    } catch {
      // ignore, use fallback
    }
    if (!assessment) {
      const { assessments } = seedAssessments()
      assessment = assessments.find((a) => a.id === testId)
    }
    if (!assessment) return res.status(404).json({ success: false, message: 'Test not found' })

    const now = new Date()
    const deadline = new Date(now.getTime() + assessment.duration * 60 * 1000)
    const userId = req.user?._id || null

    const attempt = await Attempt.create({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: assessment.id,
      branchId: assessment.branchId,
      user: userId,
      startedAt: now,
      deadline,
      submittedAt: null,
      isSubmitted: false,
      currentQuestionIndex: 0,
      answers: assessment.questions.map((q) => ({
        questionId: q.questionId ?? q.id,
        selectedOption: null,
        isMarkedForReview: false,
        visited: false,
        answered: false,
      })),
      visitedCount: 0,
      answeredCount: 0,
      markedCount: 0,
      result: null,
    })

    res.json({ success: true, data: attempt })
  }),
)

// POST /assessments/attempts/submit — submit and score (FIXED: uses attemptId → assessmentId)
router.post(
  '/attempts/submit',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { attemptId, answers = [], timeTakenSeconds = 0 } = req.body
    if (!attemptId) return res.status(400).json({ success: false, message: 'attemptId is required' })

    const attempt = await Attempt.findOne({ id: attemptId })
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
    if (attempt.isSubmitted) {
      return res.json({ success: true, data: { result: attempt.result, attemptId: attempt.id } })
    }

    let assessment
    try {
      assessment = await Assessment.findOne({ id: attempt.assessmentId }).lean()
    } catch {
      // ignore
    }
    if (!assessment) {
      const { assessments } = seedAssessments()
      assessment = assessments.find((a) => a.id === attempt.assessmentId)
    }
    if (!assessment) return res.status(404).json({ success: false, message: 'Test not found' })

    const { score, correct, incorrect, unanswered } = computeScore(assessment.questions, answers)

    const maxScore = assessment.totalMarks
    const accuracy = assessment.questionsCount > 0 ? Math.round((correct / assessment.questionsCount) * 100) : 0

    const result = {
      score,
      maxScore,
      correct,
      incorrect,
      unanswered,
      accuracy,
      timeTakenSeconds,
    }

    attempt.isSubmitted = true
    attempt.submittedAt = new Date()
    attempt.answers = attempt.answers.map((a) => {
      const incoming = answers.find((ans) => ans.questionId === a.questionId)
      return incoming ? { ...a, selectedOption: incoming.selectedOption, answered: incoming.selectedOption !== null && incoming.selectedOption !== undefined } : a
    })
    attempt.result = result
    attempt.answeredCount = correct + incorrect
    attempt.visitedCount = attempt.answers.filter((a) => a.visited).length
    await attempt.save()

    res.json({ success: true, data: { result, attemptId: attempt.id } })
  }),
)

// GET /assessments/tests/:testId/result — detailed review (with correct answers & explanations)
router.get(
  '/tests/:testId/result',
  validateParams(objectIdSchema),
  asyncHandler(async (req, res) => {
    try {
      const assessment = await Assessment.findOne({ id: req.params.testId, isLive: true }).lean()
      if (!assessment) return res.status(404).json({ success: false, message: 'Test not found' })

      const questionsWithAnswers = assessment.questions.map((q) => ({
        id: q.questionId ?? q.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        topic: q.topic,
        explanation: q.explanation,
      }))

      res.json({
        success: true,
        data: {
          testId: assessment.id,
          title: assessment.title,
          totalMarks: assessment.totalMarks,
          questionsCount: assessment.questionsCount,
          markingScheme: assessment.markingScheme,
          questions: questionsWithAnswers,
        },
      })
    } catch {
      const { assessments } = seedAssessments()
      const test = assessments.find((a) => a.id === req.params.testId)
      if (!test) return res.status(404).json({ success: false, message: 'Test not found' })
      res.json({
        success: true,
        data: {
          testId: test.id,
          title: test.title,
          totalMarks: test.totalMarks,
          questionsCount: test.questionsCount,
          markingScheme: test.markingScheme,
          questions: test.questions,
        },
      })
    }
  }),
)

export default router