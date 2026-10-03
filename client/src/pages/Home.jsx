import { useState } from 'react'
import { Link } from 'react-router-dom'
import { newsletterAPI } from '../api'
import TechCarousel from '../components/TechCarousel'
import StoriesCarousel from '../components/StoriesCarousel'

/* =====================================================
   SECTION DATA
   ===================================================== */

const TRUST_STATS = [
  { value: '50K+', label: 'Learners Reached' },
  { value: '1.2K+', label: 'Verified Internships' },
  { value: '800+', label: 'Projects Delivered' },
  { value: '6', label: 'Service Areas' },
]

const SERVICES = [
  { icon: '💻', title: 'IT Services', desc: 'Custom software, web and application development.', to: '/services/it-services' },
  { icon: '🛠️', title: 'IT Support', desc: 'Reliable technical support for teams and organizations.', to: '/services/it-support' },
  { icon: '👨‍💼', title: 'IT Consulting', desc: 'Technology strategy and digital transformation.', to: '/services/it-consulting' },
  { icon: '🤖', title: 'AI Automation', desc: 'AI-powered workflows and intelligent automation.', to: '/services/ai-automation' },
  { icon: '🎨', title: 'UI/UX', desc: 'User-centered digital product design.', to: '/services/uiux' },
  { icon: '☁️', title: 'Cloud', desc: 'Cloud adoption, deployment and modernization.', to: '/services/cloud' },
]

const PORTFOLIO_PROJECTS = [
  { icon: '🤖', title: 'AI Customer Support Bot', desc: 'WhatsApp chatbot handling 200+ daily queries for e-commerce.', tech: ['Python', 'Gemini AI', 'WhatsApp API'] },
  { icon: '💻', title: 'EdTech LMS Platform', desc: 'Full-stack learning management system for 500+ students.', tech: ['React', 'Node.js', 'MongoDB'] },
  { icon: '📱', title: 'Business Directory App', desc: 'Android app for local business discovery, 1000+ downloads.', tech: ['React Native', 'Firebase'] },
  { icon: '🛍️', title: 'E-Commerce Website', desc: 'Full e-commerce solution with payment integration.', tech: ['Next.js', 'Stripe', 'MongoDB'] },
  { icon: '📊', title: 'Sales Analytics Dashboard', desc: 'Real-time sales analytics for manufacturing client.', tech: ['Python', 'Tableau', 'SQL'] },
  { icon: '🎓', title: 'College Resource Portal', desc: 'Resource sharing platform with 2000+ active users.', tech: ['React', 'Firebase'] },
]

const STORY_NAMES = ['Kajal Kumari', 'Alok Raj', 'Abhijeet Gupta', 'Shrestha Saran', 'Tanya Gupta']

/* =====================================================
   HOME COMPONENT
   ===================================================== */

export default function Home() {
  const [email, setEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!email) return
    setNewsletterLoading(true)
    setNewsletterMsg('')
    try {
      await newsletterAPI.subscribe({ email })
      setNewsletterMsg("You're subscribed!")
      setEmail('')
    } catch (err) {
      setNewsletterMsg('Subscription failed. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <>
      {/* =====================================================
          SECTION 1 — PREMIUM HERO
      ===================================================== */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-tag"><span className="live-dot"></span>BUILD • LEARN • GROW</div>
              <h1>
                Technology that helps you{' '}
                <span className="grad">build what comes next.</span>
              </h1>
              <p className="hero-sub">
                Upskillyfy brings technology, AI, cloud, learning and career opportunities together to help students, developers, startups and businesses move from ideas to real-world outcomes.
              </p>
              <div className="hero-actions">
                <Link to="/services/it-services" className="btn-primary">Get Started</Link>
                <Link to="/services/it-services" className="btn-g">Explore Services</Link>
              </div>
              <div className="hero-actions" style={{ marginTop: 16 }}>
                <Link to="/career/internships" className="btn-text">Explore career opportunities →</Link>
                <Link to="/portfolio" className="btn-text">View our work →</Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-visual-grid" />
              <div className="hero-metric">
                <div className="hero-metric">
                  <strong>6</strong>
                  <span>Service Areas</span>
                </div>
                <div className="hero-metric">
                  <strong>3</strong>
                  <span>Learning Paths</span>
                </div>
                <div className="hero-metric">
                  <strong>∞</strong>
                  <span>Growth Options</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — TRUST / STATS
      ===================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="hero-stats">
            {TRUST_STATS.map((stat, i) => (
              <div key={i} className="stat">
                <strong className="stat-n">{stat.value}</strong>
                <span className="stat-l">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3 — WHAT IS UPSKILLYFY
      ===================================================== */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">What We Do</div>
            <h2 className="h2">Building, learning, and growing through technology.</h2>
            <p className="hero-sub">
              Upskillyfy is a complete platform for technology services, AI automation, cloud solutions, career development, and practical learning.</p>
          </div>
          <div className="g3">
            {[
              { icon: '💻', title: 'Build', desc: 'Software, web, mobile and digital products.' },
              { icon: '🤖', title: 'Automate', desc: 'AI-powered workflows and intelligent automation.' },
              { icon: '📚', title: 'Learn', desc: 'Courses, roadmaps and practical resources.' },
              { icon: '🚀', title: 'Grow', desc: 'Internships, placements and career opportunities.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ cursor: 'pointer' }}>
                <div className="card-ico" style={{ marginBottom: 0 }}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4 — SERVICES
      ===================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Services</div>
            <h2 className="h2">Comprehensive technology solutions</h2>
          </div>
          <div className="g3">
            {SERVICES.map((s, i) => (
              <Link key={i} to={s.to} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  <div className="card-ico" style={{ marginBottom: 0 }}>{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="card-arr">Learn more →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5 — TECHNOLOGY / SOLUTIONS
      ===================================================== */}
      <section className="section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">AI + Cloud + DevOps</div>
              <h2 className="h2">Turn technology into a competitive advantage.</h2>
              <p className="hero-sub">
                Upskillyfy combines AI automation, cloud technologies and software engineering to help teams build faster, learn smarter and grow confidently.</p>
              <div className="hero-actions" style={{ marginTop: 24 }}>
                <Link to="/services/ai-automation" className="btn-primary">Explore AI & Cloud</Link>
              </div>
            </div>
            <div>
              <div className="card" style={{ padding: 24, background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
                <h3>Tech Stack</h3>
                <div className="g2" style={{ gap: 16, marginTop: 16 }}>
                  <div>
                    <strong className="grad">Frontend</strong>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 6 }}>React, Next.js, TypeScript, Tailwind</p>
                  </div>
                  <div>
                    <strong className="grad">Backend</strong>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 6 }}>Node.js, Python, Java, Go</p>
                  </div>
                  <div>
                    <strong className="grad">AI/ML</strong>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 6 }}>OpenAI, Gemini, TensorFlow, PyTorch</p>
                  </div>
                  <div>
                    <strong className="grad">Cloud</strong>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 6 }}>AWS, Azure, GCP, Docker, Kubernetes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 6 — CAREER HUB
      ===================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Career Hub</div>
            <h2 className="h2">Your next opportunity can start here.</h2>
            <p className="hero-sub">
              Explore internships, placement preparation, resume building, DSA practice and career resources — all designed to help you move from learning to earning.</p>
          </div>
          <div className="card" style={{ padding: '48px', background: 'var(--cta-bg)', borderColor: 'var(--newsletter-b)' }}>
            <div className="hero-grid">
              <div>
                <h3 style={{ marginBottom: 16 }}>Career Resources</h3>
                <ul className="slist">
                  <li>Verified internships across tech and core engineering</li>
                  <li>Company-wise placement preparation guides</li>
                  <li>ATS-friendly resume templates and tips</li>
                  <li>DSA tracks and curated problem sets</li>
                </ul>
                <div className="flex-r" style={{ marginTop: 28 }}>
                  <Link to="/career/internships" className="btn-primary">Explore Career Hub</Link>
                </div>
              </div>
              <div className="g2" style={{ alignItems: 'start', gap: 16 }}>
                <div className="card" style={{ padding: 20, background: '#fff', textAlign: 'center' }}>
                  <strong>Internships</strong>
                  <p style={{ marginTop: 4 }}>Verified opportunities across tech and core engineering.</p>
                </div>
                <div className="card" style={{ padding: 20, background: '#fff', textAlign: 'center' }}>
                  <strong>Placement Prep</strong>
                  <p style={{ marginTop: 4 }}>Company-wise tips, aptitude and interview guides.</p>
                </div>
                <div className="card" style={{ padding: 20, background: '#fff', textAlign: 'center' }}>
                  <strong>Resume Building</strong>
                  <p style={{ marginTop: 4 }}>ATS-friendly templates and expert tips.</p>
                </div>
                <div className="card" style={{ padding: 20, background: '#fff', textAlign: 'center' }}>
                  <strong>DSA Practice</strong>
                  <p style={{ marginTop: 4 }}>Structured tracks and curated problem sets.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 7 — LEARNING
      ===================================================== */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Learning</div>
            <h2 className="h2">Skills that move with the industry.</h2>
          </div>
          <div className="g3" style={{ marginBottom: 64 }}>
            {[
              { icon: '💻', title: 'Courses', desc: 'Self-paced, project-based learning across tech and AI.', to: '/learning/courses', cls: 'bdg-b' },
              { icon: '🗺️', title: 'Roadmaps', desc: 'Step-by-step learning paths by role and skill.', to: '/learning/roadmaps', cls: 'bdg-p' },
              { icon: '📁', title: 'Resources', desc: 'Notes, sheets and curated reading lists.', to: '/learning/resources', cls: 'bdg-g' },
              { icon: '🧠', title: 'DSA Hub', desc: 'Structured problem sets and practice tracks.', to: '/career/dsa', cls: 'bdg-o' },
            ].map((item, i) => (
              <Link key={i} to={item.to} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div className="card-ico" style={{ marginBottom: 0 }}>{item.icon}</div>
                    <span className={`bdg ${item.cls}`}>{item.cls === 'bdg-b' ? 'Courses' : item.cls === 'bdg-p' ? 'Roadmaps' : item.cls === 'bdg-g' ? 'Resources' : 'DSA'}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p style={{ margin: '10px 0', fontSize: '.86rem' }}>{item.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.8rem', color: 'var(--faint2)' }}>📚 Learning</span>
                    <Link to={item.to} className="btn-primary btn-xs">Explore →</Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 8 — COMMUNITY
      ===================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Community</div>
            <h2 className="h2">Learn together. Build together.</h2>
            <p className="hero-sub">
              Join a community of students, developers and creators collaborating on events, challenges, workshops and technology opportunities.</p>
          </div>
          <div className="g4">
            {[
              { icon: '🎉', title: 'Events', desc: 'Workshops, meetups and webinars on the latest in tech.' },
              { icon: '🏆', title: 'Challenges', desc: 'Compete, learn and build with community hackathons.' },
              { icon: '🤝', title: 'Collaboration', desc: 'Work on projects with peers from different backgrounds.' },
              { icon: '💡', title: 'Opportunities', desc: 'Discover internships, open source and career openings.' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p style={{ marginTop: 8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 40 }}>
            <Link to="/community/events" className="btn-primary">Join the Community →</Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 9 — CUSTOMER SUCCESS STORIES
      ===================================================== */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Community</div>
            <h2 className="h2">People building with Upskillyfy</h2>
            <p className="hero-sub">Real stories from learners and builders in the Upskillyfy community.</p>
          </div>
          <StoriesCarousel names={STORY_NAMES} />
        </div>
      </section>

      {/* =====================================================
          SECTION 10 — PORTFOLIO / PROJECTS
      ===================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Portfolio</div>
            <h2 className="h2">From ideas to real-world products.</h2>
          </div>
          <div className="g3">
            {PORTFOLIO_PROJECTS.map((p, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{p.icon}</div>
                <span className="bdg bdg-b" style={{ marginBottom: 12, display: 'inline-flex' }}>{p.tech[0]}</span>
                <h3>{p.title}</h3>
                <p style={{ margin: '10px 0' }}>{p.desc}</p>
                <div className="pill-row" style={{ marginTop: 14 }}>
                  {p.tech.map((t, j) => <span key={j} className="pill">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 40 }}>
            <Link to="/portfolio" className="btn-primary">View Full Portfolio →</Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 11 — WHY UPSKILLYFY
      ===================================================== */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Why Upskillyfy</div>
            <h2 className="h2">Learn. Build. Launch. Grow.</h2>
            <p className="hero-sub">
              The complete ecosystem connecting technology, AI, cloud, learning and career opportunities.</p>
          </div>
          <div className="g2" style={{ gap: 48, alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <div className="tline" style={{ marginTop: 24 }}>
                <div className="tl-i">
                  <div className="tl-d">Learn</div>
                  <p>Courses, roadmaps, DSA practice and technical resources mapped to real roles.</p>
                </div>
                <div className="tl-i">
                  <div className="tl-d">Build</div>
                  <p>Custom software, web apps, mobile solutions and AI-powered products.</p>
                </div>
                <div className="tl-i">
                  <div className="tl-d">Launch</div>
                  <p>Cloud deployments, DevOps pipelines and scalable infrastructure solutions.</p>
                </div>
                <div className="tl-i">
                  <div className="tl-d">Grow</div>
                  <p>Internships, placements, career guidance and community opportunities.</p>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 16 }}>The Upskillyfy Advantage</h3>
                <ul className="slist">
                  <li>Project-based learning with real-world outcomes</li>
                  <li>End-to-end technology services from AI to cloud</li>
                  <li>Career-focused curriculum and placement support</li>
                  <li>Community of 50K+ active learners and builders</li>
                  <li>Verified internships and career opportunities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 12 — LARGE CTA
      ===================================================== */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2 className="h2">Ready to build what's next?</h2>
            <p className="muted" style={{ marginBottom: 24, maxWidth: 640, marginInline: 'auto' }}>
              Whether you're learning, building or growing a business, Upskillyfy can help you take the next step.</p>
            <div className="flex-r">
              <Link to="/register" className="btn-primary">Get Started</Link>
              <Link to="/about" className="btn-g">Explore Upskillyfy</Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 13 — NEWSLETTER
      ===================================================== */}
      <section className="section section-alt">
        <div className="container">
          <div className="newsletter-band">
            <div className="newsletter-left">
              <div className="newsletter-icon">✉</div>
              <div>
                <div className="newsletter-title">Get the latest updates</div>
                <p className="newsletter-sub">Subscribe to our newsletter for new courses, career opportunities, and community events.</p>
              </div>
            </div>
            <div className="newsletter-right">
              <form className="newsletter-form" onSubmit={handleNewsletter}>
                <input
                  className="newsletter-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  required
                />
                <button type="submit" className="btn-primary newsletter-btn" disabled={newsletterLoading}>
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsletterMsg && (
                <p className="newsletter-note" style={{ color: '#1a73e8', marginTop: 10 }}>{newsletterMsg}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TECH CAROUSEL (Section 14)
      ===================================================== */}
      <TechCarousel />
    </>
  )
}