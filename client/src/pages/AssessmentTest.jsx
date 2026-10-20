/* =========================================================
   UPSKILLYFY AI — PROFESSIONAL DEDICATED EXAMINATION PORTAL
   TCS iON / NTA Real Examination Portal (Google Cloud Theme)
   ========================================================= */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  MoreVertical,
  X,
  AlertTriangle,
  Eraser,
  Info,
  Check,
  Eye,
  Award,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  FileText,
  Maximize,
  Minimize,
  HelpCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
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

export default function AssessmentTest() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Phase: 'loading' | 'instructions' | 'exam' | 'result'
  const [phase, setPhase] = useState('loading')
  const [test, setTest] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timer, setTimer] = useState(0)
  const [questionTimer, setQuestionTimer] = useState(0)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [review, setReview] = useState(null)
  const [error, setError] = useState(false)

  // Instructions screen states
  const [declarationChecked, setDeclarationChecked] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const timerRef = useRef(null)
  const questionTimerRef = useRef(null)
  const deadlineRef = useRef(null)
  const attemptRef = useRef(null)
  const submittedRef = useRef(false)
  attemptRef.current = attempt

  // Candidate Name & Initials
  const candidateName = user?.name || 'Sunny Kumar'
  const candidateInitials = candidateName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SK'

  /* =========================================================
      FULLSCREEN TOGGLE
      ========================================================= */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  /* =========================================================
      INITIAL LOAD: FETCH TEST & CHECK EXISTING ATTEMPT
      ========================================================= */
  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    setError(false)
    setTest(null)
    setAttempt(null)
    setReview(null)
    setCurrentIdx(0)
    setTimer(0)
    setQuestionTimer(0)
    submittedRef.current = false

    fetchTest(testId)
      .then(async (res) => {
        if (cancelled) return
        const testData = res.data
        if (!testData) {
          setError(true)
          return
        }
        setTest(testData)

        // Initialize attempt abstraction
        const { attempt: att } = startAttempt({
          test: testData,
          userId: user?._id || 'guest',
        })

        setAttempt(att)

        // 1. If already submitted, open results review
        if (isSubmitted(att)) {
          setPhase('result')
          fetchTestReview(testId).then((revRes) => {
            if (!cancelled) setReview(revRes.data)
          })
          return
        }

        // 2. If already in-progress (browser refresh mid-exam), resume exam
        if (att.status === 'in-progress' && att.deadline) {
          const remaining = Math.max(0, att.deadline - Date.now())
          if (remaining <= 0) {
            // Expired -> auto-submit
            submittedRef.current = true
            autoSubmit(att, testData.duration * 60).then(({ attempt: subAtt, result }) => {
              setAttempt(subAtt)
              setPhase('result')
              fetchTestReview(testId).then((revRes) => {
                if (!cancelled) setReview(revRes.data)
              })
            })
            return
          }

          deadlineRef.current = att.deadline
          setTimer(remaining)
          if (typeof att.currentQuestionIndex === 'number') {
            setCurrentIdx(att.currentQuestionIndex)
          }
          setPhase('exam')
          return
        }

        // 3. New test attempt -> FIRST SHOW GENERAL INSTRUCTIONS
        setPhase('instructions')
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [testId, user])

  /* =========================================================
      EXAM COUNTDOWN & QUESTION TIMERS
      ========================================================= */
  useEffect(() => {
    if (phase !== 'exam' || !deadlineRef.current) return

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now())
      setTimer(remaining)

      if (remaining <= 0) {
        clearInterval(timerRef.current)
        if (!submittedRef.current && attemptRef.current) {
          submittedRef.current = true
          autoSubmit(attemptRef.current, test.duration * 60).then(({ attempt: subAtt, result }) => {
            setAttempt(subAtt)
            setPhase('result')
            fetchTestReview(testId).then((revRes) => {
              setReview(revRes.data)
            })
          })
        }
      }
    }, 1000)

    questionTimerRef.current = setInterval(() => {
      setQuestionTimer((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [phase, test, testId])

  // Reset per-question timer on switching question
  useEffect(() => {
    setQuestionTimer(0)
  }, [currentIdx])

  /* =========================================================
      START EXAM FROM INSTRUCTIONS SCREEN
      ========================================================= */
  const handleStartExam = async () => {
    if (!test || !attempt || !declarationChecked) return

    // Auto-enter fullscreen for true examination vibe
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.()
        setIsFullscreen(true)
      }
    } catch {
      // Browser permissions or user gesture fallback
    }

    const startedAttempt = beginAttempt(attempt, test.duration)
    setAttempt(startedAttempt)

    const deadline = startedAttempt.deadline || (Date.now() + test.duration * 60 * 1000)
    deadlineRef.current = deadline
    const remaining = Math.max(0, deadline - Date.now())
    setTimer(remaining)
    setCurrentIdx(0)
    setPhase('exam')
  }

  /* =========================================================
      EXAM ACTIONS (Answer, Mark, Clear, Jump)
      ========================================================= */
  const currentQuestion = test?.questions?.[currentIdx]
  const total = test?.questions?.length || 0
  const marking = test?.markingScheme || { positive: 1, negative: 0.25 }
  const summary = attempt && test ? getSummary(attempt, test) : {
    total: 0,
    answered: 0,
    notAnswered: 0,
    marked: 0,
    answeredMarked: 0,
    notVisited: 0,
  }

  const handleSelectOption = useCallback(async (optionIdx) => {
    if (!attempt || !currentQuestion || isSubmitted(attempt)) return
    const updated = setAnswer({
      attempt,
      questionId: currentQuestion.id,
      optionIndex: optionIdx,
    })
    setAttempt(updated)
  }, [attempt, currentQuestion])

  const handleClearResponse = useCallback(async () => {
    if (!attempt || !currentQuestion || isSubmitted(attempt)) return
    const updated = clearAnswer({
      attempt,
      questionId: currentQuestion.id,
    })
    setAttempt(updated)
  }, [attempt, currentQuestion])

  const handleToggleMarkForReview = useCallback(async () => {
    if (!attempt || !currentQuestion || isSubmitted(attempt)) return
    const updated = toggleMarkForReview({
      attempt,
      questionId: currentQuestion.id,
    })
    setAttempt(updated)
  }, [attempt, currentQuestion])

  const handleJumpToQuestion = useCallback(async (idx) => {
    if (!attempt || !test?.questions?.[idx] || isSubmitted(attempt)) return
    const updated = setCurrentQuestion({
      attempt,
      index: idx,
      total,
    })
    setAttempt(updated)
    setCurrentIdx(idx)
  }, [attempt, test, total])

  const handleNextQuestion = useCallback(async () => {
    if (currentIdx < total - 1) {
      handleJumpToQuestion(currentIdx + 1)
    }
  }, [currentIdx, total, handleJumpToQuestion])

  const handlePrevQuestion = useCallback(async () => {
    if (currentIdx > 0) {
      handleJumpToQuestion(currentIdx - 1)
    }
  }, [currentIdx, handleJumpToQuestion])

  const handleMarkAndNext = useCallback(async () => {
    if (!attempt || !currentQuestion) return
    const updated = toggleMarkForReview({
      attempt,
      questionId: currentQuestion.id,
    })
    setAttempt(updated)
    if (currentIdx < total - 1) {
      handleJumpToQuestion(currentIdx + 1)
    }
  }, [attempt, currentQuestion, currentIdx, total, handleJumpToQuestion])

  const handleFinalSubmit = async () => {
    if (!attempt || isSubmitted(attempt) || submittedRef.current) return
    submittedRef.current = true
    setShowSubmitConfirm(false)

    const timeTaken = attempt.startedAt
      ? Math.round((Date.now() - attempt.startedAt) / 1000)
      : test.duration * 60

    const { attempt: submittedAttempt, result } = await submitAttempt({
      attempt,
      timeTakenSeconds: timeTaken,
    })

    if (submittedAttempt) {
      setAttempt(submittedAttempt)
      setPhase('result')
      fetchTestReview(testId).then((revRes) => {
        setReview(revRes.data)
      })
    }
  }

  // Question Status Calculator for Palette
  const getQuestionStatus = (qId) => {
    if (!attempt) return 'not-visited'
    const isAnswered = attempt.answers?.[qId] !== undefined
    const isMarked = attempt.markedForReview?.includes(qId)
    const isVisited = attempt.visited?.includes(qId)

    if (isAnswered && isMarked) return 'answered-marked'
    if (isMarked) return 'marked'
    if (isAnswered) return 'answered'
    if (isVisited) return 'not-answered'
    return 'not-visited'
  }

  const isQuestionAnswered = currentQuestion && attempt?.answers?.[currentQuestion.id] !== undefined
  const isQuestionMarked = currentQuestion && attempt?.markedForReview?.includes(currentQuestion.id)

  // Format Timers (HH:MM:SS)
  const formatTimer = (ms) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000))
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    }
  }

  const formatSecs = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const { hrs, mins, secs } = formatTimer(timer)

  /* =========================================================
      1. LOADING & ERROR STATES
      ========================================================= */
  if (phase === 'loading') {
    return (
      <div className="exam-dedicated-portal loading-center">
        <div className="exam-loading-card">
          <div className="exam-spinner" />
          <h2>Preparing Examination Portal...</h2>
          <p>Loading questions, security environment, and candidate session.</p>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="exam-dedicated-portal loading-center">
        <div className="exam-loading-card">
          <AlertCircle size={44} color="#ea4335" />
          <h2>Test Not Found</h2>
          <p>The assessment you are trying to access does not exist or has been removed.</p>
          <Link to="/assessment" className="exam-nav-btn primary" style={{ marginTop: 16 }}>
            Back to Assessment Centre
          </Link>
        </div>
      </div>
    )
  }

  /* =========================================================
      2. GENERAL INSTRUCTIONS SCREEN (Dedicated Full Page)
      ========================================================= */
  if (phase === 'instructions') {
    return (
      <div className="exam-dedicated-portal instructions-mode">
        {/* Top Bar */}
        <header className="exam-top-nav">
          <div className="exam-top-title-group">
            <span className="exam-live-indicator" />
            <h1 className="exam-top-title">Upskillyfy AI — Examination Portal</h1>
            <span className="exam-portal-badge">NTA / TCS iON Mode</span>
          </div>
          <div className="exam-top-actions">
            <button
              type="button"
              className="exam-icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
            <Link
              to={`/assessment/branch/${test.branchId}`}
              className="exam-exit-link"
              title="Return to tests list"
            >
              <X size={16} />
              <span>Exit Portal</span>
            </Link>
          </div>
        </header>

        {/* Sub Header Bar */}
        <div className="exam-sub-bar instructions-sub">
          <div className="exam-sub-test-name">
            <strong>Subject / Topic:</strong> {test.title}
          </div>
          <div className="exam-sub-meta-strip">
            <span>Duration: <strong>{test.duration} Minutes</strong></span>
            <span>Questions: <strong>{test.questionsCount}</strong></span>
            <span>Total Marks: <strong>{test.totalMarks}</strong></span>
          </div>
        </div>

        {/* Main Instructions Split View */}
        <main className="exam-instructions-main">
          <div className="exam-ins-left-panel">
            <div className="exam-ins-head-box">
              <h2>General Instructions</h2>
              <p>Please read the instructions carefully before starting the assessment.</p>
            </div>

            <div className="exam-ins-content">
              <h3 className="exam-ins-section-title">1. Examination Details & Clock Rules</h3>
              <ol className="exam-ins-list">
                <li>
                  Total duration of examination is <strong>{test.duration} minutes</strong>.
                </li>
                <li>
                  The clock will be set at the server. The countdown timer in the top right corner of the screen will display the remaining time available for you to complete the examination.
                </li>
                <li>
                  When the timer reaches zero (00:00:00), the examination will end automatically. You will not be required to manually submit your examination upon timeout.
                </li>
              </ol>

              <h3 className="exam-ins-section-title">2. Question Palette Status Legend</h3>
              <p className="exam-ins-subtext">
                The Question Palette displayed on the right side of the screen will show the status of each question using the following standard symbols:
              </p>

              <div className="exam-ins-legend-table">
                <div className="exam-ins-legend-row">
                  <span className="legend-badge-icon not-visited">1</span>
                  <div>
                    <strong>You have not visited the question yet.</strong> (White/Gray border)
                  </div>
                </div>
                <div className="exam-ins-legend-row">
                  <span className="legend-badge-icon not-answered">2</span>
                  <div>
                    <strong>You have not answered the question.</strong> (Red shield)
                  </div>
                </div>
                <div className="exam-ins-legend-row">
                  <span className="legend-badge-icon answered">3</span>
                  <div>
                    <strong>You have answered the question.</strong> (Green shield)
                  </div>
                </div>
                <div className="exam-ins-legend-row">
                  <span className="legend-badge-icon marked">4</span>
                  <div>
                    <strong>You have NOT answered the question, but have marked the question for review.</strong> (Purple circle)
                  </div>
                </div>
                <div className="exam-ins-legend-row">
                  <span className="legend-badge-icon answered-marked">5</span>
                  <div>
                    <strong>The question is Answered and Marked for Review.</strong> This response will be evaluated for scoring. (Purple circle with green dot)
                  </div>
                </div>
              </div>

              <h3 className="exam-ins-section-title">3. Navigating to Questions</h3>
              <ul className="exam-ins-list bullets">
                <li>Click on the question number in the Question Palette to jump directly to that question.</li>
                <li>Click on <strong>Save & Next</strong> to save your answer for the current question and proceed to the next question.</li>
                <li>Click on <strong>Mark for Review & Next</strong> to mark the question for review and proceed to the next question.</li>
              </ul>

              <h3 className="exam-ins-section-title">4. Answering Multiple Choice Questions</h3>
              <ul className="exam-ins-list bullets">
                <li>To select your answer, click on the radio button corresponding to one of the options.</li>
                <li>To deselect your chosen answer, click on the <strong>Clear Response</strong> button at the bottom left.</li>
                <li>To change your chosen answer, click on the radio button of another option.</li>
              </ul>

              <h3 className="exam-ins-section-title">5. Marking Scheme</h3>
              <div className="exam-ins-marking-grid">
                <div className="exam-marking-card positive">
                  <div className="mark-val">+{marking.positive}</div>
                  <div className="mark-label">For each correct response</div>
                </div>
                <div className="exam-marking-card negative">
                  <div className="mark-val">-{marking.negative}</div>
                  <div className="mark-label">For each incorrect response</div>
                </div>
                <div className="exam-marking-card zero">
                  <div className="mark-val">0</div>
                  <div className="mark-label">For unattempted questions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Candidate & Declaration Panel */}
          <aside className="exam-ins-right-panel">
            {/* Candidate Card */}
            <div className="exam-ins-candidate-card">
              <div className="exam-candidate-avatar">
                {candidateInitials}
              </div>
              <div className="exam-candidate-details">
                <div className="exam-candidate-name">{candidateName}</div>
                <div className="exam-candidate-meta">Candidate ID: <strong>UP-{testId?.slice(-6)?.toUpperCase() || '2026'}</strong></div>
                <div className="exam-candidate-meta">Allotted Terminal: <strong>Lab Node 042</strong></div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="exam-ins-box">
              <label className="exam-field-label" htmlFor="ins-lang-select">Choose your default language:</label>
              <select
                id="ins-lang-select"
                className="exam-select-input"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
              <p className="exam-help-text">Please note all questions appear in your default language.</p>
            </div>

            {/* Declaration Checkbox */}
            <div className="exam-ins-declaration-box">
              <label className="exam-declaration-label">
                <input
                  type="checkbox"
                  className="exam-checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                />
                <span className="exam-declaration-text">
                  I have read and understood all instructions above. All computer hardware & software allotted to me are in proper working condition. I agree that in case of not adhering to the rules, I shall be liable to be debarred from this examination.
                </span>
              </label>
            </div>

            {/* Start Button */}
            <div className="exam-ins-action-box">
              <button
                type="button"
                className={`exam-begin-btn ${declarationChecked ? 'ready' : 'disabled'}`}
                disabled={!declarationChecked}
                onClick={handleStartExam}
              >
                <span>I am ready to begin</span>
                <ArrowRight size={18} />
              </button>
              {!declarationChecked && (
                <div className="exam-agree-warning">
                  * Please check the declaration checkbox to enable the test.
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    )
  }

  /* =========================================================
      3. RESULT & REVIEW SCREEN
      ========================================================= */
  if (phase === 'result') {
    const res = attempt?.result || {}
    const questionsList = review?.questions || test.questions || []
    const totalMarks = test.totalMarks || (test.questionsCount * marking.positive)

    return (
      <div className="exam-dedicated-portal result-mode">
        {/* Result Top Bar */}
        <header className="exam-top-nav">
          <div className="exam-top-title-group">
            <Award size={20} color="#1a73e8" />
            <h1 className="exam-top-title">Assessment Report — {test.title}</h1>
          </div>
          <div className="exam-top-actions">
            <Link to="/assessment" className="exam-nav-btn primary">
              <ArrowLeft size={14} />
              <span>Assessment Centre</span>
            </Link>
          </div>
        </header>

        <main className="exam-result-container">
          {/* Score Summary Banner */}
          <div className="exam-score-card">
            <div className="exam-score-hero">
              <div className="exam-score-circle">
                <div className="score-num">{res.score ?? 0}</div>
                <div className="score-max">/ {totalMarks}</div>
              </div>
              <div className="exam-score-details">
                <h2 className="score-title">Test Completed Successfully!</h2>
                <p className="score-subtitle">
                  Great effort! Here is your comprehensive evaluation breakdown and question-level review.
                </p>
                <div className="score-pills-row">
                  <div className="score-pill">
                    <span>Accuracy:</span>
                    <strong>{res.accuracy ?? 0}%</strong>
                  </div>
                  <div className="score-pill">
                    <span>Time Taken:</span>
                    <strong>{formatSecs(res.timeTakenSeconds ?? 0)}</strong>
                  </div>
                  <div className="score-pill">
                    <span>Candidate:</span>
                    <strong>{candidateName}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Metric Boxes */}
            <div className="exam-analytics-grid">
              <div className="metric-box correct">
                <div className="metric-count">{res.correct ?? 0}</div>
                <div className="metric-name">Correct</div>
              </div>
              <div className="metric-box incorrect">
                <div className="metric-count">{res.incorrect ?? 0}</div>
                <div className="metric-name">Incorrect</div>
              </div>
              <div className="metric-box unattempted">
                <div className="metric-count">{res.unattempted ?? 0}</div>
                <div className="metric-name">Unattempted</div>
              </div>
              <div className="metric-box total">
                <div className="metric-count">{questionsList.length}</div>
                <div className="metric-name">Total Questions</div>
              </div>
            </div>
          </div>

          {/* Solutions & Explanation List */}
          <div className="exam-review-section">
            <h3 className="exam-review-heading">
              <FileText size={18} />
              <span>Question Analysis & Verified Explanations</span>
            </h3>

            <div className="exam-review-list">
              {questionsList.map((q, qIndex) => {
                const userAns = attempt?.answers?.[q.id]
                const isCorrect = userAns !== undefined && userAns === q.correctAnswer
                const isUnattempted = userAns === undefined

                return (
                  <article
                    key={q.id}
                    className={`exam-review-item ${
                      isUnattempted ? 'unattempted' : isCorrect ? 'correct' : 'incorrect'
                    }`}
                  >
                    <div className="review-item-header">
                      <span className="review-q-num">Question {qIndex + 1}</span>
                      <span
                        className={`review-badge ${
                          isUnattempted ? 'unattempted' : isCorrect ? 'correct' : 'incorrect'
                        }`}
                      >
                        {isUnattempted ? 'Unattempted' : isCorrect ? 'Correct (+1)' : 'Incorrect (-0.25)'}
                      </span>
                    </div>

                    <p className="review-q-text">{q.text}</p>

                    <div className="review-options-grid">
                      {q.options.map((optText, optIdx) => {
                        const isUserChoice = userAns === optIdx
                        const isRightAnswer = q.correctAnswer === optIdx

                        let optClass = 'neutral'
                        if (isRightAnswer) optClass = 'right'
                        else if (isUserChoice && !isCorrect) optClass = 'wrong'

                        return (
                          <div key={optIdx} className={`review-option-pill ${optClass}`}>
                            <span className="review-opt-letter">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="review-opt-text">{optText}</span>
                            {isRightAnswer && <Check size={14} className="review-check-icon" />}
                            {isUserChoice && !isRightAnswer && <X size={14} className="review-x-icon" />}
                          </div>
                        )
                      })}
                    </div>

                    {q.explanation && (
                      <div className="review-explanation-box">
                        <strong>Explanation:</strong>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            <div className="exam-result-bottom-actions">
              <Link to="/assessment" className="exam-nav-btn primary">
                Explore More Assessments
              </Link>
              <Link to={`/assessment/branch/${test.branchId}`} className="exam-nav-btn">
                Back to {test.title} Branch
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* =========================================================
      4. ACTIVE EXAM SCREEN (Exact Match with Reference Image)
      ========================================================= */
  return (
    <div className="exam-dedicated-portal exam-live-mode">
      {/* 1. TOP BAR */}
      <header className="exam-top-nav">
        <div className="exam-top-title-group">
          <h1 className="exam-top-title">
            1. {test.title}
          </h1>
        </div>

        <div className="exam-top-actions">
          <button
            type="button"
            className="exam-instructions-link"
            onClick={() => setShowInstructionsModal(true)}
          >
            <Info size={15} />
            <span>Test Instructions</span>
          </button>

          {/* Digital Timer (HH : MM : SS in separate blocks) */}
          <div className={`exam-digital-timer-box ${timer < 300000 ? 'warning' : ''}`}>
            <Clock size={16} />
            <span className="exam-timer-label">Time Left:</span>
            <div className="exam-digital-digits">
              <span className="exam-digit-block">{hrs}</span>
              <span className="exam-digit-colon">:</span>
              <span className="exam-digit-block">{mins}</span>
              <span className="exam-digit-colon">:</span>
              <span className="exam-digit-block">{secs}</span>
            </div>
          </div>

          <button
            type="button"
            className="exam-icon-btn small"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </header>

      {/* 2. SUB-BAR: SECTION TABS */}
      <div className="exam-sub-bar">
        <button
          type="button"
          className="exam-sub-arrow"
          aria-label="Previous section"
          onClick={() => handleJumpToQuestion(Math.max(0, currentIdx - 5))}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="exam-section-tab active">
          <span>{currentQuestion?.topic || test.title}</span>
        </div>

        <button
          type="button"
          className="exam-sub-arrow"
          aria-label="Next section"
          onClick={() => handleJumpToQuestion(Math.min(total - 1, currentIdx + 5))}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 3. MAIN STAGE */}
      <div className="exam-main-stage">
        {/* LEFT COLUMN: QUESTION PANEL */}
        <div className="exam-q-panel">
          {/* Question Header Strip */}
          <div className="exam-q-header-strip">
            <div className="exam-q-number-title">
              Question-{currentIdx + 1}
            </div>

            <div className="exam-q-center-meta">
              <div className="exam-marking-scheme">
                <span>Marking Scheme :</span>
                <span className="scheme-badge positive">+{marking.positive}</span>
                <span className="scheme-badge negative">-{marking.negative}</span>
              </div>

              <div className="exam-q-timer" title="Time spent on this question">
                <Clock size={13} />
                <span>{formatSecs(questionTimer)}</span>
              </div>
            </div>

            <div className="exam-q-header-actions">
              <button
                type="button"
                className={`exam-q-action-btn review ${isQuestionMarked ? 'marked' : ''}`}
                onClick={handleToggleMarkForReview}
              >
                <Eye size={13} />
                <span>{isQuestionMarked ? 'Marked' : 'Mark for review'}</span>
              </button>

              <button
                type="button"
                className="exam-q-action-btn save"
                onClick={handleNextQuestion}
              >
                <Check size={13} />
                <span>Save</span>
              </button>

              <button
                type="button"
                className="exam-q-action-btn more"
                aria-label="More options"
                onClick={() => setShowInstructionsModal(true)}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          </div>

          {/* Question Card Box */}
          <div className="exam-q-card-box">
            <div className="exam-q-statement">
              {currentQuestion?.text}
            </div>

            {/* Options List */}
            <div className="exam-options-list" role="radiogroup">
              {currentQuestion?.options.map((optionText, optIdx) => {
                const isSelected = attempt?.answers?.[currentQuestion.id] === optIdx
                return (
                  <label
                    key={optIdx}
                    className={`exam-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      className="exam-radio-input"
                      checked={isSelected}
                      onChange={() => handleSelectOption(optIdx)}
                    />
                    <span className="exam-option-text">{optionText}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TCS iON / NTA SIDEBAR */}
        <aside className="exam-right-sidebar">
          {/* Candidate Profile Box */}
          <div className="exam-candidate-profile">
            <div className="exam-candidate-avatar">
              {candidateInitials}
            </div>
            <div className="exam-candidate-name">
              {candidateName}
            </div>
          </div>

          {/* Questions Count & Section Instructions Header */}
          <div className="exam-palette-subhead">
            <div>Questions : <strong>{total}</strong></div>
            <button
              type="button"
              className="exam-section-ins-link"
              onClick={() => setShowInstructionsModal(true)}
            >
              <Info size={13} />
              <span>Section Instructions</span>
            </button>
          </div>

          {/* 5 Status Legends with exact Counts */}
          <div className="exam-status-legend-grid">
            <div className="exam-legend-item">
              <span className="legend-badge-icon not-answered">{summary.notAnswered}</span>
              <span>Not Answered</span>
            </div>

            <div className="exam-legend-item">
              <span className="legend-badge-icon answered">{summary.answered}</span>
              <span>Answered</span>
            </div>

            <div className="exam-legend-item">
              <span className="legend-badge-icon marked">{summary.marked}</span>
              <span>Marked for Review</span>
            </div>

            <div className="exam-legend-item">
              <span className="legend-badge-icon not-visited">{summary.notVisited}</span>
              <span>Not Visited</span>
            </div>

            <div className="exam-legend-item full-span">
              <span className="legend-badge-icon answered-marked">{summary.answeredMarked}</span>
              <span>Answered and Marked for Review</span>
            </div>
          </div>

          {/* Section Heading */}
          <div className="exam-palette-section-title">
            {currentQuestion?.topic || test.title}
          </div>

          {/* 5-Column Question Palette Grid */}
          <div className="exam-question-palette-grid">
            {test.questions.map((q, idx) => {
              const status = getQuestionStatus(q.id)
              const isActive = idx === currentIdx

              return (
                <button
                  key={q.id}
                  type="button"
                  className={`exam-palette-q-btn ${status} ${isActive ? 'active' : ''}`}
                  onClick={() => handleJumpToQuestion(idx)}
                  title={`Question ${idx + 1}: ${status.replace('-', ' ')}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      {/* 4. BOTTOM NAVIGATION BAR */}
      <footer className="exam-bottom-bar">
        <div className="exam-bottom-left">
          <button
            type="button"
            className="exam-nav-btn"
            onClick={handleClearResponse}
            disabled={!isQuestionAnswered}
          >
            <Eraser size={14} />
            <span>Clear Response</span>
          </button>
        </div>

        <div className="exam-bottom-center">
          <button
            type="button"
            className="exam-nav-btn"
            onClick={handlePrevQuestion}
            disabled={currentIdx <= 0}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <button
            type="button"
            className="exam-nav-btn"
            onClick={handleMarkAndNext}
          >
            <Eye size={14} />
            <span>Mark for Review & Next</span>
          </button>

          <button
            type="button"
            className="exam-nav-btn primary"
            onClick={handleNextQuestion}
          >
            <span>Save & Next</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="exam-bottom-right">
          <button
            type="button"
            className="exam-nav-btn submit"
            onClick={() => setShowSubmitConfirm(true)}
          >
            Submit Test
          </button>
        </div>
      </footer>

      {/* INSTRUCTIONS POPUP MODAL */}
      {showInstructionsModal && (
        <div className="exam-modal-overlay" onClick={() => setShowInstructionsModal(false)}>
          <div className="exam-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-title">
              <span>Test Instructions</span>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="exam-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-content">
              <ul className="exam-modal-ins-list">
                <li><strong>Duration:</strong> {test.duration} minutes total examination window.</li>
                <li><strong>Total Questions:</strong> {test.questionsCount} multiple-choice questions.</li>
                <li><strong>Marking Scheme:</strong> +{marking.positive} marks for each correct response, −{marking.negative} marks for incorrect response.</li>
                <li><strong>Palette Symbols:</strong>
                  <ul>
                    <li><span className="legend-mini not-answered" /> Red Shield = Not Answered</li>
                    <li><span className="legend-mini answered" /> Green Shield = Answered</li>
                    <li><span className="legend-mini marked" /> Purple Circle = Marked for Review</li>
                    <li><span className="legend-mini answered-marked" /> Purple + Green Dot = Answered & Marked for Review</li>
                    <li><span className="legend-mini not-visited" /> Gray Box = Not Visited</li>
                  </ul>
                </li>
                <li><strong>Auto-Submission:</strong> The examination will submit automatically upon timer completion.</li>
              </ul>
            </div>
            <div className="exam-modal-actions">
              <button
                type="button"
                className="exam-nav-btn primary"
                onClick={() => setShowInstructionsModal(false)}
              >
                Back to Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitConfirm && (
        <div className="exam-modal-overlay" onClick={() => setShowSubmitConfirm(false)}>
          <div className="exam-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-title">
              <span>Submit Assessment</span>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="exam-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="exam-modal-p">
              Are you sure you want to submit your assessment? Once submitted, you cannot modify your answers.
            </p>
            <div className="exam-modal-summary-grid">
              <div className="modal-stat-item">
                <span>Answered:</span>
                <strong style={{ color: '#2e7d32' }}>{summary.answered}</strong>
              </div>
              <div className="modal-stat-item">
                <span>Marked for Review:</span>
                <strong style={{ color: '#5e35b1' }}>{summary.marked}</strong>
              </div>
              <div className="modal-stat-item">
                <span>Not Answered:</span>
                <strong style={{ color: '#e53935' }}>{summary.notAnswered}</strong>
              </div>
              <div className="modal-stat-item">
                <span>Not Visited:</span>
                <strong>{summary.notVisited}</strong>
              </div>
            </div>
            <div className="exam-modal-actions">
              <button
                type="button"
                className="exam-nav-btn"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Continue Exam
              </button>
              <button
                type="button"
                className="exam-nav-btn submit"
                onClick={handleFinalSubmit}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
