import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.mjs'
import Pencil from 'lucide-react/dist/esm/icons/pencil.mjs'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs'
import Trophy from 'lucide-react/dist/esm/icons/trophy.mjs'
import UserRound from 'lucide-react/dist/esm/icons/user-round.mjs'
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days.mjs'
import { userAPI, hackathonAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import DashboardSidebar from '../../components/hackathons/DashboardSidebar'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import { getHackathonError, unwrapHackathonResponse } from '../../services/hackathonService'
import './HackathonParticipantProfile.css'

const editableFields = ['name', 'branch', 'college', 'year', 'linkedin', 'github']

function Avatar({ user, large = false }) {
  const initials = (user?.name || 'Participant').split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()
  return user?.avatar ? <img className={`participant-avatar${large ? ' large' : ''}`} src={user.avatar} alt={`${user.name || 'Participant'} avatar`} /> : <div className={`participant-avatar participant-avatar-fallback${large ? ' large' : ''}`} aria-label={`${user?.name || 'Participant'} initials`}>{initials}</div>
}

function ProfileContent() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(authUser || {})
  const [registrations, setRegistrations] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [state, setState] = useState({ loading: true, saving: false, error: '', notice: '' })

  const load = () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    Promise.all([
      userAPI.getProfile().then(response => response.data),
      hackathonAPI.myRegistrations().then(unwrapHackathonResponse),
    ]).then(([user, items]) => {
      setProfile(user || authUser || {})
      setForm(Object.fromEntries(editableFields.map(field => [field, user?.[field] || ''])))
      setRegistrations(items || [])
      setState(current => ({ ...current, loading: false }))
    }).catch(error => setState(current => ({ ...current, loading: false, error: getHackathonError(error, 'Could not load your participant profile.') })))
  }

  useEffect(load, [authUser])

  const completion = useMemo(() => {
    const available = editableFields.filter(field => profile?.[field]).length
    return Math.round((available / editableFields.length) * 100)
  }, [profile])

  const save = async event => {
    event.preventDefault()
    setState(current => ({ ...current, saving: true, error: '', notice: '' }))
    try {
      const saved = await userAPI.updateProfile(form)
      setProfile(saved.data)
      setEditing(false)
      setState(current => ({ ...current, saving: false, notice: 'Profile details saved.' }))
    } catch (error) {
      setState(current => ({ ...current, saving: false, error: getHackathonError(error, 'Profile details could not be saved.') }))
    }
  }

  return <main className="hackathon-dashboard-page participant-profile-page"><div className="container hackathon-dashboard-layout"><DashboardSidebar /><section className="hackathon-dashboard-content">
    <header className="portal-heading"><div><span className="hackathon-kicker"><UserRound size={15} /> Participant profile</span><h1>{editing ? 'Edit your profile' : 'Your builder profile'}</h1><p>Manage the information used across your Hackathons experience.</p></div><div className="profile-heading-actions">{!editing && <button className="btn-primary" type="button" onClick={() => setEditing(true)}><Pencil size={15} /> Edit profile</button>}{editing && <button className="btn-secondary" type="button" onClick={() => setEditing(false)}>Cancel</button>}</div></header>
    {state.loading && <div className="profile-loading" aria-busy="true">Loading your profile...</div>}
    {state.error && <div className="form-error" role="alert">{state.error} <button type="button" onClick={load}>Try again</button></div>}
    {!state.loading && <><section className="participant-profile-hero"><div className="participant-profile-identity"><Avatar user={profile} large /><div><span className="hackathon-kicker">Participant</span><h2>{profile.name || 'Your name'}</h2><p>{profile.email || 'Email unavailable'}</p><div className="profile-links">{profile.github && <a href={profile.github} target="_blank" rel="noreferrer"><ExternalLink size={15} /> GitHub</a>}{profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer"><ExternalLink size={15} /> LinkedIn</a>}</div></div></div><div className="profile-completion"><div><strong>{completion}%</strong><span>Profile completion</span></div><div className="profile-progress"><span style={{ width: `${completion}%` }} /></div><small>Complete supported account fields to make your participant profile easier to recognize.</small></div></section>
      {state.notice && <p className="form-success" role="status">{state.notice}</p>}
      {editing ? <form className="profile-edit-form" onSubmit={save}><div className="profile-form-grid">{editableFields.map(field => <label key={field}>{field === 'year' ? 'Graduation year / current year' : field[0].toUpperCase() + field.slice(1)}<input type={field === 'linkedin' || field === 'github' ? 'url' : 'text'} value={form[field] || ''} onChange={event => setForm({ ...form, [field]: event.target.value })} placeholder={field === 'linkedin' || field === 'github' ? 'https://...' : ''} /></label>)}</div><p className="profile-api-note">These are the only profile fields supported by the existing account API. Avatar upload, bio, location, skills, interests and visibility are not currently persisted.</p><button className="btn-primary" type="submit" disabled={state.saving}>{state.saving ? 'Saving...' : 'Save profile'}</button></form> : <section className="profile-overview-grid"><article className="dashboard-panel"><div className="section-heading"><div><span className="hackathon-kicker">Account information</span><h2>About you</h2></div><ShieldCheck size={18} /></div><dl className="profile-facts"><div><dt>College</dt><dd>{profile.college || 'Not added'}</dd></div><div><dt>Branch</dt><dd>{profile.branch || 'Not added'}</dd></div><div><dt>Year</dt><dd>{profile.year || 'Not added'}</dd></div><div><dt>Email</dt><dd>{profile.email || 'Not available'}</dd></div></dl></article><article className="dashboard-panel"><div className="section-heading"><div><span className="hackathon-kicker">Participation</span><h2>Registered hackathons</h2></div><CalendarDays size={18} /></div><strong className="profile-stat">{registrations.length}</strong><p className="profile-muted">Registrations returned by your authenticated account.</p><Link className="btn-secondary" to="/hackathons/my-registrations">View registrations</Link></article></section>}
      <section className="profile-section-grid"><article className="dashboard-panel"><div className="section-heading"><div><span className="hackathon-kicker"><Trophy size={14} /> Achievements</span><h2>Verified recognition</h2></div></div><BackendIntegrationPending title="Achievements are API pending" description="The current APIs do not expose participant-specific rankings, awards or certificates." /></article><article className="dashboard-panel"><div className="section-heading"><div><span className="hackathon-kicker">Activity</span><h2>Recent participant updates</h2></div></div><BackendIntegrationPending title="Activity feed is API pending" description="A cross-hackathon notifications and activity endpoint is not documented." /></article></section>
    </>}
  </section></div></main>
}

export default function HackathonParticipantProfile() {
  return <HackathonProtectedRoute><ProfileContent /></HackathonProtectedRoute>
}
