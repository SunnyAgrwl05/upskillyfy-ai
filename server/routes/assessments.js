import express from 'express'
import { seedAssessments } from '../data/assessmentsSeed.js'

const router = express.Router()

// In-memory seed data (fallback if DB not ready)
const { branches, assessments, branchesWithCounts, assessmentsByBranch } = seedAssessments()

// GET /api/assessments/branches - List all branches with test counts
router.get('/branches', async (_req, res) => {
  try {
    res.json({ success: true, data: branchesWithCounts })
  } catch (err) {
    console.error('Assessments branches error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch branches' })
  }
})

// GET /api/assessments/branches/:branchId - Get single branch
router.get('/branches/:branchId', async (req, res) => {
  try {
    const branch = branches.find((b) => b.id === req.params.branchId)
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' })
    }
    res.json({ success: true, data: branch })
  } catch (err) {
    console.error('Assessment branch error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch branch' })
  }
})

// GET /api/assessments/branches/:branchId/tests - List tests for a branch
router.get('/branches/:branchId/tests', async (req, res) => {
  try {
    const branchTests = assessmentsByBranch(req.params.branchId)
    if (!branchTests) {
      return res.status(404).json({ success: false, message: 'Branch not found' })
    }
    // Return tests without correct answers
    const safeTests = branchTests.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,
      duration: t.duration,
      totalMarks: t.totalMarks,
      questionsCount: t.questionsCount,
      markingScheme: t.markingScheme,
    }))
    res.json({ success: true, data: safeTests })
  } catch (err) {
    console.error('Branch tests error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch tests' })
  }
})

// GET /api/assessments/tests/:testId - Get test details (no correct answers)
router.get('/tests/:testId', async (req, res) => {
  try {
    const test = assessments.find((a) => a.id === req.params.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }
    // Return test with questions but without correct answers
    const safeTest = {
      id: test.id,
      branchId: test.branchId,
      title: test.title,
      description: test.description,
      difficulty: test.difficulty,
      duration: test.duration,
      totalMarks: test.totalMarks,
      questionsCount: test.questionsCount,
      markingScheme: test.markingScheme,
      questions: test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        topic: q.topic,
      })),
    }
    res.json({ success: true, data: safeTest })
  } catch (err) {
    console.error('Test details error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch test' })
  }
})

// GET /api/assessments/tests/:testId/questions - Get questions for a test (without correct answers)
router.get('/tests/:testId/questions', async (req, res) => {
  try {
    const test = assessments.find((a) => a.id === req.params.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }
    const safeQuestions = test.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficulty: q.difficulty,
      topic: q.topic,
    }))
    res.json({ success: true, data: safeQuestions })
  } catch (err) {
    console.error('Test questions error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch questions' })
  }
})

// POST /api/assessments/attempts/start - Start a new attempt
router.post('/attempts/start', async (req, res) => {
  try {
    const { testId } = req.body
    const test = assessments.find((a) => a.id === testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    const now = new Date()
    const deadline = new Date(now.getTime() + test.duration * 60 * 1000)

    const attempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      assessmentId: test.id,
      branchId: test.branchId,
      user: req.user?.id || 'anonymous',
      startedAt: now,
      deadline,
      submittedAt: null,
      isSubmitted: false,
      currentQuestionIndex: 0,
      answers: test.questions.map((q) => ({
        questionId: q.id,
        selectedOption: null,
        isMarkedForReview: false,
        visited: false,
        answered: false,
      })),
      visitedCount: 0,
      answeredCount: 0,
      markedCount: 0,
      result: null,
    }

    // In production, store in DB
    res.json({ success: true, data: attempt })
  } catch (err) {
    console.error('Start attempt error:', err)
    res.status(500).json({ success: false, message: 'Failed to start attempt' })
  }
})

// POST /api/assessments/attempts/submit - Submit an attempt and get score
router.post('/attempts/submit', async (req, res) => {
  try {
    const { attemptId, answers } = req.body

    // Find the test to get correct answers
    // The attempt contains assessmentId, so we look it up
    const test = assessments.find((a) => a.id === req.body.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    // Compute score
    const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]))
    let score = 0
    let correct = 0
    let incorrect = 0
    let unanswered = 0

    test.questions.forEach((q) => {
      const selected = answerMap.get(q.id)
      if (selected === null || selected === undefined) {
        unanswered++
        return
      }
      if (selected === q.correctAnswer) {
        score += q.marks
        correct++
      } else {
        score -= q.negativeMarks
        incorrect++
      }
    })

    const maxScore = test.totalMarks
    const accuracy = test.questionsCount > 0 ? Math.round((correct / test.questionsCount) * 100) : 0

    const result = {
      score,
      maxScore,
      correct,
      incorrect,
      unanswered,
      accuracy,
      timeTakenSeconds: req.body.timeTakenSeconds || 0,
    }

    res.json({ success: true, data: { result, attemptId } })
  } catch (err) {
    console.error('Submit attempt error:', err)
    res.status(500).json({ success: false, message: 'Failed to submit attempt' })
  }
})

// GET /api/assessments/tests/:testId/result - Get detailed result for review (with explanations)
router.get('/tests/:testId/result', async (req, res) => {
  try {
    const test = assessments.find((a) => a.id === req.params.testId)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    // This endpoint requires the user's previous answers from a saved attempt
    // In production, fetch from DB. For now, return the questions with correct answers and explanations.
    const questionsWithAnswers = test.questions.map((q) => ({
      id: q.id,
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
        testId: test.id,
        title: test.title,
        totalMarks: test.totalMarks,
        questionsCount: test.questionsCount,
        markingScheme: test.markingScheme,
        questions: questionsWithAnswers,
      },
    })
  } catch (err) {
    console.error('Test result error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch result' })
  }
})

export default router