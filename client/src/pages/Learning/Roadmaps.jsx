import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  X, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Compass, 
  GraduationCap, 
  ArrowUpRight 
} from 'lucide-react'
import { ROADMAPS_DATA, ROADMAP_CATEGORIES, ROADMAP_DURATIONS } from '../../data/roadmapsData'
import './Roadmaps.css'

export default function Roadmaps() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Tracks')
  const [selectedDuration, setSelectedDuration] = useState('All Durations')
  const [sortBy, setSortBy] = useState('recommended')
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')

  // Bookmarked Roadmaps (Saved in Wishlist)
  const [savedRoadmaps, setSavedRoadmaps] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-saved-roadmaps')
      return saved ? JSON.parse(saved) : ['cloud-devops-engineer', 'fullstack-web-developer']
    } catch {
      return ['cloud-devops-engineer', 'fullstack-web-developer']
    }
  })

  // Synchronize Bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('upskillyfy-saved-roadmaps', JSON.stringify(savedRoadmaps))
    } catch {}
  }, [savedRoadmaps])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // Toggle Bookmark
  const toggleSaveRoadmap = (e, id) => {
    e.stopPropagation()
    setSavedRoadmaps((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
      showToast(exists ? 'Removed from saved roadmaps' : 'Roadmap saved to wishlist')
      return next
    })
  }

  // Filtered & Sorted Roadmaps
  const filteredRoadmaps = useMemo(() => {
    return ROADMAPS_DATA.filter((r) => {
      // Category filter
      if (selectedCategory !== 'All Tracks' && r.category !== selectedCategory) {
        return false
      }

      // Duration filter
      if (selectedDuration === 'Under 5 Months' && r.months >= 5) return false
      if (selectedDuration === '5 - 6 Months' && (r.months < 5 || r.months > 6)) return false
      if (selectedDuration === '6+ Months' && r.months < 6) return false

      // Saved only filter
      if (showSavedOnly && !savedRoadmaps.includes(r.id)) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = r.title.toLowerCase().includes(query)
        const matchCategory = r.category.toLowerCase().includes(query)
        const matchSkills = r.skills?.some(s => s.toLowerCase().includes(query))
        if (!matchTitle && !matchCategory && !matchSkills) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'shortest') return a.months - b.months
      if (sortBy === 'indepth') return b.months - a.months
      return 0 // default recommended order
    })
  }, [searchQuery, selectedCategory, selectedDuration, sortBy, showSavedOnly, savedRoadmaps])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All Tracks')
    setSelectedDuration('All Durations')
    setSortBy('recommended')
    setShowSavedOnly(false)
  }

  return (
    <div className="gcp-roadmaps-hub">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="gcp-toast" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#202124', color: '#fff', padding: '10px 18px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.3)', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} color="#34A853" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          CLEAN PAGE HERO (Google Cloud Style)
          ========================================================= */}
      <section className="gcp-clean-hero">
        <div className="gcp-clean-hero-bar" />
        <div className="container">
          <div className="gcp-clean-eyebrow">
            <Compass size={14} />
            <span>OFFICIAL CAREER PATHWAYS</span>
          </div>

          <h1 className="gcp-clean-title">
            Explore <span className="grad">Engineering Roadmaps</span>
          </h1>

          <p className="gcp-clean-sub">
            Interactive, step-by-step skill pathways from foundational systems to advanced architecture.
            Follow the connected node map to reach production readiness.
          </p>
        </div>
      </section>

      {/* =========================================================
          CONTROLS TOOLBAR (Search & Compact Dropdowns)
          ========================================================= */}
      <section className="gcp-roadmaps-toolbar">
        <div className="container">
          <div className="gcp-roadmaps-toolbar-row">
            {/* Search Input with 6px border-radius */}
            <div className="gcp-roadmaps-search-wrap">
              <Search className="gcp-roadmaps-search-icon" size={16} />
              <input
                type="text"
                className="gcp-roadmaps-search-input"
                placeholder="Search roadmaps by role or tech (Kubernetes, PyTorch, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="gcp-roadmaps-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters & Wishlist Toggle */}
            <div className="gcp-roadmaps-filter-group">
              <select
                className="gcp-roadmaps-select"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                aria-label="Filter by duration"
              >
                {ROADMAP_DURATIONS.map((dur) => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>

              <select
                className="gcp-roadmaps-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort roadmaps"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="shortest">Sort: Shortest First</option>
                <option value="indepth">Sort: Most In-Depth</option>
              </select>

              <button
                className={`gcp-roadmaps-save-toggle ${showSavedOnly ? 'active' : ''}`}
                onClick={() => setShowSavedOnly((prev) => !prev)}
                title="View saved roadmaps"
              >
                <Bookmark size={14} fill={showSavedOnly ? 'currentColor' : 'none'} />
                <span>Saved ({savedRoadmaps.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY TABS (Horizontal Touch Scroll with 6px border-radius)
          ========================================================= */}
      <nav className="gcp-roadmaps-track-bar" aria-label="Roadmap tracks">
        <div className="container">
          <div className="gcp-roadmaps-track-scroll">
            {ROADMAP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`gcp-roadmaps-track-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* =========================================================
          ROADMAPS CARDS GRID (Visual Pathways, Clean & Uncluttered)
          ========================================================= */}
      <section className="section" style={{ paddingTop: 18 }}>
        <div className="container">
          {/* Active Status Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
              Showing <strong>{filteredRoadmaps.length}</strong> of <strong>{ROADMAPS_DATA.length}</strong> career roadmaps
              {selectedCategory !== 'All Tracks' && ` in "${selectedCategory}"`}
              {showSavedOnly && ' (Saved Wishlist)'}
            </span>
            {(selectedCategory !== 'All Tracks' || selectedDuration !== 'All Durations' || searchQuery || showSavedOnly) && (
              <button 
                onClick={clearFilters}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--gcp-blue)', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Reset all filters
              </button>
            )}
          </div>

          {filteredRoadmaps.length === 0 ? (
            <div className="gcp-empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', marginTop: 12 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗺️</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No roadmaps match your search</h3>
              <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 18px', fontSize: '0.88rem' }}>
                Try adjusting your search terms or clearing selected filters to explore available paths.
              </p>
              <button onClick={clearFilters} className="gcp-btn-explore" style={{ margin: '0 auto', display: 'inline-flex' }}>
                View All Roadmaps
              </button>
            </div>
          ) : (
            <div className="gcp-roadmaps-grid">
              {filteredRoadmaps.map((r) => {
                const isSaved = savedRoadmaps.includes(r.id)

                return (
                  <div key={r.id} className="gcp-roadmap-card">
                    {/* Visual 16:9 Thumbnail with Clean Overlays */}
                    <div className="gcp-roadmap-thumbnail-wrap">
                      <img 
                        src={r.thumbnail} 
                        alt={r.title}
                        className="gcp-roadmap-thumbnail-img"
                        loading="lazy"
                      />

                      {/* Top Overlay Badges */}
                      <div className="gcp-roadmap-thumb-overlay-top">
                        <span className={`gcp-roadmap-badge ${r.badgeType || 'blue'}`}>
                          {r.badge || r.category}
                        </span>

                        <button 
                          className={`gcp-roadmap-bookmark ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => toggleSaveRoadmap(e, r.id)}
                          title={isSaved ? 'Remove from wishlist' : 'Save roadmap'}
                        >
                          <Bookmark size={15} fill={isSaved ? '#FBBC04' : 'none'} />
                        </button>
                      </div>

                      {/* Duration Tag */}
                      <div className="gcp-roadmap-duration">
                        <Clock size={12} />
                        <span>{r.duration}</span>
                      </div>
                    </div>

                    {/* Card Body with Visual Pathway Preview */}
                    <div className="gcp-roadmap-body">
                      {/* Meta Row */}
                      <div className="gcp-roadmap-meta">
                        <span>{r.category}</span>
                        <span>{r.level}</span>
                      </div>

                      {/* Title */}
                      <h3 className="gcp-roadmap-title">{r.title}</h3>

                      {/* VISUAL ROADMAP NODE RIBBON (Unmistakable roadmap appearance) */}
                      <div className="gcp-roadmap-path-ribbon">
                        {r.milestones?.slice(0, 4).map((m, idx) => {
                          const shortName = m.title.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')
                          return (
                            <div key={idx} className="gcp-path-node-item">
                              <span className="gcp-path-node-badge">{shortName}</span>
                              {idx < 3 && <span className="gcp-path-node-arrow">➔</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* Inline Side-by-Side Action Buttons */}
                      <div className="gcp-roadmap-actions-inline">
                        <Link 
                          to={`/learning/roadmaps/${r.id}`}
                          className="gcp-btn-explore"
                        >
                          <Compass size={15} />
                          <span>View Roadmap</span>
                          <ArrowUpRight size={15} />
                        </Link>

                        {r.relatedCourseId && (
                          <Link 
                            to={`/learning/courses/${r.relatedCourseId}`} 
                            className="gcp-btn-course-link"
                            title="Open related course"
                          >
                            <GraduationCap size={15} />
                            <span>Course</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}