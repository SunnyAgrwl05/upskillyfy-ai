import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trophy, 
  Terminal, 
  Video, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Search, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Laptop,
  Compass,
  Award,
  Layers
} from 'lucide-react'
import { communityAPI } from '../../api'
import './Events.css'

const STATS = [
  { value: '50K+', label: 'Engineers in Network' },
  { value: '120+', label: 'Workshops & Hackathons' },
  { value: '40+', label: 'Campus Chapters' },
  { value: '₹500K+', label: 'Prizes & Project Grants' },
]

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'workshop', label: 'Bootcamps & Labs' },
  { id: 'webinar', label: 'Webinars & AMAs' },
  { id: 'opensource', label: 'Open Source' },
]

const FALLBACK_EVENTS = [
  {
    _id: '1',
    title: 'HackUpskillyfy AI 2026: The Builder Summit',
    type: 'hackathon',
    typeLabel: 'Hackathon',
    description: '48-hour national hybrid hackathon bringing together 1,000+ engineers to build generative AI, cloud microservices, and web3 applications with cash bounties and direct internship referrals.',
    date: 'Nov 14 - 16, 2026',
    time: '48 Hours Non-Stop',
    mode: 'Hybrid (Online + Campus Hubs)',
    mentor: 'Hosted by Upskillyfy AI Engineering',
    perk: '₹2,50,000 Prize Pool + Fast-Track Interviews',
    icon: <Trophy size={20} color="#7b61ff" />
  },
  {
    _id: '2',
    title: 'Full-Stack Distributed Systems Bootcamp',
    type: 'workshop',
    typeLabel: 'Bootcamp',
    description: 'A 2-week intensive hands-on lab series architecting real-world microservices with Node.js, Docker containers, PostgreSQL connection pooling, and Kubernetes deployments.',
    date: 'Nov 22 - Dec 05, 2026',
    time: '6:00 PM - 8:00 PM IST',
    mode: 'Live Interactive (Google Meet)',
    mentor: 'Ex-Google & AWS Cloud Mentors',
    perk: 'Production Repo Codebase + Verified Certificate',
    icon: <Terminal size={20} color="#1a73e8" />
  },
  {
    _id: '3',
    title: 'Algorithmic Pattern Mastery & FAANG AMA',
    type: 'webinar',
    typeLabel: 'Webinar',
    description: 'Deep dive into 14 core coding patterns: Two Pointers, Sliding Window, Monotonic Stacks, and Tree BFS/DFS with live problem solving and recruiter AMA questions.',
    date: 'Every Saturday',
    time: '11:00 AM - 1:00 PM IST',
    mode: 'Live Stream & Discord',
    mentor: 'Senior SDEs from Tier-1 Companies',
    perk: 'Free Curated 75-Question Pattern Sheet',
    icon: <Video size={20} color="#34a853" />
  },
  {
    _id: '4',
    title: 'Open Source Sprint: Building AI Agent Tools',
    type: 'opensource',
    typeLabel: 'Open Source',
    description: 'Contribute to open developer tooling, LangChain workflows, and documentation parsers. First-time contributors will be paired with senior maintainers.',
    date: 'Dec 10 - 18, 2026',
    time: 'Async GitHub Sprints',
    mode: 'GitHub + Discord Channels',
    mentor: 'Upskillyfy AI Open Source Core Team',
    perk: 'Merged PR Badge + Exclusive Swag Kit',
    icon: <Layers size={20} color="#ea4335" />
  },
  {
    _id: '5',
    title: 'Cloud Native & DevOps Crash Bootcamp',
    type: 'workshop',
    typeLabel: 'Bootcamp',
    description: 'Learn Terraform IaC, multi-region Google Cloud clusters, automated GitHub Actions CI/CD workflows, and Prometheus observability from scratch.',
    date: 'Dec 19 - 22, 2026',
    time: '7:00 PM - 9:00 PM IST',
    mode: 'Live Hands-on Labs',
    mentor: 'Certified GCP & CKA Engineers',
    perk: 'Deploy Real Kubernetes Cluster to Production',
    icon: <Laptop size={20} color="#1a73e8" />
  },
  {
    _id: '6',
    title: 'Campus Founder Pitch Night & Startup Grants',
    type: 'hackathon',
    typeLabel: 'Summit',
    description: 'Pitch student-founded software prototypes, AI SaaS products, and developer tools to angel investors, engineering founders, and accelerator scouts.',
    date: 'Jan 09, 2027',
    time: '4:00 PM - 8:30 PM IST',
    mode: 'Hybrid (Bangalore & YouTube Live)',
    mentor: 'Tech Founders & VC Partners',
    perk: '₹5,00,000 Equity-Free Seed Grants',
    icon: <Trophy size={20} color="#fbbc04" />
  }
]

export default function Events() {
  const [events, setEvents] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Registration Modal State
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [regForm, setRegForm] = useState({ name: '', email: '', college: '', phone: '' })
  const [regSuccess, setRegSuccess] = useState(false)

  useEffect(() => {
    communityAPI.getAll()
      .then(r => {
        if (r.data && Array.isArray(r.data) && r.data.length > 0) {
          // Merge API data with fallback structure for safety
          setEvents(r.data)
        } else {
          setEvents(FALLBACK_EVENTS)
        }
      })
      .catch(() => setEvents(FALLBACK_EVENTS))
  }, [])

  const currentEventsList = events.length > 0 ? events : FALLBACK_EVENTS

  const filteredEvents = currentEventsList.filter(e => {
    const typeMatch = activeCategory === 'all' || (e.type && e.type.toLowerCase().includes(activeCategory))
    const searchMatch = searchQuery.trim() === '' || 
      (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return typeMatch && searchMatch
  })

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    if (!regForm.name || !regForm.email) return
    setRegSuccess(true)
    setTimeout(() => {
      // Close modal after 2.5 seconds
      setTimeout(() => {
        setSelectedEvent(null)
        setRegSuccess(false)
        setRegForm({ name: '', email: '', college: '', phone: '' })
      }, 1500)
    }, 1000)
  }

  return (
    <div className="events-page">
      {/* =====================================================
          SECTION 1 — HERO SECTION
          ===================================================== */}
      <section className="events-hero">
        <div className="container">
          <div className="events-hero-header">
            <div className="gcp-sec-eyebrow">
              <span className="gcp-live-pulse" />
              <span>DEVELOPER NETWORK • EVENTS & HACKATHONS</span>
            </div>

            <h1 className="events-hero-title">
              Where engineers connect,{' '}
              <span className="grad">build & compete.</span>
            </h1>

            <p className="events-hero-sub">
              Participate in 48-hour national hackathons, intensive coding bootcamps, architectural webinars, and open-source contribution sprints alongside 50,000+ ambitious developers.
            </p>

            <div className="gcp-hero-actions">
              <Link to="/community/ambassador" className="gcp-btn-primary">
                <span>Become an Ambassador</span>
                <Sparkles size={15} />
              </Link>
              <a href="#browse-events" className="gcp-btn-outline">
                <span>Browse All Events</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="events-stats-row">
            {STATS.map((s, i) => (
              <div key={i} className="events-stat-box">
                <div className="events-stat-num">{s.value}</div>
                <div className="events-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — FEATURED HACKATHON SPOTLIGHT
          ===================================================== */}
      <section className="gcp-section" id="browse-events">
        <div className="container">
          <div className="events-spotlight">
            <div>
              <div className="gcp-sec-eyebrow">NATIONAL FLAGSHIP EVENT</div>
              <h2 className="events-spotlight-title">HackUpskillyfy AI 2026: The Builder Summit</h2>
              <p className="events-spotlight-desc">
                48 hours of collaborative engineering. Build real-world solutions across Generative AI, Cloud Infrastructure, and Modern Full-Stack systems. Win cash grants, AWS/GCP credits, and direct interview opportunities with hiring partners.
              </p>

              <div className="events-spotlight-perks">
                <span className="events-spotlight-perk">
                  <Trophy size={14} color="#7b61ff" />
                  <span>₹2,50,000 Prize Pool</span>
                </span>
                <span className="events-spotlight-perk">
                  <Award size={14} color="#1a73e8" />
                  <span>Verified Certificates</span>
                </span>
                <span className="events-spotlight-perk">
                  <Users size={14} color="#34a853" />
                  <span>1,000+ Builders</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(FALLBACK_EVENTS[0])}
                className="gcp-btn-primary"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <span>Register for Hackathon</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="events-spotlight-datebox">
              <span className="events-spotlight-datebox-month">NOVEMBER 2026</span>
              <span className="events-spotlight-datebox-days">14 - 16</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={13} color="#ea4335" />
                <span>Hybrid (Pan-India)</span>
              </span>
            </div>
          </div>

          {/* =====================================================
              CATEGORY FILTER & SEARCH BAR
              ===================================================== */}
          <div className="events-controls-bar">
            <div className="events-filter-group">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`events-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="events-search-box">
              <Search size={15} color="var(--muted)" />
              <input
                type="text"
                placeholder="Search workshops, hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* =====================================================
              EVENTS GRID
              ===================================================== */}
          <div className="gcp-grid-3">
            {filteredEvents.map((e, idx) => (
              <div key={e._id || idx} className="event-card">
                <div className="event-card-topbar">
                  <span className={`event-type-badge ${e.type || 'workshop'}`}>
                    {e.typeLabel || (e.type ? e.type.toUpperCase() : 'WORKSHOP')}
                  </span>
                  <span className="event-mode-chip">{e.mode || 'Online'}</span>
                </div>

                <h3 className="event-card-title">{e.title}</h3>
                <p className="event-card-desc">{e.description}</p>

                <div className="event-card-meta">
                  <div className="event-card-meta-row">
                    <Calendar size={13} color="#1a73e8" />
                    <span>{e.date || 'Upcoming'}</span>
                  </div>
                  {e.time && (
                    <div className="event-card-meta-row">
                      <Clock size={13} color="#34a853" />
                      <span>{e.time}</span>
                    </div>
                  )}
                  {e.mentor && (
                    <div className="event-card-meta-row">
                      <Users size={13} color="#7b61ff" />
                      <span>{e.mentor}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(e)}
                  className="event-card-action-btn"
                >
                  <span>Register Free</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
              <p>No events found matching your search. Try another query.</p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SECTION 3 — CAMPUS AMBASSADOR & CHAPTER CALLOUT
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-home-cta-box">
            <div className="gcp-sec-eyebrow" style={{ justifyContent: 'center' }}>
              CAMPUS CHAPTERS
            </div>
            <h2 className="gcp-home-cta-title">Want to host Upskillyfy AI at your university?</h2>
            <p className="gcp-home-cta-sub">
              Become a Campus Ambassador to represent Upskillyfy AI at your college, organize local developer meetups, unlock exclusive student perks, and build your engineering leadership portfolio.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/community/ambassador" className="gcp-btn-primary">
                <span>Explore Ambassador Program</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="gcp-btn-outline">
                <Users size={14} />
                <span>Partner With Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTERACTIVE REGISTRATION MODAL
          ===================================================== */}
      {selectedEvent && (
        <div className="event-modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="event-modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {!regSuccess ? (
              <>
                <div className="gcp-sec-eyebrow">FREE EVENT PASS</div>
                <h3 style={{ margin: '4px 0 8px', fontSize: '1.25rem', color: 'var(--text-h)' }}>
                  {selectedEvent.title}
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  📅 {selectedEvent.date} • {selectedEvent.mode}
                </p>

                <form onSubmit={handleRegisterSubmit} className="event-modal-form">
                  <div className="event-modal-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="event-modal-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="event-modal-field">
                    <label>College / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. NIT Patna / Self-taught"
                      value={regForm.college}
                      onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                    />
                  </div>

                  <div className="event-modal-field">
                    <label>WhatsApp / Phone (for session reminders)</label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="gcp-btn-primary"
                    style={{ border: 'none', width: '100%', justifyContent: 'center', marginTop: 8, cursor: 'pointer' }}
                  >
                    <span>Confirm Free Registration</span>
                    <CheckCircle2 size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <CheckCircle2 size={48} color="#34a853" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px', color: 'var(--text-h)' }}>Registration Confirmed!</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  You are all set for <strong>{selectedEvent.title}</strong>. An email confirmation and calendar invite have been dispatched.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}