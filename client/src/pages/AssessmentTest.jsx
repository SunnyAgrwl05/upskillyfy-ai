/* =====================================================
   ASSESSMENT TEST — EXAM INTERFACE
   ------------------------------------------------------------
   Professional online examination portal:
   - Header: test name, instructions, live countdown timer
   - Question panel: number, marking scheme, options, actions
   - Sidebar: question palette with live state + summary counts
   - Bottom navigation: Previous / Clear Response /
     Mark for Review & Next / Save & Next / Submit Test
   - Auto-submits when the deadline passes; submits once only.
   ===================================================== */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  MoreHorizontal,
  X,
  AlertTriangle,
  Save,
  Eraser,
  ListChecks,
} from 'lucide-react'
import { getBranchById } from '../data/assessmentsSeed'
import {
  fetchTest,
  fetchTestReview,
  startAttempt,
  beginAttempt,
  setAnswer,
  clearAnswer,
  toggleMarkForReview,
  setCurrentQuestion,
  submitAttempt,
  autoSubmit,
  getSummary,
  isSubmitted,
} from '../services/assessmentService'
import './AssessmentTest.css'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function AssessmentTest() {
  const { testId } = useParams()

  const [phase, setPhase] = useState('loading') // loading | instructions | exam | result
  const [test, setTest] = useState(null)
  const [loadedTestId, setLoadedTestId] = useState(null)
  const [testLoadComplete, setTestLoadComplete] = useState(false)
  const [attempt, setAttempt] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timer, setTimer] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  // Post-submission review payload. Correct answers and explanations are
  // only fetched once the attempt is over — never during the exam.
  const [review, setReview] = useState(null)

  const timerRef = useRef(null)
  const deadlineRef = useRef(null)
  const attemptRef = useRef(null)
  const submittedRef = useRef(false)
  const autoSubmitScheduled = useRef(false)
  const flashRef = useRef(null)
  attemptRef.current = attempt

  /* =========================================================
      LOAD TEST DATA
      ========================================================= */
  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    setTest(null)
    setLoadedTestId(null)
    setTestLoadComplete(false)
    setAttempt(null)
    setReview(null)
    setCurrentIdx(0)
    setTimer(0)
    setShowInstructions(false)
    setShowSubmitConfirm(false)
    setPaletteOpen(false)
    submittedRef.current = false
    autoSubmitScheduled.current = false
    deadlineRef.current = null

    fetchTest(testId)
      .then((res) => {
        if (cancelled) return
        setTest(res.data)
        setLoadedTestId(testId)
        setTestLoadComplete(true)
      })
      .catch(() => {
        if (!cancelled) {
          setTest(null)
          setTestLoadComplete(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [testId])

  /* =========================================================
      INITIALISE ATTEMPT
      ========================================================= */
  useEffect(() => {
    if (!test || loadedTestId !== testId || phase !== 'loading') return

    const { attempt: newAttempt } = startAttempt({ test, userId: 'guest' })
    setAttempt(newAttempt)
    setCurrentIdx(newAttempt.currentQuestionIndex || 0)

    if (newAttempt.status === 'submitted') {
      setPhase('result')
    } else if (newAttempt.status === 'in-progress' && newAttempt.deadline) {
      deadlineRef.current = newAttempt.deadline
      setTimer(newAttempt.deadline - Date.now())
      setPhase('exam')
    } else {
      setPhase('instructions')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, loadedTestId, testId, phase])

  /* =========================================================
      TIMER — derived from the deadline so it stays accurate
      ========================================================= */
  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    if (phase !== 'exam' || attempt?.status !== 'in-progress' || !attempt.deadline) {
      stopTimer()
      return undefined
    }

    deadlineRef.current = attempt.deadline
    const tick = () => {
      if (submittedRef.current || autoSubmitScheduled.current) return
      const remaining = attempt.deadline - Date.now()
      if (remaining <= 0) {
        setTimer(0)
        triggerAutoSubmit()
      } else {
        setTimer(remaining)
      }
    }
    tick()
    timerRef.current = setInterval(tick, 500)
    return stopTimer
    // Timer is bound to the active attempt and phase. Its callbacks use this
    // attempt snapshot, so an expiry always submits the latest rendered state.
  }, [phase, attempt?.id, attempt?.deadline, attempt?.status])

  useEffect(() => stopTimer, [])

  /* =========================================================
      REVIEW PAYLOAD — fetched only after the attempt is closed
      ========================================================= */
  useEffect(() => {
    if (phase !== 'result' || !testId) return
    let cancelled = false

    fetchTestReview(testId)
      .then((res) => {
        if (cancelled) return
        setReview(res.data ?? null)
      })
      .catch(() => {
        if (!cancelled) setReview(null)
      })

    return () => {
      cancelled = true
    }
  }, [phase, testId])

  async function triggerAutoSubmit() {
    const activeAttempt = attemptRef.current
    if (autoSubmitScheduled.current || !activeAttempt) return
    autoSubmitScheduled.current = true
    stopTimer()
    submittedRef.current = true

    const timeTaken = Math.round((Date.now() - activeAttempt.startedAt) / 1000)
    const { attempt: submittedAttempt, result } = await autoSubmit(activeAttempt, timeTaken)
    if (result) {
      setAttempt(submittedAttempt)
      setPhase('result')
    } else {
      autoSubmitScheduled.current = false
      submittedRef.current = false
    }
  }

  function handleStart() {
    if (!attempt || attempt.status !== 'ready') return
    const started = beginAttempt(attempt, test.duration)
    deadlineRef.current = started.deadline
    setAttempt(started)
    setTimer(started.deadline - Date.now())
    setPhase('exam')
  }

  /* =========================================================
      QUESTION NAVIGATION
      ========================================================= */
  const total = test?.questions?.length ?? 0

  const handlePrev = useCallback(() => {
    if (currentIdx <= 0 || !attempt) return
    const newIdx = currentIdx - 1
    setAttempt(setCurrentQuestion({ attempt, index: newIdx, total }))
    setCurrentIdx(newIdx)
    setPaletteOpen(false)
  }, [currentIdx, attempt, total])

  const handleNext = useCallback(() => {
    if (!attempt || currentIdx >= total - 1) return
    const newIdx = currentIdx + 1
    setAttempt(setCurrentQuestion({ attempt, index: newIdx, total }))
    setCurrentIdx(newIdx)
    setPaletteOpen(false)
  }, [currentIdx, attempt, total])

  const handleJumpTo = useCallback(
    (idx) => {
      if (!attempt || idx < 0 || idx >= total) return
      setAttempt(setCurrentQuestion({ attempt, index: idx, total }))
      setCurrentIdx(idx)
      setPaletteOpen(false)
    },
    [attempt, total]
  )

  /* =========================================================
      ANSWER HANDLERS
      ========================================================= */
  const flashSaved = useCallback(() => {
    setSavedFlash(true)
    if (flashRef.current) clearTimeout(flashRef.current)
    flashRef.current = setTimeout(() => setSavedFlash(false), 1600)
  }, [])

  useEffect(() => () => { if (flashRef.current) clearTimeout(flashRef.current) }, [])

  const handleAnswer = useCallback(
    (questionId, optionIndex) => {
      if (!attempt || isSubmitted(attempt)) return
      setAttempt(setAnswer({ attempt, questionId, optionIndex }))
      flashSaved()
    },
    [attempt, flashSaved]
  )

  const handleClear = useCallback(
    (questionId) => {
      if (!attempt || isSubmitted(attempt)) return
      setAttempt(clearAnswer({ attempt, questionId }))
    },
    [attempt]
  )

  const handleMark = useCallback(
    (questionId) => {
      if (!attempt || isSubmitted(attempt)) return
      setAttempt(toggleMarkForReview({ attempt, questionId }))
    },
    [attempt]
  )

  /** Mark the current question for review and advance. */
  const handleMarkAndNext = useCallback(() => {
    if (!attempt || !currentQuestion) return
    const qId = currentQuestion.id
    const alreadyMarked = attempt.markedForReview?.includes(qId)
    if (!alreadyMarked) {
      setAttempt(toggleMarkForReview({ attempt, questionId: qId }))
    }
    if (currentIdx < total - 1) {
      const newIdx = currentIdx + 1
      setAttempt(setCurrentQuestion({ attempt, index: newIdx, total }))
      setCurrentIdx(newIdx)
    }
    setPaletteOpen(false)
  }, [attempt, currentQuestion, currentIdx, total])

  /* =========================================================
      SUBMISSION
      ========================================================= */
  const handleSubmit = async () => {
    if (!attempt || isSubmitted(attempt) || !test) return
    // Guard: only one submission may ever run.
    if (submittedRef.current) return
    submittedRef.current = true
    stopTimer()

    const timeTaken = Math.round((Date.now() - attempt.startedAt) / 1000)
    const { attempt: submittedAttempt, result } = await submitAttempt({ attempt, timeTakenSeconds: timeTaken })
    if (result) {
      setAttempt(submittedAttempt)
      setPhase('result')
    } else {
      submittedRef.current = false
    }
  }

  /* =========================================================
      RENDER HELPERS
      ========================================================= */
  function formatTime(ms) {
    if (ms <= 0) return '00:00'
    const totalSec = Math.ceil(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function getQuestionState(questionId) {
    if (!attempt) return 'unvisited'
    const answered = attempt.answers[questionId] !== undefined
    const marked = attempt.markedForReview?.includes(questionId)
    if (answered && marked) return 'answered-marked'
    if (answered) return 'answered'
    if (marked) return 'marked'
    if (attempt.visited?.includes(questionId)) return 'visited'
    return 'unvisited'
  }

  const currentQuestion = test?.questions?.[currentIdx]
  const summary = attempt ? getSummary(attempt, test) : null

  /* =========================================================
      RENDER
      ========================================================= */
  if (!testLoadComplete) {
    return (
      <div className="asm-exam-loading">
        <div className="asm-spinner" />
        <p>Loading test…</p>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="asm-exam-loading">
        <AlertTriangle size={30} color="#e8710a" />
        <p>This assessment could not be found.</p>
        <Link to="/assessment" className="asm-btn-secondary">
          <span>Browse assessments</span>
        </Link>
      </div>
    )
  }

  if (!test.questions?.length) {
    return (
      <div className="asm-exam-loading">
        <AlertTriangle size={30} color="#e8710a" />
        <p>This test has no questions available.</p>
        <Link to={`/assessment/branch/${test.branchId}`} className="asm-btn-secondary">
          <span>Back to tests</span>
        </Link>
      </div>
    )
  }

  const branch = getBranchById(test.branchId)
  const marking = test.markingScheme || { positive: 1, negative: 0.25 }
  const elapsed = attempt ? Date.now() - attempt.startedAt : 0

  return (
    <div className={`asm-exam ${phase}`} data-phase={phase}>
      {/* ==================== HEADER ==================== */}
      <header className="asm-exam-header">
        <div className="asm-exam-left">
          <Link to={`/assessment/branch/${test.branchId}`} className="asm-back-link">
            <ArrowLeft size={15} />
            {branch?.shortName || test.branchId}
          </Link>
          <h1 className="asm-exam-title">{test.title}</h1>
        </div>

        <div className="asm-exam-center">
          <div className="asm-timer" data-warning={timer > 0 && timer <= 5 * 60 * 1000}>
            <Clock size={16} />
            <span>{formatTime(timer)}</span>
          </div>
        </div>

        <div className="asm-exam-right">
          <button
            type="button"
            className="asm-instructions-btn"
            onClick={() => setShowInstructions(true)}
            aria-label="Test instructions"
          >
            <AlertTriangle size={15} />
            Instructions
          </button>
          <button
            type="button"
            className="asm-palette-toggle"
            onClick={() => setPaletteOpen((v) => !v)}
            aria-expanded={paletteOpen}
            aria-label="Toggle question palette"
          >
            <ListChecks size={16} />
            <span>Questions</span>
          </button>
        </div>
      </header>

      {/* ==================== INSTRUCTIONS SCREEN ==================== */}
      {phase === 'instructions' && (
        <section className="asm-instructions-section">
          <div className="asm-instructions-card">
            <h2 className="asm-ins-title">Test Instructions</h2>
            <ul className="asm-ins-list">
              <li>
                <strong>Duration:</strong> {test.duration} minutes. The timer starts on click and cannot be paused.
              </li>
              <li>
                <strong>Questions:</strong> {test.questionsCount} multiple-choice questions.
              </li>
              <li>
                <strong>Marking:</strong> +{marking.positive} correct, -{marking.negative} incorrect, 0 unattempted.
              </li>
              <li>
                <strong>Navigate:</strong> Use the question palette or Previous/Save &amp; Next buttons.
              </li>
              <li>
                <strong>Mark for Review:</strong> Flag questions to revisit later. Flagged questions are counted
                separately in the palette.
              </li>
              <li>
                <strong>Auto-submit:</strong> The test submits automatically when the time expires.
              </li>
            </ul>
            <div className="asm-ins-actions">
              <button type="button" className="asm-btn-primary asm-start-btn" onClick={handleStart}>
                <span>Start Test</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==================== EXAM SCREEN ==================== */}
      {phase === 'exam' && currentQuestion && (
        <div className="asm-exam-container">
          {/* ---------- QUESTION PANEL ---------- */}
          <div className="asm-question-panel">
            <div className="asm-question-header">
              <div className="asm-q-meta">
                <span className="asm-q-number">
                  Question {currentIdx + 1} of {test.questions.length}
                </span>
                <span className="asm-q-marking">
                  <span className="asm-mark-positive">+{marking.positive}</span>
                  <span className="asm-mark-negative">−{marking.negative}</span>
                </span>
                <span className="asm-q-elapsed">Elapsed {formatTime(elapsed)}</span>
                {savedFlash && (
                  <span className="asm-saved-flag" role="status">
                    <CheckCircle2 size={12} />
                    Answer saved
                  </span>
                )}
              </div>

              <div className="asm-q-controls">
                <button
                  type="button"
                  className="asm-q-btn"
                  onClick={() => handleMark(currentQuestion.id)}
                  aria-pressed={attempt?.markedForReview?.includes(currentQuestion.id)}
                >
                  <Flag size={14} />
                  {attempt?.markedForReview?.includes(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}
                </button>
                <button
                  type="button"
                  className="asm-q-btn asm-save-btn"
                  disabled={attempt?.answers[currentQuestion.id] === undefined}
                  onClick={() => handleClear(currentQuestion.id)}
                >
                  <Eraser size={14} />
                  Clear Response
                </button>
                <button type="button" className="asm-q-btn" aria-label="More question actions">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            <div className="asm-question-body">
              <p className="asm-question-text">{currentQuestion.text}</p>

              <fieldset className="asm-options" aria-label="Answer options">
                {currentQuestion.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`asm-option ${attempt?.answers[currentQuestion.id] === i ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={attempt?.answers[currentQuestion.id] === i}
                      onChange={() => handleAnswer(currentQuestion.id, i)}
                    />
                    <span className="asm-opt-label">{OPTION_LABELS[i]}</span>
                    <span className="asm-opt-text">{opt}</span>
                  </label>
                ))}
              </fieldset>
            </div>

            {/* ---------- BOTTOM NAVIGATION ---------- */}
            <div className="asm-question-nav">
              <button
                type="button"
                className="asm-nav-btn asm-prev"
                onClick={handlePrev}
                disabled={currentIdx <= 0}
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <button type="button" className="asm-nav-btn asm-clear" onClick={() => handleClear(currentQuestion.id)}>
                <X size={14} />
                Clear Response
              </button>

              <button type="button" className="asm-nav-btn asm-mark" onClick={handleMarkAndNext}>
                <Flag size={14} />
                Mark for Review &amp; Next
              </button>

              {currentIdx === test.questions.length - 1 ? (
                <button type="button" className="asm-nav-btn asm-submit" onClick={() => setShowSubmitConfirm(true)}>
                  Submit Test
                </button>
              ) : (
                <button type="button" className="asm-nav-btn asm-next" onClick={handleNext}>
                  <Save size={14} />
                  Save &amp; Next
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ---------- SIDEBAR: QUESTION PALETTE ---------- */}
          <aside className={`asm-palette-wrap ${paletteOpen ? 'open' : ''}`} aria-label="Question palette">
            <div className="asm-palette">
              <div className="asm-palette-summary">
                <div className="asm-palette-stat">
                  <span className="asm-palette-stat-value">{summary.total}</span>
                  <span className="asm-palette-stat-label">Total</span>
                </div>
                <div className="asm-palette-stat">
                  <span className="asm-palette-stat-value">{summary.notAnswered}</span>
                  <span className="asm-palette-stat-label">Not Answered</span>
                </div>
                <div className="asm-palette-stat">
                  <span className="asm-palette-stat-value success">{summary.answered}</span>
                  <span className="asm-palette-stat-label">Answered</span>
                </div>
                <div className="asm-palette-stat">
                  <span className="asm-palette-stat-value marked">{summary.marked}</span>
                  <span className="asm-palette-stat-label">Marked for Review</span>
                </div>
                <div className="asm-palette-stat">
                  <span className="asm-palette-stat-value muted">{summary.notVisited}</span>
                  <span className="asm-palette-stat-label">Not Visited</span>
                </div>
                <div className="asm-palette-stat">
                  <span className="asm-palette-stat-value">{summary.answeredMarked}</span>
                  <span className="asm-palette-stat-label">Answered &amp; Marked</span>
                </div>
              </div>

              <div className="asm-palette-grid">
                {test.questions.map((q, i) => {
                  const state = getQuestionState(q.id)
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`asm-palette-q ${state}`}
                      onClick={() => handleJumpTo(i)}
                      aria-current={i === currentIdx}
                      aria-label={`Question ${i + 1}, ${state.replace('-', ' ')}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              <div className="asm-palette-legend">
                <div className="asm-legend-row">
                  <span className="asm-legend-swatch unvisited" />
                  <span>Not visited</span>
                </div>
                <div className="asm-legend-row">
                  <span className="asm-legend-swatch visited" />
                  <span>Not answered</span>
                </div>
                <div className="asm-legend-row">
                  <span className="asm-legend-swatch answered" />
                  <span>Answered</span>
                </div>
                <div className="asm-legend-row">
                  <span className="asm-legend-swatch marked" />
                  <span>Marked for review</span>
                </div>
                <div className="asm-legend-row">
                  <span className="asm-legend-swatch answered-marked" />
                  <span>Answered &amp; marked</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ==================== RESULT SCREEN ==================== */}
      {phase === 'result' && attempt?.result && (
        <section className="asm-result-section">
          <div className="asm-result-card">
            <h2 className="asm-result-title">Test Submitted</h2>
            <div className="asm-result-score">
              <div className="asm-result-circle">
                <span className="asm-result-percent">{attempt.result.accuracy}%</span>
              </div>
              <div className="asm-result-details">
                <div className="asm-result-row">
                  <span>Score</span>
                  <strong className="asm-result-score-value">
                    {attempt.result.score} / {attempt.result.maxScore}
                  </strong>
                </div>
                <div className="asm-result-row">
                  <span>Correct</span>
                  <strong className="asm-result-correct">{attempt.result.correct}</strong>
                </div>
                <div className="asm-result-row">
                  <span>Incorrect</span>
                  <strong className="asm-result-incorrect">{attempt.result.incorrect}</strong>
                </div>
                <div className="asm-result-row">
                  <span>Unanswered</span>
                  <strong className="asm-result-unanswered">{attempt.result.unattempted}</strong>
                </div>
                <div className="asm-result-row">
                  <span>Time Taken</span>
                  <strong className="asm-result-time">
                    {Math.floor(attempt.result.timeTakenSeconds / 60)}m{' '}
                    {attempt.result.timeTakenSeconds % 60}s
                  </strong>
                </div>
                {attempt.result.autoSubmitted && (
                  <div className="asm-result-row asm-auto-submitted">
                    <AlertTriangle size={14} />
                    <span>Timer expired – auto-submitted</span>
                  </div>
                )}
              </div>
            </div>
            <div className="asm-result-actions">
              <Link to={`/assessment/branch/${test.branchId}`} className="asm-btn-primary">
                <ArrowLeft size={14} />
                <span>Back to Tests</span>
              </Link>
              <Link to="/assessment" className="asm-btn-secondary">
                <span>All Branches</span>
              </Link>
            </div>

            {/* ---------- REVIEW ANSWERS ---------- */}
            {review?.questions?.length ? (
              <div className="asm-review">
                <h3 className="asm-review-title">Review Answers</h3>
                <p className="asm-review-sub">
                  Compare your answers against the correct options and read the explanation for
                  each question.
                </p>

                <div className="asm-review-list">
                  {review.questions.map((q, i) => {
                    const userAnswer = attempt.answers?.[q.id]
                    const isCorrect = userAnswer !== undefined && userAnswer === q.correctAnswer
                    const isSkipped = userAnswer === undefined || userAnswer === null

                    return (
                      <details key={q.id} className="asm-review-item">
                        <summary className="asm-review-summary">
                          <span
                            className={`asm-review-qnum ${
                              isCorrect ? 'correct' : isSkipped ? 'skipped' : 'incorrect'
                            }`}
                          >
                            Q{i + 1}
                          </span>
                          <span className="asm-review-qtext">{q.text}</span>
                          <span
                            className={`asm-review-badge ${
                              isCorrect ? 'correct' : isSkipped ? 'skipped' : 'incorrect'
                            }`}
                          >
                            {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Incorrect'}
                          </span>
                        </summary>

                        <div className="asm-review-body">
                          <ul className="asm-review-options">
                            {q.options.map((opt, j) => {
                              const isAnswer = userAnswer === j
                              const isKey = j === q.correctAnswer
                              const cls = isKey
                                ? 'correct-answer'
                                : isAnswer
                                ? 'wrong-answer'
                                : ''
                              return (
                                <li key={j} className={`asm-review-option ${cls}`}>
                                  <span className="asm-review-opt-label">{OPTION_LABELS[j]}</span>
                                  <span className="asm-review-opt-text">{opt}</span>
                                  {isKey && (
                                    <span className="asm-review-tag correct">
                                      <CheckCircle2 size={12} /> Correct
                                    </span>
                                  )}
                                  {isAnswer && !isKey && (
                                    <span className="asm-review-tag wrong">
                                      <AlertTriangle size={12} /> Your answer
                                    </span>
                                  )}
                                </li>
                              )
                            })}
                          </ul>

                          {q.explanation && (
                            <p className="asm-review-explanation">
                              <strong>Why:</strong> {q.explanation}
                            </p>
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="asm-review-unavailable">
                Answer explanations are not available for this test.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ==================== INSTRUCTIONS MODAL ==================== */}
      {showInstructions && (
        <div className="asm-modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="asm-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="asm-modal-close"
              onClick={() => setShowInstructions(false)}
              aria-label="Close instructions"
            >
              <X size={18} />
            </button>
            <h3>Test Instructions</h3>
            <ul className="asm-ins-list-sm">
              <li>
                <strong>Duration:</strong> {test.duration} minutes
              </li>
              <li>
                <strong>Marking:</strong> +{marking.positive} correct, -{marking.negative} incorrect, 0 unattempted
              </li>
              <li>Navigate with Previous/Save &amp; Next or the question palette</li>
              <li>Mark for Review to revisit questions later</li>
            </ul>
          </div>
        </div>
      )}

      {/* ==================== SUBMIT CONFIRMATION ==================== */}
      {showSubmitConfirm && (
        <div className="asm-modal-overlay" onClick={() => setShowSubmitConfirm(false)}>
          <div className="asm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Test?</h3>
            <p>
              You have answered {summary.answered} of {summary.total} questions
              {summary.marked > 0 && `, with ${summary.marked} marked for review`}. This action cannot be undone.
            </p>
            <div className="asm-modal-actions">
              <button type="button" className="asm-btn-secondary" onClick={() => setShowSubmitConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="asm-btn-primary asm-submit-btn" onClick={handleSubmit}>
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
