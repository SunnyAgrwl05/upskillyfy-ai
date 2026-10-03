import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', branch: '', college: '', year: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const h = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px' }}>
      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" className="nav-logo" style={{ justifyContent: 'center', display: 'inline-flex', marginBottom: 20 }}>
            <span className="nav-logo-mark">U</span>
            <span>Upskillyfy</span>
          </Link>
          <h1 className="h1" style={{ fontSize: '1.8rem', marginBottom: 8 }}>Join Upskillyfy 🚀</h1>
          <p className="muted">Create your free account and start growing</p>
        </div>
        <div className="card">
          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#c5221f', fontSize: '.88rem' }}>
              ❌ {error}
            </div>
          )}
          <form onSubmit={submit} autoComplete="off">
            <div className="g2" style={{ gap: 14 }}>
              <div className="fg"><label>Full Name</label><input name="name" autoComplete="off" value={form.name} onChange={h} placeholder="Sunny Kumar" required /></div>
              <div className="fg"><label>Email</label><input name="email" type="email" autoComplete="off" value={form.email} onChange={h} placeholder="you@example.com" required /></div>
            </div>
            <div className="fg"><label>Password</label><input name="password" type="password" autoComplete="new-password" value={form.password} onChange={h} placeholder="Min 6 characters" required minLength={6} /></div>
            <div className="g2" style={{ gap: 14 }}>
              <div className="fg">
                <label>Branch</label>
                <select name="branch" value={form.branch} onChange={h}>
                  <option value="">Select Branch</option>
                  {['CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil', 'AI & DS', 'MBA', 'BCA/MCA'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Year</label>
                <select name="year" value={form.year} onChange={h}>
                  <option value="">Select Year</option>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label>College Name</label><input name="college" value={form.college} onChange={h} placeholder="Your college name" /></div>
            <button type="submit" className="btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Free Account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: '.88rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}