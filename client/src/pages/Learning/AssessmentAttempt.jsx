import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag, Send } from 'lucide-react'
import { assessmentAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './Assessments.css'

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export default function AssessmentAttempt() {
  const { attemptId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [answerSaveError, setAnswerSaveError] = useState('')

  const loadAttempt = useCallback(() => {
    return assessmentAPI.getAttempt(attemptId).then((response) => {
      setAttempt(response.data)
      return response.data
    })
  }, [attemptId])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true, state: { from: `${location.pathname}${location.search}${location.hash}` } })
      return
    }
    let active = true
    setLoading(true)
    assessmentAPI.getAttempt(attemptId)
      .then((response) => { if (active) setAttempt(response.data) })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'This assessment attempt could not be loaded.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attemptId, authLoading, user, navigate, location.pathname, location.search, location.hash])

  const submitAttempt = useCallback(async (automatic = false) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const response = await assessmentAPI.submit(attemptId)
      setAttempt(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || (automatic ? 'Time expired, but submission could not be confirmed. Retry submission when connected.' : 'Submission could not be confirmed. Your saved answers remain available; please retry.'))
    } finally {
      setSubmitting(false)
    }
  }, [attemptId, submitting])

  const attemptStatus = attempt?.status
  const attemptExpiresAt = attempt?.expiresAt
  useEffect(() => {
    if (attemptStatus !== 'in_progress' || !attemptExpiresAt) return
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((new Date(attemptExpiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) submitAttempt(true)
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [attemptExpiresAt, attemptStatus, submitAttempt])

  const currentQuestion = attempt?.questions?.[currentIndex]

  const saveQuestion = async (question, updates) => {
    setSaving(true)
    setAnswerSaveError('')
    setError('')
    try {
      await assessmentAPI.saveAnswer(attemptId, question.id, updates)
      await loadAttempt()
    } catch (requestError) {
      if (requestError.response?.data?.attempt) setAttempt(requestError.response.data.attempt)
      const message = requestError.response?.data?.message || 'Answer save failed. Your latest selection may not be stored.'
      setAnswerSaveError(message)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const setAnswer = (question, answer) => {
    setAttempt((previous) => ({
      ...previous,
      questions: previous.questions.map((item) => item.id === question.id ? { ...item, answer } : item),
    }))
    saveQuestion(question, { answer })
  }

  const toggleReview = (question) => {
    const markedForReview = !question.markedForReview
    setAttempt((previous) => ({
      ...previous,
      questions: previous.questions.map((item) => item.id === question.id ? { ...item, markedForReview } : item),
    }))
    saveQuestion(question, { markedForReview })
  }

  if (loading) return <div className="assessment-page container"><p role="status">Loading your attempt…</p></div>
  if (!attempt) return <div className="assessment-page container"><p className="assessment-alert" role="alert">{error || 'Attempt not found.'}</p><Link to="/assessments">Back to assessments</Link></div>

  if (attempt.status !== 'in_progress') {
    const result = attempt.result
    return (
      <div className="assessment-page container">
        <article className="assessment-result">
          <span className="assessment-category">{attempt.assessment.title}</span>
          <h1>{attempt.status === 'timed_out' ? 'Time expired' : 'Assessment result'}</h1>
          {answerSaveError && (
            <p className="assessment-alert" role="alert">
              A recent answer save was not confirmed before the attempt ended. This result includes only answers stored by the server.
            </p>
          )}
          <div className="assessment-score">{result.percentage}%</div>
          <p>{result.score} of {result.maxScore} points · {result.passed == null ? 'No pass threshold configured' : result.passed ? 'Passed' : 'Not passed'}</p>
          <div className="assessment-result-counts">
            <span><CheckCircle2 size={16} /> {result.correctCount} correct</span>
            <span>{result.incorrectCount} incorrect</span>
            <span>{result.unansweredCount} unanswered</span>
          </div>
          <p className="assessment-muted">Submitted {new Date(result.submittedAt).toLocaleString()} · {Math.floor(result.durationSeconds / 60)} min {result.durationSeconds % 60} sec</p>
          {result.reviewAllowed && attempt.questions.length > 0 && (
            <section className="assessment-review">
              <h2>Question review</h2>
              {attempt.questions.map((question, index) => (
                <article key={question.id} className="assessment-review-question">
                  <h3>{index + 1}. {question.prompt}</h3>
                  {question.options.map((option, optionIndex) => (
                    <p className={optionIndex === question.correctAnswer ? 'assessment-answer-correct' : optionIndex === question.answer ? 'assessment-answer-wrong' : ''} key={option}>
                      {optionIndex === question.answer ? 'Your answer: ' : optionIndex === question.correctAnswer ? 'Correct answer: ' : ''}{option}
                    </p>
                  ))}
                  {question.explanation && <p className="assessment-muted">{question.explanation}</p>}
                </article>
              ))}
            </section>
          )}
          <Link to="/assessments" className="assessment-primary">Back to assessments <ArrowRight size={17} /></Link>
        </article>
      </div>
    )
  }

  return (
    <div className="assessment-page assessment-taking container">
      <header className="assessment-taking-header">
        <div>
          <Link to={`/assessments/${attempt.assessment.slug}`} className="assessment-back"><ArrowLeft size={16} /> Exit attempt</Link>
          <h1>{attempt.assessment.title}</h1>
        </div>
        <div className={`assessment-timer ${secondsLeft !== null && secondsLeft < 60 ? 'urgent' : ''}`} aria-live="polite">
          <Clock3 size={18} /> {formatTime(secondsLeft ?? 0)} remaining
        </div>
      </header>

      <div className="assessment-taking-grid">
        <main className="assessment-question-panel">
          {error && <p className="assessment-alert" role="alert">{error}</p>}
          {currentQuestion && (
            <>
              <div className="assessment-question-meta">
                <span>Question {currentIndex + 1} of {attempt.questions.length}</span>
                <span>{currentQuestion.points} point{currentQuestion.points === 1 ? '' : 's'}</span>
              </div>
              <h2>{currentQuestion.prompt}</h2>
              <fieldset className="assessment-options">
                <legend>{currentQuestion.type === 'multiple_choice' ? 'Select all that apply' : 'Select one answer'}</legend>
                {currentQuestion.options.map((option, optionIndex) => {
                  const selected = currentQuestion.type === 'multiple_choice'
                    ? currentQuestion.answer?.includes(optionIndex)
                    : currentQuestion.answer === optionIndex
                  return (
                    <label className={`assessment-option ${selected ? 'selected' : ''}`} key={option}>
                      <input
                        type={currentQuestion.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                        name={`question-${currentQuestion.id}`}
                        checked={!!selected}
                        disabled={saving}
                        onChange={() => {
                          if (currentQuestion.type === 'multiple_choice') {
                            const choices = currentQuestion.answer || []
                            setAnswer(currentQuestion, selected ? choices.filter((choice) => choice !== optionIndex) : [...choices, optionIndex])
                          } else setAnswer(currentQuestion, optionIndex)
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </fieldset>
              <div className="assessment-question-controls">
                <button type="button" className="assessment-secondary" disabled={saving || currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>Previous</button>
                <span role="status">{saving ? 'Saving…' : 'Answers save automatically'}</span>
                <button type="button" className="assessment-secondary" disabled={saving || currentIndex >= attempt.questions.length - 1} onClick={() => setCurrentIndex((index) => index + 1)}>Next</button>
              </div>
            </>
          )}
        </main>

        <aside className="assessment-question-nav">
          <h2>Questions</h2>
          <div className="assessment-question-palette">
            {attempt.questions.map((question, index) => {
              const answered = question.answer !== null && question.answer !== undefined && (!Array.isArray(question.answer) || question.answer.length > 0)
              return (
                <button
                  type="button"
                  key={question.id}
                  className={`${index === currentIndex ? 'current' : ''} ${answered ? 'answered' : ''} ${question.markedForReview ? 'review' : ''}`}
                  disabled={saving}
                  aria-label={`Question ${index + 1}${answered ? ', answered' : ', unanswered'}${question.markedForReview ? ', marked for review' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                >{index + 1}</button>
              )
            })}
          </div>
          <p className="assessment-muted">{attempt.questions.filter((question) => question.answer !== null && question.answer !== undefined && (!Array.isArray(question.answer) || question.answer.length > 0)).length} answered · {attempt.questions.filter((question) => question.markedForReview).length} marked for review</p>
          {currentQuestion && (
            <button type="button" className="assessment-review-toggle" disabled={saving} onClick={() => toggleReview(currentQuestion)}>
              <Flag size={16} /> {currentQuestion.markedForReview ? 'Remove review mark' : 'Mark for review'}
            </button>
          )}
          <button
            type="button"
            className="assessment-submit"
            disabled={saving || submitting || !!answerSaveError}
            onClick={() => {
              if (window.confirm('Submit this assessment now? You cannot change answers after submission.')) submitAttempt()
            }}
          ><Send size={16} /> {submitting ? 'Submitting…' : 'Submit assessment'}</button>
        </aside>
      </div>
    </div>
  )
}
