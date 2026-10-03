import { useState } from 'react'
import { Link } from 'react-router-dom'
import { contactAPI } from '../../api'

export default function ITSupport() {
  const [form, setForm] = useState({ name: '', email: '', issue: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const h = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setSent(false)
    try {
      await contactAPI.send({ ...form, subject: 'IT Support Inquiry' })
      setSent(true)
    } catch (err) {}
    finally { setLoading(false) }
  }

  return (
    <div>
      <section className="ph" style={{ background: 'var(--bg-alt)', color: 'var(--text-h)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Technical Support</div>
          <h1 className="h1" style={{ marginBottom: 12, color: 'var(--text-h)' }}><span className="grad">IT Support</span></h1>
          <p className="lead" style={{ color: 'var(--muted)' }}>From system setup to network management and cloud support — we keep your tech running smoothly.</p>
        </div>
      </section>

      <section className="section section-alt" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g3" style={{ gap: 24 }}>
            <div className="card" style={{ height: '100%', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>💻</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Technical Support</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Software Installation & Config</li>
                <li>OS Setup & Troubleshooting</li>
                <li>Performance Optimization</li>
                <li>Device Setup</li>
                <li>Email Configuration</li>
              </ul>
            </div>
            <div className="card" style={{ height: '100%', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>🌐</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Network Support</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Router & Switch Setup</li>
                <li>WiFi Troubleshooting</li>
                <li>Network Monitoring</li>
                <li>Firewall Setup</li>
                <li>VPN Configuration</li>
              </ul>
            </div>
            <div className="card" style={{ height: '100%', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>☁️</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Cloud Support</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>AWS Setup & Management</li>
                <li>Azure Support</li>
                <li>Google Cloud Setup</li>
                <li>Cloud Migration</li>
                <li>Cost Optimization</li>
              </ul>
            </div>
          </div>

          <div className="g3" style={{ gap: 24, marginTop: 48 }}>
            <div className="card" style={{ height: '100%', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>🔐</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Security Support</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Security Audit</li>
                <li>Vulnerability Assessment</li>
                <li>Backup Solutions</li>
                <li>Data Protection</li>
                <li>Antivirus Setup</li>
              </ul>
            </div>
            <div className="card" style={{ height: '100%', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>🖥️</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Remote IT Support</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Remote Desktop Support</li>
                <li>Helpdesk Services</li>
                <li>Ticket Resolution</li>
                <li>24/7 User Assistance</li>
                <li>Screen Sharing Support</li>
              </ul>
            </div>
            <div className="card" style={{ height: '100%', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>🏢</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Business IT</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>IT Infrastructure Planning</li>
                <li>Business Email Setup</li>
                <li>Collaboration Tools</li>
                <li>IT Policy Documentation</li>
                <li>Vendor Management</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link to="/contact" className="btn-primary">Get a Quote →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: '48px 0 0', background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container">
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h3 style={{ marginBottom: 24, color: 'var(--text-h)' }}>Get Technical Support</h3>
            <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto' }}>Ready to get your IT issues resolved? Fill out the form below and we'll get back to you within 24 hours.</p>
          </div>
          {sent ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
              <h3 style={{ marginBottom: 10, color: 'var(--text-h)' }}>Message Sent!</h3>
              <p style={{ color: 'var(--muted)' }}>We'll get back to you within 24–48 hours.</p>
              <button onClick={() => setSent(false)} className="btn-g" style={{ marginTop: 20 }}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth: 560 }}>
              <div className="fg" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Name</label>
                <input name="name" value={form.name} onChange={h} placeholder="Your full name" required />
              </div>
              <div className="fg" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Email</label>
                <input name="email" value={form.email} onChange={h} type="email" placeholder="you@example.com" required />
              </div>
              <div className="fg" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Issue Type</label>
                <select name="issue" value={form.issue} onChange={h}>
                  <option value="">Select issue type</option>
                  <option>Software Troubleshooting</option>
                  <option>Hardware Issue</option>
                  <option>Network Problem</option>
                  <option>Cloud Access</option>
                  <option>Account Access</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="fg" style={{ marginBottom: 24, resize: 'vertical', minHeight: '120px' }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Message</label>
                <textarea name="message" value={form.message} onChange={h} placeholder="Describe your issue in detail..." required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}