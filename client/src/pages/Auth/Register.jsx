import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function Register() {
  const [role, setRole] = useState('student') // 'student' | 'faculty'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'CSE',
    college: '',
    year: '3rd Year'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = form.password
    if (!pwd) return { score: 0, label: '', color: 'transparent', width: '0%' }
    if (pwd.length < 6) return { score: 1, label: 'Too short (min 6 chars)', color: '#ea4335', width: '25%' }

    let score = 1
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score === 2) return { score: 2, label: 'Fair password', color: '#fbbc04', width: '50%' }
    if (score === 3) return { score: 3, label: 'Good password', color: '#1a73e8', width: '75%' }
    return { score: 4, label: 'Strong password', color: '#34a853', width: '100%' }
  }, [form.password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in your name, email address, and password.')
      return
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy to create an account.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await register({
        ...form,
        role,
        termsAccepted,
        marketingConsent,
        email: form.email.trim().toLowerCase()
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleMock = () => {
    setError('Google Sign-Up is configured. For development, please fill in your details below.')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div className="auth-split-card">
        {/* Left Side: Brand Showcase & Community Proof */}
        <div className="auth-hero-panel">
          <div>
            <div className="auth-hero-badge">
              <Sparkles size={14} />
              Free Lifetime Student Tier
            </div>

            <h2 className="auth-hero-title">
              Join 10,000+ Students <span>Building Tech Careers</span>
            </h2>

            <p className="auth-hero-desc">
              Get immediate access to verified internship roles, AI-proctored skill tests, roadmaps, and full-length curriculum videos.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <GraduationCap size={18} />
                </div>
                <div className="auth-feature-text">
                  <h4>Industry-Aligned Curriculum</h4>
                  <p>Learn Full-Stack, AI/ML, Cloud DevOps, and Data Science directly from real practitioners.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Layers size={18} />
                </div>
                <div className="auth-feature-text">
                  <h4>Verified Skill Badges</h4>
                  <p>Clear test benchmarks and earn shareable certificates to showcase on LinkedIn and resumes.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="auth-feature-text">
                  <h4>Zero Fees for Job Applications</h4>
                  <p>Apply to startup and MNC internships with 1-click tracking and direct recruiter visibility.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-trust-pill">
            <div className="auth-trust-stars">
              {'★'.repeat(5)} <span style={{ color: 'var(--text-h)', fontWeight: 700, marginLeft: 4 }}>50+ Colleges</span>
            </div>
            <p className="auth-trust-quote">
              "The faculty OBE assessment rubrics and student test portals streamlined our university placement preparation completely."
            </p>
            <span className="auth-trust-author">— Dr. S. K. Roy, Head of Department, CSE</span>
          </div>
        </div>

        {/* Right Side: Interactive Registration Form */}
        <div className="auth-form-panel">
          <div className="auth-header">
            <h1 className="auth-title">Create Your Account 🚀</h1>
            <p className="auth-subtitle">Join Upskillyfy AI and launch your tech learning journey</p>
          </div>

          {/* Role Switcher */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
            >
              <GraduationCap size={16} /> Student / Job Seeker
            </button>
            <button
              type="button"
              className={`auth-role-tab ${role === 'faculty' ? 'active' : ''}`}
              onClick={() => setRole('faculty')}
            >
              <BookOpen size={16} /> Educator / Faculty
            </button>
          </div>

          {/* Google Quick Sign-Up */}
          <button type="button" className="auth-google-btn" onClick={handleGoogleMock}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09C3.26 21.3 7.37 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.38l4.01-3.09z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.62l4.01 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="auth-divider">
            <span>or register with email</span>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-row">
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="reg-name">Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <User size={18} />
                  </span>
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="auth-input"
                    placeholder="e.g. Sunny Kumar"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="reg-email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Mail size={18} />
                  </span>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="reg-password">Create Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="auth-input"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div className="auth-strength-meter">
                  <div className="auth-strength-track">
                    <div
                      className="auth-strength-bar"
                      style={{
                        width: passwordStrength.width,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                  <span className="auth-strength-label">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="reg-branch">
                  {role === 'student' ? 'Primary Branch / Discipline' : 'Department'}
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <GraduationCap size={18} />
                  </span>
                  <select
                    id="reg-branch"
                    name="branch"
                    className="auth-input"
                    value={form.branch}
                    onChange={handleChange}
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="AI & DS">Artificial Intelligence & Data Science</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                    <option value="ME">Mechanical Engineering (ME)</option>
                    <option value="CE">Civil Engineering (CE)</option>
                    <option value="BCA/MCA">BCA / MCA Applications</option>
                    <option value="Other">Other Disciplines</option>
                  </select>
                </div>
              </div>

              {role === 'student' ? (
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="reg-year">Graduation Year</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">
                      <Calendar size={18} />
                    </span>
                    <select
                      id="reg-year"
                      name="year"
                      className="auth-input"
                      value={form.year}
                      onChange={handleChange}
                    >
                      <option value="1st Year">1st Year (2029 Batch)</option>
                      <option value="2nd Year">2nd Year (2028 Batch)</option>
                      <option value="3rd Year">3rd Year (2027 Batch)</option>
                      <option value="4th Year">4th Year (2026 Batch)</option>
                      <option value="Graduated">Graduated / Job Seeker</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="reg-college">Institution / University</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">
                      <Building2 size={18} />
                    </span>
                    <input
                      id="reg-college"
                      name="college"
                      type="text"
                      className="auth-input"
                      placeholder="e.g. State Technical University"
                      value={form.college}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {role === 'student' && (
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="reg-college-student">College / University Name (Optional)</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    <Building2 size={18} />
                  </span>
                  <input
                    id="reg-college-student"
                    name="college"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Delhi Technological University"
                    value={form.college}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="auth-consent-group">
              <label className="auth-consent-option">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required />
                <span>I agree to the <Link to="/terms" target="_blank" rel="noreferrer">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noreferrer">Privacy Policy</Link>. Required.</span>
              </label>
              <label className="auth-consent-option">
                <input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} />
                <span>Send me occasional product updates and career opportunities. Optional; you can unsubscribe anytime.</span>
              </label>
              <p className="auth-consent-note">Your college details are optional. Uploaded resumes are processed temporarily; analysis is saved only when you explicitly choose to save it.</p>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>Creating Account...</>
              ) : (
                <>
                  Create Free Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login" className="auth-switch-link">
              Sign In Instead →
            </Link>
          </div>

          <p className="auth-terms-note">
            We use your account details to provide the service and essential account messages. Marketing emails are off unless you opt in.
          </p>
        </div>
      </div>
    </div>
  )
}