import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { verificationAPI } from '../../api'
import { credentialsDemoMode } from '../../credentialsDemo'
import './CertificateVerification.css'

export default function CertificateVerification() {
  const { token } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const isDemoQr = credentialsDemoMode

  useEffect(() => {
    if (credentialsDemoMode) {
      setResult(null)
      setError('')
      return
    }
    let active = true
    verificationAPI.verify(token)
      .then((response) => { if (active) setResult(response.data) })
      .catch(() => { if (active) setError('Verification is temporarily unavailable. Please try again later.') })
    return () => { active = false }
  }, [token])

  if (isDemoQr) {
    return (
      <main className="verification-page">
        <section className="verification-card verification-card--demo">
          <div className="verification-mark is-revoked">!</div>
          <span className="achievements-eyebrow">DEMO QR DESTINATION</span>
          <h1>Not a real certificate</h1>
          <div className="verification-demo-warning">
            DEMO ONLY — NOT VALID — This sample QR does not query the production verification API or database.
          </div>
          <p>Sample recipient: Jordan Sample</p>
          <p>Sample course: Sample Full-Stack Web Development</p>
          <p>No credential was issued or verified.</p>
        </section>
      </main>
    )
  }

  const status = result?.status
  return (
    <main className="verification-page">
      <section className="verification-card">
        <div className={`verification-mark ${status === 'ISSUED' ? 'is-valid' : status === 'REVOKED' ? 'is-revoked' : ''}`}>
          {status === 'ISSUED' ? '✓' : status === 'REVOKED' ? '!' : '?'}
        </div>
        <span className="achievements-eyebrow">UPSKILLYFY AI CREDENTIALS</span>
        <h1>
          {error ? 'Unable to verify' : !result ? 'Checking certificate…' : status === 'ISSUED' ? 'Certificate verified' : status === 'REVOKED' ? 'Certificate revoked' : 'Certificate invalid'}
        </h1>
        {error && <p role="alert">{error}</p>}
        {result?.certificate && (
          <div className="verification-details">
            <div><span>Recipient</span><strong>{result.certificate.recipientName}</strong></div>
            <div><span>Course</span><strong>{result.certificate.courseTitle}</strong></div>
            <div><span>Certificate ID</span><strong>{result.certificate.certificateNumber}</strong></div>
            <div><span>Issuer</span><strong>{result.certificate.issuer}</strong></div>
            <div><span>Issued</span><strong>{new Date(result.certificate.issuedAt).toLocaleDateString()}</strong></div>
          </div>
        )}
        {result?.status === 'INVALID' && <p>No matching certificate was found.</p>}
        <p className="verification-footnote">This page displays only public certificate information. Private student account details are not shared.</p>
      </section>
    </main>
  )
}
