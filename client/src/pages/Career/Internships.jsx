import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { internshipAPI, userAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'

const BRANCHES = ['All', 'CSE', 'ECE', 'ME', 'EE', 'Civil']
const MODES = ['All Modes', 'Remote', 'Hybrid', 'On-site', 'On-campus']

const FALLBACK = [
  { _id: '1', title: 'SDE Intern — Backend', company: 'FinTech Startup', skills: ['Java', 'Spring Boot'], stipend: '₹10,000/mo', duration: '3 months', mode: 'Remote', status: 'Open', branch: ['CSE'] },
  { _id: '2', title: 'ML Research Intern', company: 'AI Lab', skills: ['Python', 'Scikit-learn'], stipend: '₹8,000/mo', duration: '2 months', mode: 'Remote', status: 'New', branch: ['CSE'] },
  { _id: '3', title: 'Frontend Developer Intern', company: 'EdTech Company', skills: ['React', 'Tailwind'], stipend: '₹6,000/mo', duration: '3 months', mode: 'Hybrid', status: 'Open', branch: ['CSE'] },
  { _id: '4', title: 'Embedded Systems Intern', company: 'IoT Startup', skills: ['C/C++', 'Arduino'], stipend: '₹5,000/mo', duration: '6 months', mode: 'On-site', status: 'Open', branch: ['ECE'] },
  { _id: '5', title: 'Mechanical Design Intern', company: 'EV Manufacturer', skills: ['SolidWorks', 'CAD'], stipend: '₹8,000/mo', duration: '3 months', mode: 'On-site', status: 'Open', branch: ['ME'] },
  { _id: '6', title: 'Power Systems Intern', company: 'Renewable Energy Co.', skills: ['MATLAB', 'Simulink'], stipend: '₹6,000/mo', duration: '3 months', mode: 'Remote', status: 'New', branch: ['EE'] },
  { _id: '7', title: 'Site Engineering Intern', company: 'Construction Firm', skills: ['AutoCAD', 'Revit'], stipend: '₹5,000/mo', duration: '2 months', mode: 'On-site', status: 'Closing Soon', branch: ['Civil'] },
  { _id: '8', title: 'Campus Ambassador', company: 'Global EdTech Brand', skills: ['Marketing'], stipend: 'Perks + Cert', duration: 'Ongoing', mode: 'On-campus', status: 'Closing Soon', branch: ['All'] },
  { _id: '9', title: 'Data Science Intern', company: 'Analytics Firm', skills: ['Python', 'Pandas'], stipend: '₹7,000/mo', duration: '3 months', mode: 'Remote', status: 'Open', branch: ['CSE'] },
]

export default function Internships() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [branch, setBranch] = useState('All')
  const [mode, setMode] = useState('All Modes')
  const { user } = useAuth()

  useEffect(() => {
    internshipAPI.getAll().then(res => { setInternships(res.data); setLoading(false) })
      .catch(() => { setInternships(FALLBACK); setLoading(false) })
  }, [])

  const filtered = internships.filter(i => {
    const branchMatch = branch === 'All' || (i.branch && (i.branch.includes(branch) || i.branch.includes('All')))
    const modeMatch = mode === 'All Modes' || i.mode === mode
    return branchMatch && modeMatch
  })

  const STATUS_COLOR = { 'Open': 'bdg-g', 'New': 'bdg-p', 'Closing Soon': 'bdg-o', 'Closed': 'bdg-r' }
  const LOGOS = ['linear-gradient(135deg,#2563eb,#06b6d4)','linear-gradient(135deg,#8b5cf6,#ec4899)','linear-gradient(135deg,#10b981,#06b6d4)','linear-gradient(135deg,#f59e0b,#ef4444)','linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#06b6d4,#2563eb)']
  const EMOJIS = ['🏦','🤖','📱','⚡','⚙️','🔋','🏗️','📢','📊']

  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Career Hub</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Internships for <span className="grad">Every Branch</span></h1>
          <p className="lead">Hand-picked, verified internship listings across tech, core engineering and management.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--faint2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Filter by Branch</div>
              <div className="ftabs">{BRANCHES.map(b => <button key={b} className={`ftab${branch === b ? ' on' : ''}`} onClick={() => setBranch(b)}>{b}</button>)}</div>
            </div>
            <div>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--faint2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Filter by Mode</div>
              <div className="ftabs">{MODES.map(m => <button key={m} className={`ftab${mode === m ? ' on' : ''}`} onClick={() => setMode(m)}>{m}</button>)}</div>
            </div>
          </div>
          <div style={{ marginBottom: 20, color: 'var(--faint2)', fontSize: '.88rem' }}>Showing {filtered.length} internships</div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--faint2)' }}>Loading internships...</div>
          ) : (
            <div className="g3">
              {filtered.map((item, i) => (
                <div key={item._id} className="ic">
                  <div className="ic-head">
                    <div className="ic-logo" style={{ background: LOGOS[i % LOGOS.length] }}>{EMOJIS[i % EMOJIS.length]}</div>
                    <div><div className="ic-co">{item.company}</div><div className="ic-title">{item.title}</div></div>
                  </div>
                  <div className="ic-tags">
                    {(item.skills || []).slice(0, 3).map((t, j) => <span key={j} className="bdg bdg-b">{t}</span>)}
                    {item.mode && <span className="bdg bdg-c">{item.mode}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: '.77rem', color: 'var(--faint2)' }}>
                    {item.stipend && <span>💰 {item.stipend}</span>}
                    {item.duration && <span>⏱ {item.duration}</span>}
                  </div>
                  <div className="ic-meta">
                    <span className={`bdg ${STATUS_COLOR[item.status] || 'bdg-g'}`}>● {item.status || 'Open'}</span>
                    <Link to="/contact" className="btn-primary btn-xs">Apply →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}