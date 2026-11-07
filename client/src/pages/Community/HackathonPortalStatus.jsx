import DashboardSidebar from '../../components/hackathons/DashboardSidebar'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import './HackathonPortal.css'

export default function HackathonPortalStatus({ title, description }) {
  return <HackathonProtectedRoute><main className="hackathon-dashboard-page"><div className="container hackathon-dashboard-layout"><DashboardSidebar /><section className="hackathon-dashboard-content"><div className="portal-heading"><div><span className="hackathon-kicker">Participant portal</span><h1>{title}</h1><p>{description}</p></div></div><BackendIntegrationPending title={`${title} integration pending`} description="The current API contract does not define this cross-hackathon module yet." /></section></div></main></HackathonProtectedRoute>
}
