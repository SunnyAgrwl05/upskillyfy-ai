import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { safeRedirectPath } from '../Career/Resume/compileGuestUtils'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawNext = searchParams.get('next')
  const next = useMemo(() => safeRedirectPath(rawNext, '/dashboard'), [rawNext])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const googleConfigured = useMemo(() => Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID), [])

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
      navigate(next)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async ({ credential }) => {
    try { await loginWithGoogle(credential, { intent: 'login' }); navigate(next) }
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
          {googleConfigured && (
            <div className="auth-google-btn"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google authentication could not start.')} text="signin_with" /></div>
          )}

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