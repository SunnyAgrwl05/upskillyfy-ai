import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  X, 
  Star, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Bookmark,
  CheckCircle2,
  Download,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { courseAPI } from '../../api'
import { COURSES_DATA } from '../../data/coursesData'
import './Courses.css'

const CATEGORIES = [
  'All Tracks',
  'Cloud & DevOps',
  'AI & Machine Learning',
  'Web Development',
  'DSA & Problem Solving',
  'Data & Analytics',
  'Security & Systems'
]

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Enrolled Courses Tracking
  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-enrolled-courses')
      return saved ? JSON.parse(saved) : ['cloud-computing-devops']
    } catch {
      return ['cloud-computing-devops']
    }
  })

  // Saved Courses (Wishlist)
  const [savedCourses, setSavedCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('upskillyfy-saved-courses')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All Tracks')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  // Syllabus Drawer State
  const [selectedSyllabusCourse, setSelectedSyllabusCourse] = useState(null)
  const [openDrawerModules, setOpenDrawerModules] = useState({ 0: true })

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    courseAPI.getAll()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setCourses(res.data)
        } else {
          setCourses(COURSES_DATA)
        }
      })
      .catch(() => {
        if (isMounted) setCourses(COURSES_DATA)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    localStorage.setItem('upskillyfy-enrolled-courses', JSON.stringify(enrolledCourses))
  }, [enrolledCourses])

  useEffect(() => {
    localStorage.setItem('upskillyfy-saved-courses', JSON.stringify(savedCourses))
  }, [savedCourses])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const toggleSaveCourse = (e, courseId) => {
    e.stopPropagation()
    setSavedCourses(prev => {
      const exists = prev.includes(courseId)
      const next = exists ? prev.filter(id => id !== courseId) : [...prev, courseId]
      showToast(exists ? 'Removed from saved' : 'Course saved to wishlist')
      return next
    })
  }

  const handleEnroll = (courseId) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses(prev => [...prev, courseId])
      courseAPI.enroll(courseId).catch(() => {})
      showToast('Enrolled successfully! Launching course workspace...')
      setTimeout(() => {
        navigate(`/learning/courses/${courseId}`)
      }, 700)
    } else {
      navigate(`/learning/courses/${courseId}`)
    }
  }

  const handleOpenSyllabus = (e, course) => {
    e.stopPropagation()
    setSelectedSyllabusCourse(course)
    setOpenDrawerModules({ 0: true })
  }

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const matchesCategory = 
          selectedCategory === 'All Tracks' || 
          course.category?.toLowerCase() === selectedCategory.toLowerCase()

        const matchesLevel = 
          selectedLevel === 'All Levels' || 
          course.level?.toLowerCase().includes(selectedLevel.toLowerCase())

        const query = searchQuery.trim().toLowerCase()
        const matchesSearch = 
          !query ||
          course.title?.toLowerCase().includes(query) ||
          course.subtitle?.toLowerCase().includes(query) ||
          course.category?.toLowerCase().includes(query) ||
          course.skills?.some(skill => skill.toLowerCase().includes(query))

        const matchesSaved = !showSavedOnly || savedCourses.includes(course.id)

        return matchesCategory && matchesLevel && matchesSearch && matchesSaved
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'duration') return (a.estimatedHours || 0) - (b.estimatedHours || 0)
        return (b.reviewsCount || 0) - (a.reviewsCount || 0)
      })
  }, [courses, selectedCategory, selectedLevel, searchQuery, sortBy, showSavedOnly, savedCourses])

  const clearFilters = () => {
    setSelectedCategory('All Tracks')
    setSelectedLevel('All Levels')
    setSearchQuery('')
    setSortBy('popular')
    setShowSavedOnly(false)
  }

  const toggleDrawerModule = (idx) => {
    setOpenDrawerModules(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="gcp-catalog-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="gcp-toast">
          <CheckCircle2 size={18} color="#34A853" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================
          CLEAN, AIRY PAGE HERO
          (Standard page container alignment with zero visual clutter)
          ========================================================= */}
      <section className="gcp-clean-hero">
        <div className="gcp-clean-hero-bar" />
        <div className="container">
          <div className="gcp-clean-eyebrow">
            <span>Google Cloud & Software Engineering Paths</span>
          </div>

          <h1 className="gcp-clean-title">
            Explore <span className="grad">Industry Courses</span>
          </h1>

          <p className="gcp-clean-sub">
            Learn production cloud architectures, GenAI solutions, full-stack systems, and algorithms.
            Self-paced, project-driven, and verified with certificates.
          </p>
        </div>
      </section>

      {/* =========================================================
          CONTROLS TOOLBAR (Search & Compact Dropdowns)
          ========================================================= */}
      <section className="gcp-toolbar">
        <div className="container">
          <div className="gcp-toolbar-row">
            {/* Search Input */}
            <div className="gcp-search-wrap">
              <Search className="gcp-search-icon" size={16} />
              <input
                type="text"
                className="gcp-search-input"
                placeholder="Search courses, skills, or tools (GKE, Gemini, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="gcp-search-clear" 
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters & Wishlist Toggle */}
            <div className="gcp-filter-dropdowns">
              <select 
                className="gcp-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by level"
              >
                {LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select 
                className="gcp-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort courses"
              >
                <option value="popular">Sort: Most Popular</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="duration">Sort: Duration</option>
              </select>

              <button
                className={`gcp-save-toggle ${showSavedOnly ? 'active' : ''}`}
                onClick={() => setShowSavedOnly((prev) => !prev)}
                title="View saved courses"
              >
                <Bookmark size={14} fill={showSavedOnly ? 'currentColor' : 'none'} />
                <span>Saved ({savedCourses.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY TABS (Horizontal Touch Scroll)
          ========================================================= */}
      <nav className="gcp-track-bar" aria-label="Course tracks">
        <div className="container">
          <div className="gcp-chips-scroll">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  className={`gcp-chip ${active ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* =========================================================
          COURSES CARDS GRID WITH VISUAL THUMBNAILS
          (Clean, uncluttered, visual, human-crafted)
          ========================================================= */}
      <section className="section" style={{ paddingTop: 16 }}>
        <div className="container">
          {/* Active Status Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
              Showing <strong>{filteredCourses.length}</strong> of <strong>{courses.length}</strong> courses
              {selectedCategory !== 'All Tracks' && ` in "${selectedCategory}"`}
              {showSavedOnly && ' (Saved Wishlist)'}
            </span>
            {(selectedCategory !== 'All Tracks' || selectedLevel !== 'All Levels' || searchQuery || showSavedOnly) && (
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading course catalog...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="gcp-empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>No matching courses found</h3>
              <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 18px', fontSize: '0.88rem' }}>
                Try adjusting your search query or switching filters to find what you are looking for.
              </p>
              <button onClick={clearFilters} className="gcp-btn-enroll" style={{ margin: '0 auto' }}>
                View All Courses
              </button>
            </div>
          ) : (
            <div className="gcp-cards-grid">
              {filteredCourses.map((c) => {
                const isEnrolled = enrolledCourses.includes(c.id)
                const isSaved = savedCourses.includes(c.id)
                const totalLessons = c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0

                return (
                  <div key={c.id} className="gcp-clean-card">
                    {/* Visual 16:9 Thumbnail with Overlays */}
                    <div className="gcp-card-thumbnail-wrap">
                      <img 
                        src={c.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'} 
                        alt={c.title}
                        className="gcp-card-thumbnail-img"
                        loading="lazy"
                      />

                      {/* Top Overlay Badges */}
                      <div className="gcp-thumb-overlay-top">
                        <span className={`gcp-thumb-badge ${c.badgeType || 'blue'}`}>
                          {c.badge || c.category}
                        </span>

                        <button 
                          className={`gcp-thumb-bookmark ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => toggleSaveCourse(e, c.id)}
                          title={isSaved ? 'Remove from wishlist' : 'Save course'}
                        >
                          <Bookmark size={15} fill={isSaved ? '#FBBC04' : 'none'} />
                        </button>
                      </div>

                      {/* Duration Tag */}
                      <div className="gcp-thumb-duration">
                        <Clock size={12} />
                        <span>{c.duration}</span>
                      </div>
                    </div>

                    {/* Clean Card Body (Minimal & Readable) */}
                    <div className="gcp-card-clean-body">
                      {/* Category & Status */}
                      <div className="gcp-card-category-row">
                        <span>{c.category} • {c.level}</span>
                        {isEnrolled && (
                          <span style={{ color: 'var(--gcp-green-dark)', fontWeight: 600 }}>✓ Enrolled</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="gcp-card-clean-title" title={c.title}>
                        {c.title}
                      </h3>

                      {/* Instructor / Track Meta */}
                      <div className="gcp-card-instructor-meta">
                        <span>By {c.instructor?.name?.split('&')[0] || 'Upskillyfy Mentors'}</span>
                      </div>

                      {/* Footer: Rating, Lessons, and Actions */}
                      <div className="gcp-card-clean-footer">
                        <div className="gcp-card-stats-row">
                          <div className="gcp-card-rating">
                            <Star size={13} className="gcp-star-icon" fill="#FBBC04" />
                            <span>{c.rating || 4.9}</span>
                            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({c.reviewsCount || 120})</span>
                          </div>
                          <span>{totalLessons} lessons</span>
                        </div>

                        {/* Buttons: Enroll Now vs Syllabus */}
                        <div className="gcp-card-actions-row">
                          <button 
                            onClick={() => handleEnroll(c.id)}
                            className={`gcp-btn-enroll ${isEnrolled ? 'enrolled' : ''}`}
                          >
                            <span>{isEnrolled ? 'Continue Course' : 'Enroll Now'}</span>
                            <ArrowRight size={14} />
                          </button>

                          <button 
                            onClick={(e) => handleOpenSyllabus(e, c)}
                            className="gcp-btn-syllabus"
                            title="View detailed course syllabus"
                          >
                            <Layers size={14} />
                            <span>Syllabus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          SYLLABUS & CURRICULUM SLIDE-OVER DRAWER
          ========================================================= */}
      {selectedSyllabusCourse && (
        <div className="gcp-drawer-backdrop" onClick={() => setSelectedSyllabusCourse(null)}>
          <div className="gcp-syllabus-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="gcp-drawer-header">
              <div>
                <span className={`gcp-tag ${selectedSyllabusCourse.badgeType || 'blue'}`} style={{ marginBottom: 6, display: 'inline-block' }}>
                  {selectedSyllabusCourse.category} • {selectedSyllabusCourse.level}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-h)', lineHeight: 1.3 }}>
                  {selectedSyllabusCourse.title}
                </h2>
              </div>
              <button 
                className="gcp-drawer-close" 
                onClick={() => setSelectedSyllabusCourse(null)}
                aria-label="Close syllabus drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="gcp-drawer-body">
              {/* Quick Meta Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: '12px 16px', background: 'var(--gcp-surface-variant)', borderRadius: 8, fontSize: '0.82rem', marginBottom: 20 }}>
                <div>⏱ <strong>{selectedSyllabusCourse.duration}</strong></div>
                <div>⭐ <strong>{selectedSyllabusCourse.rating}</strong> ({selectedSyllabusCourse.reviewsCount} reviews)</div>
                <div>👥 <strong>{selectedSyllabusCourse.enrolledCount}</strong> learners</div>
                <div>🏆 <strong>Certificate</strong> included</div>
              </div>

              {/* Course Overview */}
              <div style={{ marginBottom: 22 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>About this Track</h4>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--muted)' }}>
                  {selectedSyllabusCourse.overview}
                </p>
              </div>

              {/* What You Will Learn */}
              {selectedSyllabusCourse.whatYouWillLearn && (
                <div style={{ marginBottom: 22 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>What You Will Learn</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedSyllabusCourse.whatYouWillLearn.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} color="var(--gcp-green-dark)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Covered */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>Skills You Will Gain</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedSyllabusCourse.skills?.map((skill, sIdx) => (
                    <span key={sIdx} className="gcp-skill-pill" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Complete Curriculum Breakdown */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Curriculum & Modules</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {selectedSyllabusCourse.modules?.length} Modules • {selectedSyllabusCourse.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0)} Lessons
                  </span>
                </div>

                {selectedSyllabusCourse.modules?.map((mod, mIdx) => {
                  const isOpen = openDrawerModules[mIdx] ?? true
                  return (
                    <div key={mod.id || mIdx} className="gcp-syllabus-module-box">
                      <div className="gcp-syllabus-module-head" onClick={() => toggleDrawerModule(mIdx)}>
                        <div>
                          <strong style={{ fontSize: '0.86rem', display: 'block' }}>{mod.title}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{mod.duration} • {mod.lessons?.length || 0} items</span>
                        </div>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>

                      {isOpen && (
                        <div className="gcp-syllabus-module-lessons">
                          {mod.lessons?.map((les, lIdx) => (
                            <div key={les.id || lIdx} className="gcp-syllabus-lesson-row">
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--border)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {lIdx + 1}
                                </span>
                                <span>{les.title}</span>
                              </span>
                              <span style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>
                                {les.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Instructor */}
              {selectedSyllabusCourse.instructor && (
                <div style={{ padding: '14px', background: 'var(--gcp-surface-variant)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                    Track Instructor
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img 
                      src={selectedSyllabusCourse.instructor.avatar} 
                      alt={selectedSyllabusCourse.instructor.name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'block' }}>{selectedSyllabusCourse.instructor.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{selectedSyllabusCourse.instructor.role}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="gcp-drawer-footer">
              <button 
                onClick={() => {
                  alert(`Downloading complete syllabus PDF for: ${selectedSyllabusCourse.title}`)
                }}
                className="gcp-btn-syllabus"
              >
                <Download size={15} />
                <span>Download PDF</span>
              </button>

              <button 
                onClick={() => {
                  const id = selectedSyllabusCourse.id
                  setSelectedSyllabusCourse(null)
                  handleEnroll(id)
                }}
                className="gcp-btn-enroll"
              >
                <span>{enrolledCourses.includes(selectedSyllabusCourse.id) ? 'Continue to Player' : 'Enroll in this Track'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          CLEAN FOOTER CTA
          ========================================================= */}
      <section className="cta-band" style={{ marginTop: 20 }}>
        <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 10, borderRadius: '50%', background: 'var(--gcp-blue-light)', color: 'var(--gcp-blue)', marginBottom: 12 }}>
            <Sparkles size={24} />
          </div>
          <h2 className="h2" style={{ marginBottom: 10, fontSize: '1.5rem' }}>
            Ready to build with <span className="grad">Google Cloud</span>?
          </h2>
          <p className="muted" style={{ marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
            Pick a track, follow the hands-on video modules, complete knowledge checkpoints,
            and earn an industry-verifiable Upskillyfy completion certificate.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/career/internships" className="btn-primary">
              Explore Internships →
            </Link>
            <Link to="/learning/roadmaps" className="btn-g">
              View Roadmaps
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}