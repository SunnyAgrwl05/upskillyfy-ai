import { Link } from 'react-router-dom'

const PERKS = ['Certificate of Recognition', 'LinkedIn Recommendation', 'Priority Internship Access', 'Free Premium Resources', 'Network with Industry Experts', 'Goodies & Swag Kit', 'Revenue Sharing (future)', 'Leadership Portfolio']

const ROLES = [
  { icon: '🎓', title: 'Campus Ambassador', desc: 'Represent Upskillyfy at your college. Host events, drive sign-ups and build community.' },
  { icon: '✍️', title: 'Content Creator', desc: 'Create tech content for Upskillyfy social media. Writers, designers and video creators welcome.' },
  { icon: '👨‍💻', title: 'Community Lead', desc: 'Lead the Upskillyfy student community in your city. Organize meetups and study groups.' },
]

export default function Ambassador() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Campus Ambassador</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Become an <span className="grad">Upskillyfy Ambassador</span></h1>
          <p className="lead">Represent Upskillyfy at your campus, build your leadership portfolio and earn exclusive perks.</p>
          <div className="flex-r" style={{ justifyContent: 'center', marginTop: 28 }}>
            <Link to="/contact" className="btn-primary">Apply Now →</Link>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Roles</div>
            <h2 className="h2">Choose Your <span className="grad">Role</span></h2>
          </div>
          <div className="g3" style={{ marginBottom: 64 }}>
            {ROLES.map((r, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{r.icon}</div>
                <h3>{r.title}</h3>
                <p style={{ marginTop: 10 }}>{r.desc}</p>
                <Link to="/contact" className="btn-g btn-sm" style={{ marginTop: 20, display: 'inline-flex' }}>Apply →</Link>
              </div>
            ))}
          </div>
          <div className="sec-head">
            <div className="eyebrow">Benefits</div>
            <h2 className="h2">What You <span className="grad">Get</span></h2>
          </div>
          <div className="g4">
            {PERKS.map((p, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 700 }}>✓</div>
                <p style={{ marginTop: 8, fontWeight: 600, color: 'var(--text)', fontSize: '.9rem' }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}