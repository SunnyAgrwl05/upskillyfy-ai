import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, CheckCircle2, Mail } from 'lucide-react'
import { newsletterAPI } from '../api'
import './Footer.css'

const NAV_GROUPS = [
  {
    heading: 'Services',
    items: [
      { label: 'IT Services', to: '/services/it-services' },
      { label: 'AI Automation', to: '/services/ai-automation' },
      { label: 'Cloud Solutions', to: '/services/cloud' },
      { label: 'IT Consulting', to: '/services/it-consulting' },
      { label: 'UI/UX Design', to: '/services/uiux' },
      { label: 'IT Support', to: '/services/it-support' },
    ],
  },
  {
    heading: 'Career Hub',
    items: [
      { label: 'Internships', to: '/career/internships' },
      { label: 'Placements', to: '/career/placements' },
      { label: 'DSA Practice Hub', to: '/career/dsa' },
      { label: 'Resume Builder', to: '/career/resume' },
    ],
  },
  {
    heading: 'Learning',
    items: [
      { label: 'Course Catalog', to: '/learning/courses' },
      { label: 'Career Roadmaps', to: '/learning/roadmaps' },
      { label: 'Assessments', to: '/assessments' },
      { label: 'Docs & Resources', to: '/learning/resources' },
      { label: 'Certifications', to: '/learning/certifications' },
    ],
  },
  {
    heading: 'Company & Community',
    items: [
      { label: 'About Upskillyfy', to: '/about' },
      { label: 'Tech Events', to: '/community/events' },
      { label: 'Hackathons', to: '/community/hackathons' },
      { label: 'Campus Ambassadors', to: '/community/ambassador' },
      { label: 'Contact Support', to: '/contact' },
    ],
  },
]

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/upskillyfy/', Icon: InstagramIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/upskillyfy-ai/', Icon: LinkedInIcon },
  { label: 'GitHub repository', href: 'https://github.com/SunnyAgrwl05/upskillyfy-ai', Icon: GitHubIcon },
]

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 10H5.67v8h2.67v-8ZM7 5.8a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1ZM18.33 13.4c0-2.4-1.28-3.52-2.99-3.52a2.58 2.58 0 0 0-2.32 1.28V10h-2.67v8h2.67v-4.37c0-1.15.22-2.27 1.65-2.27 1.41 0 1.43 1.32 1.43 2.34V18h2.66l-.43-4.6Z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.2 3.26.92.1-.72.39-1.2.71-1.48-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.04-1.14 3.04-1.14.61 1.53.23 2.67.12 2.95.71.78 1.14 1.77 1.14 2.99 0 4.29-2.6 5.23-5.09 5.51.4.35.76 1.03.76 2.08v3.04c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await newsletterAPI.subscribe(email.trim())
      setMessage('Thank you for subscribing to Upskillyfy engineering updates!')
      setIsSuccess(true)
      setEmail('')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Subscription failed. Please check your email and try again.')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="gcp-footer" role="contentinfo">
      <div className="gcp-footer-accent-bar" />
      <div className="container">
        <div className="gcp-footer-newsletter">
          <div className="gcp-footer-newsletter-left">
            <div className="gcp-footer-newsletter-icon"><Mail size={22} /></div>
            <div>
              <h2 className="gcp-footer-newsletter-title">Stay Ahead in Tech & Engineering</h2>
              <p className="gcp-footer-newsletter-sub">Curated learning roadmaps, engineering resources, and internship alerts delivered to your inbox.</p>
            </div>
          </div>
          <div className="gcp-footer-newsletter-right">
            <form className="gcp-footer-newsletter-form" onSubmit={handleSubscribe}>
              <label className="sr-only" htmlFor="footer-newsletter-email">Email address for newsletter</label>
              <input
                id="footer-newsletter-email"
                className="gcp-footer-newsletter-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address..."
                required
              />
              <button type="submit" className="gcp-footer-newsletter-btn" disabled={loading}>
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            {message && (
              <p className={`gcp-footer-newsletter-msg ${isSuccess ? 'success' : 'error'}`} role={isSuccess ? 'status' : 'alert'}>
                {isSuccess && <CheckCircle2 size={14} />}
                <span>{message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="gcp-footer-main">
          <div className="gcp-footer-brand">
            <Link to="/" className="nav-logo" aria-label="Upskillyfy home">
              <img className="gcp-footer-logo-image" src="/upskillyfy-logo.jpg" alt="Upskillyfy" />
            </Link>
            <p className="gcp-footer-desc">Practical learning paths, career resources, and technical assessments for growing engineers.</p>
            <div className="gcp-footer-socials" aria-label="Official social profiles">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gcp-footer-soc-btn"
                  aria-label={label}
                  title={label}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          <div className="gcp-footer-links-grid">
            {NAV_GROUPS.map((group) => (
              <nav className="gcp-footer-col" key={group.heading} aria-label={group.heading}>
                <h2 className="gcp-footer-col-title">{group.heading}</h2>
                <ul className="gcp-footer-link-list">
                  {group.items.map((item) => <li key={item.to}><Link className="gcp-footer-link" to={item.to}>{item.label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="gcp-footer-bottom">
          <div className="gcp-footer-bottom-left">
            <span>© {new Date().getFullYear()} Upskillyfy AI. All rights reserved.</span>
          </div>
          <button type="button" className="gcp-footer-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
            <ArrowUp size={15} /> Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
