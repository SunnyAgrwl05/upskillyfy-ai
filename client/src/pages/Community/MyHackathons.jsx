import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardSidebar from '../../components/hackathons/DashboardSidebar'
import EmptyState from '../../components/hackathons/EmptyState'
import ErrorState from '../../components/hackathons/ErrorState'
import LoadingSkeleton from '../../components/hackathons/LoadingSkeleton'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import { fetchMyRegistrations, getHackathonError, unwrapHackathonResponse } from '../../services/hackathonService'
import { hackathonAPI } from '../../api'
import './HackathonPortal.css'

function MyHackathonsContent() {
  const [state, setState] = useState({ items: [], loading: true, error: '' })
  const load = () => { setState(current => ({ ...current, loading: true, error: '' })); fetchMyRegistrations().then(items => setState({ items, loading: false, error: '' })).catch(err => setState({ items: [], loading: false, error: getHackathonError(err, 'Could not load your registrations.') })) }
  const cancel = async slug => {
    setState(current => ({ ...current, loading: true, error: '' }))
    try {
      unwrapHackathonResponse(await hackathonAPI.cancelRegistration(slug))
      load()
    } catch (error) {
      setState(current => ({ ...current, loading: false, error: getHackathonError(error, 'Registration could not be cancelled.') }))
    }
  }
  useEffect(load, [])
  return <main className="hackathon-dashboard-page"><div className="container hackathon-dashboard-layout"><DashboardSidebar /><section className="hackathon-dashboard-content"><div className="portal-heading"><div><span className="hackathon-kicker">Participant portal</span><h1>My registrations</h1><p>Registrations returned by your account.</p></div></div>{state.loading && <LoadingSkeleton count={3} />}{state.error && <ErrorState message={state.error} onRetry={load} />}{!state.loading && !state.error && state.items.length === 0 && <EmptyState title="No registrations yet" description="Discover a hackathon and register to see it in your workspace." action={<Link className="btn-primary" to="/hackathons/all">Discover hackathons</Link>} />}{!state.loading && !state.error && state.items.length > 0 && <div className="registration-list">{state.items.map(item => <article className="registration-card" key={item.registrationId || item.hackathonId}><div><span className="hackathon-kicker">{item.status || 'Registered'}</span><h2>{item.title}</h2><p>Domain: {item.domainId} · Registered {item.registeredAt ? new Date(item.registeredAt).toLocaleDateString() : 'date unavailable'}</p></div><div className="registration-actions"><Link className="btn-secondary" to={`/hackathons/${encodeURIComponent(item.slug)}/workspace`}>Open workspace</Link><button className="btn-secondary" type="button" disabled={state.loading} onClick={() => cancel(item.slug)}>Cancel registration</button></div></article>)}</div>}</section></div></main>
}

export default function MyHackathons() {
  return <HackathonProtectedRoute><MyHackathonsContent /></HackathonProtectedRoute>
}
