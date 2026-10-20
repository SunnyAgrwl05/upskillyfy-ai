/* =========================================================
   UPSKILLYFY AI — FACULTY EXCELLENCE & UPSKILLING HUB
   Teaching Experience, Emerging EdTech, & Professional Growth
   ========================================================= */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Presentation,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  FileQuestion,
  Layers,
  Brain,
  Lightbulb,
  ShieldCheck,
  Code2,
  GraduationCap,
  Copy,
  Check
} from 'lucide-react'
import { getAssessmentsByBranch } from '../data/assessmentsSeed'
import './AssessmentFaculty.css'

export default function AssessmentFaculty() {
  const facultyTests = getAssessmentsByBranch('faculty') || []
  const [copiedPromptIdx, setCopiedPromptIdx] = useState(null)

  const copyPrompt = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedPromptIdx(idx)
    setTimeout(() => setCopiedPromptIdx(null), 2000)
  }

  const PROMPT_TEMPLATES = [
    {
      title: 'Bloom’s Taxonomy Question Generator',
      level: 'Pedagogy',
      prompt:
        'Act as an expert computer science professor. Generate 3 multiple-choice questions for the topic "Binary Search Trees". Structure each question at Bloom’s Taxonomy level "Analyzing" (Level 4), providing plausible distractors, the single correct option, and a pedagogical explanation of why each incorrect distractor is flawed.',
    },
    {
      title: 'Rubric Formulation for Project Evaluations',
      level: 'Assessment',
      prompt:
        'Generate a 4-tier rubric (Exemplary, Proficient, Developing, Unsatisfactory) for assessing undergraduate student submissions of a full-stack web application. Focus on code modularity, state management, accessibility, and documentation.',
    },
    {
      title: 'CO-PO Attainment & Formative Checkpoint',
      level: 'OBE Framework',
      prompt:
        'Draft 2 formative checkpoint classroom questions to verify if students achieved Course Outcome 3: "Analyze and implement graph algorithms for network path optimization".',
    },
  ]

  return (
    <div className="asm-faculty-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="asm-faculty-hero">
        <div className="container">
          <div className="asm-fac-top-bar">
            <Link to="/assessment" className="asm-fac-back">
              <ArrowLeft size={15} />
              <span>Portal Selection</span>
            </Link>
            <Link to="/assessment/student" className="asm-fac-switch-btn">
              <GraduationCap size={15} />
              <span>Switch to Student Portal</span>
            </Link>
          </div>

          <div className="asm-faculty-eyebrow">
            <span className="asm-faculty-pulse" />
            <span>Faculty & Educator Excellence Hub</span>
          </div>

          <h1 className="asm-faculty-title">
            Elevate Teaching Experience. <br />
            <span className="grad faculty">Adopt Next-Gen EdTech.</span>
          </h1>

          <p className="asm-faculty-sub">
            A dedicated ecosystem for university professors, lecturers, and academic trainers.
            Master modern active pedagogy, integrate Generative AI into your classrooms,
            align with Outcome-Based Education (OBE), and validate your competencies.
          </p>

          <div className="asm-faculty-pills">
            <div className="fac-pill">
              <Presentation size={15} color="#00897b" />
              <span>Active Pedagogy & OBE</span>
            </div>
            <div className="fac-pill">
              <Sparkles size={15} color="#1a73e8" />
              <span>AI & Modern EdTech Adoption</span>
            </div>
            <div className="fac-pill">
              <Award size={15} color="#fbbc04" />
              <span>Faculty Development Programs (FDP)</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          THE 3 CORE PILLARS FOR FACULTY
          ===================================================== */}
      <section className="asm-faculty-section">
        <div className="container">
          <div className="asm-fac-sec-head">
            <div className="asm-fac-sec-eyebrow">The Three Pillars</div>
            <h2 className="asm-fac-sec-title">Everything You Need to Modernize Instruction</h2>
            <p className="asm-fac-sec-desc">
              Designed to help educators thrive in digital classrooms while maintaining high academic rigor.
            </p>
          </div>

          <div className="asm-pillars-grid">
            {/* PILLAR 1 */}
            <div className="asm-pillar-card">
              <div className="pillar-num-badge">01</div>
              <div className="pillar-header">
                <div className="pillar-icon-circle green">
                  <Presentation size={24} />
                </div>
                <h3>Teaching Experience & Pedagogy</h3>
              </div>
              <p className="pillar-summary">
                Move beyond passive lectures into interactive, learner-centric methodologies that improve retention.
              </p>
              <ul className="pillar-list">
                <li>
                  <CheckCircle2 size={15} color="#00897b" />
                  <span><strong>Bloom’s Taxonomy Cognitive Mapping:</strong> Design questions spanning Remembering to Creating.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="#00897b" />
                  <span><strong>Flipped Classroom Frameworks:</strong> Deliver lectures pre-class, use live sessions for problem-solving.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="#00897b" />
                  <span><strong>Formative Diagnostic Feedback:</strong> Identify student learning gaps before high-stakes exams.</span>
                </li>
              </ul>
            </div>

            {/* PILLAR 2 */}
            <div className="asm-pillar-card">
              <div className="pillar-num-badge">02</div>
              <div className="pillar-header">
                <div className="pillar-icon-circle blue">
                  <Sparkles size={24} />
                </div>
                <h3>Adopt New Technology & AI</h3>
              </div>
              <p className="pillar-summary">
                Harness emerging AI tools and cloud sandbox environments to augment your instruction and assessment speed.
              </p>
              <ul className="pillar-list">
                <li>
                  <CheckCircle2 size={15} color="#1a73e8" />
                  <span><strong>GenAI in Question Authoring:</strong> Use structured prompts to generate differentiated question banks.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="#1a73e8" />
                  <span><strong>Automated Code Grading Labs:</strong> Set up unit-test driven programming assessments with instant feedback.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="#1a73e8" />
                  <span><strong>AI Ethics & Academic Integrity:</strong> Establish clear institutional guidelines for student AI usage.</span>
                </li>
              </ul>
            </div>

            {/* PILLAR 3 */}
            <div className="asm-pillar-card">
              <div className="pillar-num-badge">03</div>
              <div className="pillar-header">
                <div className="pillar-icon-circle amber">
                  <Award size={24} />
                </div>
                <h3>Upgrade Yourself (FDP & Research)</h3>
              </div>
              <p className="pillar-summary">
                Continuous professional growth aligned with National Education Policy (NEP) and global accreditations.
              </p>
              <ul className="pillar-list">
                <li>
                  <CheckCircle2 size={15} color="#fbbc04" />
                  <span><strong>Outcome-Based Education (OBE):</strong> Calculate CO-PO attainment matrices for NBA/NAAC.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="#fbbc04" />
                  <span><strong>Research & Scopus Publishing:</strong> Structure literature reviews, methodologies, and grant proposals.</span>
                </li>
                <li>
                  <CheckCircle2 size={15} color="#fbbc04" />
                  <span><strong>Industry-Aligned Curricula:</strong> Integrate contemporary industry tech stacks into syllabi.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FACULTY SELF-ASSESSMENTS
          ===================================================== */}
      <section className="asm-faculty-section alt">
        <div className="container">
          <div className="asm-fac-sec-head">
            <div className="asm-fac-sec-eyebrow">Competency Evaluation</div>
            <h2 className="asm-fac-sec-title">Faculty Competency Self-Assessments</h2>
            <p className="asm-fac-sec-desc">
              Test your proficiency in modern educational methodologies, Bloom’s cognitive frameworks,
              and EdTech tools. Taken directly inside our NTA/TCS-style examination engine.
            </p>
          </div>

          <div className="asm-faculty-tests-grid">
            {facultyTests.map((test) => (
              <article key={test.id} className="asm-fac-test-card">
                <div className="fac-test-top">
                  <span className="fac-test-badge">{test.difficulty}</span>
                  <span className="fac-test-meta">
                    <Clock size={13} />
                    <span>{test.duration} mins</span>
                  </span>
                </div>

                <h3 className="fac-test-title">{test.title}</h3>
                <p className="fac-test-desc">{test.description}</p>

                <div className="fac-test-specs">
                  <div className="spec-item">
                    <FileQuestion size={14} />
                    <span><strong>{test.questionsCount}</strong> questions</span>
                  </div>
                  <div className="spec-item">
                    <Target size={14} />
                    <span><strong>{test.totalMarks}</strong> marks</span>
                  </div>
                  <div className="spec-item">
                    <ShieldCheck size={14} />
                    <span>+{test.markingScheme.positive} / -{test.markingScheme.negative}</span>
                  </div>
                </div>

                <div className="fac-test-footer">
                  <Link to={`/assessment/test/${test.id}`} className="fac-attempt-btn">
                    <span>Attempt Assessment</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FACULTY PROMPT TOOLKITS & RESOURCES
          ===================================================== */}
      <section className="asm-faculty-section">
        <div className="container">
          <div className="asm-fac-sec-head">
            <div className="asm-fac-sec-eyebrow">Classroom Toolkits</div>
            <h2 className="asm-fac-sec-title">Ready-to-Use AI Prompts for Faculty</h2>
            <p className="asm-fac-sec-desc">
              Copy and customize these battle-tested prompts into your preferred AI assistant to draft
              differentiated questions, rubrics, and lesson checkpoints in minutes.
            </p>
          </div>

          <div className="asm-prompts-grid">
            {PROMPT_TEMPLATES.map((tpl, i) => (
              <div key={tpl.title} className="asm-prompt-card">
                <div className="prompt-header">
                  <span className="prompt-level-tag">{tpl.level}</span>
                  <button
                    type="button"
                    className="prompt-copy-btn"
                    onClick={() => copyPrompt(tpl.prompt, i)}
                    title="Copy prompt text"
                  >
                    {copiedPromptIdx === i ? (
                      <>
                        <Check size={14} color="#34a853" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <h4 className="prompt-title">{tpl.title}</h4>
                <div className="prompt-body">
                  <code>{tpl.prompt}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
