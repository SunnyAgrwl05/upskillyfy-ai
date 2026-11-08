import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CloudUpload, FileText, History, LoaderCircle, ShieldCheck, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { resumeAnalysisAPI } from '../../../api'
import { useAuth } from '../../../context/AuthContext'
import './ResumeAnalyzer.css'

const TEMPLATES = [
  ['ats-friendly-resume', 'ATS-Friendly Resume'], ['fresher-resume', 'Fresher Resume'],
  ['software-engineer-resume', 'Software Engineer Resume'],
  ['experienced-professional-resume', 'Experienced Professional Resume'], ['academic-cv', 'Academic CV'],
]
const SECTIONS = [
  ['contact', 'Contact information'], ['summary', 'Professional summary'], ['education', 'Education'],
  ['workExperience', 'Work experience'], ['skills', 'Technical and soft skills'], ['projects', 'Projects'],
  ['certifications', 'Certifications'], ['achievements', 'Achievements'], ['links', 'Links'],
]
const emptyAnalysis = (value) => ({
  ...value,
  confirmedSections: value.confirmedSections || [],
  markedIncorrectSections: value.markedIncorrectSections || [],
})

function textRows(items, format) { return (items || []).map(format).join('\n') }
function parseRows(value, columns, build) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => build(line.split('|').map((part) => part.trim()), columns))
}

function ScoreCard({ scoring }) {
  return <section className="ra-score-card">
    <div className="ra-score-ring" style={{ '--ra-score': `${scoring?.overall || 0}%` }}><span>{scoring?.overall ?? '—'}<small>/100</small></span></div>
    <div><p className="ra-eyebrow">ATS compatibility</p><h2>{scoring?.overall ?? '—'} <span>score</span></h2><p>{scoring?.method}</p></div>
    <div className="ra-section-scores">{Object.entries(scoring?.sections || {}).map(([key, score]) => <div key={key}><span>{key === 'readability' ? 'ATS readability' : key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</span><b>{score}%</b><i><em style={{ width: `${score}%` }} /></i></div>)}</div>
    <div className="ra-score-explanation"><b>How this score is calculated</b>{(scoring?.explanation || []).map((item) => <p key={item.section}><strong>{item.section} · {item.score}%</strong> {item.reason}</p>)}</div>
  </section>
}

export default function ResumeAnalyzer() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [phase, setPhase] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [retention, setRetention] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPages, setHistoryPages] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0][0])
  const [savingReview, setSavingReview] = useState(false)
  const [historyStatus, setHistoryStatus] = useState('')

  useEffect(() => {
    if (!user) { setHistory([]); return }
    let active = true
    resumeAnalysisAPI.list({ page: 1, limit: 20 }).then(({ data }) => {
      if (active) setHistory(data.analyses || [])
      if (active) { setHistoryPage(1); setHistoryPages(data.pagination?.pages || 1) }
    }).catch(() => { if (active) setHistoryStatus('Could not load saved analysis history.') })
    return () => { active = false }
  }, [user])

  const extracted = analysis?.extractedData || {}
  const confirmed = useMemo(() => new Set(analysis?.confirmedSections || []), [analysis?.confirmedSections])
  const incorrect = useMemo(() => new Set(analysis?.markedIncorrectSections || []), [analysis?.markedIncorrectSections])

  const acceptFile = (candidate) => {
    setError('')
    if (!candidate) return
    if (candidate.type !== 'application/pdf' || !candidate.name.toLowerCase().endsWith('.pdf')) {
      setFile(null); setError('Choose a PDF file. The file extension and declared MIME type must both be PDF.'); return
    }
    if (candidate.size < 16 || candidate.size > 10 * 1024 * 1024) {
      setFile(null); setError('PDF files must be between 16 bytes and 10 MB.'); return
    }
    setFile(candidate)
  }

  const analyze = async (event) => {
    event.preventDefault()
    if (!file || phase === 'uploading' || phase === 'analyzing') return
    setPhase('uploading'); setProgress(0); setError(''); setAnalysis(null); setRetention('')
    try {
      const { data } = await resumeAnalysisAPI.analyze(file, jobDescription, (eventProgress) => {
        if (eventProgress.total) {
          const percent = Math.round(eventProgress.loaded * 100 / eventProgress.total)
          setProgress(percent)
          if (percent >= 100) setPhase('analyzing')
        }
      })
      setAnalysis(emptyAnalysis(data.analysis))
      setRetention(data.retention || '')
      setPhase('done')
      setFile(null)
    } catch (requestError) {
      setPhase('idle')
      setError(requestError.response?.data?.message || 'The resume could not be analyzed. Please try again.')
    }
  }

  const updateData = (key, value) => setAnalysis((current) => ({ ...current, extractedData: { ...current.extractedData, [key]: value } }))
  const toggleSection = (key, checked) => setAnalysis((current) => ({
    ...current,
    confirmedSections: checked ? [...new Set([...current.confirmedSections, key])] : current.confirmedSections.filter((item) => item !== key),
  }))
  const markIncorrect = (key, checked) => setAnalysis((current) => ({
    ...current,
    markedIncorrectSections: checked ? [...new Set([...current.markedIncorrectSections, key])] : current.markedIncorrectSections.filter((item) => item !== key),
    confirmedSections: checked ? current.confirmedSections.filter((item) => item !== key) : current.confirmedSections,
  }))

  const saveReviewAndContinue = async () => {
    if (!analysis || confirmed.size !== SECTIONS.length) return
    setSavingReview(true); setError('')
    try {
      let reviewed = { ...analysis, reviewComplete: true }
      if (analysis.id) {
        const { data } = await resumeAnalysisAPI.saveReview(analysis.id, {
          extractedData: analysis.extractedData,
          confirmedSections: [...confirmed],
          markedIncorrectSections: [...incorrect],
          reviewComplete: true,
        })
        reviewed = emptyAnalysis(data.analysis)
        setAnalysis(reviewed)
      }
      navigate('/career/resume/create', { state: { resumeAnalyzerData: reviewed.extractedData, templateId: selectedTemplate, analysisId: reviewed.id } })
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Could not save your review. Please try again.')
    } finally { setSavingReview(false) }
  }

  const openHistory = async (id) => {
    setHistoryStatus('Loading saved analysis…'); setError('')
    try {
      const { data } = await resumeAnalysisAPI.get(id)
      setAnalysis(emptyAnalysis(data.analysis)); setRetention('This saved analysis contains structured resume data only. Delete it from your history at any time.')
      setPhase('done'); setHistoryStatus('')
      document.getElementById('resume-analysis-result')?.scrollIntoView({ behavior: 'smooth' })
    } catch (loadError) { setHistoryStatus(loadError.response?.data?.message || 'Could not load this analysis.') }
  }

  const removeHistory = async (id) => {
    try {
      await resumeAnalysisAPI.remove(id)
      setHistory((items) => items.filter((item) => item.id !== id))
      if (analysis?.id === id) { setAnalysis(null); setPhase('idle') }
    } catch (deleteError) { setHistoryStatus(deleteError.response?.data?.message || 'Could not delete the saved analysis.') }
  }

  const loadMoreHistory = async () => {
    const page = historyPage + 1
    setHistoryStatus('Loading more analyses…')
    try {
      const { data } = await resumeAnalysisAPI.list({ page, limit: 20 })
      setHistory((items) => [...items, ...(data.analyses || [])])
      setHistoryPage(page); setHistoryPages(data.pagination?.pages || page); setHistoryStatus('')
    } catch (loadError) { setHistoryStatus(loadError.response?.data?.message || 'Could not load more history.') }
  }

  const data = extracted
  const readyToContinue = confirmed.size === SECTIONS.length

  return <main className="ra-page">
    <section className="ra-hero">
      <div className="ra-hero-copy"><span className="ra-eyebrow"><Sparkles size={15} /> CAREER TOOLKIT</span><h1>AI Resume Analyzer</h1><p>Understand how your resume reads, review every extracted detail, and continue into an editable ATS resume.</p><div className="ra-trust"><ShieldCheck size={18} /><span>PDFs are processed in memory and discarded. Extracted text is sent to our configured AI provider. Analysis does not authenticate resume claims.</span></div></div>
      <div className="ra-hero-mark"><FileText size={52} /><Sparkles size={23} /></div>
    </section>

    {!analysis && <div className="ra-columns">
      <form className="ra-upload-card" onSubmit={analyze}>
        <div className="ra-card-heading"><span>01</span><div><h2>Upload your resume</h2><p>Text based PDF, up to 10 MB and 30 pages.</p></div></div>
        <div className={`ra-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex="0" onClick={() => inputRef.current?.click()} onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]) }}>
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = '' }} />
          <span className="ra-upload-icon"><CloudUpload size={27} /></span><b>{file?.name || 'Drop your PDF here'}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · PDF` : 'or browse files on your device'}</small>
          {file && <button type="button" className="ra-remove-file" onClick={(event) => { event.stopPropagation(); setFile(null) }} aria-label="Remove PDF"><X size={16} /></button>}
        </div>
        <label className="ra-job-description">Target job description <span>Optional, for keyword coverage</span><textarea value={jobDescription} maxLength={12000} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the job description to compare relevant terms. It is not saved to your history." /></label>
        {error && <p className="ra-error" role="alert">{error}</p>}
        {phase === 'uploading' || phase === 'analyzing' ? <div className="ra-progress" role="status"><div><LoaderCircle size={17} className="ra-spin" />{phase === 'uploading' ? `Uploading PDF · ${progress}%` : 'Extracting and analyzing resume…'}</div><i><em style={{ width: `${phase === 'analyzing' ? 100 : progress}%` }} /></i></div> : null}
        <button className="ra-primary" type="submit" disabled={!file || phase === 'uploading' || phase === 'analyzing'}><Sparkles size={17} /> Analyze resume <ArrowRight size={16} /></button>
        <p className="ra-privacy">Uploaded files are not retained. Scanned PDFs require OCR, which is not enabled.</p>
      </form>
      <aside className="ra-process-card"><p className="ra-eyebrow">HOW IT WORKS</p>{[['01', 'Extract', 'We read selectable text from your PDF.'], ['02', 'Analyze', 'AI provides structured feedback and explicit completeness checks.'], ['03', 'Review', 'Edit, remove, confirm, or flag each section yourself.'], ['04', 'Build', 'Choose an ATS template and open your editable resume.']].map(([num, title, copy]) => <div className="ra-process-step" key={num}><span>{num}</span><div><b>{title}</b><p>{copy}</p></div></div>)}<div className="ra-notice"><b>No external verification</b><p>Education, employment and credentials are not authenticated by this tool. Review and verify claims yourself.</p></div></aside>
    </div>}

    {analysis && <section id="resume-analysis-result" className="ra-results">
      <div className="ra-result-heading"><div><p className="ra-eyebrow">ANALYSIS COMPLETE</p><h2>Review your resume details</h2><p>Correct anything inaccurate, remove anything you do not want to keep, and confirm each section before continuing.</p></div><button className="ra-secondary" onClick={() => { setAnalysis(null); setPhase('idle') }}><Upload size={15} /> Analyze another PDF</button></div>
      <ScoreCard scoring={analysis.scoring} />
      <div className="ra-feedback-grid">
        <section><h3>Strengths</h3><ul>{analysis.feedback.strengths?.length ? analysis.feedback.strengths.map((item, index) => <li key={index}>{item}</li>) : <li>No strengths were returned.</li>}</ul></section>
        <section><h3>Suggestions</h3><ul>{analysis.feedback.improvementSuggestions?.length ? analysis.feedback.improvementSuggestions.map((item, index) => <li key={index}><b>{item.section}:</b> {item.suggestion}</li>) : <li>No suggestions were returned.</li>}</ul></section>
        <section><h3>Needs attention</h3><ul>{[...(analysis.feedback.missingInformation || []), ...(analysis.feedback.potentialInconsistencies || [])].length ? [...(analysis.feedback.missingInformation || []), ...(analysis.feedback.potentialInconsistencies || [])].map((item, index) => <li key={index}>{item}</li>) : <li>No potential issues were reported.</li>}</ul></section>
        <section><h3>Clarity and formatting</h3><ul>{[...(analysis.feedback.grammarAndClarity || []), ...(analysis.feedback.formattingIssues || [])].length ? [...(analysis.feedback.grammarAndClarity || []), ...(analysis.feedback.formattingIssues || [])].map((item, index) => <li key={index}>{item}</li>) : <li>No specific changes were suggested.</li>}</ul></section>
        <section><h3>Date consistency</h3><p>{analysis.feedback.dateConsistency?.summary || 'No summary was returned.'}</p><ul>{(analysis.feedback.dateConsistency?.findings || []).map((item, index) => <li key={index}>{item}</li>)}</ul></section>
        <section><h3>Keyword coverage</h3><p>{analysis.feedback.keywordCoverage?.percentage == null ? analysis.feedback.keywordCoverage?.note : `${analysis.feedback.keywordCoverage.percentage}% of distinct target description terms matched.`}</p><div className="ra-keywords"><span>Matched: {analysis.feedback.keywordCoverage?.matched?.join(', ') || 'None'}</span><span>Not found: {analysis.feedback.keywordCoverage?.missing?.join(', ') || 'None'}</span></div></section>
        <section><h3>Links to review</h3><ul>{analysis.feedback.suspiciousLinks?.length ? analysis.feedback.suspiciousLinks.map((item, index) => <li key={index}>{item}</li>) : <li>No suspicious links were reported. Link checks are text based only.</li>}</ul></section>
      </div>

      <div className="ra-review-heading"><div><p className="ra-eyebrow">USER REVIEW REQUIRED</p><h2>Extracted information</h2><p>Every section starts as AI Reviewed and Not Verified. Confirm details only after reviewing them.</p></div><span className="ra-review-count">{confirmed.size} / {SECTIONS.length} confirmed</span></div>
      <div className="ra-review-list">
        {SECTIONS.map(([key, label]) => <fieldset className="ra-review-section" key={key}>
          <legend>{label}</legend>
          <div className="ra-status-row"><span className="ra-status ai">AI Reviewed</span><span className={`ra-status ${confirmed.has(key) ? 'confirmed' : incorrect.has(key) ? 'attention' : 'unverified'}`}>{confirmed.has(key) ? 'User Confirmed' : incorrect.has(key) ? 'Needs Attention' : 'Not Verified'}</span><span className="ra-status unverified">Not Verified externally</span><span className="ra-status unverified">AI confidence: {analysis.feedback.confidenceLevels?.[key] || 'not rated'}</span></div>
          <div className="ra-edit-fields">
            {key === 'contact' && <><label>Name<input value={data.name || ''} maxLength={120} onChange={(event) => updateData('name', event.target.value)} /></label><label>Email<input value={data.email || ''} maxLength={254} onChange={(event) => updateData('email', event.target.value)} /></label><label>Phone<input value={data.phone || ''} maxLength={80} onChange={(event) => updateData('phone', event.target.value)} /></label><label>Location<input value={data.location || ''} maxLength={1200} onChange={(event) => updateData('location', event.target.value)} /></label><label className="wide">Links<textarea value={(data.links || []).join('\n')} onChange={(event) => updateData('links', event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))} /></label></>}
            {key === 'summary' && <label className="wide">Professional summary<textarea value={data.professionalSummary || ''} maxLength={5000} onChange={(event) => updateData('professionalSummary', event.target.value)} /></label>}
            {key === 'education' && <label className="wide">One record per line: degree | institution | dates | details<textarea value={textRows(data.education, (item) => [item.degree, item.institution, item.dates, item.details].join(' | '))} onChange={(event) => updateData('education', parseRows(event.target.value, 4, ([degree = '', institution = '', dates = '', details = '']) => ({ degree, institution, dates, details })))} /></label>}
            {key === 'workExperience' && <label className="wide">One role per line: title | employer | dates | location | bullet 1; bullet 2<textarea value={textRows(data.workExperience, (item) => [item.title, item.employer, item.dates, item.location, (item.bullets || []).join('; ')].join(' | '))} onChange={(event) => updateData('workExperience', parseRows(event.target.value, 5, ([title = '', employer = '', dates = '', location = '', bulletText = '']) => ({ title, employer, dates, location, bullets: bulletText.split(';').map((item) => item.trim()).filter(Boolean) })))} /></label>}
            {key === 'skills' && <><label>Technical skills, comma separated<textarea value={(data.technicalSkills || []).join(', ')} onChange={(event) => updateData('technicalSkills', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label><label>Soft skills, comma separated<textarea value={(data.softSkills || []).join(', ')} onChange={(event) => updateData('softSkills', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} /></label></>}
            {key === 'projects' && <label className="wide">One project per line: name | dates | description; description | technologies, comma separated<textarea value={textRows(data.projects, (item) => [item.name, item.dates, (item.description || []).join('; '), (item.technologies || []).join(', ')].join(' | '))} onChange={(event) => updateData('projects', parseRows(event.target.value, 4, ([name = '', dates = '', description = '', technologies = '']) => ({ name, dates, description: description.split(';').map((item) => item.trim()).filter(Boolean), technologies: technologies.split(',').map((item) => item.trim()).filter(Boolean) })))} /></label>}
            {key === 'certifications' && <label className="wide">One credential per line: name | issuer | date | credential ID<textarea value={textRows(data.certifications, (item) => [item.name, item.issuer, item.date, item.credentialId].join(' | '))} onChange={(event) => updateData('certifications', parseRows(event.target.value, 4, ([name = '', issuer = '', date = '', credentialId = '']) => ({ name, issuer, date, credentialId })))} /></label>}
            {key === 'achievements' && <label className="wide">One achievement per line<textarea value={(data.achievements || []).join('\n')} onChange={(event) => updateData('achievements', event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))} /></label>}
            {key === 'links' && <label className="wide">One link per line<textarea value={(data.links || []).join('\n')} onChange={(event) => updateData('links', event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))} /></label>}
          </div>
          <div className="ra-confirm-controls"><label><input type="checkbox" checked={incorrect.has(key)} onChange={(event) => markIncorrect(key, event.target.checked)} /> Mark extracted data incorrect</label><label><input type="checkbox" checked={confirmed.has(key)} onChange={(event) => toggleSection(key, event.target.checked)} /> I reviewed this section</label></div>
        </fieldset>)}
      </div>

      <section className="ra-continue-card"><div><p className="ra-eyebrow">CONTINUE TO RESUME BUILDER</p><h2>Choose an ATS template</h2><p>Your reviewed information will open in the existing editable resume builder. It will create a new local project and will not replace existing projects.</p></div><label>Template<select value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value)}>{TEMPLATES.map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select></label><button className="ra-primary" disabled={!readyToContinue || savingReview} onClick={saveReviewAndContinue}>{savingReview ? 'Saving review…' : readyToContinue ? 'Continue to Resume Builder' : `Review all sections (${confirmed.size}/${SECTIONS.length})`} <ArrowRight size={17} /></button><p className="ra-verification-note">AI feedback does not verify credentials, employment, awards, or achievements. Verify claims with their issuer or employer separately.</p></section>
      {retention && <p className="ra-retention"><ShieldCheck size={16} />{retention}</p>}
      {error && <p className="ra-error" role="alert">{error}</p>}
    </section>}

    {user && <section className="ra-history"><div className="ra-history-heading"><div><History size={18} /><div><h2>Previous analyses</h2><p>Saved until you delete them. Uploaded PDFs are never stored.</p></div></div></div>{historyStatus && <p role="status">{historyStatus}</p>}{history.length ? <div className="ra-history-list">{history.map((item) => <article key={item.id}><FileText size={18} /><div><b>Resume analysis · {item.scoring?.overall ?? '—'} score</b><small>{new Date(item.createdAt).toLocaleString()} · {item.reviewComplete ? 'User confirmed' : 'Review pending'}</small></div><button onClick={() => openHistory(item.id)}>Open</button><button className="delete" aria-label="Delete analysis" onClick={() => removeHistory(item.id)}><Trash2 size={16} /></button></article>)}</div> : <p className="ra-history-empty">{authLoading ? 'Loading account…' : 'No saved analyses yet.'}</p>}{historyPage < historyPages && <button className="ra-secondary" onClick={loadMoreHistory}>Load more analyses</button>}</section>}
    {!user && !authLoading && <p className="ra-signin-note">Sign in to keep a structured analysis in your history. Guest analyses stay in this page only.</p>}
    <footer className="ra-footer"><Link to="/career/resume">Back to Resume Builder</Link><span>AI Reviewed means machine analyzed. User Confirmed means you reviewed it. Neither is external verification.</span></footer>
  </main>
}
