import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Target,
  FileQuestion,
  AlertTriangle,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { fetchBranch, fetchBranchTests } from '../services/assessmentService'
import './AssessmentBranchTests.css'

const DIFFICULTY_CLASS = {
  Beginner: 'green',
  Intermediate: 'amber',
  Advanced: 'red',
}

export default function AssessmentBranchTests() {
  const { branchId } = useParams()
  const [query, setQuery] = useState('')

  // `null` means the request is still in flight.
  const [branch, setBranch] = useState(null)
  const [tests, setTests] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!branchId) return
    let cancelled = false

    setBranch(null)
    setTests(null)
    setError(false)

    fetchBranch(branchId)
      .then((res) => {
        if (cancelled) return
        setBranch(res.data ?? null)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    fetchBranchTests(branchId)
      .then((res) => {
        if (cancelled) return
        setTests(res.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [branchId])

  const filtered = useMemo(() => {
    const list = tests ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        (t.difficulty ?? '').toLowerCase().includes(q)
    )
  }, [tests, query])

  // ---------- LOADING ----------
  if (!error && (branch === null || tests === null)) {
    return (
      <div className="asm-branch-page">
        <section className="asm-branch-head">
          <div className="container">
            <div className="asm-skeleton-bar" />
            <div className="asm-skeleton-line" />
            <div className="asm-skeleton-line short" />
          </div>
        </section>
        <section className="asm-branch-section">
          <div className="container">
            <div className="asm-test-grid" aria-busy="true" aria-live="polite">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="asm-test-card asm-test-skeleton" />
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ---------- ERROR ----------
  if (error) {
    return (
      <div className="asm-branch-page">
        <div className="container" style={{ padding: '64px 0' }}>
          <div className="asm-empty">
            <AlertCircle size={30} />
            <h2>Could not load this branch</h2>
            <p>
              The branch could not be loaded. It may have been moved or removed. Please go back and
              pick another one.
            </p>
            <Link to="/assessment" className="asm-btn">
              <span>Browse other branches</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Unknown branch id -> graceful fallback rather than a blank screen.
  if (!branch) return <Navigate to="/assessment" replace />

  const totalQuestions = tests.reduce((sum, t) => sum + t.questionsCount, 0)

  return (
    <div className="asm-branch-page">
      {/* =====================================================
          HEADER
          ===================================================== */}
      <section className="asm-branch-head">
        <div className="container">
          <Link to="/assessment" className="asm-back">
            <ArrowLeft size={15} />
            All Branches
          </Link>

          <div className="asm-branch-eyebrow">{branch.shortName}</div>
          <h1 className="asm-branch-title">{branch.name}</h1>
          <p className="asm-branch-desc">{branch.description}</p>

          <div className="asm-branch-stats">
            <div className="asm-branch-stat">
              <FileQuestion size={16} />
              <span>
                <strong>{tests.length}</strong> {tests.length === 1 ? 'test' : 'tests'}
              </span>
            </div>
            <div className="asm-branch-stat">
              <Target size={16} />
              <span>
                <strong>{totalQuestions}</strong> questions
              </span>
            </div>
            <div className="asm-branch-stat">
              <Clock size={16} />
              <span>
                <strong>{tests.reduce((s, t) => s + t.duration, 0)}</strong> min total
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TEST LIST
          ===================================================== */}
      <section className="asm-branch-section">
        <div className="container">
          {/* Search / filter */}
          {tests.length > 0 && (
            <div className="asm-toolbar">
              <div className="asm-search">
                <Search size={16} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tests by name or topic…"
                  aria-label="Search tests"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="asm-search-clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span className="asm-toolbar-count">
                {filtered.length} of {tests.length} {tests.length === 1 ? 'test' : 'tests'}
              </span>
            </div>
          )}

          {tests.length === 0 ? (
            /* ---------- EMPTY STATE ---------- */
            <div className="asm-empty">
              <AlertTriangle size={30} />
              <h2>No tests in this branch yet</h2>
              <p>
                We are still writing the question bank for {branch.name}. Try another branch in
                the meantime.
              </p>
              <Link to="/assessment" className="asm-btn">
                <span>Browse other branches</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            /* ---------- NO SEARCH MATCHES ---------- */
            <div className="asm-empty">
              <Search size={30} />
              <h2>No tests match “{query}”</h2>
              <p>Try a different keyword, or clear the search to see every test in this branch.</p>
              <button type="button" onClick={() => setQuery('')} className="asm-btn">
                <span>Clear search</span>
              </button>
            </div>
          ) : (
            /* ---------- TEST CARDS ---------- */
            <div className="asm-test-grid">
              {filtered.map((test) => (
                <article key={test.id} className="asm-test-card">
                  <div className="asm-test-card-top">
                    <span className={`asm-tag ${DIFFICULTY_CLASS[test.difficulty] || 'blue'}`}>
                      {test.difficulty}
                    </span>
                    <span className="asm-test-questions">
                      {test.questionsCount} {test.questionsCount === 1 ? 'question' : 'questions'}
                    </span>
                  </div>

                  <h2 className="asm-test-title">{test.title}</h2>
                  <p className="asm-test-desc">{test.description}</p>

                  <ul className="asm-test-meta">
                    <li>
                      <Clock size={13} />
                      <span>{test.duration} min</span>
                    </li>
                    <li>
                      <Target size={13} />
                      <span>{test.totalMarks} marks</span>
                    </li>
                    <li>
                      <AlertTriangle size={13} />
                      <span>-{test.markingScheme.negative} negative</span>
                    </li>
                  </ul>

                  <div className="asm-test-footer">
                    <span className="asm-test-marks">
                      +{test.markingScheme.positive} for a correct answer
                    </span>
                    <Link to={`/assessment/test/${test.id}`} className="asm-attempt-btn">
                      <span>Attempt Test</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ---------- SAMPLE DATA NOTICE ---------- */}
          {tests.length > 0 && (
            <div className="asm-sample-note" role="note">
              <CheckCircle2 size={16} />
              <p>
                These are <strong>sample questions</strong> written to demonstrate the assessment
                flow. They are not an official, verified or production-ready question bank.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
