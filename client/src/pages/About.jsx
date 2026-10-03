import { Link } from 'react-router-dom'

const PILLARS = [
  { ico: '🎓', cls: 'ico-b', t: 'Learn', d: 'Courses, roadmaps, DSA, notes, certifications and branch-wise resources.' },
  { ico: '🚀', cls: 'ico-g', t: 'Grow', d: 'Internships, placements, resume building, mock interviews, career guidance.' },
  { ico: '💻', cls: 'ico-c', t: 'Build', d: 'IT services, web dev, app dev, AI solutions and custom software.' },
  { ico: '🤝', cls: 'ico-p', t: 'Transform', d: 'IT consulting, startup guidance, digital transformation and tech strategy.' },
]

const TEAM = [
  { e: '👨‍💻', title: 'Founder & Tech Lead', desc: 'Engineering student driving the vision of Upskillyfy.' },
  { e: '📚', title: 'Resource Team', desc: 'Curates DSA sheets, notes and placement material.' },
  { e: '💻', title: 'Development Team', desc: 'Builds the platform, client projects and IT solutions.' },
  { e: '📢', title: 'Community Team', desc: 'Manages events, ambassador program and community.' },
]

export default function About() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>About Us</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>About <span className="grad">Upskillyfy</span></h1>
          <p className="lead">A Career Development, IT Services & Technology Consulting Platform for Students, Professionals, Startups, and Businesses.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g2" style={{ gap: 64, alignItems: 'start' }}>
            <div>
              <div className="eyebrow">Our Story</div>
              <h2 className="h2">From Campus to <span className="grad">Company</span></h2>
              <p style={{ marginTop: 16, lineHeight: 1.85 }}>
                Upskillyfy started as a small student community in Patna, Bihar — sharing internship links and DSA resources. We realized that thousands of students across all branches struggle to find verified opportunities in one place.
              </p>
              <p style={{ marginTop: 14, lineHeight: 1.85 }}>
                Today, Upskillyfy is growing into a full-fledged EdTech + IT Services + IT Consulting platform — serving students, startups and businesses.
              </p>
              <div className="hbox" style={{ marginTop: 28 }}>
                <p style={{ color: 'var(--text)', fontStyle: 'italic', fontSize: '1.02rem', lineHeight: 1.75 }}>
                  "Empower every student, professional and business through education, technology and innovation — regardless of branch, college tier or background."
                </p>
              </div>
              <div className="flex-r" style={{ marginTop: 28 }}>
                <Link to="/contact" className="btn-primary">Get in Touch →</Link>
                <Link to="/community/events" className="btn-g">Join Community</Link>
              </div>
            </div>
            <div>
              <div className="eyebrow">Our 4 Pillars</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                {PILLARS.map((p, i) => (
                  <div key={i} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 20 }}>
                    <div className={`card-ico ${p.cls}`} style={{ marginBottom: 0, flexShrink: 0 }}>{p.ico}</div>
                    <div><h3>{p.t}</h3><p style={{ marginTop: 6, fontSize: '.87rem' }}>{p.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Team</div>
            <h2 className="h2">Built by <span className="grad">Students, for Everyone</span></h2>
          </div>
          <div className="g4">
            {TEAM.map((t, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{t.e}</div>
                <h3 style={{ fontSize: '1rem' }}>{t.title}</h3>
                <p style={{ marginTop: 8 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <h2 className="h2" style={{ marginBottom: 12 }}>Want to <span className="grad">Work With Us?</span></h2>
          <p className="muted" style={{ marginBottom: 24 }}>We're always looking for passionate people to join our mission.</p>
          <Link to="/contact" className="btn-primary">Contact Us →</Link>
        </div>
      </section>
    </div>
  )
}