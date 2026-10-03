import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { contactAPI } from '../../api'

export default function ITServices() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { service } = useParams()

  const h = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setSent(false)
    try {
      await contactAPI.send({ ...form, service })
      setSent(true)
    } catch (err) {
      setSent(true)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <section className="ph" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Software Development</div>
          <h1 className="h1" style={{ marginBottom: 12, color: 'var(--text-h)' }}><span className="grad">IT Services</span></h1>
          <p className="lead" style={{ color: 'var(--muted)' }}>From websites to full-stack apps, mobile apps and custom enterprise software — we build it all.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, background: 'var(--bg)' }}>
        <div className="container" style={{ background: 'var(--bg)' }}>
          <div className="g3" style={{ gap: 24, marginBottom: 48 }}>
            <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🌐</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Web Development</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                Business & portfolio websites, e-commerce solutions, LMS/CRM/SaaS platforms, admin panels & student portals, landing pages & blogs. Modern, responsive designs built with React, Next.js, HTML/CSS/Tailwind and TypeScript.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>📱</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Mobile App Development</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                Android & iOS apps, Flutter/React Native, educational apps, business apps, e-commerce apps. Cross-platform solutions with native performance and beautiful UIs.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>⚙️</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Custom Software</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                ERP & CRM systems, school management, hospital management, inventory systems, HR management. Tailored business process automation with scalable architecture.
              </p>
            </div>
          </div>

          <div className="g3" style={{ gap: 24, marginBottom: 48 }}>
            <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🌐</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Frontend Tech</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                React.js & Next.js, HTML / CSS / Tailwind, TypeScript, Responsive Design, Performance Optimization. Interactive, accessible, and performant user interfaces.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🔧</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Backend Tech</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                Node.js & Express.js, Python Django / Flask, Java Spring Boot, REST APIs, GraphQL. Scalable server-side solutions with modern APIs.
              </p>
            </div>
            <div className="card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🗄️</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Database & Cloud</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                MongoDB & PostgreSQL, MySQL / Firebase, AWS / Azure / GCP, Docker & Kubernetes, CI/CD Pipelines. Reliable data storage and cloud deployment.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <Link to="/contact" className="btn-primary" style={{ marginRight: 16 }}>
              Get a Quote →
            </Link>
            <Link to="/contact" className="btn-g">Book Consultation</Link>
          </div>
        </div>
      </section>

      <section className="section section-alt" style={{ background: 'var(--bg-alt)' }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ marginBottom: 24, color: 'var(--text-h)' }}>Related Services</h3>
            <div className="g2" style={{ gap: 24, marginTop: 24 }}>
              <Link to="/services/it-support" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛠️</div>
                  <div>
                    <strong style={{ color: 'var(--text-h)' }}>IT Support</strong>
                    <p style={{ color: 'var(--muted)', fontSize: '0.87rem', margin: 0 }}>Reliable technical support for teams and organizations.</p>
                  </div>
                </div>
              </Link>
              <Link to="/services/ai-automation" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🤖</div>
                  <div>
                    <strong style={{ color: 'var(--text-h)' }}>AI Automation</strong>
                    <p style={{ color: 'var(--muted)', fontSize: '0.87rem', margin: 0 }}>AI-powered workflows and intelligent automation.</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form at bottom */}
      <section className="section" style={{ padding: '48px 0 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 24, color: 'var(--text-h)' }}>Start Your Project</h3>
            <form onSubmit={submit} style={{ maxWidth: 600 }}>
              <div className="fg" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Name</label>
                <input name="name" value={form.name} onChange={h} placeholder="Your full name" required style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              </div>
              <div className="fg" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Email</label>
                <input name="email" value={form.email} onChange={h} type="email" placeholder="you@example.com" required style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              </div>
              <div className="fg" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Service Interest</label>
                <select name="service" value={form.service} onChange={h} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
                  <option value="">Select a service</option>
                  <option value="IT Services">IT Services</option>
                  <option value="IT Support">IT Support</option>
                  <option value="IT Consulting">IT Consulting</option>
                  <option value="AI Automation">AI Automation</option>
                  <option value="UI/UX">UI/UX Design</option>
                  <option value="Cloud">Cloud</option>
                </select>
              </div>
              <div className="fg" style={{ marginBottom: 24, resize: 'vertical', minHeight: '120px' }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-h)' }}>Message</label>
                <textarea name="message" value={form.message} onChange={h} placeholder="Tell us about your project..." required style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.92rem', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', minHeight: '120px' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 24px', fontWeight: 600, marginTop: 8, fontSize: '0.9rem' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}