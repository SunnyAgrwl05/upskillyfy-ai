import { Link } from 'react-router-dom'
import { 
  Code2, 
  Briefcase, 
  Bot, 
  Palette, 
  Cloud, 
  Compass, 
  GraduationCap, 
  ArrowRight, 
  ArrowUpRight, 
  Cpu
} from 'lucide-react'
import TechCarousel from '../components/TechCarousel'
import StoriesCarousel from '../components/StoriesCarousel'
import './Home.css'

/* =====================================================
   LANDING PAGE DATA
   ===================================================== */

const TRUST_STATS = [
  { value: '4+', label: 'Learning Tracks' },
  { value: '100%', label: 'Hands-on Projects' },
  { value: '24/7', label: 'Community Support' },
  { value: 'Verified', label: 'Internship Pathways' },
]

const CORE_SERVICES = [
  { 
    icon: <Code2 size={20} color="#1a73e8" />, 
    title: 'Custom Software & Web', 
    desc: 'Scalable web applications, modern frontend architectures, and high-performance microservices.', 
    to: '/services/it-services',
  },
  { 
    icon: <Bot size={20} color="#34a853" />, 
    title: 'AI Automation & ML', 
    desc: 'Production-ready AI workflows, conversational assistants, and operational process automation.', 
    to: '/services/ai-automation',
  },
  { 
    icon: <Cloud size={20} color="#4285f4" />, 
    title: 'Cloud & DevOps', 
    desc: 'Modern cloud infrastructure, containerization with Docker & Kubernetes, and automated CI/CD.', 
    to: '/services/cloud',
  },
  { 
    icon: <Palette size={20} color="#ea4335" />, 
    title: 'Product & UI/UX Design', 
    desc: 'Intuitive user experiences, modern interface design, interactive prototypes, and design systems.', 
    to: '/services/uiux',
  },
]

const LEARNING_TRACKS = [
  { 
    icon: <Compass size={20} color="#1a73e8" />, 
    title: 'Interactive Roadmaps', 
    desc: 'Step-by-step developer paths with progress tracking and curated learning milestones.', 
    to: '/learning/roadmaps',
    chip: 'Structured',
    chipClass: 'blue'
  },
  { 
    icon: <GraduationCap size={20} color="#34a853" />, 
    title: 'Hands-on Courses', 
    desc: 'Real-world video curriculum and practical assignments designed for production skills.', 
    to: '/learning/courses',
    chip: 'Project-Based',
    chipClass: 'green'
  },
  { 
    icon: <Briefcase size={20} color="#fbbc04" />, 
    title: 'Verified Internships', 
    desc: 'Industry-backed internship programs in full-stack, AI automation, and cloud engineering.', 
    to: '/career/internships',
    chip: 'Career',
    chipClass: 'amber'
  },
  { 
    icon: <Cpu size={20} color="#ea4335" />, 
    title: 'DSA & Interview Hub', 
    desc: 'Structured problem sets, pattern guides, and technical interview preparation.', 
    to: '/career/dsa',
    chip: 'Practice',
    chipClass: 'purple'
  },
]

const PORTFOLIO_PROJECTS = [
  { 
    icon: <GraduationCap size={20} color="#34a853" />, 
    title: 'Learning Management System', 
    desc: 'Full-stack educational platform with interactive course players, quizzes, and live progress.', 
    tech: ['React', 'Node.js', 'PostgreSQL', 'Docker'] 
  },
  { 
    icon: <Bot size={20} color="#1a73e8" />, 
    title: 'AI Workflow Assistant', 
    desc: 'Intelligent assistant with semantic search and vector indexing for fast documentation retrieval.', 
    tech: ['Python', 'FastAPI', 'Gemini AI', 'Redis'] 
  },
  { 
    icon: <Cloud size={20} color="#4285f4" />, 
    title: 'Cloud CI/CD & Deploy Engine', 
    desc: 'Automated release pipeline with containerized deployments and live monitoring dashboards.', 
    tech: ['Kubernetes', 'Docker', 'GitHub Actions', 'GCP'] 
  },
]

const STORY_NAMES = ['Kajal Kumari', 'Alok Raj', 'Abhijeet Gupta', 'Shrestha Saran', 'Tanya Gupta', 'Shivam Kumar']

export default function Home() {
  return (
    <div className="home-page">
      {/* =====================================================
          SECTION 1 — HERO SECTION
          ===================================================== */}
      <section className="gcp-home-hero">
        <div className="container">
          <div className="gcp-hero-grid">
            {/* Left Narrative */}
            <div className="gcp-hero-content">
              <div className="gcp-hero-eyebrow">
                <span className="gcp-live-pulse" />
                <span>UPSKILLYFY PLATFORM</span>
              </div>

              <h1 className="gcp-hero-title">
                Learn tech. Build software.{' '}
                <span className="grad">Launch your career.</span>
              </h1>

              <p className="gcp-hero-sub">
                A modern engineering ecosystem connecting real-world software development, interactive developer roadmaps, and verified tech internships.
              </p>

              {/* Main Action Buttons */}
              <div className="gcp-hero-actions">
                <Link to="/services/it-services" className="gcp-btn-primary">
                  <span>Get Started Free</span>
                  <ArrowRight size={15} />
                </Link>
                <Link to="/learning/roadmaps" className="gcp-btn-outline">
                  <Compass size={15} />
                  <span>Explore Roadmaps</span>
                </Link>
              </div>

              {/* Verified Sub-Links */}
              <div className="gcp-hero-meta-links">
                <Link to="/career/internships" className="gcp-hero-meta-link">
                  <span>Verified Internships</span>
                  <ArrowUpRight size={13} />
                </Link>
                <span className="gcp-hero-meta-dot">•</span>
                <Link to="/learning/courses" className="gcp-hero-meta-link">
                  <span>Hands-on Cloud Labs</span>
                  <ArrowUpRight size={13} />
                </Link>
                <span className="gcp-hero-meta-dot">•</span>
                <Link to="/portfolio" className="gcp-hero-meta-link">
                  <span>Client Case Studies</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>

            {/* Right Platform Overview Widget */}
            <div>
              <div className="gcp-console-panel">
                <div className="gcp-console-topbar">
                  <div className="gcp-console-dots">
                    <span className="gcp-dot red" />
                    <span className="gcp-dot yellow" />
                    <span className="gcp-dot green" />
                  </div>
                  <span className="gcp-console-label">upskillyfy / platform-overview</span>
                </div>

                <div className="gcp-console-body">
                  <div className="gcp-overview-intro">
                    <span className="gcp-overview-badge">WORKSPACE</span>
                    <h4>Integrated Engineering & Learning</h4>
                    <p>Everything needed to build software, master technologies, and advance in tech.</p>
                  </div>

                  <div className="gcp-console-list">
                    <Link to="/services/it-services" className="gcp-console-item">
                      <div className="gcp-console-item-left">
                        <Code2 size={16} color="#1a73e8" />
                        <span>Software & Cloud Services</span>
                      </div>
                      <ArrowRight size={13} color="var(--muted)" />
                    </Link>

                    <Link to="/services/ai-automation" className="gcp-console-item">
                      <div className="gcp-console-item-left">
                        <Bot size={16} color="#34a853" />
                        <span>AI Automation & Systems</span>
                      </div>
                      <ArrowRight size={13} color="var(--muted)" />
                    </Link>

                    <Link to="/learning/roadmaps" className="gcp-console-item">
                      <div className="gcp-console-item-left">
                        <Compass size={16} color="#fbbc04" />
                        <span>Interactive Career Roadmaps</span>
                      </div>
                      <ArrowRight size={13} color="var(--muted)" />
                    </Link>

                    <Link to="/career/internships" className="gcp-console-item">
                      <div className="gcp-console-item-left">
                        <Briefcase size={16} color="#7b61ff" />
                        <span>Verified Internship Network</span>
                      </div>
                      <ArrowRight size={13} color="var(--muted)" />
                    </Link>
                  </div>

                  <Link to="/services/it-services" className="gcp-console-footer" style={{ textDecoration: 'none' }}>
                    <span>EXPLORE ALL PLATFORM TOOLS</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="gcp-hero-stats-row">
            {TRUST_STATS.map((stat, i) => (
              <div key={i} className="gcp-stat-box">
                <div className="gcp-stat-number">{stat.value}</div>
                <div className="gcp-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — INDUSTRY TECH UNIVERSE (INTERACTIVE CAROUSEL)
          ===================================================== */}
      <TechCarousel />

      {/* =====================================================
          SECTION 3 — CORE SERVICES
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">SERVICES</div>
            <h2 className="gcp-sec-title">Full-stack engineering & technology solutions.</h2>
            <p className="gcp-sec-desc">
              From custom software and AI workflows to cloud infrastructure, we build production software that scales.
            </p>
          </div>

          <div className="gcp-grid-4">
            {CORE_SERVICES.map((item, i) => (
              <Link key={i} to={item.to} className="gcp-card">
                <div className="gcp-card-top">
                  <div className="gcp-card-icon-box">{item.icon}</div>
                </div>
                <h3 className="gcp-card-title">{item.title}</h3>
                <p className="gcp-card-desc">{item.desc}</p>
                <div className="gcp-card-action">
                  <span>Learn more</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4 — LEARNING & CAREER PATHS
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">LEARNING & CAREER</div>
            <h2 className="gcp-sec-title">Skills that move with the software industry.</h2>
            <p className="gcp-sec-desc">
              Interactive developer pathways, project-based video curricula, and verified career internships.
            </p>
          </div>

          <div className="gcp-grid-4">
            {LEARNING_TRACKS.map((item, i) => (
              <Link key={i} to={item.to} className="gcp-card">
                <div className="gcp-card-top">
                  <div className="gcp-card-icon-box">{item.icon}</div>
                  <span className={`gcp-status-chip ${item.chipClass}`}>{item.chip}</span>
                </div>
                <h3 className="gcp-card-title">{item.title}</h3>
                <p className="gcp-card-desc">{item.desc}</p>
                <div className="gcp-card-action">
                  <span>Explore track</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5 — SELECTED PORTFOLIO
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">PORTFOLIO</div>
            <h2 className="gcp-sec-title">From ideas to production systems.</h2>
            <p className="gcp-sec-desc">A selection of applications, cloud infrastructure, and automation systems.</p>
          </div>

          <div className="gcp-grid-3">
            {PORTFOLIO_PROJECTS.map((p, i) => (
              <div key={i} className="gcp-card">
                <div className="gcp-card-top">
                  <div className="gcp-card-icon-box">{p.icon}</div>
                </div>
                <h3 className="gcp-card-title">{p.title}</h3>
                <p className="gcp-card-desc">{p.desc}</p>
                <div className="gcp-tech-pill-row">
                  {p.tech.map((t, j) => (
                    <span key={j} className="gcp-tech-pill">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/portfolio" className="gcp-btn-primary" style={{ display: 'inline-flex' }}>
              <span>View Full Portfolio</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 6 — COMMUNITY BUILDERS
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">COMMUNITY</div>
            <h2 className="gcp-sec-title">Engineers building with Upskillyfy.</h2>
            <p className="gcp-sec-desc">Real stories and projects from learners and builders in our community.</p>
          </div>
          <StoriesCarousel names={STORY_NAMES} />
        </div>
      </section>

      {/* =====================================================
          SECTION 7 — CALL TO ACTION
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-home-cta-box">
            <h2 className="gcp-home-cta-title">Ready to build what's next?</h2>
            <p className="gcp-home-cta-sub">
              Whether you are mastering new tech stacks, building client software, or hiring top engineering talent, Upskillyfy is built for you.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" className="gcp-btn-primary">
                <span>Get Started Free</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/learning/roadmaps" className="gcp-btn-outline">
                <Compass size={14} />
                <span>Explore Roadmaps</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}