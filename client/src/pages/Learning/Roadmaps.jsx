import { Link } from 'react-router-dom'

const ROADMAPS = [
  { icon: '💻', cls: 'ico-b', title: 'Full-Stack Web Dev', dur: '6 months', steps: ['HTML/CSS/JS Basics', 'React.js Frontend', 'Node.js + Express Backend', 'MongoDB + REST APIs', 'Authentication (JWT)', 'Deploy on AWS / Vercel'] },
  { icon: '🤖', cls: 'ico-p', title: 'AI/ML Engineer', dur: '8 months', steps: ['Python Fundamentals', 'NumPy, Pandas, Matplotlib', 'Machine Learning (Scikit-learn)', 'Deep Learning (TensorFlow)', 'NLP & Computer Vision', 'MLOps & Deployment'] },
  { icon: '☁️', cls: 'ico-o', title: 'Cloud & DevOps', dur: '6 months', steps: ['Linux Fundamentals', 'Git & GitHub', 'Docker Containerization', 'Kubernetes Basics', 'CI/CD Pipelines', 'AWS/Azure Certifications'] },
  { icon: '📱', cls: 'ico-c', title: 'Mobile Developer', dur: '4 months', steps: ['JavaScript/TypeScript', 'React Native Basics', 'Navigation & State Mgmt', 'API Integration', 'Firebase Setup', 'App Store Deployment'] },
  { icon: '🔐', cls: 'ico-g', title: 'Cybersecurity', dur: '5 months', steps: ['Networking Fundamentals', 'Linux & Command Line', 'Web Security Basics', 'Ethical Hacking Intro', 'CTF Practice', 'Security Certifications'] },
  { icon: '🎨', cls: 'ico-pk', title: 'UI/UX Design', dur: '3 months', steps: ['Design Principles', 'Figma Fundamentals', 'User Research Methods', 'Wireframing & Prototyping', 'Design Systems', 'Portfolio Building'] },
]

export default function Roadmaps() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Roadmaps</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Career <span className="grad">Roadmaps</span></h1>
          <p className="lead">Step-by-step learning paths from beginner to job-ready — pick your track and follow the map.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g3">
            {ROADMAPS.map((r, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div className={`card-ico ${r.cls}`} style={{ marginBottom: 0 }}>{r.icon}</div>
                  <span className="bdg bdg-c">{r.dur}</span>
                </div>
                <h3>{r.title}</h3>
                <div className="tline" style={{ marginTop: 18 }}>
                  {r.steps.map((s, j) => (
                    <div key={j} className="tl-i">
                      <div className="tl-d">Step {j + 1}</div>
                      <p>{s}</p>
                    </div>
                  ))}
                </div>
                <Link to="/contact" className="btn-g btn-sm" style={{ marginTop: 20, display: 'inline-flex' }}>Start Roadmap →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}