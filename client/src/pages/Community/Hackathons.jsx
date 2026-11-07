import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal.mjs'
import AlertCircle from 'lucide-react/dist/esm/icons/circle-alert.mjs'
import Trophy from 'lucide-react/dist/esm/icons/trophy.mjs'
import Eye from 'lucide-react/dist/esm/icons/eye.mjs'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs'
import X from 'lucide-react/dist/esm/icons/x.mjs'
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw.mjs'
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid.mjs'
import List from 'lucide-react/dist/esm/icons/list.mjs'
import HackathonCard from '../../components/hackathons/HackathonCard'
import { fetchHackathons, getHackathonError } from '../../services/hackathonService'
import './Hackathons.css'

const PAGE_SIZE = 12
const DEMO_HACKATHONS = [
  { slug: 'demo-climate-build', title: 'Climate Build Sprint', organiser: 'Fictional Demo Organiser', category: 'Flagship', participationType: 'Team', description: 'A fictional preview opportunity used only to demonstrate the catalogue layout.', status: 'Open', mode: 'Virtual', isFree: true, startDate: '2026-12-10', endDate: '2026-12-20', registrationDeadline: '2026-12-08', domains: [{ domainId: 'climate', name: 'Climate' }, { domainId: 'ai', name: 'AI' }] },
  { slug: 'demo-ai-for-good', title: 'AI for Good Lab', organiser: 'Fictional Demo Organiser', category: 'Community', participationType: 'Individual', description: 'A fictional preview opportunity used only to demonstrate the catalogue layout.', status: 'Live', mode: 'Hybrid', fee: '₹499', startDate: '2026-11-18', endDate: '2026-11-30', registrationDeadline: '2026-11-16', domains: [{ domainId: 'ai', name: 'AI' }, { domainId: 'health', name: 'Health' }] },
  { slug: 'demo-future-fintech', title: 'Future Fintech Studio', organiser: 'Fictional Demo Organiser', category: 'Flagship', participationType: 'Team', description: 'A fictional preview opportunity used only to demonstrate the catalogue layout.', status: 'Open', mode: 'In Person', isFree: true, startDate: '2027-01-08', endDate: '2027-01-18', registrationDeadline: '2027-01-05', domains: [{ domainId: 'fintech', name: 'Fintech' }, { domainId: 'web3', name: 'Web3' }] },
  { slug: 'demo-education-lab', title: 'Education Innovation Lab', organiser: 'Fictional Demo Organiser', category: 'Community', participationType: 'Individual', description: 'A fictional preview opportunity used only to demonstrate the catalogue layout.', status: 'Open', mode: 'Virtual', isFree: true, startDate: '2027-02-02', endDate: '2027-02-12', registrationDeadline: '2027-01-30', domains: [{ domainId: 'education', name: 'Education' }] },
  { slug: 'demo-builders-week', title: 'Builders Week', organiser: 'Fictional Demo Organiser', category: 'Community', participationType: 'Team', description: 'A fictional preview opportunity used only to demonstrate the catalogue layout.', status: 'Ended', mode: 'Hybrid', fee: '₹299', startDate: '2026-10-04', endDate: '2026-10-12', registrationDeadline: '2026-10-01', domains: [{ domainId: 'developer-tools', name: 'Developer tools' }] },
  { slug: 'demo-smart-cities', title: 'Smart Cities Challenge', organiser: 'Fictional Demo Organiser', category: 'Flagship', participationType: 'Team', description: 'A fictional preview opportunity used only to demonstrate the catalogue layout.', status: 'Open', mode: 'Virtual', isFree: true, startDate: '2027-03-05', endDate: '2027-03-15', registrationDeadline: '2027-03-01', domains: [{ domainId: 'smart-cities', name: 'Smart cities' }] },
]
const CATEGORY_OPTIONS = ['Flagship', 'Community']
const PARTICIPATION_OPTIONS = ['Team', 'Individual']
const STATUS_OPTIONS = ['Open', 'Live', 'Ended']
const MODE_OPTIONS = ['Virtual', 'Hybrid', 'In Person']

function readFilters(params) {
  return {
    search: params.get('search') || '',
    category: params.get('category') || '',
    participation: params.get('participation') || '',
    domain: params.get('domain') || '',
    isFree: params.get('isFree') || '',
    status: params.get('status') || '',
    mode: params.get('mode') || '',
    startDate: params.get('startDate') || '',
    endDate: params.get('endDate') || '',
    page: Math.max(1, Number(params.get('page')) || 1),
  }
}

function HackathonCardSkeleton() {
  return <div className="hackathon-skeleton" aria-hidden="true"><div /><div /><div /><div /></div>
}

export default function Hackathons() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])
  const [searchValue, setSearchValue] = useState(filters.search)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: filters.page, limit: PAGE_SIZE, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [view, setView] = useState('grid')
  const [sort, setSort] = useState('featured')
  const [featuredOffset, setFeaturedOffset] = useState(0)
  const [draftFilters, setDraftFilters] = useState(filters)
  const demoPreview = params.get('preview') === 'demo'
  const paramsString = params.toString()

  useEffect(() => {
    setSearchValue(filters.search)
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    if (demoPreview) {
      const demoItems = DEMO_HACKATHONS.filter(item => {
        const start = filters.startDate ? new Date(filters.startDate) : null
        const end = filters.endDate ? new Date(filters.endDate) : null
        return (!filters.search || `${item.title} ${item.organiser}`.toLowerCase().includes(filters.search.toLowerCase()))
          && (!filters.status || item.status === filters.status)
          && (!filters.mode || item.mode === filters.mode)
          && (!filters.category || item.category === filters.category)
          && (!filters.participation || item.participationType === filters.participation)
          && (!filters.isFree || String(Boolean(item.isFree)) === filters.isFree)
          && (!filters.domain || item.domains.some(domain => (domain.domainId || domain.name || '').toLowerCase().includes(filters.domain.toLowerCase())))
          && (!start || new Date(item.endDate) >= start)
          && (!end || new Date(item.startDate) <= end)
      })
      setItems(demoItems)
      setPagination({ page: 1, limit: PAGE_SIZE, total: demoItems.length, pages: 1 })
      setLoading(false)
      setError('')
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError('')
    fetchHackathons({
      search: filters.search || undefined,
      status: filters.status || undefined,
      mode: filters.mode || undefined,
      domain: filters.domain || undefined,
      isFree: filters.isFree || undefined,
      page: filters.page,
      limit: PAGE_SIZE,
    }).then(result => {
      if (cancelled) return
      setItems(result.items)
      const pages = Math.max(1, Number(result.pagination.pages) || 1)
      const page = Math.min(pages, Math.max(1, Number(result.pagination.page) || 1))
      const nextPagination = { ...result.pagination, page, pages }
      setPagination(nextPagination)
      if (filters.page !== page) {
        const next = new URLSearchParams(paramsString)
        if (page > 1) next.set('page', String(page))
        else next.delete('page')
        setParams(next, { replace: true })
      }
    }).catch(requestError => {
      if (!cancelled) setError(getHackathonError(requestError, 'Could not load hackathons.'))
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [demoPreview, filters, paramsString, retryKey, setParams])

  useEffect(() => {
    if (searchValue === filters.search) return undefined
    const timeoutId = window.setTimeout(() => {
      const next = new URLSearchParams(paramsString)
      if (searchValue) next.set('search', searchValue)
      else next.delete('search')
      next.delete('page')
      setParams(next)
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchValue, filters.search, paramsString, setParams])

  const updatePage = page => {
    const next = new URLSearchParams(paramsString)
    if (page > 1) next.set('page', String(page))
    else next.delete('page')
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const retry = () => setRetryKey(current => current + 1)
  const toggleDemoPreview = () => {
    const next = new URLSearchParams(params)
    if (demoPreview) next.delete('preview')
    else next.set('preview', 'demo')
    next.delete('page')
    setParams(next)
  }

  const sortedItems = useMemo(() => {
    const next = [...items]
    if (sort === 'title') return next.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    if (sort === 'date') return next.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0))
    return next
  }, [items, sort])
  useEffect(() => {
    setFeaturedOffset(current => current >= sortedItems.length ? 0 : current)
  }, [sortedItems.length])
  const featuredItems = sortedItems.slice(featuredOffset, featuredOffset + 3)
  const canMoveFeatured = sortedItems.length > 3
  const resetFilters = () => {
    const next = new URLSearchParams()
    if (demoPreview) next.set('preview', 'demo')
    setParams(next)
    setDraftFilters(readFilters(next))
  }
  const updateDraftFilter = (key, value) => setDraftFilters(current => ({ ...current, [key]: value }))
  const applyFilters = () => {
    const next = new URLSearchParams(params)
    ;['category', 'participation', 'startDate', 'endDate', 'domain', 'isFree', 'status', 'mode'].forEach(key => {
      if (draftFilters[key]) next.set(key, draftFilters[key])
      else next.delete(key)
    })
    next.delete('page')
    setParams(next)
    setFiltersOpen(false)
  }

  return (
    <div className="hackathons-page">
      <section className="hackathons-catalogue">
        <div className="container">
          <div className="hackathons-page-heading">
            <div><span className="hackathons-kicker">Upskillyfy Innovation Platform</span><h1>Hackathons</h1><p>Discover opportunities to learn, build and create meaningful impact.</p></div>
            <button type="button" className="btn-secondary preview-toggle" onClick={toggleDemoPreview}><Eye size={15} /> {demoPreview ? 'Return to live catalogue' : 'View design preview'}</button>
          </div>
          {demoPreview && <div className="demo-preview-notice"><strong>DEMO PREVIEW</strong><span>Fictional sample cards are shown for layout preview only. They are not real events and no registrations or API operations are available.</span><button type="button" onClick={toggleDemoPreview}>Return to live API</button></div>}
          {!loading && !error && sortedItems.length > 0 && <section className="catalogue-featured-section" aria-label="Featured hackathons" aria-live="polite">
            <div className="catalogue-section-heading"><div><span className="hackathons-kicker">Featured</span><h2>Explore top opportunities</h2></div><div className="featured-controls"><button type="button" aria-label="Previous featured hackathons" disabled={!canMoveFeatured} onClick={() => setFeaturedOffset(offset => offset === 0 ? Math.max(0, sortedItems.length - 3) : offset - 1)}><ChevronLeft size={17} /></button><button type="button" aria-label="Next featured hackathons" disabled={!canMoveFeatured} onClick={() => setFeaturedOffset(offset => offset + 3 >= sortedItems.length ? 0 : offset + 1)}><ChevronRight size={17} /></button></div></div>
            <div className="featured-card-grid">{featuredItems.map((hackathon, index) => <HackathonCard key={hackathon.slug || hackathon._id} hackathon={hackathon} demo={demoPreview} accent={['blue', 'green', 'orange'][index]} />)}</div>
          </section>}
          <div className="hackathons-layout">
            <main className="hackathons-main">
              <div className="hackathons-toolbar">
                <label className="hackathon-search"><Search size={17} /><input type="search" value={searchValue} onChange={event => setSearchValue(event.target.value)} placeholder="Search hackathons or organisers" aria-label="Search hackathons" /></label>
                <button type="button" className="mobile-filter-toggle btn-secondary" aria-expanded={filtersOpen} aria-controls="hackathon-filter-sidebar" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters</button>
                <label className="sort-control"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="date">Start date</option><option value="title">Name</option></select></label>
                <div className="view-toggle" aria-label="Catalogue view"><button type="button" className={view === 'grid' ? 'active' : ''} aria-label="Grid view" onClick={() => setView('grid')}><LayoutGrid size={16} /></button><button type="button" className={view === 'list' ? 'active' : ''} aria-label="List view" onClick={() => setView('list')}><List size={16} /></button></div>
                {!demoPreview && <button type="button" className="refresh-button" aria-label="Refresh hackathons" onClick={retry}><RotateCcw size={16} /></button>}
              </div>
              <div className="hackathons-results-head"><div><span className="hackathons-kicker">All opportunities</span><h2>Find your next challenge</h2></div>{!loading && !error && <span>{pagination.total} {pagination.total === 1 ? 'hackathon' : 'hackathons'}</span>}</div>
              {loading && <div className={`hackathons-grid ${view === 'list' ? 'list-view' : ''}`} aria-busy="true" aria-live="polite">{Array.from({ length: 6 }, (_, index) => <HackathonCardSkeleton key={index} />)}</div>}
          {!loading && error && (
            <div className="hackathons-state" role="alert">
              <AlertCircle size={30} />
              <h2>Hackathons are unavailable</h2>
              <p>{error}</p>
              <button type="button" className="btn-primary" onClick={retry}>Try again</button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="hackathons-state">
              <Trophy size={30} />
              <h2>No hackathons match these filters</h2>
              <p>Try a different search or clear one of the filters to see more opportunities.</p>
              <button type="button" className="btn-primary" onClick={() => setParams(new URLSearchParams())}>Clear filters</button>
            </div>
          )}
          {!loading && !error && items.length > 0 && (
            <>
              <div className={`hackathons-grid ${view === 'list' ? 'list-view' : ''}`}>{sortedItems.map((hackathon, index) => <HackathonCard key={hackathon.slug || hackathon._id} hackathon={hackathon} demo={demoPreview} accent={['blue', 'green', 'orange', 'purple', 'navy', 'teal'][index % 6]} />)}</div>
              {pagination.pages > 1 && (
                <nav className="hackathon-pagination" aria-label="Hackathon pages">
                  <button type="button" disabled={filters.page <= 1} onClick={() => updatePage(filters.page - 1)}>Previous</button>
                  <span>Page {pagination.page} of {pagination.pages}</span>
                  <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => updatePage(pagination.page + 1)}>Next</button>
                </nav>
              )}
            </>
          )}
            </main>
            <aside id="hackathon-filter-sidebar" className={`hackathons-filter-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label="Hackathon filters" role={filtersOpen ? 'dialog' : undefined} aria-modal={filtersOpen ? 'true' : undefined}>
              <div className="filter-sidebar-heading"><h2>Filters</h2><button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={18} /></button></div>
              <fieldset><legend>Event category {!demoPreview && <small className="api-pending-label">API pending</small>}</legend>{CATEGORY_OPTIONS.map(option => <label key={option}><input type="radio" name="category" aria-label={`Event category: ${option}`} disabled={!demoPreview} checked={draftFilters.category === option} onChange={() => updateDraftFilter('category', option)} />{option}</label>)}</fieldset>
              <fieldset><legend>Pricing</legend><label><input type="radio" name="pricing" aria-label="Free events" checked={draftFilters.isFree === 'true'} onChange={() => updateDraftFilter('isFree', 'true')} />Free</label><label><input type="radio" name="pricing" aria-label="Paid events" checked={draftFilters.isFree === 'false'} onChange={() => updateDraftFilter('isFree', 'false')} />Paid</label></fieldset>
              <fieldset><legend>Event status</legend>{STATUS_OPTIONS.map(option => <label key={option}><input type="radio" name="status" aria-label={`Event status: ${option}`} checked={draftFilters.status === option} onChange={() => updateDraftFilter('status', option)} />{option}</label>)}</fieldset>
              <fieldset><legend>Participation mode</legend>{MODE_OPTIONS.map(option => <label key={option}><input type="radio" name="mode" aria-label={`Participation mode: ${option}`} checked={draftFilters.mode === option} onChange={() => updateDraftFilter('mode', option)} />{option}</label>)}</fieldset>
              <fieldset><legend>Participation type {!demoPreview && <small className="api-pending-label">API pending</small>}</legend>{PARTICIPATION_OPTIONS.map(option => <label key={option}><input type="radio" name="participation" aria-label={`Participation type: ${option}`} disabled={!demoPreview} checked={draftFilters.participation === option} onChange={() => updateDraftFilter('participation', option)} />{option}</label>)}</fieldset>
              <fieldset><legend>Filter by activity <small className="api-pending-label">API pending</small></legend><label className="pending-filter"><input type="checkbox" disabled />Ongoing registration</label><label className="pending-filter"><input type="checkbox" disabled />Ongoing submission</label></fieldset>
              <fieldset className="filter-date-range"><legend>Date range {!demoPreview && <small className="api-pending-label">API pending</small>}</legend><label><span>From</span><input type="date" aria-label="Filter start date" disabled={!demoPreview} value={draftFilters.startDate} onChange={event => updateDraftFilter('startDate', event.target.value)} /></label><label><span>To</span><input type="date" aria-label="Filter end date" disabled={!demoPreview} value={draftFilters.endDate} onChange={event => updateDraftFilter('endDate', event.target.value)} /></label></fieldset>
              <label className="filter-domain-input"><span>Domain <small className="api-pending-label">documented API filter</small></span><input value={draftFilters.domain} onChange={event => updateDraftFilter('domain', event.target.value)} placeholder="e.g. ai" aria-label="Filter by domain ID" /></label>
              <div className="filter-sidebar-actions"><button type="button" className="btn-secondary" onClick={resetFilters}>Reset</button><button type="button" className="btn-primary" onClick={applyFilters}>Apply</button></div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
