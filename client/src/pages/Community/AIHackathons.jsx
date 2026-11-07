import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Brain from 'lucide-react/dist/esm/icons/brain.mjs'
import HackathonCard from '../../components/hackathons/HackathonCard'
import LoadingSkeleton from '../../components/hackathons/LoadingSkeleton'
import ErrorState from '../../components/hackathons/ErrorState'
import EmptyState from '../../components/hackathons/EmptyState'
import { fetchHackathons, getHackathonError } from '../../services/hackathonService'
import './HackathonPortal.css'

export default function AIHackathons() {
  const [state, setState] = useState({ items: [], loading: true, error: '' })
  const load = () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    fetchHackathons({ domain: 'ai', page: 1, limit: 12 }).then(result => setState({ items: result.items, loading: false, error: '' })).catch(err => setState({ items: [], loading: false, error: getHackathonError(err, 'AI hackathons are unavailable.') }))
  }
  useEffect(load, [])
  return <main className="hackathon-page-shell"><section className="innovation-subhero ai-hero"><div className="container"><span className="hackathon-kicker"><Brain size={15} /> AI opportunities</span><h1>Build the intelligence layer.</h1><p>AI-focused hackathons from the documented hackathon catalogue.</p><Link className="btn-secondary" to="/community/hackathons">Browse all hackathons</Link></div></section><section className="hackathon-page-section"><div className="container"><div className="section-heading"><div><span className="hackathon-kicker">Domain: ai</span><h2>AI hackathons</h2></div></div>{state.loading && <LoadingSkeleton count={6} />}{state.error && <ErrorState message={state.error} onRetry={load} />}{!state.loading && !state.error && state.items.length === 0 && <EmptyState title="No AI hackathons found" description="AI opportunities will appear when published by organizers." />}{!state.loading && !state.error && state.items.length > 0 && <div className="hackathon-grid">{state.items.map(item => <HackathonCard key={item.slug || item._id} hackathon={item} />)}</div>}</div></section></main>
}
