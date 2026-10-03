import { useState } from 'react'
import { Link } from 'react-router-dom'
import { newsletterAPI } from '../api'

const NAV = [
  {
    heading: 'Explore',
    items: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Portfolio', to: '/portfolio' },
      { label: 'Services', to: '/services/it-services' },
      { label: 'Career Hub', to: '/career/internships' },
      { label: 'Learning', to: '/learning/courses' },
      { label: 'Community', to: '/community/events' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Services',
    items: [
      { label: 'IT Services', to: '/services/it-services' },
      { label: 'IT Support', to: '/services/it-support' },
      { label: 'IT Consulting', to: '/services/it-consulting' },
      { label: 'AI Automation', to: '/services/ai-automation' },
      { label: 'UI/UX', to: '/services/uiux' },
      { label: 'Cloud', to: '/services/cloud' },
    ],
  },
  {
    heading: 'Career & Learning',
    items: [
      { label: 'Internships', to: '/career/internships' },
      { label: 'Placements', to: '/career/placements' },
      { label: 'DSA Hub', to: '/career/dsa' },
      { label: 'Resume Builder', to: '/career/resume' },
      { label: 'Courses', to: '/learning/courses' },
      { label: 'Roadmaps', to: '/learning/roadmaps' },
      { label: 'Resources', to: '/learning/resources' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Story', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/about' },
      { label: 'Terms of Service', to: '/about' },
    ],
  },
]

const FOOTER_DESC = 'Upskillyfy is a learning and technology platform helping people build skills, create meaningful projects, and grow their careers through practical, project-based learning.'

export default function Footer() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await newsletterAPI.subscribe({ message: 'Newsletter subscription' })
      setMessage('Thanks for subscribing!')
    } catch (err) {
      setMessage('We could not subscribe you. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-g">
          <div>
            <Link to="/" className="nav-logo" style={{ marginBottom: 16 }}>
              <span className="nav-logo-mark">U</span>
              <span>Upskillyfy</span>
            </Link>
            <p className="footer-desc">{FOOTER_DESC}</p>
            <div className="f-social" style={{ marginTop: 24 }}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="f-soc-btn" aria-label="Twitter">𝕏</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="f-soc-btn" aria-label="Facebook">f</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="f-soc-btn" aria-label="Instagram">◎</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="f-soc-btn" aria-label="LinkedIn">in</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="f-soc-btn" aria-label="YouTube">▶</a>
            </div>
          </div>
          {NAV.map((group) => (
            <div key={group.heading}>
              <h5>{group.heading}</h5>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="newsletter-band">
          <div className="newsletter-left">
            <div className="newsletter-icon">✉</div>
            <div>
              <div className="newsletter-title">Get the latest updates</div>
              <p className="newsletter-sub">Subscribe to our newsletter for new courses, career opportunities, and community events.</p>
            </div>
          </div>
          <div className="newsletter-right">
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                className="newsletter-input"
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
                required
              />
              <button type="submit" className="btn-primary newsletter-btn" disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {message && <p className="newsletter-note" style={{ color: '#1a73e8' }}>{message}</p>}
          </div>
        </div>

        <div className="f-bottom">
          <span>© 2026 Upskillyfy. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/about">Privacy Policy</Link>
            <Link to="/about">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
