import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right.mjs'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.mjs'
import HackathonCard from '../../components/hackathons/HackathonCard'
import LoadingSkeleton from '../../components/hackathons/LoadingSkeleton'
import ErrorState from '../../components/hackathons/ErrorState'
import EmptyState from '../../components/hackathons/EmptyState'
import { fetchHackathons, getHackathonError } from '../../services/hackathonService'
import './HackathonPortal.css'

export default function InnovationHome() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [featuredOffset, setFeaturedOffset] = useState(0)

  const load = () => {
    setLoading(true)
    setError('')
    fetchHackathons({ page: 1, limit: 12 })
      .then(result => setItems(result.items))
      .catch(requestError => setError(getHackathonError(requestError, 'Innovation opportunities are unavailable.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const upcoming = useMemo(() => [...items]
    .filter(item => item.startDate && new Date(item.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3), [items])
  const recent = useMemo(() => [...items]
    .filter(item => item.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3), [items])
  const domains = useMemo(() => [...new Map(items
    .flatMap(item => (item.domains || []).map(domain => [domain.domainId || domain.name, domain]))
    .filter(([key]) => key)).values()].slice(0, 10), [items])
  const featured = items.slice(featuredOffset, featuredOffset + 3)
  const canMove = items.length > 3

  useEffect(() => {
    setFeaturedOffset(current => current >= items.length ? 0 : current)
  }, [items.length])

  const cards = collection => <div className="hackathon-grid">{collection.map(item => <HackathonCard key={item.slug || item._id} hackathon={item} />)}</div>

  return <main className="hackathon-page-shell hackathon-home-page">
    <section className="hackathon-home-hero">
      <div className="container">
        <div className="hackathon-home-hero-copy">
          <span className="hackathon-kicker"><Sparkles size={15} /> Upskillyfy Hackathons</span>
          <h1>Find a challenge. Build what matters.</h1>
          <p>Discover real hackathons, meet ambitious builders and turn your ideas into work worth sharing.</p>
          <div className="hackathon-hero-actions">
            <Link className="btn-primary" to="/hackathons/all">Explore hackathons <ArrowRight size={16} /></Link>
            <Link className="btn-secondary" to="/hackathons/all"><Search size={16} /> Search opportunities</Link>
          </div>
        </div>
        <div className="hackathon-home-hero-note"><span>THE BUILDER'S ROUTE</span><strong>Discover · Collaborate · Submit</strong><p>A focused workspace for participants and organizers.</p></div>
      </div>
    </section>

    <section className="hackathon-page-section">
      <div className="container">
        <div className="section-heading"><div><span className="hackathon-kicker">Live catalogue</span><h2>Featured hackathons</h2></div><div className="featured-controls"><button type="button" aria-label="Previous featured hackathons" disabled={!canMove} onClick={() => setFeaturedOffset(offset => offset === 0 ? Math.max(0, items.length - 3) : offset - 1)}><ChevronLeft size={17} /></button><button type="button" aria-label="Next featured hackathons" disabled={!canMove} onClick={() => setFeaturedOffset(offset => offset + 3 >= items.length ? 0 : offset + 1)}><ChevronRight size={17} /></button></div></div>
        {loading && <LoadingSkeleton count={3} />}
        {error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && items.length === 0 && <EmptyState title="No featured hackathons yet" description="Published opportunities will appear here when the live API returns them." />}
        {!loading && !error && items.length > 0 && <div className="hackathon-home-featured">{cards(featured)}</div>}
      </div>
    </section>

    {!loading && !error && upcoming.length > 0 && <section className="hackathon-page-section alt"><div className="container"><div className="section-heading"><div><span className="hackathon-kicker">What is next</span><h2>Upcoming opportunities</h2></div><Link to="/hackathons/all">View all <ArrowRight size={15} /></Link></div>{cards(upcoming)}</div></section>}
    {!loading && !error && recent.length > 0 && <section className="hackathon-page-section"><div className="container"><div className="section-heading"><div><span className="hackathon-kicker">Fresh from organizers</span><h2>Recently added</h2></div><Link to="/hackathons/all">Browse catalogue <ArrowRight size={15} /></Link></div>{cards(recent)}</div></section>}

    <section className="hackathon-page-section alt"><div className="container"><div className="section-heading"><div><span className="hackathon-kicker">Find your lane</span><h2>Popular domains</h2></div></div>{domains.length > 0 ? <div className="popular-domain-grid">{domains.map(domain => <Link className="popular-domain" key={domain.domainId || domain.name} to={`/hackathons/all?domain=${encodeURIComponent(domain.domainId || domain.name)}`}>{domain.name || domain.domainId}</Link>)}</div> : <div className="innovation-upcoming-note"><p>Domain discovery will appear when published hackathons return domain data.</p><Link className="btn-secondary" to="/hackathons/all">Browse catalogue</Link></div>}</div></section>

    <section className="hackathon-page-section"><div className="container"><div className="hackathon-home-cta"><div><span className="hackathon-kicker">Ready to build?</span><h2>Find the opportunity that fits your next idea.</h2><p>Use the catalogue to filter by domain, mode, status and pricing.</p></div><Link className="btn-primary" to="/hackathons/all">Browse all hackathons <ArrowRight size={16} /></Link></div></div></section>
  </main>
}
