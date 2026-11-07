import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Flag from 'lucide-react/dist/esm/icons/flag.mjs'
import BackendIntegrationPending from '../../components/hackathons/BackendIntegrationPending'
import './HackathonPortal.css'

export default function InnovationChallenges() {
  return <main className="hackathon-page-shell"><section className="innovation-subhero"><div className="container"><span className="hackathon-kicker"><Flag size={15} /> Innovation challenges</span><h1>Problems worth solving.</h1><p>Explore challenge discovery designed for organizer-published problem statements.</p></div></section><section className="hackathon-page-section"><div className="container"><div className="discovery-toolbar"><label><Search size={17} /><input placeholder="Search challenges" aria-label="Search challenges" disabled /></label><select aria-label="Filter by category" disabled><option>All categories</option></select><select aria-label="Filter by domain" disabled><option>All domains</option></select></div><BackendIntegrationPending title="Challenge discovery API pending" description="The current API contract does not define challenge listing, search, filters or details. The UI is ready for that contract without showing fabricated challenges." /></div></section></main>
}
