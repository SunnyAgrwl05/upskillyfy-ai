import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  GraduationCap, 
  Bot, 
  Cloud, 
  Code2, 
  TrendingUp, 
  Smartphone, 
  FolderGit2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowUpRight, 
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import './Portfolio.css'

const METRICS = [
  { value: '8+', label: 'Flagship Deliveries' },
  { value: '99.9%', label: 'Guaranteed Platform Uptime' },
  { value: '50K+', label: 'Users Supported Across Systems' },
  { value: 'Multi-Cloud', label: 'Google Cloud & AWS Native' },
]

const CATEGORIES = [
  { id: 'all', label: 'All Projects' },
  { id: 'web', label: 'Web & Full-Stack' },
  { id: 'ai', label: 'AI & Automation' },
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'mobile', label: 'Mobile Apps' },
]

const ALL_PROJECTS = [
  {
    id: 1,
    title: 'Distributed LMS & Code Evaluation Platform',
    category: 'web',
    categoryLabel: 'Web & Full-Stack',
    icon: <GraduationCap size={22} color="#34a853" />,
    impact: '2,500+ Active Learners',
    desc: 'Scalable educational platform featuring interactive video player streaming, automated quiz evaluation, and Dockerized code runner execution sandboxes with live output telemetry.',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
    demoLink: '/learning/courses'
  },
  {
    id: 2,
    title: 'Autonomous AI Support & Workflow Agent',
    category: 'ai',
    categoryLabel: 'AI & Automation',
    icon: <Bot size={22} color="#1a73e8" />,
    impact: '500+ Daily Inquiries',
    desc: 'Multi-turn vector-indexed RAG assistant with conversational memory, dynamic knowledge base parsing, semantic search reranking, and automated escalation dispatching.',
    tech: ['Python', 'FastAPI', 'Gemini AI', 'LangChain', 'Qdrant'],
    demoLink: '/services/ai-automation'
  },
  {
    id: 3,
    title: 'Multi-Cloud GitOps Release Engine',
    category: 'cloud',
    categoryLabel: 'Cloud & DevOps',
    icon: <Cloud size={22} color="#4285f4" />,
    impact: 'Zero-Downtime Releases',
    desc: 'Automated Kubernetes release orchestrator provisioning multi-region infrastructure via Terraform with automated canary traffic shifting, live Prometheus metrics, and automated rollbacks.',
    tech: ['Kubernetes', 'Terraform', 'GitHub Actions', 'GCP', 'Prometheus'],
    demoLink: '/services/cloud'
  },
  {
    id: 4,
    title: 'Sub-Second Digital Commerce Storefront',
    category: 'web',
    categoryLabel: 'Web & Full-Stack',
    icon: <Code2 size={22} color="#fbbc04" />,
    impact: '<280ms Edge TTFB',
    desc: 'Ultra-fast edge-rendered e-commerce hub featuring global CDN caching, real-time inventory synchronization, dynamic product filtering, and Stripe payment gateway flows.',
    tech: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind', 'MongoDB'],
    demoLink: '/services/it-services'
  },
  {
    id: 5,
    title: 'Industrial Telemetry & Anomaly Stream',
    category: 'ai',
    categoryLabel: 'AI & Automation',
    icon: <TrendingUp size={22} color="#ea4335" />,
    impact: '50,000 Events/Sec',
    desc: 'High-throughput event streaming pipeline processing industrial machine telemetry with automated anomaly detection models, time-series database aggregations, and Grafana dashboard alerts.',
    tech: ['Python', 'Apache Kafka', 'ClickHouse', 'React', 'Grafana'],
    demoLink: '/services/ai-automation'
  },
  {
    id: 6,
    title: 'Local Business & Service Discovery App',
    category: 'mobile',
    categoryLabel: 'Mobile Apps',
    icon: <Smartphone size={22} color="#7b61ff" />,
    impact: '10K+ Mobile Downloads',
    desc: 'Cross-platform iOS and Android mobile application with real-time GPS location discovery, instant appointment booking engine, in-app messaging, and push notification triggers.',
    tech: ['React Native', 'Expo', 'Firebase', 'Node.js', 'Redux'],
    demoLink: '/services/it-services'
  },
  {
    id: 7,
    title: 'Developer Documentation & API Sandbox',
    category: 'web',
    categoryLabel: 'Web & Full-Stack',
    icon: <FolderGit2 size={22} color="#5f6368" />,
    impact: 'Versioned Open API',
    desc: 'Interactive documentation engine featuring live API test consoles, syntax-highlighted blueprint guides, interactive terminal simulators, and instant markdown search indexing.',
    tech: ['TypeScript', 'Vite', 'Markdown', 'Firebase', 'Tailwind'],
    demoLink: '/learning/resources'
  },
  {
    id: 8,
    title: 'Cloud Security & Posture Sentinel',
    category: 'cloud',
    categoryLabel: 'Cloud & DevOps',
    icon: <ShieldCheck size={22} color="#34a853" />,
    impact: 'CIS Benchmark Audited',
    desc: 'Automated infrastructure compliance scanner inspecting IAM privilege escalations, open security groups, container image vulnerabilities, and automated drift detection across multi-cloud accounts.',
    tech: ['Go', 'Docker', 'AWS SDK', 'Google Cloud API', 'PostgreSQL'],
    demoLink: '/services/cloud'
  }
]

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects = activeFilter === 'all'
    ? ALL_PROJECTS
    : ALL_PROJECTS.filter(p => p.category === activeFilter)

  return (
    <div className="portfolio-page">
      {/* =====================================================
          SECTION 1 — HERO SECTION
          ===================================================== */}
      <section className="portfolio-hero">
        <div className="container">
          <div className="portfolio-hero-header">
            <div className="gcp-sec-eyebrow">
              <span className="gcp-live-pulse" />
              <span>PORTFOLIO & CASE STUDIES</span>
            </div>

            <h1 className="portfolio-hero-title">
              From architectural concepts to{' '}
              <span className="grad">production systems.</span>
            </h1>

            <p className="portfolio-hero-sub">
              Explore real-world software applications, generative AI automation pipelines, multi-cloud Kubernetes architectures, and developer ecosystems built by our engineering team.
            </p>
          </div>

          {/* Delivery Metrics */}
          <div className="portfolio-metrics-row">
            {METRICS.map((m, i) => (
              <div key={i} className="portfolio-metric-box">
                <div className="portfolio-metric-num">{m.value}</div>
                <div className="portfolio-metric-lbl">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — SPOTLIGHT ARCHITECTURE SHOWCASE
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="portfolio-spotlight-box">
            <div className="portfolio-spotlight-left">
              <div className="gcp-sec-eyebrow">FEATURED ARCHITECTURE</div>
              <h3>Production Multi-Cloud Engineering Standard</h3>
              <p>
                Every client solution and internal platform we build adheres to enterprise-grade cloud native practices: containerized microservices, zero-trust security postures, automated CI/CD canary rollouts, and deep telemetry.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/services/it-services" className="gcp-btn-primary">
                  <span>Start a Project</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to="/services/cloud" className="gcp-btn-outline">
                  <span>Cloud Capabilities</span>
                </Link>
              </div>
            </div>

            <div className="portfolio-spotlight-stack">
              <div className="portfolio-spotlight-stack-title">Production Stack Blueprint</div>
              <div className="portfolio-spotlight-grid">
                <div className="portfolio-spotlight-node">
                  <strong>Frontend</strong>
                  <span>React, Next.js, Vite, TypeScript</span>
                </div>
                <div className="portfolio-spotlight-node">
                  <strong>Backend</strong>
                  <span>Node.js, Python, Go, FastAPI</span>
                </div>
                <div className="portfolio-spotlight-node">
                  <strong>AI & Agents</strong>
                  <span>Gemini AI, LangChain, Qdrant</span>
                </div>
                <div className="portfolio-spotlight-node">
                  <strong>Cloud & DevOps</strong>
                  <span>Kubernetes, Docker, GCP, AWS</span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              CATEGORY FILTER BAR
              ===================================================== */}
          <div className="portfolio-filter-bar">
            {CATEGORIES.map((cat) => {
              const count = cat.id === 'all'
                ? ALL_PROJECTS.length
                : ALL_PROJECTS.filter(p => p.category === cat.id).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveFilter(cat.id)}
                  className={`portfolio-filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
                >
                  <span>{cat.label}</span>
                  <span className="portfolio-filter-count">{count}</span>
                </button>
              )
            })}
          </div>

          {/* =====================================================
              PROJECTS GRID
              ===================================================== */}
          <div className="gcp-grid-3">
            {filteredProjects.map((p) => (
              <div key={p.id} className="portfolio-card">
                <div className="portfolio-card-header">
                  <div className="gcp-card-icon-box">{p.icon}</div>
                  <span className="portfolio-impact-pill">{p.impact}</span>
                </div>

                <div style={{ marginBottom: 6 }}>
                  <span className="portfolio-card-badge">{p.categoryLabel}</span>
                </div>

                <h3 className="portfolio-card-title">{p.title}</h3>
                <p className="portfolio-card-desc">{p.desc}</p>

                {/* Tech Tags */}
                <div className="portfolio-tech-list">
                  {p.tech.map((t, idx) => (
                    <span key={idx} className="portfolio-tech-item">{t}</span>
                  ))}
                </div>

                <div className="portfolio-card-footer">
                  <Link to={p.demoLink} className="portfolio-card-link">
                    <span>Explore Solution</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3 — CLIENT / PARTNER CTA
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-home-cta-box">
            <h2 className="gcp-home-cta-title">Have a project or system in mind?</h2>
            <p className="gcp-home-cta-sub">
              Whether you need end-to-end custom web engineering, generative AI automation, or scalable cloud infrastructure, our team is ready to deliver.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/contact" className="gcp-btn-primary">
                <span>Start a Project</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/services/it-services" className="gcp-btn-outline">
                <Layers size={14} />
                <span>Explore All Services</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}