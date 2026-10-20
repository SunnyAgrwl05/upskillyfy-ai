import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Code2, 
  Cloud, 
  Rocket, 
  CheckCircle2, 
  Target, 
  Compass, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Laptop, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react'
import './About.css'

const STATS = [
  { value: '50K+', label: 'Community Learners' },
  { value: '4+', label: 'Core Engineering Tracks' },
  { value: '100%', label: 'Hands-on Code Focus' },
  { value: 'Zero', label: 'College Tier Barriers' },
]

const PILLARS = [
  { 
    icon: <BookOpen size={22} color="#1a73e8" />, 
    title: 'Learn (Curriculum & Roadmaps)', 
    desc: 'Structured role-based paths, visual checkpoint guides, real-world video modules, and curated developer cheatsheets.',
    chip: 'Foundation',
    link: '/learning/roadmaps'
  },
  { 
    icon: <Code2 size={22} color="#34a853" />, 
    title: 'Build (Production Engineering)', 
    desc: 'Full-stack web applications, scalable distributed microservices, AI workflows, and modern cloud native software.',
    chip: 'Engineering',
    link: '/services/it-services'
  },
  { 
    icon: <Cloud size={22} color="#4285f4" />, 
    title: 'Deploy (Cloud & Infrastructure)', 
    desc: 'Dockerized workloads, managed Kubernetes clusters, multi-cloud architectures on GCP and AWS, and automated CI/CD.',
    chip: 'DevOps',
    link: '/services/cloud'
  },
  { 
    icon: <Rocket size={22} color="#ea4335" />, 
    title: 'Grow (Career & Placements)', 
    desc: 'Verified industry internships, company-aligned interview mocks, ATS resume builders, and direct hiring networks.',
    chip: 'Placement',
    link: '/career/internships'
  },
]

const VALUES = [
  {
    icon: <Laptop size={20} color="#1a73e8" />,
    title: 'Production Over Tutorials',
    desc: 'We focus on actual git repositories, real relational and vector databases, production pipelines, and automated tests.'
  },
  {
    icon: <GraduationCap size={20} color="#34a853" />,
    title: 'Zero Tier Barriers',
    desc: 'Quality engineering knowledge, mentorship, and enterprise career opportunities should be accessible regardless of college tier.'
  },
  {
    icon: <ShieldCheck size={20} color="#fbbc04" />,
    title: 'Architectural Rigor',
    desc: 'We build and teach with industry best practices: clean code, type safety, modular microservices, and reliable cloud patterns.'
  },
  {
    icon: <Users size={20} color="#ea4335" />,
    title: 'Builder Community',
    desc: 'Collaborative code reviews, community hackathons, live build sessions, and continuous peer mentorship across all tech disciplines.'
  }
]

const TEAMS = [
  {
    avatar: 'FL',
    role: 'Leadership',
    title: 'Founder & Tech Lead',
    desc: 'Engineering leadership driving platform vision, software delivery standards, and community partnerships.'
  },
  {
    avatar: 'ET',
    role: 'Engineering',
    title: 'Core Development Team',
    desc: 'Building our full-stack web platforms, distributed APIs, microservices, and client technology solutions.'
  },
  {
    avatar: 'CM',
    role: 'Curriculum',
    title: 'Learning & Roadmap Team',
    desc: 'Curating developer roadmaps, interactive coding sandboxes, algorithmic pattern guides, and labs.'
  },
  {
    avatar: 'CG',
    role: 'Outreach',
    title: 'Community & Placement Hub',
    desc: 'Managing employer partnerships, verified internship drives, campus ambassadors, and tech events.'
  }
]

export default function About() {
  return (
    <div className="about-page">
      {/* =====================================================
          SECTION 1 — HERO SECTION
          ===================================================== */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-header">
            <div className="gcp-sec-eyebrow">
              <span className="gcp-live-pulse" />
              <span>ABOUT UPSSKILLYFY • MISSION & VISION</span>
            </div>

            <h1 className="about-hero-title">
              Empowering builders to create{' '}
              <span className="grad">what comes next.</span>
            </h1>

            <p className="about-hero-sub">
              Upskillyfy AI is an integrated career development, software engineering, and technology consulting platform founded to bridge the gap between technical education and enterprise software delivery.
            </p>

            <div className="gcp-hero-actions">
              <Link to="/learning/roadmaps" className="gcp-btn-primary">
                <span>Explore Roadmaps</span>
                <Compass size={15} />
              </Link>
              <Link to="/services/it-services" className="gcp-btn-outline">
                <span>Enterprise Services</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="about-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="about-stat-box">
                <div className="about-stat-num">{s.value}</div>
                <div className="about-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — OUR STORY & PURPOSE (SPLIT SECTION)
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="about-story-split">
            <div className="about-story-content">
              <div className="gcp-sec-eyebrow">OUR ORIGIN & PURPOSE</div>
              <h2 className="gcp-sec-title">From a campus initiative to a scalable tech ecosystem.</h2>
              
              <p>
                Upskillyfy AI was born out of a real problem observed on engineering campuses in Patna, Bihar. Thousands of talented students across Computer Science, IT, and core engineering branches were eager to build real software, but found themselves stuck in theoretical rote learning and unverified job boards.
              </p>

              <p>
                We started by sharing structured technical roadmaps, open DSA practice patterns, and verified internships. As our builder network grew, we recognized that the best way to learn software is to write real software for real clients.
              </p>

              <p>
                Today, Upskillyfy AI operates at the intersection of modern EdTech, full-stack IT services, and technology consulting — serving students, ambitious developers, startups, and growing enterprises.
              </p>

              <div className="about-quote-card">
                <p className="about-quote-text">
                  "Empower every student, engineer, and business through education, modern technology, and innovation — regardless of background, branch, or college tier."
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/contact" className="gcp-btn-primary">
                  <span>Get in Touch</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to="/portfolio" className="gcp-btn-outline">
                  <span>View Our Work</span>
                </Link>
              </div>
            </div>

            {/* Right Card: Platform Vision & Focus */}
            <div>
              <div className="about-vision-card">
                <div className="about-vision-header">
                  <div className="about-vision-icon">
                    <Target size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-h)', fontWeight: 700 }}>
                      The Upskillyfy AI Vision
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      Engineering & Career Excellence
                    </span>
                  </div>
                </div>

                <div className="about-vision-list">
                  <div className="about-vision-item">
                    <CheckCircle2 size={18} className="about-vision-check" />
                    <div>
                      <div className="about-vision-item-title">Enterprise Software Standards</div>
                      <p className="about-vision-item-desc">
                        Full-stack React, Node.js, Python, and cloud infrastructure engineered for production uptime and security.
                      </p>
                    </div>
                  </div>

                  <div className="about-vision-item">
                    <CheckCircle2 size={18} className="about-vision-check" />
                    <div>
                      <div className="about-vision-item-title">Interactive Career Roadmaps</div>
                      <p className="about-vision-item-desc">
                        Curated step-by-step developer paths from fundamental data structures to cloud microservices and generative AI.
                      </p>
                    </div>
                  </div>

                  <div className="about-vision-item">
                    <CheckCircle2 size={18} className="about-vision-check" />
                    <div>
                      <div className="about-vision-item-title">Direct Verified Opportunities</div>
                      <p className="about-vision-item-desc">
                        Direct connection to legitimate hiring partners, startup internships, and placement prep drives.
                      </p>
                    </div>
                  </div>

                  <div className="about-vision-item">
                    <CheckCircle2 size={18} className="about-vision-check" />
                    <div>
                      <div className="about-vision-item-title">Open Builder Culture</div>
                      <p className="about-vision-item-desc">
                        Fostering open-source contributions, hackathon teamwork, and peer code reviews.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3 — THE 4 PILLARS
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">OUR CORE ARCHITECTURE</div>
            <h2 className="gcp-sec-title">Four pillars driving our ecosystem.</h2>
            <p className="gcp-sec-desc">
              How our platform connects foundational learning, enterprise software engineering, and verified career acceleration.
            </p>
          </div>

          <div className="gcp-grid-4">
            {PILLARS.map((p, i) => (
              <Link key={i} to={p.link} className="gcp-card">
                <div className="gcp-card-top">
                  <div className="gcp-card-icon-box">{p.icon}</div>
                  <span className="gcp-status-chip blue">{p.chip}</span>
                </div>
                <h3 className="gcp-card-title">{p.title}</h3>
                <p className="gcp-card-desc">{p.desc}</p>
                <div className="gcp-card-action">
                  <span>Explore pillar</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4 — OUR VALUES & PRINCIPLES
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">CULTURE & PRINCIPLES</div>
            <h2 className="gcp-sec-title">What we believe and how we build.</h2>
            <p className="gcp-sec-desc">
              The fundamental engineering and community values that guide every product and curriculum we release.
            </p>
          </div>

          <div className="gcp-grid-4">
            {VALUES.map((v, i) => (
              <div key={i} className="gcp-card">
                <div className="gcp-card-top">
                  <div className="gcp-card-icon-box">{v.icon}</div>
                </div>
                <h3 className="gcp-card-title">{v.title}</h3>
                <p className="gcp-card-desc" style={{ marginBottom: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5 — TEAMS & LEADERSHIP
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">TEAMS & STRUCTURE</div>
            <h2 className="gcp-sec-title">Built by engineers, for the next generation.</h2>
            <p className="gcp-sec-desc">
              Dedicated cross-functional teams focused on software delivery, community mentorship, and learning content.
            </p>
          </div>

          <div className="gcp-grid-4">
            {TEAMS.map((t, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar">{t.avatar}</div>
                <div className="about-team-role">{t.role}</div>
                <h3 className="about-team-title">{t.title}</h3>
                <p className="about-team-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 6 — CALL TO ACTION
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="gcp-home-cta-box">
            <h2 className="gcp-home-cta-title">Want to build or partner with us?</h2>
            <p className="gcp-home-cta-sub">
              Whether you are an ambitious developer seeking career acceleration, or an enterprise looking for high-performance software, we are ready to collaborate.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/contact" className="gcp-btn-primary">
                <span>Contact Our Team</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/career/internships" className="gcp-btn-outline">
                <Rocket size={14} />
                <span>Explore Internships</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}