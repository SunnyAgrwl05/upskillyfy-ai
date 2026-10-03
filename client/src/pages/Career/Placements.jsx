import { Link } from 'react-router-dom'

const COMPANIES = [
  { name: 'Google', icon: '🔵', tips: ['DSA heavy — Graphs, DP, Trees', 'System Design rounds', 'Behavioral with STAR method', 'Past LeetCode Google problems'] },
  { name: 'Microsoft', icon: '🟦', tips: ['Arrays, Trees, Graphs focus', 'Coding + System Design', 'Cultural add interviews', 'GitHub profile matters'] },
  { name: 'Amazon', icon: '🟠', tips: ['14 Leadership Principles', 'OOP Design questions', 'Behavioral story prep', 'Amazon-specific LeetCode set'] },
  { name: 'TCS / Infosys', icon: '⬛', tips: ['Aptitude + Reasoning + English', 'Ninja vs Digital roles', 'Basic CS fundamentals', 'InfyTQ certification helps'] },
  { name: 'Flipkart', icon: '🟡', tips: ['DSA heavy (top companies)', 'Problem solving speed', 'Past contest rankings help', 'Focus on system design'] },
  { name: 'Startups', icon: '🚀', tips: ['Practical coding skills', 'Portfolio & GitHub', 'DSA + real project experience', 'Full-stack preferred'] },
]

export default function Placements() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Placements</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Crack Your <span className="grad">Dream Company</span></h1>
          <p className="lead">Company-wise prep, aptitude material, resume templates and interview guides.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Company-wise Prep</div>
            <h2 className="h2">Prepare <span className="grad">Strategically</span></h2>
          </div>
          <div className="g3" style={{ marginBottom: 64 }}>
            {COMPANIES.map((c, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{c.icon}</div>
                <h3>{c.name}</h3>
                <ul className="slist">{c.tips.map((t, j) => <li key={j}>{t}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="g4">
            {[
              { e: '📄', t: 'ATS Resume Templates', d: 'Templates optimised for applicant tracking systems.' },
              { e: '🧮', t: 'Aptitude Prep Sheet', d: 'Quantitative, logical reasoning and verbal ability sets.' },
              { e: '🎤', t: 'HR Interview Guide', d: 'Common questions, STAR method and behavioral strategies.' },
              { e: '💻', t: 'Technical Revision', d: 'OS, DBMS, CN, OOP — subject-wise revision notes.' },
            ].map((p, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{p.e}</div>
                <h3 style={{ fontSize: '1rem' }}>{p.t}</h3>
                <p style={{ marginTop: 8, fontSize: '.83rem' }}>{p.d}</p>
                <Link to="/contact" className="btn-g btn-xs" style={{ marginTop: 14, display: 'inline-flex' }}>Access →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}