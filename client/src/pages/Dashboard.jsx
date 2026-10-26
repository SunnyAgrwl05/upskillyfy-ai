import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { assessmentAPI, learningAPI } from '../api'
import { COURSES_DATA } from '../data/coursesData'

export default function Dashboard() {
  const { user } = useAuth()
  const [learningProgress, setLearningProgress] = useState(null)
  const [assessmentHistory, setAssessmentHistory] = useState(null)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.allSettled([learningAPI.getProgress(), assessmentAPI.getHistory()])
      .then(([learning, assessments]) => {
        if (!active) return
        const errors = []
        if (learning.status === 'fulfilled') setLearningProgress(learning.value.data.courses || [])
        else errors.push('Learning progress')
        if (assessments.status === 'fulfilled') setAssessmentHistory(assessments.value.data.attempts || [])
        else errors.push('Assessment history')
        if (errors.length) setDashboardError(`Could not load ${errors.join(' and ').toLowerCase()}. Refresh to retry.`)
      })
    return () => { active = false }
  }, [user])

  if (!user) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, textAlign: 'center', padding: '100px 24px' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 className="h2">Login Required</h2>
      <p className="muted">Please login to access your dashboard.</p>
      <Link to="/login" className="btn-primary">Login →</Link>
    </div>
  )

  return (
    <div style={{ paddingTop: 0 }}>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Welcome Back</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Hey, <span className="grad">{user.name?.split(' ')[0]} 👋</span></h1>
          <p className="lead">Your Upskillyfy Dashboard — track your progress, saved internships and more.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g2" style={{ gap: 28, marginBottom: 36, alignItems: 'start' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Poppins,sans-serif', color: '#fff', flexShrink: 0 }}>
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>{user.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 3 }}>{user.email}</div>
                  {user.branch && <span className="bdg bdg-b" style={{ marginTop: 8, display: 'inline-flex' }}>{user.branch}</span>}
                </div>
              </div>
              <div className="g2" style={{ gap: 12 }}>
                {[['🎓', user.year || 'Year N/A'], ['🏫', user.college || 'College N/A'], ['📧', user.email]].map(([ic, val], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10 }}>
                    <span>{ic}</span><span style={{ fontSize: '.84rem', color: 'var(--muted)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🚀', title: 'Browse Internships', desc: 'Find verified internships for your branch', link: '/career/internships', cls: 'btn-p' },
                { icon: '🧠', title: 'DSA Hub', desc: 'Practice problems and track your progress', link: '/career/dsa', cls: 'btn-g' },
                { icon: '📄', title: 'Resume Builder Tips', desc: 'Build an ATS-friendly resume', link: '/career/resume', cls: 'btn-g' },
                { icon: '🎯', title: 'Community Events', desc: 'Join workshops, hackathons and webinars', link: '/community/events', cls: 'btn-g' },
              ].map((a, i) => (
                <div key={i} className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                    <div><div style={{ fontWeight: 700, fontSize: '.95rem' }}>{a.title}</div><div style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: 2 }}>{a.desc}</div></div>
                  </div>
                  <Link to={a.link} className={`btn ${a.cls} btn-sm`} style={{ flexShrink: 0 }}>Go →</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="h2" style={{ marginBottom: 18 }}>Your learning</h2>
          {dashboardError && <p role="alert" style={{ color: '#b3261e', marginBottom: 16 }}>{dashboardError}</p>}
          <div className="g2" style={{ gap: 24, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Courses in progress</h3>
              {learningProgress === null ? (
                <p className="muted">Learning progress could not be loaded.</p>
              ) : learningProgress.length === 0 ? (
                <p className="muted">You have not started a course yet. Your progress will appear here when you launch one.</p>
              ) : learningProgress.map((progress) => {
                const course = COURSES_DATA.find((item) => item.id === progress.courseId)
                if (!course) return null
                const lessons = course.modules?.flatMap((module) => module.lessons || []) || []
                const completed = lessons.filter((lesson) => progress.completedLessons?.includes(lesson.id)).length
                const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0
                return (
                  <div key={progress.courseId} style={{ borderTop: '1px solid var(--border)', padding: '14px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <strong>{course.title}</strong><span>{percent}%</span>
                    </div>
                    <div style={{ height: 6, margin: '10px 0', borderRadius: 5, background: 'var(--border)' }}>
                      <div style={{ width: `${percent}%`, height: '100%', borderRadius: 5, background: 'var(--accent)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--muted)', fontSize: '.82rem' }}>
                      <span>Last activity {progress.lastActivityAt ? new Date(progress.lastActivityAt).toLocaleDateString() : '—'}</span>
                      <Link to={`/learning/courses/${progress.courseId}`}>Resume learning →</Link>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Assessment history</h3>
              {assessmentHistory === null ? (
                <p className="muted">Assessment history could not be loaded.</p>
              ) : assessmentHistory.length === 0 ? (
                <p className="muted">No assessment attempts yet. Your completed and in-progress attempts will appear here.</p>
              ) : assessmentHistory.slice(0, 6).map((item) => (
                <div key={item.id} style={{ borderTop: '1px solid var(--border)', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div>
                    <strong>{item.assessment?.title || 'Assessment'}</strong>
                    <div className="muted" style={{ fontSize: '.82rem', marginTop: 3 }}>
                      {item.status === 'in_progress' ? 'In progress' : `${item.percentage}% · ${item.status === 'timed_out' ? 'Timed out' : 'Completed'}`}
                      {item.submittedAt && ` · ${new Date(item.submittedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  {item.assessment && (
                    <Link to={item.status === 'in_progress'
                      ? `/assessments/${item.assessment.slug}`
                      : `/assessments/${item.assessment.slug}/attempt/${item.id}`}
                    >
                      {item.status === 'in_progress' ? 'Continue' : 'Review'}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}