import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  GraduationCap, 
  Code2, 
  Sparkles, 
  Award, 
  Rocket, 
  Gift, 
  Users, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  Send
} from 'lucide-react'
import './Ambassador.css'

const METRICS = [
  { value: '40+', label: 'University Chapters' },
  { value: '1,200+', label: 'Students Represented' },
  { value: '100%', label: 'Free Leadership Credentials' },
  { value: 'Direct', label: 'Priority Internship Referrals' },
]

const ROLES = [
  {
    icon: <GraduationCap size={24} color="#1a73e8" />,
    badge: 'Leadership',
    title: 'Campus Chapter Lead',
    desc: 'Lead the official Upskillyfy AI student community at your college. Organize local meetups, build study groups, drive hackathon teams, and represent your university.',
    duties: ['Host bi-weekly campus study jams', 'Lead college hackathon delegations', 'Direct line to Upskillyfy AI executive team']
  },
  {
    icon: <Code2 size={24} color="#34a853" />,
    badge: 'Engineering',
    title: 'Technical Mentor & Peer Lead',
    desc: 'Support fellow campus developers through structured algorithmic patterns, modern full-stack web roadmaps, and collaborative git code reviews.',
    duties: ['Conduct DSA problem-solving sessions', 'Mentor junior batch students on web/cloud', 'Review student open-source PRs']
  },
  {
    icon: <Sparkles size={24} color="#7b61ff" />,
    badge: 'Content & Media',
    title: 'Developer Content Creator',
    desc: 'Create high-impact developer tutorials, architectural infographics, campus build videos, and project walkthroughs for social channels and tech blogs.',
    duties: ['Author technical articles & guides', 'Design visual cheatsheets & infographics', 'Showcase campus student projects']
  }
]

const PERKS = [
  {
    icon: <Award size={20} color="#1a73e8" />,
    title: 'Leadership Recommendation',
    desc: 'Official verified Certificate of Ambassadorship and personalized recommendation letters for employment or higher studies.'
  },
  {
    icon: <Rocket size={20} color="#ea4335" />,
    title: 'Priority Internship Fast-Track',
    desc: 'Direct resume referrals to hiring startup partners and fast-track interview pipelines for verified high-performing chapter leads.'
  },
  {
    icon: <Gift size={20} color="#fbbc04" />,
    title: 'Official Swag Kit & Goodies',
    desc: 'Custom Upskillyfy AI developer hoodie, verified ambassador badge, laptop stickers, and tech goodies shipped directly to you.'
  },
  {
    icon: <Users size={20} color="#34a853" />,
    title: '1-on-1 Industry Mentorship',
    desc: 'Exclusive monthly mentoring calls with senior software engineers, founders, and cloud architects across Tier-1 tech firms.'
  },
  {
    icon: <BookOpen size={20} color="#1a73e8" />,
    title: 'Free Access to Premium Labs',
    desc: 'Complimentary full access to all Upskillyfy AI courses, advanced architectural sandboxes, and premium video modules.'
  },
  {
    icon: <Trophy size={20} color="#7b61ff" />,
    title: 'Hackathon Sponsorship Grants',
    desc: 'Financial grants, mentor support, and cloud vouchers to support technical events and annual hackathons at your university.'
  },
  {
    icon: <TrendingUp size={20} color="#34a853" />,
    title: 'Performance Stipends',
    desc: 'Quarterly achievement stipends and performance bounties based on community growth and successful event milestones.'
  },
  {
    icon: <Compass size={20} color="#ea4335" />,
    title: 'Global Alumni Network',
    desc: 'Lifelong membership in an elite nationwide network of student leaders, founding engineers, and campus directors.'
  }
]

const FAQS = [
  {
    q: 'Who is eligible to apply for the Campus Ambassador program?',
    a: 'Any enrolled student from an accredited university or polytechnic institution (B.Tech, BCA, MCA, BSc CS, or core engineering disciplines) who is passionate about coding and community building.'
  },
  {
    q: 'What is the expected weekly time commitment?',
    a: 'Ambassadors typically dedicate 3 to 5 hours per week organizing study sessions, coordinating campus announcements, or creating technical guides.'
  },
  {
    q: 'How does the selection process work?',
    a: 'Once you submit the application form below, our community team reviews your profile within 3 business days. Shortlisted candidates are invited for a brief 15-minute Google Meet conversation.'
  },
  {
    q: 'Can multiple students apply from the same college?',
    a: 'Yes! We often assign a Campus Chapter Lead alongside Technical Mentors and Content Creators to form a balanced campus leadership core.'
  }
]

export default function Ambassador() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    year: '2nd Year',
    branch: 'Computer Science / IT',
    role: 'Campus Chapter Lead',
    links: '',
    motivation: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.college) return
    setSubmitted(true)
  }

  return (
    <div className="ambassador-page">
      {/* =====================================================
          SECTION 1 — HERO SECTION
          ===================================================== */}
      <section className="ambassador-hero">
        <div className="container">
          <div className="ambassador-hero-header">
            <div className="gcp-sec-eyebrow">
              <span className="gcp-live-pulse" />
              <span>CAMPUS LEADERSHIP NETWORK</span>
            </div>

            <h1 className="ambassador-hero-title">
              Lead the builder movement{' '}
              <span className="grad">on your campus.</span>
            </h1>

            <p className="ambassador-hero-sub">
              Represent Upskillyfy AI at your university, organize developer study groups, gain verified leadership credentials, and unlock direct priority access to top internships and mentors.
            </p>

            <div className="gcp-hero-actions">
              <a href="#apply-form" className="gcp-btn-primary">
                <span>Apply for Ambassadorship</span>
                <ArrowRight size={15} />
              </a>
              <Link to="/community/events" className="gcp-btn-outline">
                <Calendar size={15} />
                <span>Explore Events & Hackathons</span>
              </Link>
            </div>
          </div>

          {/* Metrics */}
          <div className="ambassador-metrics-row">
            {METRICS.map((m, i) => (
              <div key={i} className="ambassador-metric-box">
                <div className="ambassador-metric-num">{m.value}</div>
                <div className="ambassador-metric-lbl">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 2 — CHOOSE YOUR ROLE
          ===================================================== */}
      <section className="gcp-section">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">LEADERSHIP TRACKS</div>
            <h2 className="gcp-sec-title">Choose how you want to lead.</h2>
            <p className="gcp-sec-desc">
              Whether you are an organizer, a technical mentor, or a content creator, find the role that aligns with your strengths.
            </p>
          </div>

          <div className="gcp-grid-3">
            {ROLES.map((r, i) => (
              <div key={i} className="gcp-card">
                <div className="gcp-card-top">
                  <div className="gcp-card-icon-box">{r.icon}</div>
                  <span className="gcp-status-chip blue">{r.badge}</span>
                </div>

                <h3 className="gcp-card-title">{r.title}</h3>
                <p className="gcp-card-desc">{r.desc}</p>

                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Core Responsibilities:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {r.duties.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 3 — PERKS & REWARDS (GCP GRID 4)
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-sec-header">
            <div className="gcp-sec-eyebrow">AMBASSADOR ADVANTAGE</div>
            <h2 className="gcp-sec-title">What you earn as a campus leader.</h2>
            <p className="gcp-sec-desc">
              Tangible rewards, verified portfolio credentials, career mentorship, and direct connections to hiring partners.
            </p>
          </div>

          <div className="gcp-grid-4">
            {PERKS.map((p, i) => (
              <div key={i} className="ambassador-perk-card">
                <div className="ambassador-perk-icon-box">{p.icon}</div>
                <div>
                  <h4 className="ambassador-perk-title">{p.title}</h4>
                  <p className="ambassador-perk-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 4 — APPLICATION FORM
          ===================================================== */}
      <section className="gcp-section" id="apply-form">
        <div className="container">
          <div className="gcp-sec-header" style={{ textAlign: 'center', margin: '0 auto 36px' }}>
            <div className="gcp-sec-eyebrow" style={{ justifyContent: 'center' }}>APPLY NOW</div>
            <h2 className="gcp-sec-title">Join the Ambassador Cohort</h2>
            <p className="gcp-sec-desc" style={{ margin: '0 auto' }}>
              Applications are reviewed on a rolling basis. Fill out the details below to start your campus leadership journey.
            </p>
          </div>

          <div className="ambassador-form-container">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="ambassador-form-grid">
                <div className="ambassador-form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ananya Roy"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="ambassador-form-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="ananya@college.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="ambassador-form-field">
                  <label>College / University Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Birla Institute of Technology"
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                    required
                  />
                </div>

                <div className="ambassador-form-field">
                  <label>Current Year of Study *</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>Final Year</option>
                    <option>Postgraduate</option>
                  </select>
                </div>

                <div className="ambassador-form-field">
                  <label>Major / Branch *</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science / ECE / Mechanical"
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    required
                  />
                </div>

                <div className="ambassador-form-field">
                  <label>Preferred Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option>Campus Chapter Lead</option>
                    <option>Technical Mentor & Peer Lead</option>
                    <option>Developer Content Creator</option>
                  </select>
                </div>

                <div className="ambassador-form-field full">
                  <label>LinkedIn or GitHub Profile (optional)</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={form.links}
                    onChange={(e) => setForm({ ...form, links: e.target.value })}
                  />
                </div>

                <div className="ambassador-form-field full">
                  <label>Why do you want to lead as an Upskillyfy AI Ambassador? *</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your interests, past initiatives, or how you plan to help students on your campus..."
                    value={form.motivation}
                    onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                    required
                  />
                </div>

                <div className="ambassador-form-field full" style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    className="gcp-btn-primary"
                    style={{ border: 'none', justifyContent: 'center', width: '100%', padding: '12px 24px', cursor: 'pointer' }}
                  >
                    <span>Submit Ambassador Application</span>
                    <Send size={15} />
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                <CheckCircle2 size={54} color="#34a853" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: 'var(--text-h)' }}>
                  Application Received!
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Thank you for applying to represent Upskillyfy AI, <strong>{form.name}</strong>. Our campus director will review your details and reach out to <strong>{form.email}</strong> within 3 business days.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="gcp-btn-outline"
                  style={{ display: 'inline-flex' }}
                >
                  <span>Submit Another Response</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION 5 — FAQS
          ===================================================== */}
      <section className="gcp-section alt">
        <div className="container">
          <div className="gcp-sec-header" style={{ textAlign: 'center', margin: '0 auto 36px' }}>
            <div className="gcp-sec-eyebrow" style={{ justifyContent: 'center' }}>FREQUENTLY ASKED QUESTIONS</div>
            <h2 className="gcp-sec-title">Common questions about the program.</h2>
          </div>

          <div className="ambassador-faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className="ambassador-faq-item">
                <h4 className="ambassador-faq-q">{faq.q}</h4>
                <p className="ambassador-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}