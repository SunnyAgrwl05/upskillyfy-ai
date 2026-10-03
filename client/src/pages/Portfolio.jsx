import { Link } from 'react-router-dom'

const PROJECTS = [
  { e: '🌐', t: 'EdTech Platform', cat: 'Web Dev', tags: ['React', 'Node.js', 'MongoDB'], d: 'Full-stack LMS for an educational institute with 500+ students.' },
  { e: '📱', t: 'Business Directory App', cat: 'Mobile App', tags: ['React Native', 'Firebase'], d: 'Android app for local business discovery with 1000+ downloads.' },
  { e: '🤖', t: 'AI Customer Support Bot', cat: 'AI/ML', tags: ['Python', 'Gemini API', 'WhatsApp'], d: 'WhatsApp chatbot handling 200+ daily customer queries.' },
  { e: '🏪', t: 'E-Commerce Website', cat: 'Web Dev', tags: ['Next.js', 'Stripe', 'MongoDB'], d: 'Full e-commerce solution with payment integration and admin panel.' },
  { e: '📊', t: 'Sales Analytics Dashboard', cat: 'AI/ML', tags: ['Python', 'Tableau'], d: 'Real-time sales analytics for a manufacturing company.' },
  { e: '🎓', t: 'College Resource Portal', cat: 'Web Dev', tags: ['React', 'Firebase'], d: 'Resource sharing portal with 2000+ active student users.' },
]

export default function Portfolio() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Our Work</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Portfolio & <span className="grad">Projects</span></h1>
          <p className="lead">Real projects delivered for real clients. From websites to AI solutions.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g3">
            {PROJECTS.map((p, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{p.e}</div>
                <span className="bdg bdg-b" style={{ marginBottom: 12, display: 'inline-flex' }}>{p.cat}</span>
                <h3>{p.t}</h3>
                <p style={{ margin: '10px 0' }}>{p.d}</p>
                <div className="pill-row" style={{ marginTop: 14 }}>{p.tags.map((t, j) => <span key={j} className="pill">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <h2 className="h2" style={{ marginBottom: 12 }}>Have a <span className="grad">Project in Mind?</span></h2>
          <p className="muted" style={{ marginBottom: 28 }}>Let's build something amazing together.</p>
          <Link to="/contact" className="btn-primary">Start a Project →</Link>
        </div>
      </section>
    </div>
  )
}