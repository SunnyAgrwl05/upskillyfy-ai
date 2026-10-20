import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Code2,
  Monitor,
  Cpu,
  Zap,
  Cog,
  Building2,
  Brain,
  Puzzle,
  ArrowRight,
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { fetchBranches } from '../services/assessmentService'
import './AssessmentBranches.css'

const ICONS = {
  Code2,
  Monitor,
  Server: Monitor,
  CircuitBoard: Cpu,
  Zap,
  Cog,
  Building2,
  Brain,
  Puzzle,
}

export default function AssessmentBranches() {
  // `branches` is null while the request is in flight.
  const [branches, setBranches] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchBranches()
      .then((res) => {
        if (cancelled) return
        // Test counts come back with the payload — derived from the
        // actual assessment data, never hardcoded.
        setBranches(res.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="asm-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="asm-hero">
        <div className="container">
          <div className="asm-hero-eyebrow">
            <span className="asm-live-pulse" />
            <span>Assessment Centre</span>
          </div>

          <h1 className="asm-hero-title">
            Choose Your <span className="grad">Branch</span>
          </h1>

          <p className="asm-hero-sub">
            Pick the academic or technical branch you want to test. Each branch contains
            topic-wise timed tests with a configured marking scheme.
          </p>

          <div className="asm-hero-points">
            <li>
              <CheckCircle2 size={15} color="#34a853" />
              <span>Topic-wise question banks</span>
            </li>
            <li>
              <CheckCircle2 size={15} color="#34a883" />
              <span>Timed, graded tests</span>
            </li>
            <li>
              <CheckCircle2 size={15} color="#1a73e8" />
              <span>Detailed answer explanations</span>
            </li>
          </div>
        </div>
      </section>

      {/* =====================================================
          BRANCH CARDS
          ===================================================== */}
      <section className="asm-section">
        <div className="container">
          <div className="asm-sec-head">
            <div className="asm-sec-eyebrow">Branches</div>
            <h2 className="asm-sec-title">Select a branch to see its tests</h2>
            <p className="asm-sec-desc">
              Every branch card shows the number of available tests, derived from the
              actual assessment data — never hardcoded.
            </p>
          </div>

          {/* ---------- LOADING ---------- */}
          {branches === null && !error && (
            <div className="asm-grid" aria-busy="true" aria-live="polite">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="asm-card asm-card-skeleton" />
              ))}
            </div>
          )}

          {/* ---------- ERROR ---------- */}
          {error && (
            <div className="asm-empty">
              <AlertCircle size={30} />
              <h2>Could not load branches</h2>
              <p>The branch catalogue could not be loaded. Please check your connection and try again.</p>
              <button type="button" className="asm-btn" onClick={() => window.location.reload()}>
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* ---------- EMPTY ---------- */}
          {Array.isArray(branches) && branches.length === 0 && (
            <div className="asm-empty">
              <BookOpen size={30} />
              <h2>No branches available yet</h2>
              <p>Assessment content is being prepared. Please check back shortly.</p>
            </div>
          )}

          {/* ---------- BRANCH CARDS ---------- */}
          {Array.isArray(branches) && branches.length > 0 && (
            <div className="asm-grid">
              {branches.map((branch) => {
                const Icon = ICONS[branch.icon] || BookOpen
                const testCount = branch.testCount ?? 0

                return (
                  <Link
                    key={branch.id}
                    to={`/assessment/branch/${branch.id}`}
                    className="asm-card"
                    aria-label={`Explore tests for ${branch.name}`}
                  >
                    <div className="asm-card-top">
                      <div className="asm-card-icon">
                        <Icon size={22} />
                      </div>
                      <span className="asm-branch-count">
                        {testCount} {testCount === 1 ? 'test' : 'tests'}
                      </span>
                      <span className="asm-branch-count-meta">
                        {testCount === 0 ? 'No tests yet' : 'Available now'}
                      </span>
                    </div>

                    <h3 className="asm-card-title">{branch.name}</h3>
                    <p className="asm-card-desc">{branch.description}</p>

                    <div className="asm-card-footer">
                      <span className="asm-difficulty">
                        <strong>{branch.shortName}</strong>
                      </span>
                      <span className="asm-explore">
                        Explore Tests
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}
      <section className="asm-section alt">
        <div className="container">
          <div className="asm-sec-head">
            <div className="asm-sec-eyebrow">How It Works</div>
            <h2 className="asm-sec-title">A practice loop that actually tells you something.</h2>
            <p className="asm-sec-desc">
              Every module is built around one idea — a number on a screen is useless unless you
              know which concepts caused it.
            </p>
          </div>

          <div className="asm-steps">
            {[
              {
                icon: <Target size={18} color="#1a73e8" />,
                title: 'Pick your branch',
                desc: 'Choose the subject closest to the role you are targeting.',
              },
              {
                icon: <BookOpen size={18} color="#34a853" />,
                title: 'Pick a test',
                desc: 'Read the instructions, check the marking scheme, and start under time pressure.',
              },
              {
                icon: <Clock size={18} color="#fbbc04" />,
                title: 'Attempt under time pressure',
                desc: 'Practise against the clock so the real thing feels familiar.',
              },
              {
                icon: <CheckCircle2 size={18} color="#ea4335" />,
                title: 'Review every answer',
                desc: 'Explanations show the reasoning, not just the correct option.',
              },
            ].map((step, i) => (
              <div key={step.title} className="asm-step">
                <div className="asm-step-icon">{step.icon}</div>
                <span className="asm-step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}
      <section className="asm-section">
        <div className="container">
          <div className="asm-cta">
            <h2 className="asm-cta-title">Want your results saved across devices?</h2>
            <p className="asm-cta-sub">
              Create a free Upskillyfy-ai account to track your practice history, saved
              internships and learning progress in one place.
            </p>
            <div className="asm-cta-actions">
              <Link to="/register" className="asm-btn">
                <span>Create Free Account</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/career/dsa" className="asm-btn-outline">
                <span>Open DSA Hub</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}