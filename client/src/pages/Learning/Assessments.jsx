import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Search, ShieldCheck } from 'lucide-react'
import { assessmentAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './Assessments.css'

export default function Assessments() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [stats, setStats] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [duration, setDuration] = useState('all')
  const [questionType, setQuestionType] = useState('all')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    const requests = [assessmentAPI.getAll()]
    if (user) requests.push(assessmentAPI.getHistory())
    Promise.all(requests)
      .then(([catalog, history]) => {
        if (!active) return
        setAssessments(catalog.data)
        setStats(history?.data.stats || null)
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Assessments could not be loaded. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user])

  const categories = useMemo(() => [...new Set(assessments.map((item) => item.category))].sort(), [assessments])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return assessments
      .filter((item) => category === 'all' || item.category === category)
      .filter((item) => difficulty === 'all' || item.difficulty === difficulty)
      .filter((item) => duration === 'all'
        || (duration === 'short' && item.durationMinutes <= 15)
        || (duration === 'medium' && item.durationMinutes > 15 && item.durationMinutes <= 30)
        || (duration === 'long' && item.durationMinutes > 30))
      .filter((item) => questionType === 'all' || item.questionTypes?.includes(questionType))
      .filter((item) => !needle || `${item.title} ${item.description} ${item.skills.join(' ')}`.toLowerCase().includes(needle))
      .sort((first, second) => {
        if (sort === 'difficulty') return ['Beginner', 'Intermediate', 'Advanced'].indexOf(first.difficulty) - ['Beginner', 'Intermediate', 'Advanced'].indexOf(second.difficulty)
        if (sort === 'recommended') {
          const rank = (item) => item.status === 'in_progress' ? 0 : item.status === 'available' ? 1 : 2
          return rank(first) - rank(second) || (first.bestScore || 0) - (second.bestScore || 0)
        }
        return 0
      })
  }, [assessments, category, difficulty, duration, questionType, query, sort])

  return (
    <div className="assessment-page container">
      <section className="assessment-heading">
        <div>
          <span className="assessment-eyebrow">Skill checks · Practice · Interview preparation</span>
          <h1>Assessments</h1>
          <p>Measure your skills with timed, scored assessments. Your answers and results are saved to your account.</p>
        </div>
        {user?.role === 'admin' && <Link className="assessment-admin-link" to="/assessments/admin">Manage assessments</Link>}
      </section>
      <p className="assessment-unavailable" role="status">
        Coding challenges are unavailable until a secure server-side code-judging service is configured. No submitted source code is executed by this application.
      </p>

      {user && (
        <section className="assessment-stats" aria-label="Your assessment statistics">
          <div><strong>{stats?.attempted ?? '—'}</strong><span>Attempts</span></div>
          <div><strong>{stats?.completed ?? '—'}</strong><span>Completed</span></div>
          <div><strong>{stats ? `${stats.bestScore}%` : '—'}</strong><span>Best score</span></div>
          {!stats && <span className="assessment-muted">Loading your history…</span>}
        </section>
      )}

      <section className="assessment-filters" aria-label="Filter assessments">
        <label className="assessment-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search by assessment or skill</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assessments or skills" />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by difficulty</span>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="all">All difficulties</option>
            {['Beginner', 'Intermediate', 'Advanced'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by duration</span>
          <select value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="all">All durations</option>
            <option value="short">15 minutes or less</option>
            <option value="medium">16–30 minutes</option>
            <option value="long">Over 30 minutes</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by question format</span>
          <select value={questionType} onChange={(event) => setQuestionType(event.target.value)}>
            <option value="all">All question formats</option>
            <option value="single_choice">Single choice</option>
            <option value="multiple_choice">Multiple select</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort assessments</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="recommended">Recommended</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </label>
      </section>

      {error && <p className="assessment-alert" role="alert">{error}</p>}
      {loading && <p className="assessment-empty" role="status">Loading assessments…</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="assessment-empty">No assessments match these filters.</p>
      )}

      <section className="assessment-grid" aria-label="Available assessments">
        {filtered.map((assessment) => (
          <article className="assessment-card" key={assessment.id}>
            <div className="assessment-card-top">
              <span className="assessment-category">{assessment.category}</span>
              <span className={`assessment-status ${assessment.status || 'available'}`}>
                {assessment.status === 'in_progress' ? 'In progress' : assessment.status === 'completed' ? 'Attempted' : 'Available'}
              </span>
            </div>
            <h2>{assessment.title}</h2>
            <p>{assessment.description}</p>
            <div className="assessment-tags">
              {assessment.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
            <div className="assessment-meta">
              <span>{assessment.difficulty}</span>
              <span><Clock3 size={15} />{assessment.durationMinutes} min</span>
              <span>{assessment.questionCount} questions · {assessment.questionTypes?.map((type) => type === 'multiple_choice' ? 'multiple select' : 'single choice').join(', ')}</span>
            </div>
            {user && assessment.status === 'completed' && <p className="assessment-best-score">Best result: {assessment.bestScore}%</p>}
            <div className="assessment-card-actions">
              <Link className="assessment-card-action" to={`/assessments/${assessment.slug}`}>
                {assessment.status === 'in_progress' ? 'Continue assessment' : assessment.status === 'completed' ? 'Details and retry' : 'View assessment'}
                <ArrowRight size={16} />
              </Link>
              {assessment.status === 'completed' && assessment.latestAttemptId && (
                <Link className="assessment-card-secondary-action" to={`/assessments/${assessment.slug}/attempt/${assessment.latestAttemptId}`}>
                  Review latest result
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
      <p className="assessment-privacy"><ShieldCheck size={16} /> Scores are calculated and stored by the server for your account.</p>
    </div>
  )
}
