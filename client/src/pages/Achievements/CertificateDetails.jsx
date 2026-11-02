import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { certificateAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { credentialsDemoMode, DEMO_STUDENT, getDemoCertificate } from '../../credentialsDemo'
import CertificatePreview from './CertificatePreview'
import CredentialsDemoBar from './CredentialsDemoBar'
import './Achievements.css'

export default function CertificateDetails() {
  const { id } = useParams()
  const { user: authenticatedUser, loading: authLoading } = useAuth()
  const user = credentialsDemoMode ? DEMO_STUDENT : authenticatedUser
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (credentialsDemoMode) {
      const sample = getDemoCertificate(id)
      setCertificate(sample)
      setError(sample ? '' : 'This sample certificate is not available.')
      setLoading(false)
      return
    }
    if (!user) {
      setLoading(false)
      return
    }
    let active = true
    certificateAPI.getOne(id)
      .then((response) => { if (active) setCertificate(response.data.certificate) })
      .catch(() => { if (active) setError('This certificate could not be found or you do not have access to it.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, user])

  if ((!credentialsDemoMode && authLoading) || loading) return <main className="achievements-page"><div className="container achievements-message">Loading certificate…</div></main>
  if (!credentialsDemoMode && !user) return <main className="achievements-page"><div className="container achievements-message"><h1>Sign in to view this certificate</h1><Link to="/login">Sign in</Link></div></main>
  if (error || !certificate) return <main className="achievements-page"><div className="container achievements-message"><h1>Certificate unavailable</h1><p>{error}</p><Link to="/learning/certifications">Back to achievements</Link></div></main>

  return (
    <main className="achievements-page">
      <div className="container certificate-detail">
        {credentialsDemoMode && <CredentialsDemoBar />}
        <Link className="achievement-back-link" to="/learning/certifications">← My achievements</Link>
        <div className="certificate-detail__heading">
          <div>
            <span className="achievements-eyebrow">COURSE CERTIFICATE</span>
            <h1>{certificate.courseTitle}</h1>
            <p>{certificate.recipientName} · Certificate {certificate.certificateNumber}</p>
          </div>
          <span className={`achievement-status ${certificate.status === 'REVOKED' || credentialsDemoMode ? 'is-revoked' : ''}`}>
            {credentialsDemoMode ? 'DEMO · NOT VALID' : certificate.status === 'REVOKED' ? 'Revoked' : 'Valid'}
          </span>
        </div>
        {credentialsDemoMode && <div className="achievement-alert">DEMO SAMPLE — NOT A REAL CREDENTIAL. The QR destination is a demo page and does not query production verification.</div>}
        {certificate.status === 'REVOKED' && <div className="achievement-alert" role="status">This certificate has been revoked. Its public verification page will show the revoked status.</div>}
        <CertificatePreview certificate={certificate} />
        <div className="certificate-detail__meta">
          <span>Completed {new Date(certificate.completionDate).toLocaleDateString()}</span>
          <span>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>
          <span>Template {certificate.templateVersion}</span>
          <a href={certificate.verificationUrl} target="_blank" rel="noreferrer">{credentialsDemoMode ? 'Demo QR destination ↗' : 'Public verification ↗'}</a>
        </div>
      </div>
    </main>
  )
}
