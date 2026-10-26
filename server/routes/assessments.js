import express from 'express'
import mongoose from 'mongoose'
import Assessment from '../models/Assessment.js'
import AssessmentAttempt from '../models/AssessmentAttempt.js'
import { adminOnly, optionalAuth, protect } from '../middleware/auth.js'
import { answerIsCorrect, calculateAssessmentResult, isValidAssessmentAnswer } from '../services/assessmentScoring.js'

const router = express.Router()

const publicQuestion = (question, answer, reveal) => {
  const item = {
    id: String(question.questionId || question._id),
    prompt: question.prompt,
    type: question.type,
    options: question.options,
    points: question.points,
    answer: answer?.answer ?? null,
    markedForReview: answer?.markedForReview ?? false,
  }
  if (reveal) {
    item.correctAnswer = question.correctAnswer
    item.explanation = question.explanation
    item.isCorrect = answerIsCorrect(question, answer?.answer)
  }
  return item
}

const resultFor = (assessment, attempt, status) => {
  const questions = attempt.questionSnapshot?.length ? attempt.questionSnapshot : assessment.questions
  const hasSnapshot = !!attempt.assessmentSnapshot?.slug
  const passPercent = hasSnapshot ? attempt.assessmentSnapshot.passPercent : assessment.passPercent
  return calculateAssessmentResult(questions, attempt.answers, passPercent, status)
}

const finalizeAttempt = async (assessment, attempt, status) => {
  for (let retry = 0; retry < 5; retry += 1) {
    const finalStatus = attempt.expiresAt <= new Date() ? 'timed_out' : status
    const result = resultFor(assessment, attempt, finalStatus)
    const finalized = await AssessmentAttempt.findOneAndUpdate(
      {
        _id: attempt._id,
        userId: attempt.userId,
        status: 'in_progress',
        answerVersion: attempt.answerVersion || 0,
      },
      { $set: result },
      { new: true, runValidators: true },
    ).select('+questionSnapshot.correctAnswer')
    if (finalized) return finalized
    const latest = await AssessmentAttempt.findOne({ _id: attempt._id, userId: attempt.userId, status: 'in_progress' })
      .select('+questionSnapshot.correctAnswer')
    if (!latest) {
      return AssessmentAttempt.findOne({ _id: attempt._id, userId: attempt.userId })
        .select('+questionSnapshot.correctAnswer')
    }
    attempt = latest
  }
  throw new Error('Assessment answers changed repeatedly while submitting')
}

const presentAttempt = (assessment, attempt) => {
  const finished = attempt.status !== 'in_progress'
  const questions = attempt.questionSnapshot?.length ? attempt.questionSnapshot : assessment.questions
  const hasSnapshot = !!attempt.assessmentSnapshot?.slug
  const reviewAnswers = hasSnapshot ? attempt.assessmentSnapshot.reviewAnswers : assessment.reviewAnswers
  const answers = new Map(attempt.answers.map((answer) => [String(answer.questionId), answer]))
  const reveal = finished && reviewAnswers
  return {
    id: String(attempt._id),
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    questions: finished && !reveal ? [] : questions.map((question) => (
      publicQuestion(question, answers.get(String(question.questionId || question._id)), reveal)
    )),
    result: finished ? {
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      unansweredCount: attempt.unansweredCount,
      passed: attempt.passed,
      passPercent: hasSnapshot ? attempt.assessmentSnapshot.passPercent : assessment.passPercent,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      durationSeconds: Math.max(0, Math.round((attempt.submittedAt - attempt.startedAt) / 1000)),
      reviewAllowed: hasSnapshot ? reviewAnswers : assessment.reviewAnswers,
    } : null,
    assessment: {
      id: String(assessment._id),
      slug: hasSnapshot ? attempt.assessmentSnapshot.slug : assessment.slug,
      title: hasSnapshot ? attempt.assessmentSnapshot.title : assessment.title,
      durationMinutes: hasSnapshot ? attempt.assessmentSnapshot.durationMinutes : assessment.durationMinutes,
      questionCount: questions.length,
      passPercent: hasSnapshot ? attempt.assessmentSnapshot.passPercent : assessment.passPercent,
    },
  }
}

const validAssessmentInput = (body) => {
  if (!body || typeof body !== 'object') return false
  if (typeof body.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) return false
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 160) return false
  if (typeof body.description !== 'string' || !body.description.trim() || body.description.length > 2000) return false
  if (typeof body.category !== 'string' || !body.category.trim() || body.category.length > 80) return false
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(body.difficulty)) return false
  if (!Number.isInteger(body.durationMinutes) || body.durationMinutes < 1 || body.durationMinutes > 240) return false
  if (body.passPercent != null && (!Number.isInteger(body.passPercent) || body.passPercent < 0 || body.passPercent > 100)) return false
  if (body.attemptLimit != null && (!Number.isInteger(body.attemptLimit) || body.attemptLimit < 1 || body.attemptLimit > 100)) return false
  if (body.reviewAnswers != null && typeof body.reviewAnswers !== 'boolean') return false
  if (!Array.isArray(body.skills) || body.skills.some((skill) => typeof skill !== 'string' || !skill.trim() || skill.length > 80)) return false
  if (!Array.isArray(body.questions) || body.questions.length < 1 || body.questions.length > 100) return false
  return body.questions.every((question) => {
    if (!question || typeof question.prompt !== 'string' || !question.prompt.trim() || question.prompt.length > 2000) return false
    if (!['single_choice', 'multiple_choice'].includes(question.type)) return false
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 10) return false
    if (question.options.some((option) => typeof option !== 'string' || !option.trim() || option.length > 500)) return false
    if (!Number.isInteger(question.points) || question.points < 1 || question.points > 100) return false
    const key = question.correctAnswer
    if (question.type === 'single_choice') return Number.isInteger(key) && key >= 0 && key < question.options.length
    return Array.isArray(key)
      && key.length > 0
      && new Set(key).size === key.length
      && key.every((index) => Number.isInteger(index) && index >= 0 && index < question.options.length)
  })
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ published: true })
      .select('slug title description category skills difficulty durationMinutes passPercent attemptLimit questions.type createdAt')
      .sort({ createdAt: -1 })
      .lean()
    let attemptsByAssessment = new Map()
    if (req.user) {
      const attempts = await AssessmentAttempt.find({ userId: req.user._id })
        .select('assessmentId status percentage submittedAt expiresAt')
        .sort({ updatedAt: -1 })
        .lean()
      attemptsByAssessment = new Map()
      attempts.forEach((attempt) => {
        const id = String(attempt.assessmentId)
        if (!attemptsByAssessment.has(id)) attemptsByAssessment.set(id, [])
        attemptsByAssessment.get(id).push(attempt)
      })
    }
    res.json(assessments.map((assessment) => {
      const attempts = attemptsByAssessment.get(String(assessment._id)) || []
      const hasActiveAttempt = attempts.some((attempt) => attempt.status === 'in_progress' && attempt.expiresAt > new Date())
      return {
        id: String(assessment._id),
        slug: assessment.slug,
        title: assessment.title,
        description: assessment.description,
        category: assessment.category,
        skills: assessment.skills,
        difficulty: assessment.difficulty,
        durationMinutes: assessment.durationMinutes,
        passPercent: assessment.passPercent,
        attemptLimit: assessment.attemptLimit,
        questionCount: assessment.questions.length,
        questionTypes: [...new Set(assessment.questions.map((question) => question.type))],
        status: hasActiveAttempt
          ? 'in_progress'
          : attempts.length > 0
            ? 'completed'
            : 'available',
        bestScore: Math.max(0, ...attempts.map((attempt) => attempt.percentage ?? 0)),
        latestAttemptId: attempts[0] ? String(attempts[0]._id) : null,
      }
    }))
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assessments' })
  }
})

router.get('/me/history', protect, async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.find({ userId: req.user._id })
      .populate('assessmentId', 'slug title category difficulty')
      .sort({ updatedAt: -1 })
      .lean()
    const finished = attempts.filter((attempt) => attempt.status !== 'in_progress')
    res.json({
      stats: {
        attempted: attempts.length,
        completed: finished.length,
        bestScore: Math.max(0, ...finished.map((attempt) => attempt.percentage ?? 0)),
      },
      attempts: attempts.map((attempt) => ({
        id: String(attempt._id),
        assessment: attempt.assessmentId ? {
          id: String(attempt.assessmentId._id),
          slug: attempt.assessmentSnapshot?.slug || attempt.assessmentId.slug,
          title: attempt.assessmentSnapshot?.title || attempt.assessmentId.title,
          category: attempt.assessmentId.category,
          difficulty: attempt.assessmentId.difficulty,
        } : null,
        status: attempt.status,
        percentage: attempt.percentage,
        submittedAt: attempt.submittedAt,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assessment history' })
  }
})

router.get('/admin', protect, adminOnly, async (_req, res) => {
  try {
    const assessments = await Assessment.find().select('+questions.correctAnswer').sort({ updatedAt: -1 }).lean()
    res.json(assessments)
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assessment administration data' })
  }
})

router.get('/admin/results', protect, adminOnly, async (_req, res) => {
  try {
    const [summary, attempts] = await Promise.all([
      AssessmentAttempt.aggregate([{
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          finishedAttempts: { $sum: { $cond: [{ $in: ['$status', ['completed', 'timed_out']] }, 1, 0] } },
          averagePercentage: { $avg: { $cond: [{ $in: ['$status', ['completed', 'timed_out']] }, '$percentage', null] } },
          bestPercentage: { $max: '$percentage' },
        },
      }]),
      AssessmentAttempt.find()
        .populate('userId', 'name email')
        .populate('assessmentId', 'slug title category difficulty')
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean(),
    ])
    res.json({
      summary: summary[0] || { totalAttempts: 0, finishedAttempts: 0, averagePercentage: null, bestPercentage: null },
      attempts: attempts.map((attempt) => ({
        id: String(attempt._id),
        user: attempt.userId ? { name: attempt.userId.name, email: attempt.userId.email } : null,
        assessment: attempt.assessmentId ? {
          slug: attempt.assessmentSnapshot?.slug || attempt.assessmentId.slug,
          title: attempt.assessmentSnapshot?.title || attempt.assessmentId.title,
        } : null,
        status: attempt.status,
        percentage: attempt.percentage,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      })),
    })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assessment results' })
  }
})

router.get('/admin/attempts/:attemptId', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.attemptId)) return res.status(400).json({ message: 'Invalid attempt identifier' })
    const attempt = await AssessmentAttempt.findById(req.params.attemptId)
      .populate('userId', 'name email')
      .select('+questionSnapshot.correctAnswer')
    if (!attempt) return res.status(404).json({ message: 'Assessment attempt not found' })
    const assessment = await Assessment.findById(attempt.assessmentId).select('+questions.correctAnswer')
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    res.json({
      ...presentAttempt(assessment, attempt),
      user: attempt.userId ? { name: attempt.userId.name, email: attempt.userId.email } : null,
    })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load this assessment attempt' })
  }
})

router.post('/admin', protect, adminOnly, async (req, res) => {
  try {
    if (!validAssessmentInput(req.body) || typeof req.body.published !== 'boolean') {
      return res.status(400).json({ message: 'Assessment content and publish state are invalid' })
    }
    const assessment = await Assessment.create({
      slug: req.body.slug,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      skills: req.body.skills,
      difficulty: req.body.difficulty,
      durationMinutes: req.body.durationMinutes,
      passPercent: req.body.passPercent ?? null,
      attemptLimit: req.body.attemptLimit ?? null,
      reviewAnswers: req.body.reviewAnswers === true,
      published: req.body.published,
      questions: req.body.questions.map((question) => ({
        prompt: question.prompt,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        points: question.points,
      })),
    })
    res.status(201).json({ id: String(assessment._id), slug: assessment.slug })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? 'An assessment with this slug already exists' : 'Unable to create assessment' })
  }
})

router.put('/admin/:assessmentId', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.assessmentId)) return res.status(400).json({ message: 'Invalid assessment identifier' })
    if (!validAssessmentInput(req.body) || typeof req.body.published !== 'boolean') {
      return res.status(400).json({ message: 'Assessment content and publish state are invalid' })
    }
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.assessmentId,
      {
        slug: req.body.slug,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        skills: req.body.skills,
        difficulty: req.body.difficulty,
        durationMinutes: req.body.durationMinutes,
        passPercent: req.body.passPercent ?? null,
        attemptLimit: req.body.attemptLimit ?? null,
        reviewAnswers: req.body.reviewAnswers === true,
        published: req.body.published,
        questions: req.body.questions.map((question) => ({
          prompt: question.prompt,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          points: question.points,
        })),
      },
      { new: true, runValidators: true },
    )
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    res.json({ id: String(assessment._id), slug: assessment.slug, published: assessment.published })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? 'An assessment with this slug already exists' : 'Unable to update assessment' })
  }
})

router.get('/attempts/:attemptId', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.attemptId)) return res.status(400).json({ message: 'Invalid attempt identifier' })
    let attempt = await AssessmentAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id })
      .select('+questionSnapshot.correctAnswer')
    if (!attempt) return res.status(404).json({ message: 'Assessment attempt not found' })
    const assessment = await Assessment.findById(attempt.assessmentId).select('+questions.correctAnswer')
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    if (attempt.status === 'in_progress' && attempt.expiresAt <= new Date()) {
      attempt = await finalizeAttempt(assessment, attempt, 'timed_out') || await AssessmentAttempt.findById(attempt._id)
        .select('+questionSnapshot.correctAnswer')
    }
    res.json(presentAttempt(assessment, attempt))
  } catch (error) {
    res.status(500).json({ message: 'Unable to load this assessment attempt' })
  }
})

router.post('/:assessmentId/attempts', protect, async (req, res) => {
  try {
    const selector = mongoose.isValidObjectId(req.params.assessmentId)
      ? { _id: req.params.assessmentId }
      : { slug: req.params.assessmentId }
    const assessment = await Assessment.findOne({ ...selector, published: true }).select('+questions.correctAnswer')
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    let active = await AssessmentAttempt.findOne({ userId: req.user._id, assessmentId: assessment._id, status: 'in_progress' })
      .select('+questionSnapshot.correctAnswer')
    if (active && active.expiresAt <= new Date()) {
      await finalizeAttempt(assessment, active, 'timed_out')
      active = null
    }
    if (active) return res.json(presentAttempt(assessment, active))
    if (assessment.attemptLimit != null) {
      const count = await AssessmentAttempt.countDocuments({ userId: req.user._id, assessmentId: assessment._id })
      if (count >= assessment.attemptLimit) return res.status(409).json({ message: 'You have reached the attempt limit for this assessment' })
    }
    const startedAt = new Date()
    let attempt
    try {
      attempt = await AssessmentAttempt.create({
        userId: req.user._id,
        assessmentId: assessment._id,
        questionSnapshot: assessment.questions.map((question) => ({
          questionId: question._id,
          prompt: question.prompt,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          points: question.points,
        })),
        assessmentSnapshot: {
          slug: assessment.slug,
          title: assessment.title,
          durationMinutes: assessment.durationMinutes,
          passPercent: assessment.passPercent,
          reviewAnswers: assessment.reviewAnswers,
        },
        startedAt,
        expiresAt: new Date(startedAt.getTime() + assessment.durationMinutes * 60_000),
      })
    } catch (error) {
      if (error.code !== 11000) throw error
      attempt = await AssessmentAttempt.findOne({ userId: req.user._id, assessmentId: assessment._id, status: 'in_progress' })
        .select('+questionSnapshot.correctAnswer')
      if (!attempt) throw error
    }
    res.status(201).json(presentAttempt(assessment, attempt))
  } catch (error) {
    res.status(500).json({ message: 'Unable to start this assessment' })
  }
})

router.put('/attempts/:attemptId/answers/:questionId', protect, async (req, res) => {
  try {
    const { attemptId, questionId } = req.params
    if (!mongoose.isValidObjectId(attemptId) || !mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({ message: 'Invalid attempt or question identifier' })
    }
    let attempt = await AssessmentAttempt.findOne({ _id: attemptId, userId: req.user._id, status: 'in_progress' })
      .select('+questionSnapshot.correctAnswer')
    if (!attempt) return res.status(404).json({ message: 'Active assessment attempt not found' })
    const assessment = await Assessment.findById(attempt.assessmentId).select('+questions.correctAnswer')
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    if (attempt.expiresAt <= new Date()) {
      attempt = await finalizeAttempt(assessment, attempt, 'timed_out') || await AssessmentAttempt.findById(attempt._id)
        .select('+questionSnapshot.correctAnswer')
      return res.status(409).json({ message: 'Time expired; the assessment was submitted', attempt: presentAttempt(assessment, attempt) })
    }
    const question = attempt.questionSnapshot?.length
      ? attempt.questionSnapshot.find((item) => String(item.questionId) === questionId)
      : assessment.questions.id(questionId)
    if (!question) return res.status(404).json({ message: 'Question not found' })
    const { answer, markedForReview } = req.body
    if (Object.hasOwn(req.body, 'answer') && !isValidAssessmentAnswer(question, answer)) {
      return res.status(400).json({ message: 'Answer is not valid for this question' })
    }
    if (Object.hasOwn(req.body, 'markedForReview') && typeof markedForReview !== 'boolean') {
      return res.status(400).json({ message: 'Review state must be a boolean' })
    }
    const update = {}
    if (Object.hasOwn(req.body, 'answer')) update['answers.$.answer'] = answer
    if (Object.hasOwn(req.body, 'markedForReview')) update['answers.$.markedForReview'] = markedForReview
    if (Object.keys(update).length === 0) return res.status(400).json({ message: 'No answer changes provided' })
    const existing = attempt.answers.find((item) => String(item.questionId) === questionId)
    const questionKey = question.questionId || question._id
    if (existing) {
      attempt = await AssessmentAttempt.findOneAndUpdate(
        { _id: attemptId, userId: req.user._id, status: 'in_progress', expiresAt: { $gt: new Date() }, 'answers.questionId': questionKey },
        { $set: update, $inc: { answerVersion: 1 } },
        { new: true },
      )
    } else {
      const newAnswer = {
        questionId: questionKey,
        ...(Object.hasOwn(req.body, 'answer') ? { answer } : {}),
        ...(Object.hasOwn(req.body, 'markedForReview') ? { markedForReview } : {}),
      }
      attempt = await AssessmentAttempt.findOneAndUpdate(
        { _id: attemptId, userId: req.user._id, status: 'in_progress', expiresAt: { $gt: new Date() }, 'answers.questionId': { $ne: questionKey } },
        { $push: { answers: newAnswer }, $inc: { answerVersion: 1 } },
        { new: true },
      )
    }
    if (!attempt) return res.status(409).json({ message: 'Assessment is no longer active; reload to view its result' })
    res.json({ saved: true, questionId, answer: attempt.answers.find((item) => String(item.questionId) === questionId)?.answer ?? null })
  } catch (error) {
    res.status(500).json({ message: 'Unable to save this answer' })
  }
})

router.post('/attempts/:attemptId/submit', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.attemptId)) return res.status(400).json({ message: 'Invalid attempt identifier' })
    let attempt = await AssessmentAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id })
      .select('+questionSnapshot.correctAnswer')
    if (!attempt) return res.status(404).json({ message: 'Assessment attempt not found' })
    const assessment = await Assessment.findById(attempt.assessmentId).select('+questions.correctAnswer')
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    if (attempt.status !== 'in_progress') return res.json(presentAttempt(assessment, attempt))
    const status = attempt.expiresAt <= new Date() ? 'timed_out' : 'completed'
    attempt = await finalizeAttempt(assessment, attempt, status) || await AssessmentAttempt.findById(attempt._id)
      .select('+questionSnapshot.correctAnswer')
    res.json(presentAttempt(assessment, attempt))
  } catch (error) {
    res.status(500).json({ message: 'Unable to submit this assessment' })
  }
})

router.get('/:assessmentId', async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ slug: req.params.assessmentId, published: true })
      .select('slug title description category skills difficulty durationMinutes passPercent attemptLimit questions.type reviewAnswers')
      .lean()
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' })
    res.json({
      id: String(assessment._id),
      slug: assessment.slug,
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      skills: assessment.skills,
      difficulty: assessment.difficulty,
      durationMinutes: assessment.durationMinutes,
      passPercent: assessment.passPercent,
      attemptLimit: assessment.attemptLimit,
      questionCount: assessment.questions.length,
      questionTypes: [...new Set(assessment.questions.map((question) => question.type))],
      reviewAnswers: assessment.reviewAnswers,
    })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load assessment details' })
  }
})

export default router
