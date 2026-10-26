import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock3, ListChecks } from 'lucide-react'
import { assessmentAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './Assessments.css'

export default function AssessmentDetail() {
  const { assessmentId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    assessmentAPI.getOne(assessmentId)
      .then((response) => { if (active) setAssessment(response.data) })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Assessment details could not be loaded.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [assessmentId])

  const startAssessment = useCallback(async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname, startAssessment: true } })
      return
    }
    setStarting(true)
    setError('')
    try {
      const response = await assessmentAPI.start(assessmentId)
      navigate(`/assessments/${assessmentId}/attempt/${response.data.id}`, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not start the assessment. Please retry.')
    } finally {
      setStarting(false)
    }
  }, [user, navigate, location.pathname, assessmentId])

  useEffect(() => {
    if (authLoading || !user || !location.state?.startAssessment || !assessment) return
    navigate(location.pathname, { replace: true, state: null })
    startAssessment()
  }, [authLoading, user, location.state, location.pathname, assessment, navigate, startAssessment])

  if (loading) return <div className="assessment-page container"><p role="status">Loading assessment…</p></div>
  if (!assessment) {
    return <div className="assessment-page container"><p className="assessment-alert" role="alert">{error || 'Assessment not found.'}</p><Link to="/assessments">Back to assessments</Link></div>
  }

  return (
    <div className="assessment-page container">
      <Link className="assessment-back" to="/assessments"><ArrowLeft size={16} /> All assessments</Link>
      <article className="assessment-detail">
        <span className="assessment-category">{assessment.category}</span>
        <h1>{assessment.title}</h1>
        <p>{assessment.description}</p>
        <div className="assessment-tags">{assessment.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        <div className="assessment-detail-facts">
          <span><Clock3 size={18} /> {assessment.durationMinutes} minutes</span>
          <span><ListChecks size={18} /> {assessment.questionCount} questions · {assessment.questionTypes?.map((type) => type === 'multiple_choice' ? 'multiple select' : 'single choice').join(', ')}</span>
          <span>{assessment.difficulty}</span>
          {assessment.passPercent != null && <span>Pass threshold: {assessment.passPercent}%</span>}
          {assessment.attemptLimit != null && <span>Attempts allowed: {assessment.attemptLimit}</span>}
        </div>
        <div className="assessment-instructions">
          <h2>Before you begin</h2>
          <ul>
            <li>Your attempt starts on the server when you launch and ends when the time limit expires.</li>
            <li>Your selected answers are saved as you work; you may revisit questions before submitting.</li>
            <li>The server scores the submitted answers. {assessment.reviewAnswers ? 'Answer explanations are available after submission.' : 'Question review is disabled for this assessment.'}</li>
            <li>You can resume an active attempt from this page.</li>
          </ul>
        </div>
        {error && <p className="assessment-alert" role="alert">{error}</p>}
        <button type="button" className="assessment-primary" disabled={starting || authLoading} onClick={startAssessment}>
          {starting ? 'Opening your attempt…' : user ? 'Start or continue assessment' : 'Sign in to start'}
          <ArrowRight size={17} />
        </button>
      </article>
    </div>
  )
}
