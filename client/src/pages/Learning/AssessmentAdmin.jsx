import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { assessmentAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './Assessments.css'

const blankAssessment = {
  slug: 'new-assessment',
  title: '',
  description: '',
  category: '',
  skills: [],
  difficulty: 'Beginner',
  durationMinutes: 15,
  passPercent: 70,
  attemptLimit: 3,
  reviewAnswers: true,
  published: false,
  questions: [{
    prompt: '',
    type: 'single_choice',
    options: ['', ''],
    correctAnswer: 0,
    explanation: '',
    points: 1,
  }],
}

export default function AssessmentAdmin() {
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [results, setResults] = useState(null)
  const [selectedResult, setSelectedResult] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [content, setContent] = useState(JSON.stringify(blankAssessment, null, 2))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (user.role !== 'admin') {
      setError('An administrator account is required to manage assessment content.')
      setLoading(false)
      return
    }
    let active = true
    Promise.all([assessmentAPI.adminList(), assessmentAPI.adminResults()])
      .then(([catalog, resultData]) => {
        if (!active) return
        setAssessments(catalog.data)
        setResults(resultData.data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load assessment administration data.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [authLoading, user, navigate, location.pathname])

  const selectAssessment = (id) => {
    setSelectedId(id)
    const item = assessments.find((assessment) => String(assessment._id) === id)
    setContent(JSON.stringify(item || blankAssessment, null, 2))
    setError('')
    setMessage('')
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const data = JSON.parse(content)
      if (selectedId) await assessmentAPI.update(selectedId, data)
      else await assessmentAPI.create(data)
      const response = await assessmentAPI.adminList()
      setAssessments(response.data)
      setMessage('Assessment saved.')
      if (!selectedId && response.data.length) {
        const created = response.data.find((item) => item.slug === data.slug)
        if (created) selectAssessment(String(created._id))
      } else {
        const updated = response.data.find((item) => String(item._id) === selectedId)
        if (updated) setContent(JSON.stringify(updated, null, 2))
      }
    } catch (requestError) {
      setError(requestError instanceof SyntaxError
        ? 'Assessment JSON is invalid. Correct the JSON and try again.'
        : requestError.response?.data?.message || 'Could not save this assessment.')
    } finally {
      setSaving(false)
    }
  }

  const viewResult = async (id) => {
    setSelectedResult(null)
    setError('')
    try {
      const response = await assessmentAPI.adminAttempt(id)
      setSelectedResult(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load this attempt.')
    }
  }

  return (
    <div className="assessment-page container">
      <Link className="assessment-back" to="/assessments">← Assessments</Link>
      <h1>Assessment administration</h1>
      <p className="assessment-muted">Create, edit, publish, and configure assessment questions. Correct answers are only available in this administrator view.</p>
      {error && <p className="assessment-alert" role="alert">{error}</p>}
      {message && <p className="assessment-admin-success" role="status">{message}</p>}
      {loading ? <p role="status">Loading assessments…</p> : user?.role === 'admin' && (
        <>
          <div className="assessment-admin-layout">
            <aside className="assessment-admin-list">
              <button type="button" className="assessment-secondary" onClick={() => selectAssessment('')}>New assessment</button>
              {assessments.map((item) => (
                <button
                  type="button"
                  key={item._id}
                  className={`assessment-admin-item ${selectedId === String(item._id) ? 'selected' : ''}`}
                  onClick={() => selectAssessment(String(item._id))}
                >
                  {item.title}<span>{item.published ? 'Published' : 'Draft'}</span>
                </button>
              ))}
            </aside>
            <form className="assessment-admin-editor" onSubmit={save}>
              <label htmlFor="assessment-json">Assessment configuration (JSON)</label>
              <textarea id="assessment-json" value={content} onChange={(event) => setContent(event.target.value)} spellCheck="false" />
              <button type="submit" className="assessment-primary" disabled={saving}>
                {saving ? 'Saving…' : selectedId ? 'Save assessment' : 'Create assessment'}
              </button>
            </form>
          </div>
          <section className="assessment-admin-results">
            <h2>Attempt results</h2>
            {results && (
              <div className="assessment-admin-summary">
                <span>{results.summary.totalAttempts} attempts</span>
                <span>{results.summary.finishedAttempts} finished</span>
                <span>{results.summary.averagePercentage == null ? 'No scores yet' : `Average ${Math.round(results.summary.averagePercentage)}%`}</span>
                <span>{results.summary.bestPercentage == null ? 'No best score yet' : `Best ${results.summary.bestPercentage}%`}</span>
              </div>
            )}
            {selectedResult && (
              <article className="assessment-admin-attempt">
                <button type="button" className="assessment-secondary" onClick={() => setSelectedResult(null)}>Close attempt</button>
                <h3>{selectedResult.assessment.title}</h3>
                <p>{selectedResult.user?.name} · {selectedResult.user?.email} · {selectedResult.status}</p>
                {selectedResult.result && <p>{selectedResult.result.percentage}% · {selectedResult.result.correctCount} correct · {selectedResult.result.incorrectCount} incorrect · {selectedResult.result.unansweredCount} unanswered</p>}
                {selectedResult.questions.map((question, index) => (
                  <div key={question.id} className="assessment-review-question">
                    <strong>{index + 1}. {question.prompt}</strong>
                    {question.options.map((option, optionIndex) => (
                      <p className={optionIndex === question.correctAnswer ? 'assessment-answer-correct' : optionIndex === question.answer ? 'assessment-answer-wrong' : ''} key={option}>
                        {optionIndex === question.answer ? 'Learner answer: ' : optionIndex === question.correctAnswer ? 'Correct: ' : ''}{option}
                      </p>
                    ))}
                  </div>
                ))}
              </article>
            )}
            <div className="assessment-admin-table-wrap">
              <table className="assessment-admin-table">
                <thead><tr><th>Learner</th><th>Assessment</th><th>Status</th><th>Score</th><th>Attempt</th></tr></thead>
                <tbody>
                  {results?.attempts.map((item) => (
                    <tr key={item.id}>
                      <td>{item.user ? `${item.user.name} (${item.user.email})` : 'User unavailable'}</td>
                      <td>{item.assessment?.title || 'Assessment unavailable'}</td>
                      <td>{item.status}</td>
                      <td>{item.percentage == null ? '—' : `${item.percentage}%`}</td>
                      <td><button type="button" className="assessment-review-toggle" onClick={() => viewResult(item.id)}>View</button></td>
                    </tr>
                  ))}
                  {results?.attempts.length === 0 && <tr><td colSpan="5">No assessment attempts recorded.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
