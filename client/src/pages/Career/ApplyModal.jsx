import React, { useState } from 'react'
import { X, CheckCircle2, ShieldCheck, Send, Sparkles, AlertCircle } from 'lucide-react'
import './ApplyModal.css'

export default function ApplyModal({ internship, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    batch: '2026',
    resumeUrl: '',
    portfolioUrl: '',
    pitch: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [appId, setAppId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen || !internship) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errorMsg) setErrorMsg('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.resumeUrl.trim()) {
      setErrorMsg('Please fill in your name, email, and resume link.')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      const generatedId = `UPS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      setAppId(generatedId)
    }, 900)
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      college: '',
      batch: '2026',
      resumeUrl: '',
      portfolioUrl: '',
      pitch: ''
    })
    onClose()
  }

  return (
    <div className="apply-modal-overlay" onClick={onClose}>
      <div className="apply-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="apply-modal-header">
          <div>
            <div className="apply-modal-title">
              {submitted ? 'Application Confirmed' : `Apply for ${internship.title}`}
            </div>
            <div className="apply-modal-subtitle">
              {internship.company} • {internship.location} • {internship.stipend}
            </div>
          </div>
          <button className="apply-modal-close-btn" onClick={handleReset} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          /* Success Screen */
          <div className="apply-modal-body">
            <div className="apply-success-box">
              <div className="apply-success-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="apply-success-title">Application Submitted!</h3>
              <p className="apply-success-desc">
                Congratulations <strong style={{ color: 'var(--text-h)' }}>{formData.fullName}</strong>! Your profile and resume have been directly routed to the hiring manager at <strong style={{ color: 'var(--text-h)' }}>{internship.company}</strong>.
              </p>

              <div className="apply-app-id-card">
                <span className="apply-app-id-label">Application Tracking ID</span>
                <span className="apply-app-id-code">{appId}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
                <div style={{ fontSize: '0.84rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <ShieldCheck size={16} color="#34a853" /> Confirmation sent to {formData.email}
                </div>
                <button className="btn-primary" onClick={handleReset} style={{ width: '100%', marginTop: 8 }}>
                  Done & Back to Internships
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit}>
            <div className="apply-modal-body">
              {/* Role Quick Bar */}
              <div className="apply-role-pill-banner">
                <div className="apply-pill-avatar" style={{ background: internship.logoBg }}>
                  {internship.logoInitial}
                </div>
                <div className="apply-pill-details">
                  <span className="apply-pill-role">{internship.title}</span>
                  <span className="apply-pill-meta">
                    {internship.company} • {internship.duration} • PPO: {internship.ppoPackage || 'Available'}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(234, 67, 53, 0.1)', color: '#ea4335', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="apply-form-grid">
                <div className="apply-form-group">
                  <label className="apply-form-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="apply-form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="apply-form-group">
                  <label className="apply-form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="apply-form-input"
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="apply-form-group">
                  <label className="apply-form-label">
                    WhatsApp / Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="apply-form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="apply-form-group">
                  <label className="apply-form-label">
                    Graduation Batch
                  </label>
                  <select
                    name="batch"
                    className="apply-form-select"
                    value={formData.batch}
                    onChange={handleChange}
                  >
                    <option value="2024">2024 (Graduated)</option>
                    <option value="2025">2025 (Final Year)</option>
                    <option value="2026">2026 (3rd Year)</option>
                    <option value="2027">2027 (2nd Year)</option>
                    <option value="2028">2028 (1st Year)</option>
                  </select>
                </div>

                <div className="apply-form-group full-width">
                  <label className="apply-form-label">
                    College / University & Branch
                  </label>
                  <input
                    type="text"
                    name="college"
                    className="apply-form-input"
                    placeholder="e.g. IIT Delhi — Computer Science & Engineering"
                    value={formData.college}
                    onChange={handleChange}
                  />
                </div>

                <div className="apply-form-group full-width">
                  <label className="apply-form-label">
                    Resume Link (Google Drive / Notion / Cloud Link) <span className="req">*</span>
                  </label>
                  <input
                    type="url"
                    name="resumeUrl"
                    className="apply-form-input"
                    placeholder="https://drive.google.com/file/d/... or PDF link (Public access)"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="apply-form-group full-width">
                  <label className="apply-form-label">
                    GitHub / LinkedIn / Portfolio Link
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    className="apply-form-input"
                    placeholder="https://github.com/yourhandle or live portfolio"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="apply-form-group full-width">
                  <label className="apply-form-label">
                    Why are you a good fit for this role?
                  </label>
                  <textarea
                    name="pitch"
                    className="apply-form-textarea"
                    placeholder="Highlight 2-3 key projects, relevant tech stacks, or problem-solving experience..."
                    value={formData.pitch}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="apply-modal-footer">
              <div className="apply-guarantee-note">
                <ShieldCheck size={16} color="#34a853" />
                <span>100% Free • Verified Direct Referral</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn-g" onClick={handleReset}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : (
                    <>
                      <span>Submit Application</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
