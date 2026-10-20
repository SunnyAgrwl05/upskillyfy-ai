import { assessmentAPI } from '../api'
import {
  getAssessmentById,
  getBranchesWithCounts,
  getAssessmentsByBranch,
  getBranchById,
  DEFAULT_MARKING,
  DEFAULT_NEGATIVE_MARKS,
} from '../data/assessmentsSeed'

/* =========================================================
   ASSESSMENT SERVICE — data + state abstraction layer
   ---------------------------------------------------------
   Two responsibilities:

   1. READS  — every catalogue/test read tries the Express API
      first and transparently falls back to the clearly-labelled
      sample dataset when the backend is unreachable. Swapping the
      sample dataset for real records needs no UI change.

   2. STATE — attempt state lives in localStorage under a keyed
      structure so a refresh mid-exam does not lose answers.
   ========================================================= */

const ATTEMPT_KEY = 'upskillfy_assess_attempt'

/* =========================================================
   STORAGE HELPERS
   ========================================================= */

function loadAttempt(testId) {
  try {
    const raw = localStorage.getItem(`${ATTEMPT_KEY}_${testId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAttempt(testId, attempt) {
  try {
    localStorage.setItem(`${ATTEMPT_KEY}_${testId}`, JSON.stringify(attempt))
  } catch {
    // storage full or unavailable — the attempt still lives in memory
  }
}

/**
 * Loads a persisted attempt for a test so a submitted attempt can
 * be reviewed after navigation (e.g. reopening the result).
 */
export function loadSavedAttempt(testId) {
  return loadAttempt(testId)
}

function makeAttemptId() {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/* =========================================================
   READS — API first, sample data fallback
   ========================================================= */

/**
 * Run an API call, falling back to a local value when the backend
 * is unreachable or has not exposed the endpoint yet.
 */
async function withFallback(apiCall, fallback) {
  try {
    const res = await apiCall()
    if (res && res.data && res.data.success && res.data.data !== undefined) {
      return { data: res.data.data, source: 'api' }
    }
    return { data: fallback(), source: 'sample' }
  } catch {
    return { data: fallback(), source: 'sample' }
  }
}

/** All branches, with test counts derived from the actual data. */
export async function fetchBranches() {
  return withFallback(
    () => assessmentAPI.getBranches(),
    () => getBranchesWithCounts()
  )
}

/** A single branch. Resolves to null for an unknown id. */
export async function fetchBranch(branchId) {
  return withFallback(
    () => assessmentAPI.getBranch(branchId),
    () => getBranchById(branchId)
  )
}

/** Every test belonging to a branch (no correct answers included). */
export async function fetchBranchTests(branchId) {
  return withFallback(
    () => assessmentAPI.getBranchTests(branchId),
    () => {
      const branch = getBranchById(branchId)
      if (!branch) return null
      return getAssessmentsByBranch(branchId).map((t) => ({
        id: t.id,
        branchId: t.branchId,
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        duration: t.duration,
        totalMarks: t.totalMarks,
        questionsCount: t.questionsCount,
        markingScheme: t.markingScheme,
      }))
    }
  )
}

/**
 * A test with its questions, WITHOUT correct answers or
 * explanations — exactly what an exam screen should receive.
 */
export async function fetchTest(testId) {
  return withFallback(
    () => assessmentAPI.getTest(testId),
    () => {
      const test = getAssessmentById(testId)
      if (!test) return null
      return {
        id: test.id,
        branchId: test.branchId,
        title: test.title,
        description: test.description,
        difficulty: test.difficulty,
        duration: test.duration,
        totalMarks: test.totalMarks,
        questionsCount: test.questionsCount,
        markingScheme: test.markingScheme,
        questions: test.questions.map((q) => {
          // Strip the answer key so it never reaches the exam screen.
          const safe = { ...q }
          delete safe.correctAnswer
          delete safe.explanation
          return safe
        }),
      }
    }
  )
}

/**
 * Post-submission review payload. Correct answers and explanations
 * are only exposed here, never during an attempt.
 */
export async function fetchTestReview(testId) {
  return withFallback(
    () => assessmentAPI.getTestResult(testId),
    () => {
      const test = getAssessmentById(testId)
      if (!test) return null
      return {
        testId: test.id,
        title: test.title,
        totalMarks: test.totalMarks,
        questionsCount: test.questionsCount,
        markingScheme: test.markingScheme,
        questions: test.questions,
      }
    }
  )
}

/* =========================================================
   ATTEMPT LIFECYCLE
   ========================================================= */

/**
 * Initialise or resume an attempt for the given test.
 */
export function startAttempt({ test, userId = 'guest' }) {
  if (!test) throw new Error('Test not provided')

  // Keep a completed attempt available so refreshes can reopen its result.
  const completed = loadAttempt(test.id)
  if (completed?.status === 'submitted') {
    return { attempt: completed, resumed: false }
  }

  // Resume an attempt that is still in progress.
  const existing = loadAttempt(test.id)
  if (existing && existing.status === 'in-progress') {
    return { attempt: existing, resumed: true }
  }

  const attempt = {
    id: makeAttemptId(),
    testId: test.id,
    branchId: test.branchId,
    userId,
    status: 'ready',
    startedAt: null,
    submittedAt: null,
    deadline: null,
    currentQuestionIndex: 0,
    answers: {}, // questionId -> selected option index
    markedForReview: [],
    visited: [],
    result: null,
  }

  saveAttempt(test.id, attempt)
  return { attempt, resumed: false }
}

/** Start the clock only after the user accepts the instructions. */
export function beginAttempt(attempt, durationMinutes) {
  if (!attempt || attempt.status !== 'ready') return attempt
  const now = Date.now()
  const started = {
    ...attempt,
    status: 'in-progress',
    startedAt: now,
    deadline: now + durationMinutes * 60 * 1000,
  }
  save(started)
  return started
}

/** Persist a changed attempt (returns new reference for React state). */
export function save(attempt) {
  saveAttempt(attempt.testId, attempt)
  return attempt
}

/** Set the selected option for a question. */
export function setAnswer({ attempt, questionId, optionIndex }) {
  const newAttempt = {
    ...attempt,
    answers: {
      ...attempt.answers,
      [questionId]: optionIndex,
    },
    visited: [...new Set([...attempt.visited, questionId])],
  }

  save(newAttempt)
  return newAttempt
}

/** Clear the answer for a question (keeps it visited). */
export function clearAnswer({ attempt, questionId }) {
  const answers = { ...attempt.answers }
  delete answers[questionId]

  const newAttempt = {
    ...attempt,
    answers,
    markedForReview: attempt.markedForReview.filter((id) => id !== questionId),
  }

  save(newAttempt)
  return newAttempt
}

/** Toggle 'marked for review' on a question. */
export function toggleMarkForReview({ attempt, questionId }) {
  const newAttempt = {
    ...attempt,
    visited: [...new Set([...attempt.visited, questionId])],
    markedForReview: attempt.markedForReview.includes(questionId)
      ? attempt.markedForReview.filter((id) => id !== questionId)
      : [...attempt.markedForReview, questionId],
  }
  save(newAttempt)
  return newAttempt
}

/**
 * Jump to a different question index.
 * `total` is the question count, used to clamp the index.
 */
export function setCurrentQuestion({ attempt, index, total }) {
  const max = typeof total === 'number' ? total : undefined
  const clamped = Math.max(0, max === undefined ? index : Math.min(index, max - 1))
  const newAttempt = { ...attempt, currentQuestionIndex: clamped }
  save(newAttempt)
  return newAttempt
}

/** Compute analytics counts from an attempt. */
export function getSummary(attempt, test) {
  const total = test?.questions?.length ?? 0
  const answers = attempt?.answers ?? {}
  const markedList = attempt?.markedForReview ?? []

  const answered = Object.keys(answers).length
  const marked = markedList.length
  const visited = attempt?.visited?.length ?? 0
  const answeredMarked = markedList.filter((id) => answers[id] !== undefined).length

  return {
    total,
    answered,
    notAnswered: total - answered,
    marked,
    answeredMarked,
    visited,
    notVisited: total - visited,
  }
}

/* =========================================================
   SUBMISSION
   ========================================================= */

/** Score an attempt against the sample dataset. */
function scoreLocally(attempt, timeTakenSeconds, autoSubmitted) {
  const test = getAssessmentById(attempt.testId)
  if (!test) return null

  const correctMark = test.markingScheme?.positive ?? DEFAULT_MARKING.positive
  const negativeMark = test.markingScheme?.negative ?? DEFAULT_NEGATIVE_MARKS
  const questions = test.questions

  let correct = 0
  let incorrect = 0

  for (const q of questions) {
    const userAns = attempt.answers[q.id]
    if (userAns === undefined || userAns === null) continue // unattempted
    if (userAns === q.correctAnswer) correct++
    else incorrect++
  }

  const score = correct * correctMark - incorrect * negativeMark
  const maxScore = correctMark * questions.length
  const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0

  return {
    score,
    maxScore,
    correct,
    incorrect,
    unattempted: questions.length - correct - incorrect,
    accuracy,
    timeTakenSeconds,
    submittedAt: Date.now(),
    autoSubmitted,
  }
}

/**
 * Score and mark the attempt as submitted.
 *
 * When the backend is reachable it performs the scoring so correct
 * answers never have to reach the browser. When it is not, the
 * sample dataset is scored locally — acceptable because that
 * dataset is demonstration content already shipped in the bundle.
 */
export async function submitAttempt({ attempt, timeTakenSeconds, autoSubmitted = false }) {
  if (!attempt) return { attempt: null, result: null }

  // Guard against a duplicate submission.
  if (isSubmitted(attempt) && attempt.result) {
    return { attempt, result: attempt.result }
  }

  let result = null

  try {
    const res = await assessmentAPI.submitAttempt({
      attemptId: attempt.id,
      testId: attempt.testId,
      answers: Object.entries(attempt.answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })),
      timeTakenSeconds,
    })
    if (res && res.data && res.data.success && res.data.data?.result) {
      const apiResult = res.data.data.result
      result = {
        ...apiResult,
        unattempted: apiResult.unattempted ?? apiResult.unanswered,
        autoSubmitted,
      }
    }
  } catch {
    /* fall through to local scoring */
  }

  if (!result) {
    result = scoreLocally(attempt, timeTakenSeconds, autoSubmitted)
  }

  if (!result) return { attempt, result: null }

  const newAttempt = {
    ...attempt,
    status: 'submitted',
    result,
    submittedAt: result.submittedAt ?? Date.now(),
  }

  save(newAttempt)
  return { attempt: newAttempt, result }
}

/** Auto-submit handler called when the timer reaches zero. */
export async function autoSubmit(attempt, timeTakenSeconds) {
  return submitAttempt({ attempt, timeTakenSeconds, autoSubmitted: true })
}

/** Check if an attempt has been submitted. */
export function isSubmitted(attempt) {
  return attempt?.status === 'submitted'
}
