import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CalendarClock from 'lucide-react/dist/esm/icons/calendar-clock.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import Bell from 'lucide-react/dist/esm/icons/bell.mjs'
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.mjs'
import UserRound from 'lucide-react/dist/esm/icons/user-round.mjs'
import DashboardSidebar from '../../components/hackathons/DashboardSidebar'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import LoadingSkeleton from '../../components/hackathons/LoadingSkeleton'
import ErrorState from '../../components/hackathons/ErrorState'
import { fetchMyRegistrations, getHackathonError } from '../../services/hackathonService'
import './HackathonPortal.css'

function DashboardContent() {
  const [state, setState] = useState({ items: [], loading: true, error: '' })
  const load = () => { setState(current => ({ ...current, loading: true, error: '' })); fetchMyRegistrations().then(items => setState({ items, loading: false, error: '' })).catch(error => setState({ items: [], loading: false, error: getHackathonError(error, 'Could not load your dashboard data.') })) }
  useEffect(load, [])
  return <main className="hackathon-dashboard-page participant-dashboard"><div className="container hackathon-dashboard-layout"><DashboardSidebar /><section className="hackathon-dashboard-content"><div className="portal-heading"><div><span className="hackathon-kicker">Participant portal</span><h1>Your innovation workspace</h1><p>Track registrations, teams and submissions from one place.</p></div><Link className="btn-primary" to="/hackathons/all">Discover hackathons</Link></div>{state.loading && <LoadingSkeleton count={3} />}{state.error && <ErrorState message={state.error} onRetry={load} />}{!state.loading && !state.error && <><div className="dashboard-stat-grid">{[['My Hackathons', 'View registrations', CalendarClock, '/hackathons/my-registrations'], ['My Teams', 'Manage collaboration', Users, '/hackathons/my-teams'], ['Submissions', 'Track project work', Upload, '/hackathons/submissions']].map(([title, text, Icon, to]) => <Link className="dashboard-stat-card" to={to} key={title}><Icon size={20} /><strong>{title}</strong><span>{title === 'My Hackathons' ? `${state.items.length} registered` : text}</span></Link>)}</div><div className="dashboard-panel-grid"><section className="dashboard-panel dashboard-agenda"><div className="section-heading"><div><span className="hackathon-kicker"><Clock3 size={14} /> Registered activity</span><h2>Your hackathons</h2></div><span className="panel-caption">Live account data</span></div>{state.items.length ? <div className="dashboard-registration-list">{state.items.slice(0, 4).map(item => <Link key={item.registrationId || item.hackathonId} to={`/hackathons/${encodeURIComponent(item.slug)}/workspace`}><strong>{item.title}</strong><span>{item.status || 'Registered'} · {item.domainId || 'Domain unavailable'}</span></Link>)}</div> : <BackendIntegrationPending title="No registrations yet" description="Register for a published hackathon to see it in your dashboard." />}</section><section className="dashboard-panel dashboard-profile"><div className="section-heading"><div><span className="hackathon-kicker"><UserRound size={14} /> Participant information</span><h2>Your profile</h2></div><span className="panel-caption">Private</span></div><p>Keep your supported account details ready for organizers and teammates.</p><Link className="btn-secondary" to="/hackathons/profile">View and edit profile</Link></section></div><section className="dashboard-panel dashboard-activity"><div className="section-heading"><div><span className="hackathon-kicker"><Bell size={14} /> Activity</span><h2>Notifications and achievements</h2></div></div><BackendIntegrationPending title="Activity feed is API pending" description="Notifications, certificates and participant-specific rankings are not documented by the current API contract." /></section></>}</section></div></main>
}

export default function HackathonDashboard() {
  return <HackathonProtectedRoute><DashboardContent /></HackathonProtectedRoute>
}
