import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.mjs'
import HackathonStatusBadge from '../../components/hackathons/HackathonStatusBadge'
import WorkspaceNavigation from '../../components/hackathons/WorkspaceNavigation'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import SubmissionCard from '../../components/hackathons/SubmissionCard'
import AnnouncementCard from '../../components/hackathons/AnnouncementCard'
import ErrorState from '../../components/hackathons/ErrorState'
import RegistrationPanel from '../../components/hackathons/RegistrationPanel'
import TeamManagementPanel from '../../components/hackathons/TeamManagementPanel'
import SubmissionEditor from '../../components/hackathons/SubmissionEditor'
import {
  fetchHackathon,
  fetchHackathonResults,
  fetchHackathonTeam,
  fetchMySubmissions,
  formatHackathonDateRange,
  getHackathonError,
} from '../../services/hackathonService'
import './HackathonPortal.css'

const PENDING_TABS = {
  roadmap: ['Roadmap progress', 'Persistent roadmap completion is not part of the current API contract.'],
  challenges: ['Challenges', 'Challenge lifecycle endpoints are not documented yet.'],
  resources: ['Resources', 'Participant resource listing is not part of the current API contract.'],
  interactions: ['Interactions and discussions', 'Discussion, questions and replies require new backend endpoints.'],
}

function WorkspaceOverview({ hackathon }) {
  return (
    <>
      <section className="workspace-panel">
        <span className="hackathon-kicker">Overview</span>
        <h2>Build with purpose</h2>
        <p>{hackathon.description || 'Hackathon details will appear here.'}</p>
        <div className="workspace-info-grid">
          <span>Mode<strong>{hackathon.mode || 'To be announced'}</strong></span>
          <span>Deadline<strong>{hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline).toLocaleDateString() : 'To be announced'}</strong></span>
          <span>Domains<strong>{hackathon.domains?.length || 0}</strong></span>
        </div>
      </section>
      <WorkspacePendingModules />
    </>
  )
}

function WorkspaceSubmissions({ submissions }) {
  if (!submissions.length) {
    return <BackendIntegrationPending title="No submissions returned" description="The documented submissions endpoint returned no project submissions for this workspace." />
  }
  return <div className="submission-list">{submissions.map(item => <SubmissionCard key={item._id || item.submissionId} submission={item} />)}</div>
}

function WorkspaceAnnouncements({ announcements }) {
  if (!announcements?.length) {
    return <BackendIntegrationPending title="Announcements are not available" description="Announcements are exposed in the detail model, but no participant listing endpoint is documented." />
  }
  return announcements.map(item => <AnnouncementCard key={item._id || item.title} announcement={item} />)
}

function WorkspaceResults({ results }) {
  if (!results?.winners?.length) {
    return <BackendIntegrationPending title="Results not published" description="Results appear here only when the documented public results endpoint returns published winners." />
  }
  return results.winners.map(winner => <div className="result-row" key={`${winner.teamId}-${winner.rank}`}><strong>Rank {winner.rank}</strong><span>{winner.domainId}</span><b>{winner.score}</b></div>)
}

function WorkspaceContent() {
  const { slug, tab = 'overview' } = useParams()
  const [hackathon, setHackathon] = useState(null)
  const [team, setTeam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [results, setResults] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHackathon(slug)
      .then(data => setHackathon(data?.hackathon || data))
      .catch(err => setError(getHackathonError(err, 'Could not load hackathon.')))
    fetchHackathonTeam(slug).then(setTeam).catch(() => {})
    fetchMySubmissions(slug).then(setSubmissions).catch(() => {})
    fetchHackathonResults(slug).then(setResults).catch(() => {})
  }, [slug])

  if (error) return <ErrorState message={error} />
  if (!hackathon) return <main className="hackathon-page-shell"><div className="container">Loading workspace...</div></main>

  return (
    <main className="hackathon-workspace-page">
      <div className="container">
        <Link className="back-link" to={`/hackathons/${encodeURIComponent(slug)}`}><ArrowLeft size={15} /> Back to details</Link>
        <header className="workspace-header">
          <div><span className="hackathon-kicker">Participant workspace</span><h1>{hackathon.title}</h1><p>{formatHackathonDateRange(hackathon.startDate, hackathon.endDate)}</p></div>
          <HackathonStatusBadge status={hackathon.status} />
        </header>
        <WorkspaceNavigation slug={slug} />
        <div className="workspace-body">
          {tab === 'overview' && <WorkspaceOverview hackathon={hackathon} />}
          {tab === 'registration' && <section className="workspace-panel"><h2>Registration</h2><RegistrationPanel slug={slug} domains={hackathon.domains} registration={registration} onChanged={setRegistration} /></section>}
          {tab === 'team' && <section className="workspace-panel"><h2>Team management</h2><TeamManagementPanel slug={slug} team={team} domains={hackathon.domains} onChange={() => fetchHackathonTeam(slug).then(setTeam).catch(() => setTeam(null))} /></section>}
          {tab === 'submissions' && <section className="workspace-panel"><h2>Submissions</h2><SubmissionEditor slug={slug} submissions={submissions} onSaved={() => fetchMySubmissions(slug).then(setSubmissions)} /><WorkspaceSubmissions submissions={submissions} /></section>}
          {tab === 'announcements' && <section className="workspace-panel"><h2>Announcements</h2><WorkspaceAnnouncements announcements={hackathon.announcements} /></section>}
          {tab === 'results' && <section className="workspace-panel"><h2>Results and leaderboard</h2><WorkspaceResults results={results} /></section>}
          {PENDING_TABS[tab] && <section className="workspace-panel"><h2>{PENDING_TABS[tab][0]}</h2><BackendIntegrationPending title={`${PENDING_TABS[tab][0]} pending`} description={PENDING_TABS[tab][1]} /></section>}
        </div>
      </div>
    </main>
  )
}

function WorkspacePendingModules() {
  return <div className="workspace-module-grid"><BackendIntegrationPending title="Roadmap" description="Round milestones are visible on the public detail page; persistent completion is pending." /><BackendIntegrationPending title="Challenges" description="Challenge endpoints are not documented yet." /><BackendIntegrationPending title="Resources and discussions" description="Participant resource and interaction endpoints are not documented yet." /></div>
}

export default function HackathonWorkspace() {
  return <HackathonProtectedRoute><WorkspaceContent /></HackathonProtectedRoute>
}
