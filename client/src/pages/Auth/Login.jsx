import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  PlayCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please provide both your email address and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(form.email.trim(), form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async ({ credential }) => {
    try { await loginWithGoogle(credential, { intent: 'login' }); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.message || 'Google sign-in failed. Please try again.') }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      <div className="auth-split-card">
        {/* Left Side: Brand Showcase & Social Proof */}
        <div className="auth-hero-panel">
          <div>
            <div className="auth-hero-badge">
              <Sparkles size={14} />
              Career OS for Modern Engineers
            </div>

            <h2 className="auth-hero-title">
              Master In-Demand Tech & <span>Accelerate Your Growth</span>
            </h2>

            <p className="auth-hero-desc">
              Log in to resume your interactive MPEG-DASH courses, practice full-length technical assessments, and track your internship applications.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <PlayCircle size={18} />
                </div>
                <div className="auth-feature-text">
                  <h4>Adaptive Video Streaming</h4>
                  <p>HD video player with multi-bitrate resolution controls & playback speeds.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <GraduationCap size={18} />
                </div>
                <div className="auth-feature-text">
                  <h4>41+ Verified Technical Tests</h4>
                  <p>Branch-specific DSA, Web Dev, Cloud, and AI skill assessments with instant scoring.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Briefcase size={18} />
                </div>
                <div className="auth-feature-text">
                  <h4>Curated Paid Tech Internships</h4>
                  <p>Direct application routing to verified startup & enterprise hiring managers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-trust-pill">
            <div className="auth-trust-stars">
              {'★'.repeat(5)} <span style={{ color: 'var(--text-h)', fontWeight: 700, marginLeft: 4 }}>4.9/5</span>
            </div>
            <p className="auth-trust-quote">
              "The DSA mock tests and Cloud Architecture cram sheets were instrumental in clearing my Google & startup rounds."
            </p>
            <span className="auth-trust-author">— Rohit Verma, SDE Intern (Placed 2026 Batch)</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form */}
        <div className="auth-form-panel">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back 👋</h1>
            <p className="auth-subtitle">Sign in to your Upskillyfy AI account to continue</p>
          </div>

          {/* Google Quick Sign-In */}
          <button type="button" className="auth-google-btn" onClick={handleGoogleMock}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09C3.26 21.3 7.37 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.38l4.01-3.09z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.62l4.01 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  className="auth-input"
                  placeholder="you@college.edu or name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
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
            </div>

            <div className="auth-helper-row">
              <span style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={15} color="#34a853" /> Secure JWT Session
              </span>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('Password reset instructions will be sent to your registered email.') }} className="auth-forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>Signing in...</>
              ) : (
                <>
                  Sign In to Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account yet?
            <Link to="/register" className="auth-switch-link">
              Create Free Account →
            </Link>
          </div>

          <p className="auth-terms-note">
            By signing in, you agree to Upskillyfy AI's Terms of Service and Privacy Policy. Protected by enterprise-grade encryption.
          </p>
        </div>
      </div>
    </div>
  )
}