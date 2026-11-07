import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './HackathonAuth.css'

export default function HackathonRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', branch: '', year: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const destination = location.state?.from?.pathname || '/hackathons/dashboard'

  const submit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = event => setForm({ ...form, [event.target.name]: event.target.value })
  return <main className="hackathon-auth-page"><section className="hackathon-auth-card hackathon-auth-card-wide"><span className="hackathon-kicker">Join the builder network</span><h1>Create your participant account</h1><p>Use your existing Upskillyfy account credentials across the Hackathons platform.</p>{error && <div className="hackathon-auth-error" role="alert">{error}</div>}<form onSubmit={submit}><div className="hackathon-auth-grid"><label>Full name<input name="name" value={form.name} onChange={update} required /></label><label>Email<input name="email" type="email" value={form.email} onChange={update} required /></label></div><label>Password<input name="password" type="password" minLength="8" value={form.password} onChange={update} required /></label><div className="hackathon-auth-grid"><label>College<input name="college" value={form.college} onChange={update} /></label><label>Branch<input name="branch" value={form.branch} onChange={update} /></label></div><label>Graduation year<input name="year" value={form.year} onChange={update} placeholder="e.g. 2027" /></label><button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button></form><p className="hackathon-auth-foot">Already registered? <Link to="/hackathons/login">Sign in</Link></p></section></main>
}
