import { useState, useEffect, useMemo } from 'react'
import {
  Search,
  X,
  Download,
  Bookmark,
  FileText,
  CheckCircle2,
  Layers,
  BookOpen,
  Code2,
  Copy,
  Check,
  ArrowDownToLine
} from 'lucide-react'
import { resourceAPI } from '../../api'
import { RESOURCES_DATA } from '../../data/resourcesData'
import './Resources.css'

const CATEGORIES = [
  'All Tracks',
  'Cloud & DevOps',
  'DSA & Problem Solving',
  'System Design',
  'CSE & IT',
  'AI & Data Science',
  'Core Engineering',
  'Placements & Career'
]

const TYPES = [
  'All Formats',
  'Cheat Sheet',
  'Question Bank',
  'Architecture Blueprint',
  'Lab Workbook'
]

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Tracks')
  const [selectedType, setSelectedType] = useState('All Formats')
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  // Bookmarked IDs
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-saved-resources')
      return saved ? JSON.parse(saved) : ['gcp-ace-cheatsheet']
    } catch {
      return ['gcp-ace-cheatsheet']
    }
  })

  // Downloaded tracker
  const [downloadedIds, setDownloadedIds] = useState([])

  // Document Reader Modal
  const [readerResource, setReaderResource] = useState(null)
  const [readerActiveTab, setReaderActiveTab] = useState('specs') // 'specs' | 'toc' | 'excerpt'
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  // Toast notification
  const [toastMessage, setToastMessage] = useState('')

  // 1. Lock background page scroll when modal is open ("backward page scroll" fix)
  useEffect(() => {
    if (readerResource) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [readerResource])

  // 2. Load Resources
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    resourceAPI.getAll()
      .then((res) => {
        if (isMounted && res?.data && res.data.length > 0) {
          setResources(res.data)
        } else {
          setResources(RESOURCES_DATA)
        }
      })
      .catch(() => {
        if (isMounted) setResources(RESOURCES_DATA)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  // 3. Sync Bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('upskillyfy-saved-resources', JSON.stringify(bookmarkedIds))
    } catch {
      // ignore
    }
  }, [bookmarkedIds])

  // 4. Toast Auto-dismiss
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(''), 2800)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Toggle Bookmark
  const toggleBookmark = (id, title, e) => {
    if (e) e.stopPropagation()
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id)
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id]
      setToastMessage(exists ? `Removed "${title}" from your library` : `Saved "${title}" to your library`)
      return next
    })
    resourceAPI.bookmark(id).catch(() => {})
  }

  // Handle Download Action
  const handleDownload = (resource, e) => {
    if (e) e.stopPropagation()
    setDownloadedIds((prev) => [...new Set([...prev, resource.id])])
    setToastMessage(`Downloading "${resource.title}"...`)
    resourceAPI.download(resource.id).catch(() => {})

    setTimeout(() => {
      setToastMessage(`✓ "${resource.title}" downloaded!`)
    }, 800)
  }

  // Copy Snippet inside modal
  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (selectedCategory !== 'All Tracks' && res.category !== selectedCategory) return false
      if (selectedType !== 'All Formats' && res.type !== selectedType) return false
      if (showSavedOnly && !bookmarkedIds.includes(res.id)) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = res.title.toLowerCase().includes(q)
        const matchesDesc = res.description.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc) return false
      }
      return true
    })
  }, [resources, selectedCategory, selectedType, showSavedOnly, searchQuery, bookmarkedIds])

  return (
    <div className="gcp-docs-hub">
      {/* =========================================================
          HERO BANNER (Exact same Google Cloud vibe as Courses)
          ========================================================= */}
      <section className="gcp-clean-hero">
        <div className="gcp-clean-hero-bar" />
        <div className="container">
          <div className="gcp-clean-eyebrow">
            <span>Engineering Documentation & Study Materials</span>
          </div>

          <h1 className="gcp-clean-title">
            Explore <span className="grad">Technical Resources</span>
          </h1>

          <p className="gcp-clean-sub">
            Verified architecture decision guides, algorithmic patterns, system design blueprints, and interview kits.
            Direct PDF downloads with zero paywalls.
          </p>
        </div>
      </section>

      {/* =========================================================
          CONTROLS TOOLBAR (Search & Compact Dropdowns)
          ========================================================= */}
      <section className="gcp-docs-toolbar">
        <div className="container">
          <div className="gcp-docs-toolbar-row">
            {/* Search Input */}
            <div className="gcp-docs-search-wrap">
              <Search className="gcp-docs-search-icon" size={16} />
              <input
                type="text"
                className="gcp-docs-search-input"
                placeholder="Search resources by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="gcp-docs-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="gcp-docs-filter-group">
              <select
                className="gcp-docs-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label="Filter by format"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <button
                className={`gcp-docs-save-toggle ${showSavedOnly ? 'active' : ''}`}
                onClick={() => setShowSavedOnly((prev) => !prev)}
                title="View saved resources"
              >
                <Bookmark size={14} fill={showSavedOnly ? 'currentColor' : 'none'} />
                <span>Saved ({bookmarkedIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY TABS (Horizontal Touch Scroll)
          ========================================================= */}
      <nav className="gcp-docs-track-bar" aria-label="Resource tracks">
        <div className="container">
          <div className="gcp-docs-track-scroll">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`gcp-docs-track-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* =========================================================
          MAIN DOCUMENT CARDS (Clean, Uncluttered, Inline Buttons)
          ========================================================= */}
      <main className="container" style={{ paddingTop: 20 }}>
        {/* Results Bar */}
        <div className="gcp-docs-results-bar">
          <span>
            Showing <strong>{filteredResources.length}</strong> resources
            {selectedCategory !== 'All Tracks' && ` in ${selectedCategory}`}
          </span>

          {(searchQuery || selectedCategory !== 'All Tracks' || selectedType !== 'All Formats' || showSavedOnly) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All Tracks')
                setSelectedType('All Formats')
                setShowSavedOnly(false)
              }}
              className="gcp-docs-reset-btn"
            >
              Reset
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Loading documents...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="gcp-docs-empty-state">
            <FileText size={28} color="var(--muted)" style={{ marginBottom: 10 }} />
            <h3>No Resources Found</h3>
            <p>Try resetting filters or searching with different terms.</p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All Tracks')
                setSelectedType('All Formats')
                setShowSavedOnly(false)
              }}
            >
              Show All Resources
            </button>
          </div>
        ) : (
          /* Cards Grid: Always Inline Buttons on All Screens */
          <div className="gcp-docs-cards-grid">
            {filteredResources.map((res) => {
              const isBookmarked = bookmarkedIds.includes(res.id)
              const isDownloaded = downloadedIds.includes(res.id)

              return (
                <article key={res.id} className="gcp-doc-card">
                  {/* Top Bar: Format & Bookmark */}
                  <div className="gcp-doc-top">
                    <span className="gcp-doc-type-badge">
                      <FileText size={13} />
                      <span>{res.fileFormat} • {res.fileSize}</span>
                    </span>

                    <button
                      className={`gcp-doc-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                      onClick={(e) => toggleBookmark(res.id, res.title, e)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                      aria-label="Bookmark resource"
                    >
                      <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h2 className="gcp-doc-title">
                    {res.title}
                  </h2>

                  <p className="gcp-doc-description">
                    {res.description}
                  </p>

                  {/* Bottom Actions: ALWAYS INLINE SIDE-BY-SIDE */}
                  <div className="gcp-doc-actions-inline">
                    <button
                      className="gcp-doc-btn-preview"
                      onClick={() => {
                        setReaderResource(res)
                        setReaderActiveTab('specs')
                      }}
                      title="Inspect outline and excerpt"
                    >
                      <BookOpen size={14} />
                      <span>Preview</span>
                    </button>

                    <button
                      className={`gcp-doc-btn-download ${isDownloaded ? 'downloaded' : ''}`}
                      onClick={(e) => handleDownload(res, e)}
                      title={`Download ${res.fileFormat}`}
                    >
                      <Download size={14} />
                      <span>{isDownloaded ? 'Saved' : 'Download'}</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* =========================================================
          DOCUMENT READER MODAL
          Fixed background scroll & compact non-overflowing buttons
          ========================================================= */}
      {readerResource && (
        <div
          className="gcp-reader-backdrop"
          onClick={() => setReaderResource(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="gcp-reader-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Top Bar */}
            <div className="gcp-reader-top-bar">
              <div className="gcp-reader-title-area">
                <div className="gcp-reader-doc-icon">
                  <FileText size={17} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 className="gcp-reader-heading" title={readerResource.title}>
                    {readerResource.title}
                  </h3>
                  <div className="gcp-reader-subheading">
                    {readerResource.category} • {readerResource.fileFormat} • {readerResource.pages}
                  </div>
                </div>
              </div>

              <button
                className="gcp-reader-close-btn"
                onClick={() => setReaderResource(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="gcp-reader-tabs">
              <button
                className={`gcp-reader-tab-btn ${readerActiveTab === 'specs' ? 'active' : ''}`}
                onClick={() => setReaderActiveTab('specs')}
              >
                <BookOpen size={14} />
                <span>Overview</span>
              </button>

              <button
                className={`gcp-reader-tab-btn ${readerActiveTab === 'toc' ? 'active' : ''}`}
                onClick={() => setReaderActiveTab('toc')}
              >
                <Layers size={14} />
                <span>Outline ({readerResource.tableOfContents?.length || 0})</span>
              </button>

              {readerResource.sampleSnippet && (
                <button
                  className={`gcp-reader-tab-btn ${readerActiveTab === 'excerpt' ? 'active' : ''}`}
                  onClick={() => setReaderActiveTab('excerpt')}
                >
                  <Code2 size={14} />
                  <span>Sample Excerpt</span>
                </button>
              )}
            </div>

            {/* Modal Scrollable Body */}
            <div className="gcp-reader-scrollable">
              {/* TAB 1: OVERVIEW */}
              {readerActiveTab === 'specs' && (
                <div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 16px' }}>
                    {readerResource.previewSummary || readerResource.description}
                  </p>

                  {readerResource.keyHighlights && (
                    <div>
                      <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', fontWeight: 700, marginBottom: 10 }}>
                        Key Coverage
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {readerResource.keyHighlights.map((hl, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.84rem' }}>
                            <CheckCircle2 size={15} color="var(--gcp-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ lineHeight: 1.45, color: 'var(--text)' }}>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 20, padding: '10px 14px', background: 'var(--gcp-surface-variant)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--muted)' }}>
                    <span>Author: {readerResource.author}</span>
                    <span>Size: {readerResource.fileSize}</span>
                  </div>
                </div>
              )}

              {/* TAB 2: TABLE OF CONTENTS */}
              {readerActiveTab === 'toc' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {readerResource.tableOfContents?.map((section, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        fontSize: '0.82rem'
                      }}
                    >
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'var(--gcp-blue-light)',
                        color: 'var(--gcp-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {sIdx + 1}
                      </span>
                      <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>
                        {section}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: SAMPLE EXCERPT */}
              {readerActiveTab === 'excerpt' && readerResource.sampleSnippet && (
                <div>
                  <div className="gcp-code-block-container" style={{ marginTop: 4 }}>
                    <div className="gcp-code-block-header">
                      <div className="gcp-code-window-dots">
                        <span className="dot dot-red" />
                        <span className="dot dot-yellow" />
                        <span className="dot dot-green" />
                        <span className="gcp-code-lang-label">Page 1 Excerpt</span>
                      </div>

                      <button
                        className="gcp-code-copy-btn"
                        onClick={() => handleCopySnippet(readerResource.sampleSnippet)}
                        title="Copy excerpt"
                      >
                        {copiedSnippet ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="gcp-code-pre"><code>{readerResource.sampleSnippet}</code></pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions: Concise Text to Prevent Overflow */}
            <div className="gcp-reader-footer">
              <button
                className="gcp-reader-save-btn"
                onClick={(e) => toggleBookmark(readerResource.id, readerResource.title, e)}
                title={bookmarkedIds.includes(readerResource.id) ? 'Saved' : 'Save'}
              >
                <Bookmark size={15} fill={bookmarkedIds.includes(readerResource.id) ? 'currentColor' : 'none'} />
                <span className="gcp-reader-save-label">
                  {bookmarkedIds.includes(readerResource.id) ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                className="gcp-reader-download-btn"
                onClick={(e) => {
                  handleDownload(readerResource, e)
                  setReaderResource(null)
                }}
              >
                <ArrowDownToLine size={15} />
                <span>Download ({readerResource.fileSize})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TOAST FEEDBACK
          ========================================================= */}
      {toastMessage && (
        <div className="gcp-docs-toast" role="status">
          <CheckCircle2 size={16} color="#34A853" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}