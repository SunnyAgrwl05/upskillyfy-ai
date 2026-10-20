import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ChevronRight, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Bookmark, 
  Briefcase, 
  Award, 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Sparkles,
  ArrowLeft,
  GraduationCap,
  ArrowRight
} from 'lucide-react'
import { INTERNSHIPS_DATA } from '../../data/internshipsData'
import ApplyModal from './ApplyModal'
import './InternshipDetail.css'

export default function InternshipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find target internship or fallback
  const internship = INTERNSHIPS_DATA.find(item => item.id === id) || INTERNSHIPS_DATA[0]

  const [activeTab, setActiveTab] = useState('overview')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard! 📋')
    } else {
      showToast('Share link ready!')
    }
  }

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked)
    showToast(!isBookmarked ? 'Saved to bookmarks! 🔖' : 'Removed from bookmarks.')
  }

  const scrollToSection = (sectionId, tabKey) => {
    setActiveTab(tabKey)
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (!internship) {
    return (
      <div className="internship-detail-page">
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <h2>Internship Not Found</h2>
          <p style={{ marginTop: 12, marginBottom: 24 }}>The internship listing you requested could not be located.</p>
          <Link to="/career/internships" className="btn-primary">
            <ArrowLeft size={16} /> Back to All Internships
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="internship-detail-page">
      {/* Breadcrumb Navigation Bar */}
      <div className="detail-breadcrumb-bar">
        <div className="container">
          <div className="detail-breadcrumb-list">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/career/internships">Internships</Link>
            <ChevronRight size={14} />
            <span className="detail-breadcrumb-current">{internship.title}</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Unstop-Style Header Banner Card */}
        <div className="detail-header-card">
          <div className="detail-header-top-row">
            <div className="detail-header-company-group">
              <div className="detail-header-avatar" style={{ background: internship.logoBg }}>
                {internship.logoInitial}
              </div>
              <div className="detail-header-info">
                <div className="detail-header-company-name-row">
                  <span className="detail-header-company-name">{internship.company}</span>
                  <span className="detail-header-verified">
                    <CheckCircle2 size={13} /> Verified Employer
                  </span>
                </div>
                <h1 className="detail-header-title">{internship.title}</h1>
                <div className="detail-header-tagline">{internship.companyTagline}</div>
                
                {/* Meta Pills Row */}
                <div className="detail-header-tags-row">
                  <span className="detail-header-pill">
                    <MapPin size={13} color="#1a73e8" /> {internship.location}
                  </span>
                  <span className="detail-header-pill">
                    <Briefcase size={13} color="#34a853" /> {internship.categoryLabel || 'Engineering'}
                  </span>
                  <span className="detail-header-pill">
                    <GraduationCap size={13} color="#f29900" /> Batch: {internship.batch?.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="detail-header-actions">
              <button 
                type="button" 
                className="btn-g" 
                onClick={handleShare} 
                title="Share this internship"
                style={{ padding: '8px 14px' }}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button 
                type="button" 
                className="btn-g" 
                onClick={handleBookmarkToggle} 
                title="Save for later"
                style={{ padding: '8px 14px', color: isBookmarked ? '#1a73e8' : 'inherit' }}
              >
                <Bookmark size={16} fill={isBookmarked ? '#1a73e8' : 'none'} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setIsApplyModalOpen(true)}
                style={{ padding: '9px 20px' }}
              >
                <span>Apply Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Unstop Sticky Section Navigation Tabs */}
        <div className="detail-nav-tabs-bar">
          <button 
            type="button" 
            className={`detail-nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-overview', 'overview')}
          >
            Overview
          </button>
          <button 
            type="button" 
            className={`detail-nav-tab-btn ${activeTab === 'responsibilities' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-responsibilities', 'responsibilities')}
          >
            Responsibilities
          </button>
          <button 
            type="button" 
            className={`detail-nav-tab-btn ${activeTab === 'eligibility' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-eligibility', 'eligibility')}
          >
            Eligibility & Skills
          </button>
          <button 
            type="button" 
            className={`detail-nav-tab-btn ${activeTab === 'perks' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-perks', 'perks')}
          >
            Perks & PPO
          </button>
          <button 
            type="button" 
            className={`detail-nav-tab-btn ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-process', 'process')}
          >
            Hiring Process
          </button>
          <button 
            type="button" 
            className={`detail-nav-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => scrollToSection('sec-company', 'company')}
          >
            About Company
          </button>
        </div>

        {/* Two-Column Layout */}
        <div className="detail-main-layout">
          {/* Main Content Column */}
          <div className="detail-content-col">
            {/* 4-Item Highlights Grid */}
            <div className="detail-highlights-grid">
              <div className="detail-highlight-card">
                <div className="detail-highlight-icon-box" style={{ background: 'rgba(52, 168, 83, 0.1)', color: '#34a853' }}>
                  <DollarSign size={20} />
                </div>
                <div className="detail-highlight-meta">
                  <span className="detail-highlight-label">Fixed Stipend</span>
                  <span className="detail-highlight-val">{internship.stipend}</span>
                </div>
              </div>

              <div className="detail-highlight-card">
                <div className="detail-highlight-icon-box" style={{ background: 'rgba(26, 115, 232, 0.1)', color: '#1a73e8' }}>
                  <Clock size={20} />
                </div>
                <div className="detail-highlight-meta">
                  <span className="detail-highlight-label">Duration</span>
                  <span className="detail-highlight-val">{internship.duration}</span>
                </div>
              </div>

              <div className="detail-highlight-card">
                <div className="detail-highlight-icon-box" style={{ background: 'rgba(251, 188, 4, 0.12)', color: '#f29900' }}>
                  <Calendar size={20} />
                </div>
                <div className="detail-highlight-meta">
                  <span className="detail-highlight-label">Start Date</span>
                  <span className="detail-highlight-val">{internship.startDate}</span>
                </div>
              </div>

              <div className="detail-highlight-card">
                <div className="detail-highlight-icon-box" style={{ background: 'rgba(123, 97, 255, 0.1)', color: '#7b61ff' }}>
                  <Users size={20} />
                </div>
                <div className="detail-highlight-meta">
                  <span className="detail-highlight-label">Openings</span>
                  <span className="detail-highlight-val">{internship.openings} Positions</span>
                </div>
              </div>
            </div>

            {/* PPO Highlight Banner (Unstop style) */}
            {internship.ppoOffered && (
              <div id="sec-perks" className="detail-ppo-banner">
                <div className="detail-ppo-icon-wrap">
                  <Award size={26} />
                </div>
                <div>
                  <div className="detail-ppo-title">
                    Pre-Placement Offer (PPO): {internship.ppoPackage}
                  </div>
                  <div className="detail-ppo-desc">
                    Top performing candidates in this internship cohort will be considered for immediate full-time conversion with competitive standard company compensation and benefits.
                  </div>
                </div>
              </div>
            )}

            {/* Role Overview */}
            <div id="sec-overview" className="detail-section-card">
              <h2 className="detail-section-heading">
                <Sparkles size={18} color="#1a73e8" />
                About the Role
              </h2>
              <p className="detail-section-p">{internship.overview}</p>
            </div>

            {/* Key Responsibilities */}
            <div id="sec-responsibilities" className="detail-section-card">
              <h2 className="detail-section-heading">
                <Briefcase size={18} color="#34a853" />
                Key Day-to-Day Responsibilities
              </h2>
              <ul className="detail-styled-list">
                {internship.responsibilities.map((resp, idx) => (
                  <li key={idx} className="detail-list-item">
                    <CheckCircle2 size={17} className="detail-list-icon" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements & Eligibility */}
            <div id="sec-eligibility" className="detail-section-card">
              <h2 className="detail-section-heading">
                <GraduationCap size={18} color="#f29900" />
                Who Can Apply & Eligibility Criteria
              </h2>
              <div style={{ marginBottom: 16, fontSize: '0.9rem', color: 'var(--muted)' }}>
                <strong>Candidate Profile: </strong>{internship.experienceLevel} • Eligible Batches: {internship.batch?.join(', ')}
              </div>
              <ul className="detail-styled-list">
                {internship.requirements.map((req, idx) => (
                  <li key={idx} className="detail-list-item">
                    <Check size={17} className="detail-list-icon" style={{ color: '#34a853' }} />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills Required */}
            <div className="detail-section-card">
              <h2 className="detail-section-heading">
                <Sparkles size={18} color="#7b61ff" />
                Skills & Tech Stack Required
              </h2>
              <div className="detail-skills-wrap">
                {internship.skills.map((skill, idx) => (
                  <span key={idx} className="detail-skill-chip">{skill}</span>
                ))}
              </div>
            </div>

            {/* Perks & Benefits */}
            <div className="detail-section-card">
              <h2 className="detail-section-heading">
                <Award size={18} color="#1a73e8" />
                Perks & Benefits Included
              </h2>
              <div className="detail-perks-grid">
                {internship.perks.map((perk, idx) => (
                  <div key={idx} className="detail-perk-card">
                    <CheckCircle2 size={18} className="detail-perk-icon" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Step Selection Process (Unstop Signature Feature) */}
            <div id="sec-process" className="detail-section-card">
              <h2 className="detail-section-heading">
                <ShieldCheck size={18} color="#1a73e8" />
                Selection & Evaluation Stages
              </h2>
              <div className="detail-process-timeline">
                {internship.selectionProcess.map((stepItem) => (
                  <div key={stepItem.step} className="detail-process-step">
                    <div className="detail-process-badge">{stepItem.step}</div>
                    <div className="detail-process-body">
                      <div className="detail-process-title">{stepItem.title}</div>
                      <div className="detail-process-desc">{stepItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About the Company */}
            <div id="sec-company" className="detail-section-card">
              <h2 className="detail-section-heading">
                <Building2 size={18} color="#1a73e8" />
                About {internship.company}
              </h2>
              <p className="detail-section-p">{internship.aboutCompany?.bio}</p>

              <div className="detail-company-stats-grid">
                <div className="detail-company-stat-item">
                  <span className="detail-company-stat-label">Headquarters</span>
                  <span className="detail-company-stat-val">{internship.aboutCompany?.headquarters}</span>
                </div>
                <div className="detail-company-stat-item">
                  <span className="detail-company-stat-label">Company Size</span>
                  <span className="detail-company-stat-val">{internship.aboutCompany?.size}</span>
                </div>
                <div className="detail-company-stat-item">
                  <span className="detail-company-stat-label">Industry</span>
                  <span className="detail-company-stat-val">{internship.aboutCompany?.industry}</span>
                </div>
                <div className="detail-company-stat-item">
                  <span className="detail-company-stat-label">Official Website</span>
                  <a 
                    href={internship.aboutCompany?.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: '#1a73e8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                  >
                    <span>Visit Company Site</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Unstop Application Box) */}
          <div className="detail-sidebar-col">
            <div className="detail-apply-card">
              <div className="detail-sidebar-stipend-box">
                <div className="detail-sidebar-stipend-label">Stipend (Fixed Monthly)</div>
                <div className="detail-sidebar-stipend-val">{internship.stipend}</div>
              </div>

              <div className="detail-sidebar-deadline-row">
                <Clock size={16} />
                <span>Application Deadline: {internship.deadline}</span>
              </div>

              <div className="detail-sidebar-applicant-row">
                <Users size={16} color="#1a73e8" />
                <span>Over <strong>{internship.applicants}+ candidates</strong> have applied</span>
              </div>

              <button 
                type="button" 
                className="btn-primary detail-sidebar-apply-btn"
                onClick={() => setIsApplyModalOpen(true)}
              >
                <span>Apply Now</span>
                <ArrowRight size={16} />
              </button>

              <div className="detail-sidebar-guarantees">
                <div className="detail-sidebar-guarantee-item">
                  <ShieldCheck size={15} color="#34a853" />
                  <span>100% Free Application — Zero Hidden Fees</span>
                </div>
                <div className="detail-sidebar-guarantee-item">
                  <CheckCircle2 size={15} color="#1a73e8" />
                  <span>Verified Corporate Partner & Direct HR Review</span>
                </div>
                <div className="detail-sidebar-guarantee-item">
                  <Award size={15} color="#f29900" />
                  <span>Upskillyfy AI Candidate Referral Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Apply Modal */}
      <ApplyModal
        internship={internship}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="detail-toast-msg">{toastMessage}</div>
      )}
    </div>
  )
}
