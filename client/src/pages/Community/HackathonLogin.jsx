import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './HackathonAuth.css'

export default function HackathonLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const destination = location.state?.from?.pathname || '/hackathons/dashboard'

  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="hackathon-auth-page"><section className="hackathon-auth-card"><span className="hackathon-kicker">Upskillyfy Hackathons</span><h1>Welcome back</h1><p>Sign in to manage registrations, teams and submissions.</p>{error && <div className="hackathon-auth-error" role="alert">{error}</div>}<form onSubmit={submit}><label htmlFor="hackathon-login-email">Email<input id="hackathon-login-email" name="email" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="Enter your email" autoComplete="email" required /></label><label htmlFor="hackathon-login-password">Password<input id="hackathon-login-password" name="password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" autoComplete="current-password" required /></label><button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button></form><p className="hackathon-auth-foot">New to hackathons? <Link to="/hackathons/register">Create an account</Link></p></section></main>
}
