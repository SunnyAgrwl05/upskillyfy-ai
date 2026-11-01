import request from 'supertest'
import { app } from './helpers.js'
import Assessment from '../models/Assessment.js'
import Attempt from '../models/Attempt.js'

const TEST_ID = 'cse-data-structures'

describe('GET /api/assessments/branches', () => {
  it('returns a list of branches', async () => {
    const res = await request(app).get('/api/assessments/branches')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('id')
  })
})

describe('GET /api/assessments/branches/:branchId/tests', () => {
  it('lists the tests for a branch', async () => {
    const res = await request(app).get('/api/assessments/branches/cse/tests')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('title')
  })
})

describe('GET /api/assessments/tests/:testId', () => {
  it('returns the test with questions', async () => {
    const res = await request(app).get(`/api/assessments/tests/${TEST_ID}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.questions.length).toBeGreaterThan(0)
  })

  it('never exposes correct answers to the exam screen', async () => {
    const res = await request(app).get(`/api/assessments/tests/${TEST_ID}`)

    for (const question of res.body.data.questions) {
      expect(question).not.toHaveProperty('correctAnswer')
      expect(question).not.toHaveProperty('explanation')
    }
  })
})

describe('GET /api/assessments/tests/:testId/result', () => {
  it('exposes correct answers for post-exam review', async () => {
    const res = await request(app).get(`/api/assessments/tests/${TEST_ID}/result`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.questions[0]).toHaveProperty('correctAnswer')
  })
})

describe('POST /api/assessments/attempts/start', () => {
  it('creates an attempt and returns its id', async () => {
    const res = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeTruthy()
    expect(res.body.data.assessmentId).toBe(TEST_ID)
    expect(res.body.data.isSubmitted).toBe(false)
  })

  it('persists the attempt in the database', async () => {
    const res = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })
    const saved = await Attempt.findOne({ id: res.body.data.id })

    expect(saved).toBeTruthy()
    expect(saved.assessmentId).toBe(TEST_ID)
  })

  it('returns 404 for an unknown test', async () => {
    const res = await request(app).post('/api/assessments/attempts/start').send({ testId: 'nope' })
    expect(res.status).toBe(404)
  })
})

describe('POST /api/assessments/attempts/submit', () => {
  it('scores the attempt using the attemptId (regression: the old code read req.body.testId)', async () => {
    const start = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })
    const attemptId = start.body.data.id

    const test = await request(app).get(`/api/assessments/tests/${TEST_ID}`)
    const questions = test.body.data.questions

    // Answer every question with option 0 and submit by attemptId only.
    const answers = questions.map((q) => ({ questionId: q.id, selectedOption: 0 }))

    const res = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ attemptId, answers, timeTakenSeconds: 120 })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.result).toBeDefined()
    expect(res.body.data.result.correct).toBeGreaterThanOrEqual(0)
    expect(res.body.data.result.maxScore).toBe(test.body.data.totalMarks)
  })

  it('computes the correct score for a known answer pattern', async () => {
    const start = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })
    const attemptId = start.body.data.id

    // The seed's first question (dsa-1) has correctAnswer = 1.
    const review = await request(app).get(`/api/assessments/tests/${TEST_ID}/result`)
    const firstQuestion = review.body.data.questions[0]

    const answers = [{ questionId: firstQuestion.id, selectedOption: firstQuestion.correctAnswer }]

    const res = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ attemptId, answers, timeTakenSeconds: 30 })

    expect(res.status).toBe(200)
    expect(res.body.data.result.correct).toBe(1)
    expect(res.body.data.result.incorrect).toBe(0)
    expect(res.body.data.result.unanswered).toBe(firstQuestion.id ? expect.any(Number) : 0)
  })

  it('applies negative marks for a wrong answer', async () => {
    const start = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })
    const attemptId = start.body.data.id

    const review = await request(app).get(`/api/assessments/tests/${TEST_ID}/result`)
    const firstQuestion = review.body.data.questions[0]
    const wrongOption = (firstQuestion.correctAnswer + 1) % 4

    const res = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({
        attemptId,
        answers: [{ questionId: firstQuestion.id, selectedOption: wrongOption }],
        timeTakenSeconds: 30,
      })

    expect(res.status).toBe(200)
    expect(res.body.data.result.incorrect).toBe(1)
    expect(res.body.data.result.score).toBeLessThan(0)
  })

  it('marks the attempt as submitted and stores the result', async () => {
    const start = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })
    const attemptId = start.body.data.id

    await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ attemptId, answers: [], timeTakenSeconds: 10 })

    const saved = await Attempt.findOne({ id: attemptId })
    expect(saved.isSubmitted).toBe(true)
    expect(saved.submittedAt).toBeTruthy()
    expect(saved.result).toBeDefined()
  })

  it('is idempotent — a second submit returns the stored result', async () => {
    const start = await request(app).post('/api/assessments/attempts/start').send({ testId: TEST_ID })
    const attemptId = start.body.data.id

    const first = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ attemptId, answers: [], timeTakenSeconds: 10 })

    const second = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ attemptId, answers: [], timeTakenSeconds: 10 })

    expect(second.status).toBe(200)
    expect(second.body.data.result).toEqual(first.body.data.result)
  })

  it('returns 400 when attemptId is missing', async () => {
    const res = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ answers: [], timeTakenSeconds: 10 })

    expect(res.status).toBe(400)
  })

  it('returns 404 for an unknown attempt', async () => {
    const res = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({ attemptId: 'att_does_not_exist', answers: [] })

    expect(res.status).toBe(404)
  })
})

describe('assessment data in MongoDB', () => {
  it('serves tests from the database when a record exists', async () => {
    await Assessment.create({
      id: 'db-test-1',
      branchId: 'cse',
      title: 'Database Seeded Test',
      description: 'A test stored in MongoDB',
      difficulty: 'Beginner',
      duration: 5,
      totalMarks: 2,
      questionsCount: 2,
      isLive: true,
      questions: [
        {
          questionId: 'dbq-1',
          text: 'What is 1 + 1?',
          options: [{ text: '1' }, { text: '2' }, { text: '3' }, { text: '4' }],
          correctAnswer: 1,
          marks: 1,
          negativeMarks: 0.25,
        },
        {
          questionId: 'dbq-2',
          text: 'What is 2 + 2?',
          options: [{ text: '3' }, { text: '4' }, { text: '5' }, { text: '6' }],
          correctAnswer: 1,
          marks: 1,
          negativeMarks: 0.25,
        },
      ],
    })

    const res = await request(app).get('/api/assessments/tests/db-test-1')

    expect(res.status).toBe(200)
    expect(res.body.data.title).toBe('Database Seeded Test')
    // Correct answers must still be stripped.
    expect(res.body.data.questions[0]).not.toHaveProperty('correctAnswer')
  })

  it('scores a database-backed attempt', async () => {
    const start = await request(app).post('/api/assessments/attempts/start').send({ testId: 'db-test-1' })
    const attemptId = start.body.data.id

    const res = await request(app)
      .post('/api/assessments/attempts/submit')
      .send({
        attemptId,
        answers: [
          { questionId: 'dbq-1', selectedOption: 1 },
          { questionId: 'dbq-2', selectedOption: 1 },
        ],
        timeTakenSeconds: 60,
      })

    expect(res.status).toBe(200)
    expect(res.body.data.result.correct).toBe(2)
    expect(res.body.data.result.score).toBe(2)
    expect(res.body.data.result.maxScore).toBe(2)
  })
})
