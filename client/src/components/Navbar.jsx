import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  ChevronDown, 
  Sun, 
  Moon, 
  ArrowRight, 
  Sparkles,
  LayoutDashboard,
  LogOut,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

const NAV = [
  {
    label: 'Services',
    intro: {
      title: 'Enterprise Technology Services',
      desc: 'Full-cycle engineering from AI automation and cloud systems to custom web and mobile development.',
      cta: 'Explore All Services',
      to: '/services/it-services',
    },
    columns: [
      {
        heading: 'Core Engineering',
        items: [
          { label: 'IT Services', desc: 'Custom software & web applications.', to: '/services/it-services' },
          { label: 'IT Consulting', desc: 'Modernization, architecture & audit.', to: '/services/it-consulting' },
          { label: 'IT Support', desc: '24/7 technical infrastructure support.', to: '/services/it-support' },
        ],
      },
      {
        heading: 'Emerging Tech',
        items: [
          { label: 'AI Automation', desc: 'Autonomous workflows, LLMs & agents.', to: '/services/ai-automation', badge: 'AI' },
          { label: 'Cloud Architecture', desc: 'GCP, AWS & multi-cloud DevOps.', to: '/services/cloud' },
          { label: 'UI/UX Design', desc: 'Design systems & user experience.', to: '/services/uiux' },
        ],
      },
    ],
  },
  {
    label: 'Career Hub',
    intro: {
      title: 'Accelerate Your Tech Career',
      desc: 'Verified internships, placement drives, live DSA practice and modern ATS resume tools.',
      cta: 'Explore Career Hub',
      to: '/career/internships',
    },
    columns: [
      {
        heading: 'Opportunities',
        items: [
          { label: 'Internships', desc: 'Live industry internship programs.', to: '/career/internships', badge: 'Hiring' },
          { label: 'Placements', desc: 'Campus & off-campus hiring drives.', to: '/career/placements' },
        ],
      },
      {
        heading: 'Prep Tools',
        items: [
          { label: 'DSA Practice Hub', desc: 'Structured algorithms & coding track.', to: '/career/dsa' },
          { label: 'Resume Builder', desc: 'ATS-optimized resume generator.', to: '/career/resume' },
        ],
      },
    ],
  },
  {
    label: 'Learning',
    intro: {
      title: 'Skill-First Engineering Curriculum',
      desc: 'Step-by-step role roadmaps, hands-on cloud labs, and practical developer resources.',
      cta: 'Explore All Roadmaps',
      to: '/learning/roadmaps',
    },
    columns: [
      {
        heading: 'Curriculum',
        items: [
          { label: 'Career Roadmaps', desc: 'Interactive step-by-step tracks.', to: '/learning/roadmaps', badge: 'New' },
          { label: 'Course Catalog', desc: 'Project-driven code workspaces.', to: '/learning/courses' },
        ],
      },
      {
        heading: 'Knowledge',
        items: [
          { label: 'Docs & Resources', desc: 'Cheatsheets, tools & repositories.', to: '/learning/resources' },
          { label: 'Certifications', desc: 'Industry certification paths.', to: '/learning/certifications' },
        ],
      },
    ],
  },
  { label: 'Community', to: '/community/events' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' },
]

export default function Navbar() {
  const [mobOpen, setMobOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [mobExpandedSection, setMobExpandedSection] = useState(null)

  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobOpen(false)
  }

  // Close menus on page route changes
  useEffect(() => {
    setOpenMenu(null)
    setMobOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobOpen])

  // Click outside to close desktop mega menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMobOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleMobileAccordion = (label) => {
    setMobExpandedSection((prev) => (prev === label ? null : label))
  }

  return (
    <>
      <header className="gcp-navbar-wrap" ref={navRef}>
        {/* Signature 4-Color Accent Line */}
        <div className="gcp-navbar-accent" />

        <div className="container">
          <div className="gcp-navbar-inner">
            {/* BRAND LOGO */}
            <Link to="/" className="gcp-nav-logo" aria-label="Upskillyfy Home">
              <span className="gcp-nav-logo-mark">U</span>
              <span className="gcp-nav-logo-text">Upskillyfy</span>
            </Link>

            {/* DESKTOP NAVIGATION ITEMS */}
            <ul className="gcp-nav-menu">
              {NAV.map((item, i) =>
                item.columns ? (
                  <li className="gcp-nav-item" key={item.label}>
                    <button
                      type="button"
                      className={`gcp-nav-link-btn ${openMenu === i ? 'active' : ''}`}
                      onClick={() => setOpenMenu(openMenu === i ? null : i)}
                      aria-expanded={openMenu === i}
                      aria-haspopup="menu"
                    >
                      <span>{item.label}</span>
                      <ChevronDown 
                        size={14} 
                        className={`gcp-nav-chevron ${openMenu === i ? 'rotated' : ''}`} 
                      />
                    </button>
                  </li>
                ) : (
                  <li className="gcp-nav-item" key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `gcp-nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                )
              )}
            </ul>

            {/* RIGHT ACTIONS */}
            <div className="gcp-nav-actions">
              {/* Theme Switcher Toggle */}
              <button
                type="button"
                onClick={toggle}
                className="gcp-nav-theme-btn"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle visual theme"
              >
                {theme === 'dark' ? (
                  <Sun size={15} color="#FBBC04" />
                ) : (
                  <Moon size={15} color="#5f6368" />
                )}
                <span className="gcp-nav-theme-label">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
              </button>

              {/* Desktop Auth Buttons */}
              {user ? (
                <>
                  <Link to="/dashboard" className="gcp-nav-btn-outline">
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>
                  <button type="button" onClick={handleLogout} className="gcp-nav-btn-primary">
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="gcp-nav-btn-outline">
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="gcp-nav-btn-primary">
                    <span>Join Free</span>
                  </Link>
                </>
              )}

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                className="gcp-nav-mob-toggle"
                onClick={() => setMobOpen((prev) => !prev)}
                aria-label={mobOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
                aria-expanded={mobOpen}
              >
                {mobOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP MEGA MENU DROPDOWN */}
        {openMenu !== null && NAV[openMenu]?.columns && (
          <div className="gcp-mega-dropdown" role="menu">
            <div className="container">
              <div className="gcp-mega-inner">
                {/* Close Button */}
                <button
                  type="button"
                  className="gcp-mega-close-btn"
                  onClick={() => setOpenMenu(null)}
                  aria-label="Close menu"
                >
                  <X size={15} />
                </button>

                {/* Left Promo Intro */}
                <div className="gcp-mega-intro">
                  <h3 className="gcp-mega-intro-title">{NAV[openMenu].intro.title}</h3>
                  <p className="gcp-mega-intro-desc">{NAV[openMenu].intro.desc}</p>
                  <Link 
                    to={NAV[openMenu].intro.to} 
                    className="gcp-mega-intro-cta" 
                    onClick={() => setOpenMenu(null)}
                  >
                    <span>{NAV[openMenu].intro.cta}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Columns */}
                {NAV[openMenu].columns.map((col) => (
                  <div className="gcp-mega-col" key={col.heading}>
                    <div className="gcp-mega-col-heading">{col.heading}</div>
                    <div className="gcp-mega-list">
                      {col.items.map((it) => (
                        <Link 
                          key={it.label} 
                          to={it.to} 
                          className="gcp-mega-item" 
                          onClick={() => setOpenMenu(null)}
                        >
                          <div className="gcp-mega-item-top">
                            <span className="gcp-mega-item-title">{it.label}</span>
                            {it.badge && <span className="gcp-mega-badge">{it.badge}</span>}
                          </div>
                          <p className="gcp-mega-item-desc">{it.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE ACCORDION DRAWER (Full Viewport Safe with Scroll) */}
      {mobOpen && (
        <div className="gcp-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {NAV.map((item) =>
            item.columns ? (
              <div className="gcp-mob-section" key={item.label}>
                <button
                  type="button"
                  className="gcp-mob-accordion-btn"
                  onClick={() => toggleMobileAccordion(item.label)}
                  aria-expanded={mobExpandedSection === item.label}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`gcp-mob-accordion-chevron ${
                      mobExpandedSection === item.label ? 'rotated' : ''
                    }`}
                  />
                </button>

                {mobExpandedSection === item.label && (
                  <div className="gcp-mob-accordion-body">
                    {item.columns.map((col) =>
                      col.items.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          className="gcp-mob-sub-link"
                          onClick={() => setMobOpen(false)}
                        >
                          <span>{sub.label}</span>
                          {sub.badge && <span className="gcp-mega-badge">{sub.badge}</span>}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="gcp-mob-direct-link"
                onClick={() => setMobOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}

          {/* Mobile Bottom Actions: Login / Register / Dashboard */}
          <div className="gcp-mob-bottom-actions">
            <div className="gcp-mob-auth-btns">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="gcp-mob-btn-outline" 
                    onClick={() => setMobOpen(false)}
                  >
                    <LayoutDashboard size={16} style={{ marginRight: 6 }} />
                    <span>Dashboard</span>
                  </Link>
                  <button 
                    type="button" 
                    onClick={handleLogout} 
                    className="gcp-mob-btn-primary"
                  >
                    <LogOut size={16} style={{ marginRight: 6 }} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="gcp-mob-btn-outline" 
                    onClick={() => setMobOpen(false)}
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="gcp-mob-btn-primary" 
                    onClick={() => setMobOpen(false)}
                  >
                    <span>Create Free Account</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
