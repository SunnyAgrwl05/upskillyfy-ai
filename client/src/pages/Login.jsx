import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { safePostAuthDestination } from '../utils/authRedirect'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const h = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(form.email, form.password)
      navigate(safePostAuthDestination(location.state?.from), {
        replace: true,
        state: location.state?.startAssessment ? { startAssessment: true } : null,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" className="nav-logo" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: 24 }}>
            <img className="auth-brand-logo-image" src="/upskillyfy-logo.jpg" alt="Upskillyfy" />
          </Link>
          <h1 className="h1" style={{ fontSize: '1.8rem', marginBottom: 8 }}>Welcome Back 👋</h1>
          <p className="muted">Login to your Upskillyfy account</p>
        </div>
        <div className="card">
          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#c5221f', fontSize: '.88rem' }}>
              ❌ {error}
            </div>
          )}
          <form onSubmit={submit}>
            <div className="fg"><label>Email</label><input name="email" type="email" value={form.email} onChange={h} placeholder="you@example.com" required/></div>
            <div className="fg"><label>Password</label><input name="password" type="password" value={form.password} onChange={h} placeholder="Your password" required/></div>
            <button type="submit" className="btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: '.88rem' }}>
            Don't have an account? <Link to="/register" state={location.state} style={{ color: 'var(--accent)', fontWeight: 700 }}>Join Free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}