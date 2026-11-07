import { Link } from 'react-router-dom'
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days.mjs'
import MapPin from 'lucide-react/dist/esm/icons/map-pin.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right.mjs'
import { formatHackathonDate, formatHackathonDateRange } from '../../services/hackathonService'
import HackathonStatusBadge from './HackathonStatusBadge'
import DomainIllustration from './DomainIllustration'

export default function HackathonCard({ hackathon, demo = false, accent = 'blue' }) {
  const domains = Array.isArray(hackathon.domains) ? hackathon.domains : []
  const mode = hackathon.mode || 'Mode to be announced'
  const posterImage = hackathon.bannerImage || hackathon.posterImage || hackathon.image || hackathon.banner

  return (
    <article className={`hackathon-card ${demo ? 'hackathon-card-demo' : ''}`}>
      <div className={`hackathon-card-poster hackathon-card-poster-${accent}`} aria-hidden={posterImage ? undefined : undefined}>
        {posterImage ? <img src={posterImage} alt="" /> : <DomainIllustration domain={domains[0]?.domainId || domains[0]?.name} title={hackathon.title} />}
      </div>
      <div className="hackathon-card-top">
        <div className="hackathon-logo">
          {hackathon.logo ? <img src={hackathon.logo} alt="" /> : <span aria-hidden="true">⚡</span>}
        </div>
        <HackathonStatusBadge status={hackathon.status} />
      </div>
      <div className="hackathon-card-content">
        <p className="hackathon-organiser">{hackathon.organiser || 'Upskillyfy Innovation Platform'}</p>
        <h2>{hackathon.title}</h2>
        <p className="hackathon-description">{hackathon.description || 'Details will be announced soon.'}</p>
        <div className="hackathon-card-meta">
          <span><CalendarDays size={15} /> {formatHackathonDateRange(hackathon.startDate, hackathon.endDate)}</span>
          <span><MapPin size={15} /> {mode}</span>
          <span><Users size={15} /> {domains.length} {domains.length === 1 ? 'domain' : 'domains'}</span>
        </div>
        {domains.length > 0 && (
          <div className="hackathon-domain-list" aria-label="Hackathon domains">
            {domains.slice(0, 3).map(domain => <span key={domain.domainId || domain.name}>{domain.name || domain.domainId}</span>)}
            {domains.length > 3 && <span>+{domains.length - 3} more</span>}
          </div>
        )}
        <div className="hackathon-card-footer">
          <span className="hackathon-fee">{hackathon.isFree ? 'Free to join' : hackathon.fee ? `Fee: ${hackathon.fee}` : 'Fee details available inside'}</span>
          <span className="hackathon-deadline">Deadline {formatHackathonDate(hackathon.registrationDeadline)}</span>
        </div>
      </div>
      {demo ? <span className="btn-secondary hackathon-card-cta hackathon-demo-cta">Preview only <ArrowUpRight size={16} /></span> : <Link className="btn-primary hackathon-card-cta" to={`/hackathons/${encodeURIComponent(hackathon.slug)}`}>
        View details <ArrowUpRight size={16} />
      </Link>}
    </article>
  )
}
