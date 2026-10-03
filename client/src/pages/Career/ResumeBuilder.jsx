import { Link } from 'react-router-dom'

const TIPS = ['Use single-column ATS-friendly layout', 'Quantify achievements (e.g. 40% improvement)', 'Use action verbs (Built, Led, Developed)', 'Keep it to 1 page for students', 'Tailor keywords to each job description', 'Include GitHub, LinkedIn and portfolio links', 'List projects with tech stack and impact']

export default function ResumeBuilder() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Resume Builder</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Build an <span className="grad">ATS-Friendly Resume</span></h1>
          <p className="lead">Templates and tips for resumes that pass ATS filters and impress recruiters.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g2" style={{ alignItems: 'start', gap: 48 }}>
            <div>
              <h2 className="h2" style={{ marginBottom: 24 }}>Resume <span className="grad">Templates</span></h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { e: '💼', t: 'SDE / Tech Intern Resume', tags: ['CSE', 'IT', 'AI/ML'] },
                  { e: '⚙️', t: 'Core Engineering Resume', tags: ['ECE', 'ME', 'EE', 'Civil'] },
                  { e: '🎨', t: 'Designer / Creative Resume', tags: ['UI/UX', 'Design'] },
                  { e: '📊', t: 'MBA / Management Resume', tags: ['MBA', 'Business'] },
                ].map((item, i) => (
                  <div key={i} className="card" style={{ padding: '18px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: '1.5rem' }}>{item.e}</span><span style={{ fontWeight: 700 }}>{item.t}</span></div>
                      <div style={{ display: 'flex', gap: 6 }}>{item.tags.map((t, j) => <span key={j} className="bdg bdg-b">{t}</span>)}</div>
                    </div>
                    <Link to="/contact" className="btn-g btn-xs" style={{ marginTop: 12, display: 'inline-flex' }}>Download Template →</Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="h2" style={{ marginBottom: 24 }}>Pro <span className="grad">Tips</span></h2>
              <div className="card">
                <ul className="slist">{TIPS.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
              <div className="hbox" style={{ marginTop: 20 }}>
                <h3 className="h3" style={{ marginBottom: 10 }}>💡 Want a Custom Review?</h3>
                <p>Share your resume and our team will give you personalized feedback.</p>
                <Link to="/contact" className="btn-primary btn-sm" style={{ marginTop: 14, display: 'inline-flex' }}>Get Resume Review →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}