import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AlertCircle from 'lucide-react/dist/esm/icons/circle-alert.mjs'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.mjs'
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days.mjs'
import CheckCircle2 from 'lucide-react/dist/esm/icons/circle-check.mjs'
import Clock3 from 'lucide-react/dist/esm/icons/clock-3.mjs'
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.mjs'
import MapPin from 'lucide-react/dist/esm/icons/map-pin.mjs'
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.mjs'
import HackathonStatusBadge from '../../components/hackathons/HackathonStatusBadge'
import HackathonModulePlaceholder from '../../components/hackathons/HackathonModulePlaceholder'
import RegistrationPanel from '../../components/hackathons/RegistrationPanel'
import DomainIllustration from '../../components/hackathons/DomainIllustration'
import { fetchHackathon, formatHackathonDate, formatHackathonDateRange, getHackathonError } from '../../services/hackathonService'
import NotFound from '../NotFound'
import './HackathonDetail.css'

function DetailSection({ icon, title, children }) {
  return (
    <section className="hackathon-detail-section">
      <div className="hackathon-detail-section-title">{icon}<h2>{title}</h2></div>
      {children}
    </section>
  )
}

export default function HackathonDetail() {
  const { slug } = useParams()
  const [hackathon, setHackathon] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchHackathon(slug).then(result => {
      if (!cancelled) setHackathon(result?.hackathon || result)
    }).catch(requestError => {
      if (!cancelled) setError(getHackathonError(requestError, 'Could not load this hackathon.'))
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return <main className="hackathon-detail-page"><div className="container hackathon-detail-state" aria-busy="true">Loading hackathon details...</div></main>
  }

  if ((error && (error.status === 404 || error.response?.status === 404)) || (!loading && !hackathon && !error)) {
    return <NotFound />
  }

  if (error || !hackathon) {
    return (
      <main className="hackathon-detail-page">
        <div className="container hackathon-detail-state" role="alert">
          <AlertCircle size={30} />
          <h1>Hackathon unavailable</h1>
          <p>{error || 'This hackathon could not be found.'}</p>
          <Link className="btn-primary" to="/hackathons/all">Back to hackathons</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="hackathon-detail-page">
      <div className="container">
        <Link className="hackathon-back-link" to="/hackathons/all"><ArrowLeft size={16} /> Back to hackathons</Link>
        <article className="hackathon-detail-hero">
          <div className="hackathon-detail-hero-main">
            {hackathon.logo ? <img className="hackathon-detail-logo" src={hackathon.logo} alt="" /> : <div className="hackathon-detail-logo-art"><DomainIllustration domain={hackathon.domains?.[0]?.domainId || hackathon.domains?.[0]?.name} title={hackathon.title} compact /></div>}
            <div>
              <span className="hackathons-kicker">Hackathon details</span>
              <h1>{hackathon.title}</h1>
              <p>{hackathon.description || 'Details will be announced soon.'}</p>
              <div className="hackathon-detail-badges">
                <HackathonStatusBadge status={hackathon.status} />
                <span><MapPin size={15} /> {hackathon.mode || 'Mode to be announced'}</span>
                <span><CalendarDays size={15} /> {formatHackathonDateRange(hackathon.startDate, hackathon.endDate)}</span>
              </div>
            </div>
          </div>
          <aside className="hackathon-detail-cta">
            <strong>{hackathon.isFree ? 'Free to participate' : hackathon.fee ? `Participation fee: ${hackathon.fee}` : 'Participation details inside'}</strong>
            <span>Choose an eligible domain and register with your Upskillyfy account.</span>
            <RegistrationPanel slug={slug} domains={hackathon.domains} />
            <small>Deadline: {formatHackathonDate(hackathon.registrationDeadline)}</small>
          </aside>
        </article>

        <div className="hackathon-detail-layout">
          <div className="hackathon-detail-main">
            <DetailSection icon={<CheckCircle2 size={18} />} title="Overview">
              <p className="hackathon-detail-copy">{hackathon.timeline || hackathon.description || 'Overview details will be announced soon.'}</p>
            </DetailSection>
            <DetailSection icon={<ShieldCheck size={18} />} title="Eligibility">
              <p className="hackathon-detail-copy">{hackathon.eligibility || 'Eligibility requirements will be announced soon.'}</p>
            </DetailSection>
            <DetailSection icon={<Clock3 size={18} />} title="Timeline">
              {Array.isArray(hackathon.rounds) && hackathon.rounds.length > 0 ? (
                <div className="hackathon-timeline">
                  {hackathon.rounds.map(round => (
                    <div className="hackathon-timeline-item" key={round.roundId || round.title}>
                      <span className="hackathon-timeline-dot" />
                      <div><strong>{round.title}</strong><p>{round.description || 'Round details will be announced soon.'}</p><small>{formatHackathonDateRange(round.startDate, round.endDate)}</small></div>
                    </div>
                  ))}
                </div>
              ) : <p className="hackathon-detail-muted">Timeline details will be announced soon.</p>}
            </DetailSection>
            <DetailSection icon={<ShieldCheck size={18} />} title="Rules and guidelines">
              <p className="hackathon-detail-copy">{hackathon.rules || 'Rules and guidelines will be announced soon.'}</p>
            </DetailSection>
            <DetailSection icon={<CheckCircle2 size={18} />} title="Prizes and domains">
              {Array.isArray(hackathon.domains) && hackathon.domains.length > 0 ? (
                <div className="hackathon-prize-grid">
                  {hackathon.domains.map(domain => <article key={domain.domainId || domain.name}><strong>{domain.name || domain.domainId}</strong>{domain.description && <p>{domain.description}</p>}{Array.isArray(domain.sampleProblemStatements) && domain.sampleProblemStatements.length > 0 && <ul className="hackathon-detail-list">{domain.sampleProblemStatements.map(statement => <li key={statement}>{statement}</li>)}</ul>}<p>{domain.prizes || 'Prize details will be announced soon.'}</p><small>{domain.teamSizeMin || 1}-{domain.teamSizeMax || 1} participants · Deadline {formatHackathonDate(domain.domainDeadline)}</small></article>)}
                </div>
              ) : <p className="hackathon-detail-muted">Prize and domain details will be announced soon.</p>}
            </DetailSection>
            <DetailSection icon={<ExternalLink size={18} />} title="Resources">
              {Array.isArray(hackathon.resources) && hackathon.resources.length > 0 ? <div className="hackathon-resource-list">{hackathon.resources.map(resource => <a key={resource.url || resource.title} href={resource.url} target="_blank" rel="noreferrer"><strong>{resource.title || 'Organizer resource'}</strong><span>{resource.description || 'Open resource'} <ExternalLink size={14} /></span></a>)}</div> : <p className="hackathon-detail-muted">Resources will be announced by the organizer.</p>}
            </DetailSection>
            <DetailSection icon={<CheckCircle2 size={18} />} title="Frequently asked questions">
              {Array.isArray(hackathon.faqs) && hackathon.faqs.length > 0 ? <div className="hackathon-faq-list">{hackathon.faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div> : <p className="hackathon-detail-muted">FAQs will be published by the organizer.</p>}
            </DetailSection>
          </div>
          <aside className="hackathon-detail-sidebar">
            <DetailSection icon={<ExternalLink size={18} />} title="Organiser">
              <p className="hackathon-detail-organiser">{hackathon.organiser || 'Upskillyfy Innovation Platform'}</p>
              {hackathon.organiserEmail && <a href={`mailto:${hackathon.organiserEmail}`}>{hackathon.organiserEmail}</a>}
            </DetailSection>
            <DetailSection icon={<ShieldCheck size={18} />} title="People behind the event">
              {Array.isArray(hackathon.judges) && hackathon.judges.length > 0 && <div className="hackathon-people-group"><strong>Judges</strong>{hackathon.judges.map(person => <div key={person.name} className="hackathon-person"><span>{person.name}</span><small>{[person.title, person.company].filter(Boolean).join(' · ')}</small></div>)}</div>}
              {Array.isArray(hackathon.mentors) && hackathon.mentors.length > 0 && <div className="hackathon-people-group"><strong>Mentors</strong>{hackathon.mentors.map(person => <div key={person.name} className="hackathon-person"><span>{person.name}</span><small>{[person.title, person.company].filter(Boolean).join(' · ')}</small></div>)}</div>}
              {(!hackathon.judges?.length && !hackathon.mentors?.length) && <p className="hackathon-detail-muted">Judges and mentors will be announced soon.</p>}
            </DetailSection>
            <DetailSection icon={<ExternalLink size={18} />} title="Partners">
              {Array.isArray(hackathon.partners) && hackathon.partners.length > 0 ? <div className="hackathon-partner-list">{hackathon.partners.map(partner => partner.url ? <a key={partner.name} href={partner.url} target="_blank" rel="noreferrer">{partner.name}</a> : <span key={partner.name}>{partner.name}</span>)}</div> : <p className="hackathon-detail-muted">Partners will be announced soon.</p>}
            </DetailSection>
            <DetailSection icon={<Clock3 size={18} />} title="Participant modules">
              <div className="hackathon-module-list">
                <HackathonModulePlaceholder title="Registration and teams" description="Join solo or manage a team when participant APIs are available." />
                <HackathonModulePlaceholder title="Submissions" description="Create drafts and submit project work through the participant workspace." />
                <HackathonModulePlaceholder title="Resources and announcements" description="Access organiser-managed updates and resources in a future workspace." />
              </div>
            </DetailSection>
          </aside>
        </div>

        <article className="hackathon-detail-card">
          <div className="hackathon-detail-heading">
            <div>
              <span className="hackathons-kicker">Stay informed</span>
              <h2>{hackathon.announcements?.length ? 'Announcements' : 'More updates will appear here'}</h2>
              {hackathon.announcements?.length ? hackathon.announcements.map(announcement => <div className="hackathon-detail-announcement" key={announcement._id || announcement.title}><strong>{announcement.title}</strong><p>{announcement.content}</p></div>) : <p>Announcements and results will be shown when the corresponding documented API data is available.</p>}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
