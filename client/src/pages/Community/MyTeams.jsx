import { useEffect, useState } from 'react'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import DashboardSidebar from '../../components/hackathons/DashboardSidebar'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import LoadingSkeleton from '../../components/hackathons/LoadingSkeleton'
import ErrorState from '../../components/hackathons/ErrorState'
import { fetchMyRegistrations, fetchHackathonTeam, getHackathonError } from '../../services/hackathonService'
import './HackathonPortal.css'

export default function MyTeams() {
  const [state, setState] = useState({ teams: [], loading: true, error: '' })
  const load = () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    fetchMyRegistrations().then(async registrations => {
      const results = await Promise.all(registrations.map(async registration => {
        try { return { ...await fetchHackathonTeam(registration.slug), title: registration.title, slug: registration.slug } } catch { return null }
      }))
      setState({ teams: results.filter(Boolean), loading: false, error: '' })
    }).catch(error => setState({ teams: [], loading: false, error: getHackathonError(error, 'Could not load your team memberships.') }))
  }
  useEffect(load, [])
  return <HackathonProtectedRoute><main className="hackathon-dashboard-page"><div className="container hackathon-dashboard-layout"><DashboardSidebar /><section className="hackathon-dashboard-content"><div className="portal-heading"><div><span className="hackathon-kicker"><Users size={15} /> Participant portal</span><h1>My teams</h1><p>Team memberships returned by each registered hackathon workspace.</p></div></div>{state.loading && <LoadingSkeleton count={2} />}{state.error && <ErrorState message={state.error} onRetry={load} />}{!state.loading && !state.error && state.teams.length === 0 && <BackendIntegrationPending title="No team memberships returned" description="The documented API exposes team details per hackathon. Cross-hackathon team listing is not available, and no registered workspace returned a team." />}{!state.loading && !state.error && state.teams.length > 0 && <div className="team-directory">{state.teams.map(team => <article className="dashboard-panel" key={`${team.slug}-${team.teamId}`}><div className="section-heading"><div><span className="hackathon-kicker">{team.currentUserIsLeader || team.isLeader ? 'Team leader' : 'Team member'}</span><h2>{team.teamName}</h2></div><Users size={18} /></div><p>{team.title}</p><div className="team-directory-meta"><span>Domain: {team.domainId || 'Unavailable'}</span><span>{team.members?.length || 0} members</span></div><a className="btn-secondary" href={`/hackathons/${encodeURIComponent(team.slug)}/workspace/team`}>Manage team</a></article>)}</div>}</section></div></main></HackathonProtectedRoute>
}
