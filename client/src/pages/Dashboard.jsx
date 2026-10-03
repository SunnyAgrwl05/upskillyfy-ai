import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

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
    </div>
  )
}