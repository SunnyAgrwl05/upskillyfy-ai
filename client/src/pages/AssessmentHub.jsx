/* =========================================================
   UPSKILLYFY AI — ASSESSMENT HUB GATEWAY
   Role Selection: Student Portal vs. Faculty Excellence Hub
   ========================================================= */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Cpu,
  Clock,
  CheckCircle2,
  Users,
  Target,
  Award,
  Layers,
  Brain,
  ShieldCheck,
  Presentation,
  Compass
} from 'lucide-react'
import './AssessmentHub.css'

export default function AssessmentHub() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)

  return (
    <div className="asm-hub-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="asm-hub-hero">
        <div className="container">
          <div className="asm-hub-eyebrow">
            <span className="asm-hub-pulse" />
            <span>Upskillyfy AI Assessment Hub</span>
          </div>

          <h1 className="asm-hub-title">
            Tailored Portals for <span className="grad">Students</span> &{' '}
            <span className="grad faculty">Faculty</span>
          </h1>

          <p className="asm-hub-sub">
            Whether you are a student preparing for competitive exams and campus placements,
            or an educator looking to master modern pedagogy and adopt emerging AI in teaching,
            select your portal to access tailored tools and evaluations.
          </p>

          <div className="asm-hub-badges-strip">
            <div className="hub-badge-item">
              <GraduationCap size={15} color="#1a73e8" />
              <span>For Students: Practice & Mock Tests</span>
            </div>
            <div className="hub-badge-item">
              <Presentation size={15} color="#00897b" />
              <span>For Faculty: Pedagogy & EdTech Adoption</span>
            </div>
            <div className="hub-badge-item">
              <ShieldCheck size={15} color="#34a853" />
              <span>NTA / TCS iON Real Exam Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PORTAL SELECTION CARDS
          ===================================================== */}
      <section className="asm-hub-section">
        <div className="container">
          <div className="asm-hub-sec-head">
            <div className="asm-hub-sec-eyebrow">Select Your Role</div>
            <h2 className="asm-hub-sec-title">Who is this assessment for?</h2>
            <p className="asm-hub-sec-desc">
              Choose your role below to enter your customized portal with dedicated assessments,
              analytics, and resources.
            </p>
          </div>

          <div className="asm-hub-cards-grid">
            {/* CARD 1: FOR STUDENTS */}
            <div
              className={`asm-role-card student ${selectedRole === 'student' ? 'active' : ''}`}
              onClick={() => setSelectedRole('student')}
            >
              <div className="role-card-banner student-banner">
                <span className="role-chip student-chip">
                  <GraduationCap size={14} />
                  <span>Student & Candidate Portal</span>
                </span>
                <span className="role-avail">8+ Technical Branches</span>
              </div>

              <div className="role-card-body">
                <div className="role-icon-box student-icon">
                  <GraduationCap size={28} />
                </div>

                <h3 className="role-card-title">I am a Student / Aspirant</h3>
                <p className="role-card-desc">
                  Assess your technical skills, test readiness for campus placements, and practice
                  with topic-wise mock tests in an authentic timed examination environment.
                </p>

                <div className="role-highlights">
                  <div className="role-highlight-item">
                    <CheckCircle2 size={16} color="#1a73e8" />
                    <span><strong>Branch-Wise Test Banks:</strong> CSE, IT, ECE, EE, ME, CE, AI/DS & Aptitude</span>
                  </div>
                  <div className="role-highlight-item">
                    <CheckCircle2 size={16} color="#1a73e8" />
                    <span><strong>Real Exam Experience:</strong> NTA / TCS iON layout, countdown clock & negative marking</span>
                  </div>
                  <div className="role-highlight-item">
                    <CheckCircle2 size={16} color="#1a73e8" />
                    <span><strong>Verified Explanations:</strong> Question-level rationales and performance accuracy reports</span>
                  </div>
                </div>

                <div className="role-audiences">
                  <span className="aud-label">Best suited for:</span>
                  <div className="aud-tags">
                    <span className="aud-tag">Undergraduates</span>
                    <span className="aud-tag">GATE Aspirants</span>
                    <span className="aud-tag">Placement Seekers</span>
                  </div>
                </div>

                <div className="role-card-footer">
                  <Link to="/assessment/student" className="role-enter-btn student-btn">
                    <span>Enter Student Portal</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* CARD 2: FOR FACULTY */}
            <div
              className={`asm-role-card faculty ${selectedRole === 'faculty' ? 'active' : ''}`}
              onClick={() => setSelectedRole('faculty')}
            >
              <div className="role-card-banner faculty-banner">
                <span className="role-chip faculty-chip">
                  <Presentation size={14} />
                  <span>Faculty & Educator Hub</span>
                </span>
                <span className="role-avail">FDP & EdTech Ready</span>
              </div>

              <div className="role-card-body">
                <div className="role-icon-box faculty-icon">
                  <Award size={28} />
                </div>

                <h3 className="role-card-title">I am a Faculty / Educator</h3>
                <p className="role-card-desc">
                  Upskill your teaching experience, adopt emerging educational technologies like GenAI,
                  align with Outcome-Based Education (OBE), and evaluate your instructional competencies.
                </p>

                <div className="role-highlights">
                  <div className="role-highlight-item">
                    <CheckCircle2 size={16} color="#00897b" />
                    <span><strong>Teaching Experience:</strong> Flipped learning models, active pedagogy & Bloom’s Taxonomy</span>
                  </div>
                  <div className="role-highlight-item">
                    <CheckCircle2 size={16} color="#00897b" />
                    <span><strong>Adopt New Technology:</strong> GenAI in course delivery, virtual coding labs & automated grading</span>
                  </div>
                  <div className="role-highlight-item">
                    <CheckCircle2 size={16} color="#00897b" />
                    <span><strong>Faculty Self-Assessments:</strong> Evaluate and certify your EdTech & OBE competencies</span>
                  </div>
                </div>

                <div className="role-audiences">
                  <span className="aud-label">Best suited for:</span>
                  <div className="aud-tags">
                    <span className="aud-tag faculty">Professors</span>
                    <span className="aud-tag faculty">Lecturers</span>
                    <span className="aud-tag faculty">Corporate Trainers</span>
                  </div>
                </div>

                <div className="role-card-footer">
                  <Link to="/assessment/faculty" className="role-enter-btn faculty-btn">
                    <span>Enter Faculty Hub</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY THIS PORTAL MATTERS
          ===================================================== */}
      <section className="asm-hub-section alt">
        <div className="container">
          <div className="asm-hub-sec-head">
            <div className="asm-hub-sec-eyebrow">Academic Ecosystem</div>
            <h2 className="asm-hub-sec-title">Bridging the Gap Between Learning & Instruction</h2>
            <p className="asm-hub-sec-desc">
              Education thrives when both students and educators have the digital infrastructure
              to measure progress and embrace continuous growth.
            </p>
          </div>

          <div className="asm-hub-pillars-grid">
            <div className="hub-pillar-card">
              <div className="pillar-icon-box">
                <Target size={22} color="#1a73e8" />
              </div>
              <h4>Outcome-Based Evaluation</h4>
              <p>
                Every question is tagged to specific cognitive levels and learning outcomes,
                giving students clear feedback and faculty actionable attainment data.
              </p>
            </div>

            <div className="hub-pillar-card">
              <div className="pillar-icon-box">
                <Brain size={22} color="#7b61ff" />
              </div>
              <h4>AI & Technology Adoption</h4>
              <p>
                Students test their skills in modern domains like AI and Cloud, while faculty
                learn ethical frameworks to integrate GenAI tools into everyday classrooms.
              </p>
            </div>

            <div className="hub-pillar-card">
              <div className="pillar-icon-box">
                <Clock size={22} color="#34a853" />
              </div>
              <h4>Real-World Exam Rigor</h4>
              <p>
                Strict timer controls, palette shield states, and negative marking simulate
                the pressure of official university and competitive assessments.
              </p>
            </div>

            <div className="hub-pillar-card">
              <div className="pillar-icon-box">
                <Award size={22} color="#ea4335" />
              </div>
              <h4>Continuous Professional Growth</h4>
              <p>
                Faculty Development Program (FDP) assessments help teachers stay ahead
                of rapidly evolving industry standards and accreditation criteria.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
