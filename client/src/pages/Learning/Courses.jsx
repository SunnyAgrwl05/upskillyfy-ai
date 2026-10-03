import { Link } from 'react-router-dom'

const COURSES = [
  { e: '💻', t: 'Full-Stack Web Dev Bootcamp', dur: '3 months', lv: 'Beginner → Advanced', tag: 'Web Dev', cls: 'bdg-b', topics: 'React, Node.js, MongoDB, REST APIs, Deployment' },
  { e: '🤖', t: 'AI/ML with Python', dur: '2 months', lv: 'Intermediate', tag: 'AI/ML', cls: 'bdg-p', topics: 'NumPy, Pandas, Scikit-learn, TensorFlow, Projects' },
  { e: '📱', t: 'React Native Mobile Dev', dur: '6 weeks', lv: 'Intermediate', tag: 'Mobile', cls: 'bdg-c', topics: 'React Native, Expo, Firebase, App Store Deploy' },
  { e: '🧠', t: 'DSA & Competitive Programming', dur: '2 months', lv: 'All Levels', tag: 'DSA', cls: 'bdg-g', topics: '450+ problems, patterns, interview prep' },
  { e: '☁️', t: 'Cloud Computing & DevOps', dur: '2 months', lv: 'Intermediate', tag: 'Cloud', cls: 'bdg-o', topics: 'AWS, Docker, Kubernetes, CI/CD, GitHub Actions' },
  { e: '🎨', t: 'UI/UX Design Fundamentals', dur: '6 weeks', lv: 'Beginner', tag: 'Design', cls: 'bdg-b', topics: 'Figma, Design Systems, Prototyping, UX Research' },
]

export default function Courses() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Courses</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Learn from <span className="grad">Industry Experts</span></h1>
          <p className="lead">Structured courses designed to take you from beginner to job-ready.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g3">
            {COURSES.map((c, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{c.e}</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><span className={`bdg ${c.cls}`}>{c.tag}</span><span className="bdg bdg-g">{c.lv}</span></div>
                <h3>{c.t}</h3>
                <p style={{ margin: '10px 0', fontSize: '.86rem' }}>{c.topics}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.8rem', color: 'var(--faint2)' }}>⏱ {c.dur}</span>
                  <Link to="/contact" className="btn-primary btn-xs">Enroll →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎓</div>
          <h2 className="h2" style={{ marginBottom: 12 }}>Upskillyfy <span className="grad">Academy</span> — Coming Soon</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Full course platform with video lessons, quizzes, assignments and certificates.</p>
          <Link to="/contact" className="btn-primary">Join Waitlist →</Link>
        </div>
      </section>
    </div>
  )
}