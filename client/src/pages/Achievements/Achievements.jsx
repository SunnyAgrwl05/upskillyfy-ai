import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { certificateAPI, documentAPI } from '../../api'
import {
  createDemoPdfBlob,
  credentialsDemoMode,
  DEMO_STUDENT,
  getDemoCertificates,
  getDemoDocuments,
  getDemoStudentViewState,
  setDemoStudentViewState,
} from '../../credentialsDemo'
import CredentialsDemoBar from './CredentialsDemoBar'
import './Achievements.css'

const TABS = [
  { id: 'all', label: 'All achievements' },
  { id: 'certificates', label: 'Course certificates' },
  { id: 'internships', label: 'Internship documents' },
  { id: 'offers', label: 'Offer letters' },
]

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function AchievementCard({ item, onDownload }) {
  const isCertificate = item.kind === 'certificate'
  return (
    <article className="achievement-card">
      <div className={`achievement-card__icon ${isCertificate ? 'is-certificate' : ''}`} aria-hidden="true">
        {isCertificate ? '✦' : item.documentType === 'OFFER_LETTER' ? '✉' : '▤'}
      </div>
      <div className="achievement-card__main">
        <div className="achievement-card__topline">
          <span className="achievement-card__type">
            {isCertificate ? 'Course certificate' : item.documentType.replaceAll('_', ' ')}
            {credentialsDemoMode && <span className="achievement-demo-tag">DEMO</span>}
          </span>
          <span className={`achievement-status ${item.status === 'REVOKED' ? 'is-revoked' : ''}`}>
            {item.status === 'REVOKED' ? 'Revoked' : credentialsDemoMode ? 'Demo only' : 'Available'}
          </span>
        </div>
        <h2>{isCertificate ? item.courseTitle : item.title}</h2>
        <p>{isCertificate ? `Issued ${formatDate(item.issuedAt)}` : [item.company, `Issued ${formatDate(item.issuedAt)}`].filter(Boolean).join(' · ')}</p>
        <div className="achievement-card__actions">
          {isCertificate && <Link to={`/learning/certifications/${item.id}`}>View certificate</Link>}
          {item.status !== 'REVOKED' && (
            <button type="button" className="achievement-link-button" onClick={() => onDownload(item)}>
              Download PDF
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Achievements() {
  const { user: authenticatedUser, loading: authLoading } = useAuth()
  const user = credentialsDemoMode ? DEMO_STUDENT : authenticatedUser
  const [activeTab, setActiveTab] = useState('all')
  const [certificates, setCertificates] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const [demoViewState, setDemoViewState] = useState(getDemoStudentViewState)

  useEffect(() => {
    if (credentialsDemoMode) {
      setCertificates(getDemoCertificates().filter((certificate) => certificate.user.id === DEMO_STUDENT.id))
      setDocuments(getDemoDocuments().filter((document) => document.user.id === DEMO_STUDENT.id))
      setDemoViewState(getDemoStudentViewState())
      setLoading(false)
      setError('')
      return
    }
    if (!user) {
      setLoading(false)
      return
    }
    let active = true
    Promise.all([certificateAPI.getMine(), documentAPI.getMine()])
      .then(([certificateResponse, documentResponse]) => {
        if (!active) return
        setCertificates(certificateResponse.data.certificates || [])
        setDocuments(documentResponse.data.documents || [])
      })
      .catch(() => {
        if (active) setError('We could not load your achievements. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user])

  const items = useMemo(() => {
    const all = [
      ...certificates.map((certificate) => ({ ...certificate, kind: 'certificate' })),
      ...documents.map((document) => ({ ...document, kind: 'document' })),
    ]
    if (activeTab === 'certificates') return all.filter((item) => item.kind === 'certificate')
    if (activeTab === 'internships') return all.filter((item) => item.kind === 'document' && item.documentType !== 'OFFER_LETTER')
    if (activeTab === 'offers') return all.filter((item) => item.kind === 'document' && item.documentType === 'OFFER_LETTER')
    return all
  }, [activeTab, certificates, documents])

  const handleDownload = async (item) => {
    setDownloadError('')
    try {
      if (credentialsDemoMode) {
        downloadBlob(createDemoPdfBlob(item), item.kind === 'certificate' ? `${item.certificateNumber}.pdf` : item.fileName)
        return
      }
      const response = item.kind === 'certificate'
        ? await certificateAPI.download(item.id)
        : await documentAPI.download(item.id)
      downloadBlob(response.data, item.kind === 'certificate' ? `${item.certificateNumber}.pdf` : item.fileName)
    } catch {
      setDownloadError('The document could not be downloaded. Please try again.')
    }
  }

  const chooseDemoState = (state) => {
    setDemoStudentViewState(state)
    setDemoViewState(state)
    setLoading(false)
    setError(state === 'error' ? 'DEMO ERROR: sample data is intentionally unavailable in this preview state.' : '')
    if (state !== 'empty' && state !== 'error' && state !== 'loading') {
      setCertificates(getDemoCertificates().filter((certificate) => certificate.user.id === DEMO_STUDENT.id))
      setDocuments(getDemoDocuments().filter((document) => document.user.id === DEMO_STUDENT.id))
    }
  }

  const resetDemo = () => {
    setDemoStudentViewState('records')
    setDemoViewState('records')
    setError('')
    setCertificates(getDemoCertificates().filter((certificate) => certificate.user.id === DEMO_STUDENT.id))
    setDocuments(getDemoDocuments().filter((document) => document.user.id === DEMO_STUDENT.id))
  }

  if ((!credentialsDemoMode && authLoading) || (!credentialsDemoMode && loading)) {
    return <main className="achievements-page"><div className="container"><p className="achievements-message">Loading your achievements…</p></div></main>
  }

  if (!credentialsDemoMode && !user) {
    return <main className="achievements-page"><div className="container achievements-message"><h1>Sign in to view achievements</h1><Link to="/login" className="btn-primary">Sign in</Link></div></main>
  }

  return (
    <main className="achievements-page">
      <div className="container">
        {credentialsDemoMode && (
          <CredentialsDemoBar onReset={resetDemo}>
            <label className="credentials-demo-state">Preview state
              <select value={demoViewState} onChange={(event) => chooseDemoState(event.target.value)}>
                <option value="records">Sample records (includes revoked)</option>
                <option value="empty">Empty state</option>
                <option value="loading">Loading state</option>
                <option value="error">Error state</option>
              </select>
            </label>
          </CredentialsDemoBar>
        )}
        <header className="achievements-header">
          <span className="achievements-eyebrow">YOUR LEARNING MILESTONES</span>
          <h1>My Achievements</h1>
          <p>{credentialsDemoMode ? 'Sample certificates and internship documents for visual preview only.' : 'Certificates and official documents issued to your account.'}</p>
          <div className="achievements-counts" aria-label="Achievement totals">
            <div><strong>{certificates.length.toString().padStart(2, '0')}</strong><span>Certificates</span></div>
            <div><strong>{documents.length.toString().padStart(2, '0')}</strong><span>Other documents</span></div>
          </div>
        </header>

        <nav className="achievement-tabs" aria-label="Filter achievements">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'is-active' : ''}
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {error && <div className="achievement-alert" role="alert">{error}</div>}
        {downloadError && <div className="achievement-alert" role="alert">{downloadError}</div>}
        {credentialsDemoMode && demoViewState === 'loading' && <p className="achievements-message">Loading sample achievements… (preview state)</p>}
        {!error && demoViewState !== 'loading' && (demoViewState === 'empty' || items.length === 0) && (
          <div className="achievements-empty">
            <span aria-hidden="true">✦</span>
            <h2>No achievements yet</h2>
            <p>When a certificate or official document is issued to you, it will appear here.</p>
          </div>
        )}
        <div className="achievement-list">
          {demoViewState !== 'empty' && demoViewState !== 'error' && demoViewState !== 'loading' && items.map((item) => <AchievementCard key={`${item.kind}-${item.id}`} item={item} onDownload={handleDownload} />)}
        </div>
      </div>
    </main>
  )
}
