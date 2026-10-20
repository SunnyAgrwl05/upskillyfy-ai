import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  Award, 
  Filter, 
  Sparkles,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  ShieldCheck,
  Check,
  X,
  GraduationCap
} from 'lucide-react'
import { INTERNSHIPS_DATA } from '../../data/internshipsData'
import ApplyModal from './ApplyModal'
import './Internships.css'

const DOMAIN_OPTIONS = [
  { id: 'all', label: 'All Profiles' },
  { id: 'fullstack', label: 'Full-Stack & Backend' },
  { id: 'aiml', label: 'AI & Machine Learning' },
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'frontend', label: 'Frontend Engineering' },
  { id: 'mobile', label: 'Mobile Apps' },
  { id: 'data', label: 'Data Analytics' },
]

const MODE_OPTIONS = ['All Modes', 'Remote', 'Hybrid', 'In-Office']

export default function Internships() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedMode, setSelectedMode] = useState('All Modes')
  const [selectedStipend, setSelectedStipend] = useState('all')
  const [ppoOnly, setPpoOnly] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Apply Modal state
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  const handleOpenApplyModal = (internship) => {
    setSelectedInternshipForApply(internship)
    setIsApplyModalOpen(true)
  }

  const handleCloseApplyModal = () => {
    setIsApplyModalOpen(false)
    setSelectedInternshipForApply(null)
  }

  // Filtered & Sorted internships
  const filteredInternships = useMemo(() => {
    let list = INTERNSHIPS_DATA.filter(item => {
      // Search query
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.company.toLowerCase().includes(query) ||
        item.skills.some(s => s.toLowerCase().includes(query)) ||
        (item.location && item.location.toLowerCase().includes(query))

      // Domain
      const matchesDomain = selectedDomain === 'all' || item.category === selectedDomain

      // Mode
      const matchesMode = selectedMode === 'All Modes' || item.mode.toLowerCase() === selectedMode.toLowerCase()

      // PPO
      const matchesPPO = !ppoOnly || item.ppoOffered

      // Stipend
      let matchesStipend = true
      const numStipend = parseInt(item.stipend.replace(/[^0-9]/g, ''), 10) || 0
      if (selectedStipend === '15k') matchesStipend = numStipend >= 15000
      if (selectedStipend === '25k') matchesStipend = numStipend >= 25000
      if (selectedStipend === '35k') matchesStipend = numStipend >= 35000

      return matchesSearch && matchesDomain && matchesMode && matchesPPO && matchesStipend
    })

    // Sort
    if (sortBy === 'stipend') {
      list = [...list].sort((a, b) => {
        const stipendA = parseInt(a.stipend.replace(/[^0-9]/g, ''), 10) || 0
        const stipendB = parseInt(b.stipend.replace(/[^0-9]/g, ''), 10) || 0
        return stipendB - stipendA
      })
    } else if (sortBy === 'applicants') {
      list = [...list].sort((a, b) => b.applicants - a.applicants)
    }

    return list
  }, [searchQuery, selectedDomain, selectedMode, selectedStipend, ppoOnly, sortBy])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedDomain('all')
    setSelectedMode('All Modes')
    setSelectedStipend('all')
    setPpoOnly(false)
    setSortBy('recommended')
  }

  const isFiltered = searchQuery || selectedDomain !== 'all' || selectedMode !== 'All Modes' || selectedStipend !== 'all' || ppoOnly

  return (
    <div className="internships-page">
      {/* Hero Header */}
      <section className="internships-hero">
        <div className="container">
          <div className="internships-hero-inner">
            <div className="eyebrow">
              <Sparkles size={14} color="#1a73e8" />
              <span>Verified Career Opportunities</span>
            </div>
            <h1 className="internships-hero-title">
              Find Internships That Fast-Track Your Career with <span className="grad">Guaranteed PPOs</span>
            </h1>
            <p className="internships-hero-desc">
              Explore high-growth tech roles from vetted startups and enterprise partners.
              Benefit from transparent monthly stipends, full-time placement packages, and direct HR referrals.
            </p>

            {/* Quick Metrics Strip */}
            <div className="internships-metrics-row">
              <div className="internships-metric-pill">
                <div className="internships-metric-icon" style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1a73e8' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <div className="internships-metric-val">{INTERNSHIPS_DATA.length} Verified</div>
                  <div className="internships-metric-label">Active Roles</div>
                </div>
              </div>

              <div className="internships-metric-pill">
                <div className="internships-metric-icon" style={{ background: 'rgba(52, 168, 83, 0.1)', color: '#34a853' }}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="internships-metric-val">₹45,000 /mo</div>
                  <div className="internships-metric-label">Max Stipend</div>
                </div>
              </div>

              <div className="internships-metric-pill">
                <div className="internships-metric-icon" style={{ background: 'rgba(251, 188, 4, 0.12)', color: '#f29900' }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="internships-metric-val">Up to ₹18 LPA</div>
                  <div className="internships-metric-label">Full-time PPO Package</div>
                </div>
              </div>

              <div className="internships-metric-pill">
                <div className="internships-metric-icon" style={{ background: 'rgba(123, 97, 255, 0.1)', color: '#7b61ff' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="internships-metric-val">100% Free</div>
                  <div className="internships-metric-label">Zero Application Fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Explorer Layout (Authentic Unstop Architecture) */}
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container">
          {/* Mobile Filter Button */}
          <button 
            type="button" 
            className="unstop-mobile-filter-toggle"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters & Sorting'}</span>
          </button>

          <div className="internships-explorer-layout">
            {/* =========================================================
               LEFT SIDEBAR: UNSTOP STICKY FILTERS
               ========================================================= */}
            <aside className={`unstop-filter-sidebar ${mobileFilterOpen ? 'open-mobile' : ''}`}>
              <div className="unstop-filter-header">
                <div className="unstop-filter-title">
                  <Filter size={16} color="#1a73e8" />
                  <span>Filters</span>
                </div>
                {isFiltered && (
                  <button type="button" className="unstop-filter-reset-btn" onClick={clearAllFilters}>
                    Clear All
                  </button>
                )}
              </div>

              {/* Quick Checkbox Filters */}
              <div className="unstop-filter-group">
                <div className="unstop-filter-group-title">Quick Filters</div>
                <label className="unstop-checkbox-label">
                  <input
                    type="checkbox"
                    checked={ppoOnly}
                    onChange={(e) => setPpoOnly(e.target.checked)}
                  />
                  <span>Job Offer / PPO Guaranteed</span>
                </label>
                <label className="unstop-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedMode === 'Remote'}
                    onChange={(e) => setSelectedMode(e.target.checked ? 'Remote' : 'All Modes')}
                  />
                  <span>Work from Home (Remote)</span>
                </label>
                <label className="unstop-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStipend === '25k'}
                    onChange={(e) => setSelectedStipend(e.target.checked ? '25k' : 'all')}
                  />
                  <span>High Stipend (≥ ₹25,000)</span>
                </label>
              </div>

              {/* Profile / Domain Filter */}
              <div className="unstop-filter-group">
                <div className="unstop-filter-group-title">Domain / Track</div>
                {DOMAIN_OPTIONS.map(domain => {
                  const count = domain.id === 'all' 
                    ? INTERNSHIPS_DATA.length 
                    : INTERNSHIPS_DATA.filter(i => i.category === domain.id).length

                  return (
                    <label key={domain.id} className="unstop-checkbox-label">
                      <input
                        type="radio"
                        name="domain"
                        checked={selectedDomain === domain.id}
                        onChange={() => setSelectedDomain(domain.id)}
                      />
                      <span>{domain.label}</span>
                      <span className="unstop-filter-count">{count}</span>
                    </label>
                  )
                })}
              </div>

              {/* Work Mode Filter */}
              <div className="unstop-filter-group">
                <div className="unstop-filter-group-title">Work Mode</div>
                {MODE_OPTIONS.map(m => (
                  <label key={m} className="unstop-checkbox-label">
                    <input
                      type="radio"
                      name="mode"
                      checked={selectedMode === m}
                      onChange={() => setSelectedMode(m)}
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>

              {/* Stipend Range */}
              <div className="unstop-filter-group">
                <div className="unstop-filter-group-title">Minimum Stipend</div>
                {[
                  { id: 'all', label: 'Any Stipend' },
                  { id: '15k', label: '₹15,000+ /month' },
                  { id: '25k', label: '₹25,000+ /month' },
                  { id: '35k', label: '₹35,000+ /month' },
                ].map(stip => (
                  <label key={stip.id} className="unstop-checkbox-label">
                    <input
                      type="radio"
                      name="stipend"
                      checked={selectedStipend === stip.id}
                      onChange={() => setSelectedStipend(stip.id)}
                    />
                    <span>{stip.label}</span>
                  </label>
                ))}
              </div>
            </aside>

            {/* =========================================================
               RIGHT COLUMN: UNSTOP FEED & HORIZONTAL CARDS
               ========================================================= */}
            <main className="unstop-feed-column">
              {/* Top Search & Controls Bar */}
              <div className="unstop-feed-topbar">
                {/* Search Input */}
                <div className="unstop-search-input-wrap">
                  <Search size={18} />
                  <input
                    type="text"
                    className="unstop-search-input"
                    placeholder="Search by role, company, or skills (e.g. Node.js, Docker, Python, React)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Sub Bar with Results Count & Sort Dropdown */}
                <div className="unstop-topbar-controls">
                  <div className="unstop-feed-count">
                    Showing <strong>{filteredInternships.length}</strong> of {INTERNSHIPS_DATA.length} opportunities
                  </div>

                  <div className="unstop-sort-wrap">
                    <span>Sort by:</span>
                    <select
                      className="unstop-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="stipend">Highest Stipend</option>
                      <option value="applicants">Most Applicants</option>
                    </select>
                  </div>
                </div>

                {/* Quick Domain Pills */}
                <div className="unstop-quick-chips-row">
                  {DOMAIN_OPTIONS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      className={`unstop-quick-chip ${selectedDomain === d.id ? 'active' : ''}`}
                      onClick={() => setSelectedDomain(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed List of Authentic Horizontal Unstop Cards */}
              {filteredInternships.length === 0 ? (
                <div className="unstop-empty-state">
                  <Briefcase size={48} style={{ opacity: 0.35, margin: '0 auto' }} />
                  <div className="unstop-empty-title">No Internships Found</div>
                  <p>Try clearing some filters or searching with broader keywords.</p>
                  <button className="btn-g" onClick={clearAllFilters} style={{ marginTop: 16 }}>
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="unstop-feed-list">
                  {filteredInternships.map(internship => {
                    const isRemote = internship.mode.toLowerCase() === 'remote'
                    const isHybrid = internship.mode.toLowerCase() === 'hybrid'

                    return (
                      <article key={internship.id} className="unstop-h-card">
                        {/* Top Section */}
                        <div className="unstop-h-card-top">
                          <div className="unstop-h-logo" style={{ background: internship.logoBg }}>
                            {internship.logoInitial}
                          </div>

                          <div className="unstop-h-info">
                            <div className="unstop-h-title-row">
                              <Link to={`/career/internships/${internship.id}`} className="unstop-h-title">
                                {internship.title}
                              </Link>
                            </div>

                            <div className="unstop-h-company-meta">
                              <span className="unstop-h-company-name">{internship.company}</span>
                              <span className="unstop-h-verified" title="Verified Upskillyfy AI Partner">
                                <CheckCircle2 size={14} />
                                <span>Verified</span>
                              </span>
                              <span>•</span>
                              <span>{internship.location}</span>
                            </div>

                            <div className="unstop-h-tagline">
                              {internship.companyTagline}
                            </div>
                          </div>
                        </div>

                        {/* Signature Unstop Badges Bar */}
                        <div className="unstop-h-badges-row">
                          <span className="unstop-badge-pill stipend">
                            <DollarSign size={13} />
                            <span>{internship.stipend}</span>
                          </span>

                          <span className="unstop-badge-pill">
                            <Clock size={13} color="#1a73e8" />
                            <span>{internship.duration}</span>
                          </span>

                          {internship.ppoOffered && (
                            <span className="unstop-badge-pill ppo">
                              <Award size={13} />
                              <span>PPO: {internship.ppoPackage}</span>
                            </span>
                          )}

                          <span className={`unstop-badge-pill ${isRemote ? 'mode-remote' : isHybrid ? 'mode-hybrid' : ''}`}>
                            <MapPin size={13} />
                            <span>{internship.mode}</span>
                          </span>

                          <span className="unstop-badge-pill">
                            <GraduationCap size={13} color="#f29900" />
                            <span>Batch: {internship.batch?.slice(0, 2).join(', ')}</span>
                          </span>
                        </div>

                        {/* Skills Row */}
                        <div className="unstop-h-skills-row">
                          {internship.skills.map((skill, idx) => (
                            <span key={idx} className="unstop-h-skill-tag">{skill}</span>
                          ))}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="unstop-h-footer">
                          <div className="unstop-h-meta-tags">
                            <span className="unstop-h-meta-item">
                              <Calendar size={13} color="#1a73e8" />
                              <span>Apply by {internship.deadline}</span>
                            </span>
                            <span className="unstop-h-meta-item">
                              <Users size={13} color="#34a853" />
                              <span>{internship.applicants}+ applied</span>
                            </span>
                            <span className="unstop-h-meta-item">
                              <Building2 size={13} color="#f29900" />
                              <span>{internship.openings} Openings</span>
                            </span>
                          </div>

                          <div className="unstop-h-actions">
                            <Link 
                              to={`/career/internships/${internship.id}`} 
                              className="btn-g unstop-h-btn-details"
                            >
                              View Details
                            </Link>
                            <button
                              type="button"
                              className="btn-primary unstop-h-btn-apply"
                              onClick={() => handleOpenApplyModal(internship)}
                            >
                              <span>Apply Now</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Shared Apply Modal */}
      <ApplyModal
        internship={selectedInternshipForApply}
        isOpen={isApplyModalOpen}
        onClose={handleCloseApplyModal}
      />
    </div>
  )
}