import { Link } from 'react-router-dom'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs'
import FilePlus2 from 'lucide-react/dist/esm/icons/file-plus-2.mjs'
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list.mjs'
import Gavel from 'lucide-react/dist/esm/icons/gavel.mjs'
import Megaphone from 'lucide-react/dist/esm/icons/megaphone.mjs'
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3.mjs'
import Download from 'lucide-react/dist/esm/icons/download.mjs'
import Settings2 from 'lucide-react/dist/esm/icons/settings-2.mjs'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import HackathonProtectedRoute from '../../components/hackathons/HackathonProtectedRoute'
import './HackathonPortal.css'

function OrganizerContent() {
  const modules = [['Create and manage hackathons', 'Create, edit and publish using the documented organizer endpoints.', FilePlus2], ['Registrations and participants', 'Review registrations and export the documented CSV response.', ClipboardList], ['Judging and scoring', 'Review submissions and submit documented score criteria.', Gavel], ['Announcements and results', 'Publish announcements and final results when the organizer APIs are connected.', Megaphone]]
  return <main className="hackathon-dashboard-page organizer-dashboard"><div className="container hackathon-dashboard-layout"><aside className="hackathon-dashboard-sidebar organizer-sidebar"><div className="organizer-brand"><ShieldCheck size={18} /><span>Organizer console</span></div><div className="hackathon-sidebar-label">Workspace</div><Link className="active" to="/community/organizer"><BarChart3 size={16} />Overview</Link><span><FilePlus2 size={16} />Hackathon CRUD</span><span><ClipboardList size={16} />Registrations</span><span><Gavel size={16} />Submissions & judging</span><span><Megaphone size={16} />Announcements</span><span><Download size={16} />CSV exports</span><span><Settings2 size={16} />Settings</span></aside><section className="hackathon-dashboard-content"><div className="portal-heading"><div><span className="hackathon-kicker"><ShieldCheck size={15} /> Organizer portal</span><h1>Run better innovation programs</h1><p>A professional control centre for documented organizer workflows.</p></div><button className="btn-secondary" type="button" disabled>Create hackathon</button></div><section className="organizer-overview-strip"><div><span>Published events</span><strong>API pending</strong></div><div><span>Registrations</span><strong>API pending</strong></div><div><span>Submissions</span><strong>API pending</strong></div><div><span>Results</span><strong>API pending</strong></div></section><div className="organizer-content-grid"><section className="organizer-table-panel"><div className="section-heading"><div><span className="hackathon-kicker">Program administration</span><h2>Manage your events</h2></div><button className="btn-secondary" type="button" disabled>Export CSV</button></div><BackendIntegrationPending title="Organizer records are waiting for the API" description="The documented admin endpoints are ready to connect, but no authenticated organizer records are currently available." /></section><section className="organizer-chart-panel"><div className="section-heading"><div><span className="hackathon-kicker">Analytics</span><h2>Program overview</h2></div></div><BackendIntegrationPending title="Analytics pending" description="Charts and totals will render from real registration and submission data once the organizer API is available." /></section></div><div className="organizer-module-grid">{modules.map(([title, description, Icon]) => <article className="organizer-module" key={title}><Icon size={20} /><h2>{title}</h2><p>{description}</p><button className="btn-secondary" type="button" disabled>Open module</button></article>)}</div></section></div></main>
}

export default function OrganizerDashboard() {
  return <HackathonProtectedRoute admin><OrganizerContent /></HackathonProtectedRoute>
}
