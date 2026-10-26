import test from 'node:test'
import assert from 'node:assert/strict'
import { answerIsCorrect, calculateAssessmentResult, isValidAssessmentAnswer } from '../services/assessmentScoring.js'

const choice = {
  _id: 'question-1',
  type: 'single_choice',
  options: ['red', 'blue', 'green'],
  correctAnswer: 1,
  points: 2,
}

test('validates single-choice answer indexes', () => {
  assert.equal(isValidAssessmentAnswer(choice, 1), true)
  assert.equal(isValidAssessmentAnswer(choice, 3), false)
  assert.equal(isValidAssessmentAnswer(choice, '1'), false)
  assert.equal(isValidAssessmentAnswer(choice, null), true)
})

test('scores multiple-choice answers without depending on option order', () => {
  const question = { ...choice, type: 'multiple_choice', correctAnswer: [0, 2] }
  assert.equal(isValidAssessmentAnswer(question, [2, 0]), true)
  assert.equal(isValidAssessmentAnswer(question, []), true)
  assert.equal(answerIsCorrect(question, [2, 0]), true)
  assert.equal(answerIsCorrect(question, [0]), false)
  assert.equal(isValidAssessmentAnswer(question, [0, 0]), false)
})

test('calculates weighted score and distinguishes unanswered answers', () => {
  const questions = [
    { ...choice, questionId: 'first', correctAnswer: 1 },
    { ...choice, questionId: 'second', correctAnswer: 0, points: 1 },
    { ...choice, questionId: 'third', correctAnswer: 2, points: 1 },
  ]
  const result = calculateAssessmentResult(
    questions,
    [
      { questionId: 'first', answer: 1 },
      { questionId: 'second', answer: 2 },
      { questionId: 'third', answer: [] },
    ],
    50,
    'completed',
    new Date('2026-01-01T00:00:00.000Z'),
  )
  assert.deepEqual({
    score: result.score,
    maxScore: result.maxScore,
    percentage: result.percentage,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
    unansweredCount: result.unansweredCount,
    passed: result.passed,
    status: result.status,
  }, {
    score: 2,
    maxScore: 4,
    percentage: 50,
    correctCount: 1,
    incorrectCount: 1,
    unansweredCount: 1,
    passed: true,
    status: 'completed',
  })
})
