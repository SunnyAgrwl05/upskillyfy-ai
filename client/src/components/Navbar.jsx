import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  {
    label: 'Services',
    intro: {
      title: 'Technology services built for what comes next',
      desc: 'From software development to AI automation and cloud, we help teams and businesses move forward.',
      cta: 'Explore all services',
      to: '/services/it-services',
    },
    columns: [
      {
        heading: 'Core services',
        items: [
          { label: 'IT Services', desc: 'Custom software, web and application development.', to: '/services/it-services' },
          { label: 'IT Support', desc: 'Reliable technical support for teams and organizations.', to: '/services/it-support' },
          { label: 'IT Consulting', desc: 'Technology strategy and digital transformation.', to: '/services/it-consulting' },
        ],
      },
      {
        heading: 'Emerging technology',
        items: [
          { label: 'AI Automation', desc: 'AI-powered workflows and intelligent automation.', to: '/services/ai-automation' },
          { label: 'UI/UX', desc: 'User-centered digital product design.', to: '/services/uiux' },
          { label: 'Cloud', desc: 'Cloud adoption, deployment and modernization.', to: '/services/cloud' },
        ],
      },
    ],
  },
  {
    label: 'Career Hub',
    intro: {
      title: 'Your next opportunity starts here',
      desc: 'Internships, placement preparation, DSA practice and career resources for every stage of your journey.',
      cta: 'Explore Career Hub',
      to: '/career/internships',
    },
    columns: [
      {
        heading: 'Career',
        items: [
          { label: 'Internships', desc: 'Find opportunities across technology and core engineering.', to: '/career/internships' },
          { label: 'Placements', desc: 'Prepare for company drives and interview rounds.', to: '/career/placements' },
        ],
      },
      {
        heading: 'Preparation',
        items: [
          { label: 'DSA Hub', desc: 'Structured problem sets and learning tracks.', to: '/career/dsa' },
          { label: 'Resume Builder', desc: 'Build an ATS-friendly resume.', to: '/career/resume' },
        ],
      },
    ],
  },
  {
    label: 'Learning',
    intro: {
      title: 'Learn skills that move with the industry',
      desc: 'Courses, roadmaps and practical resources mapped to real roles and real projects.',
      cta: 'Explore learning',
      to: '/learning/courses',
    },
    columns: [
      {
        heading: 'Learn',
        items: [
          { label: 'Courses', desc: 'Self-paced, project-based learning.', to: '/learning/courses' },
          { label: 'Roadmaps', desc: 'Step-by-step paths by role.', to: '/learning/roadmaps' },
        ],
      },
      {
        heading: 'Resources',
        items: [
          { label: 'Resources', desc: 'Notes, sheets and reading lists.', to: '/learning/resources' },
          { label: 'DSA Hub', desc: 'Practice problems and tracks.', to: '/career/dsa' },
        ],
      },
    ],
  },
  { label: 'Community', to: '/community/events' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' },
]

export default function Navbar() {
  const [mob, setMob] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)

  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const navRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMob(false)
      }
    }

    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    setOpenMenu(null)
    setMob(false)
  }, [navigate])

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <div className="nav-inner">

          {/* LOGO */}
          <Link to="/" className="nav-logo">
            <span className="nav-logo-mark">U</span>
            <span>Upskillyfy</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <ul className="nav-menu">
            {NAV.map((item, i) =>
              item.columns ? (
                <li className="nav-item" key={i}>
                  <button
                    className={`nav-link${openMenu === i ? ' on' : ''}`}
                    onClick={() => setOpenMenu(openMenu === i ? null : i)}
                    aria-expanded={openMenu === i}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <span className={`nav-caret${openMenu === i ? ' up' : ''}`}>▾</span>
                  </button>
                </li>
              ) : (
                <li className="nav-item" key={i}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `nav-link${isActive ? ' on' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>

          {/* RIGHT ACTIONS */}
          <div className="nav-acts">
            <button
              onClick={toggle}
              className="theme-toggle"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  <line x1="5.64" y1="18.36" x2="4.22" y2="19.78" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {user ? (
              <>
                <Link to="/dashboard" className="btn-g btn-sm">Dashboard</Link>
                <button onClick={handleLogout} className="btn-primary btn-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-g btn-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Join Free</Link>
              </>
            )}

            <button
              className="mob-btn"
              onClick={() => setMob(!mob)}
              aria-label={mob ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mob}
            >
              {mob ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* MEGA MENU */}
        {openMenu !== null && NAV[openMenu].columns && (
          <div className="mega">
            <button
              className="mega-close"
              onClick={() => setOpenMenu(null)}
              aria-label="Close menu"
            >
              ✕
            </button>
            <div className="mega-inner">
              <div className="mega-intro">
                <h3>{NAV[openMenu].intro.title}</h3>
                <p>{NAV[openMenu].intro.desc}</p>
                <Link to={NAV[openMenu].intro.to} className="mega-intro-link" onClick={() => setOpenMenu(null)}>
                  {NAV[openMenu].intro.cta} →
                </Link>
              </div>
              {NAV[openMenu].columns.map((col, ci) => (
                <div className="mega-col" key={ci}>
                  <div className="mega-col-h">{col.heading}</div>
                  {col.items.map((it, ii) => (
                    <Link key={ii} to={it.to} className="mega-item" onClick={() => setOpenMenu(null)}>
                      <span className="mega-item-t">{it.label}</span>
                      <span className="mega-item-d">{it.desc}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* BACKDROP */}
      {openMenu !== null && (
        <div className="mega-backdrop" onClick={() => setOpenMenu(null)} />
      )}

      {/* MOBILE MENU */}
      {mob && (
        <div className="mobile-menu open">
          {NAV.map((item, i) =>
            item.columns ? (
              <div key={i}>
                <div className="mob-sec" style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--faint2)', textTransform: 'uppercase', letterSpacing: '.06em', padding: '14px 12px 4px' }}>
                  {item.label}
                </div>
                {item.columns.map((col) =>
                  col.items.map((d, j) => (
                    <Link key={`${i}-${j}`} to={d.to} onClick={() => setMob(false)}>
                      {d.label}
                    </Link>
                  ))
                )}
              </div>
            ) : (
              <Link key={i} to={item.to} onClick={() => setMob(false)}>
                {item.label}
              </Link>
            )
          )}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMob(false)}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setMob(false) }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMob(false)}>Login</Link>
                <Link to="/register" onClick={() => setMob(false)}>Join Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
