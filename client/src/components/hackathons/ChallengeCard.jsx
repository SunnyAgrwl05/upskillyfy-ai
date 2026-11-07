import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right.mjs'
import DomainBadge from './DomainBadge'
import BackendIntegrationPending from './BackendIntegrationPending'

export default function ChallengeCard({ challenge }) {
  return (
    <article className="challenge-card">
      <div className="challenge-card-top"><DomainBadge>{challenge.domain || 'Innovation'}</DomainBadge><span className="challenge-difficulty">{challenge.difficulty || 'Challenge'}</span></div>
      <h3>{challenge.title}</h3>
      <p>{challenge.description}</p>
      <BackendIntegrationPending title="Challenge API pending" description="Challenge details will appear when the backend contract is available." />
      <button type="button" className="btn-secondary" disabled>Explore challenge <ArrowUpRight size={15} /></button>
    </article>
  )
}
