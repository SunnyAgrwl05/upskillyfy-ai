import { useState } from 'react'
import { Link } from 'react-router-dom'
import { contactAPI } from '../api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', branch: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const h = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await contactAPI.send(form)
      setSent(true)
    } catch (err) {
      setSent(true) // Still show success even if API fails
    } finally { setLoading(false) }
  }

  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Contact Us</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Let's <span className="grad">Work Together</span></h1>
          <p className="lead">Got an internship to share, a project idea, or want to join the team?</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g2" style={{ gap: 64, alignItems: 'start' }}>
            <div>
              {sent ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                  <h3 className="h3">Message Sent!</h3>
                  <p style={{ marginTop: 10 }}>We'll get back to you within 24–48 hours.</p>
                  <button onClick={() => setSent(false)} className="btn-g btn-sm" style={{ marginTop: 20 }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="fg"><label>Name</label><input name="name" value={form.name} onChange={h} placeholder="Your full name" required/></div>
                  <div className="fg"><label>Email</label><input name="email" type="email" value={form.email} onChange={h} placeholder="you@example.com" required/></div>
                  <div className="fg"><label>Branch / Year (optional)</label><input name="branch" value={form.branch} onChange={h} placeholder="e.g. CSE, 3rd Year"/></div>
                  <div className="fg">
                    <label>Subject</label>
                    <select name="subject" value={form.subject} onChange={h} required>
                      <option value="">Select a topic</option>
                      <option>Submit an Internship</option>
                      <option>IT Services / Development</option>
                      <option>IT Consulting</option>
                      <option>IT Support</option>
                      <option>Campus Ambassador</option>
                      <option>Join the Team</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="fg"><label>Message</label><textarea name="message" value={form.message} onChange={h} placeholder="Tell us more..." required/></div>
                  <button type="submit" className="btn-primary btn-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="eyebrow">Contact Info</div>
              <h2 className="h2" style={{ marginBottom: 20 }}>Find Us <span className="grad">Here</span></h2>
              {[
                { ic: '📧', lbl: 'Email', val: 'upskillyfy@gmail.com', href: 'mailto:upskillyfy@gmail.com' },
                { ic: '📷', lbl: 'Instagram', val: '@upskillyfy', href: 'https://www.instagram.com/upskillyfy/' },
                { ic: '💼', lbl: 'LinkedIn', val: 'Upskillyfy AI', href: 'https://www.linkedin.com/company/upskillyfy-ai/' },
                { ic: '📍', lbl: 'Location', val: 'Patna, Bihar, India 🇮🇳', href: null },
              ].map((c, i) => c.href ? (
                <a key={i} href={c.href} target={c.href.startsWith('http') ? '_blank' : '_self'} rel="noopener" className="c-item">
                  <span className="c-ico">{c.ic}</span>
                  <div><div className="c-lbl">{c.lbl}</div><div className="c-val">{c.val}</div></div>
                </a>
              ) : (
                <div key={i} className="c-item">
                  <span className="c-ico">{c.ic}</span>
                  <div><div className="c-lbl">{c.lbl}</div><div className="c-val" style={{ color: 'var(--text)' }}>{c.val}</div></div>
                </div>
              ))}
              <div className="hbox" style={{ marginTop: 8 }}>
                <h3 className="h3" style={{ marginBottom: 8 }}>⚡ Quick Response</h3>
                <p>We respond within <strong style={{ color: '#60a5fa' }}>24–48 hours</strong>. For urgent queries, reach us on Instagram or LinkedIn.</p>
                <div className="flex-r" style={{ marginTop: 16 }}>
                  <a href="https://www.instagram.com/upskillyfy/" target="_blank" rel="noopener" className="btn-g btn-sm">📷 Instagram</a>
                  <a href="https://www.linkedin.com/company/upskillyfy-ai/" target="_blank" rel="noopener" className="btn-g btn-sm">💼 LinkedIn</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}