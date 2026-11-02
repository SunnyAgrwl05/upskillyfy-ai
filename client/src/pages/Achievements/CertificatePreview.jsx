import { useEffect, useState } from 'react'
import { certificateAPI } from '../../api'
import { createDemoPdfBlob, credentialsDemoMode } from '../../credentialsDemo'

export default function CertificatePreview({ certificate }) {
  const [pdfUrl, setPdfUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let url = ''
    let active = true
    const pdfPromise = credentialsDemoMode
      ? Promise.resolve(createDemoPdfBlob({ ...certificate, kind: 'certificate' }))
      : certificateAPI.download(certificate.id).then(({ data }) => data)
    pdfPromise
      .then((data) => {
        if (!active) return
        url = URL.createObjectURL(data)
        setPdfUrl(url)
      })
      .catch(() => {
        if (active) setError('The certificate preview is temporarily unavailable.')
      })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [certificate])

  if (error) return <p className="achievement-alert" role="alert">{error}</p>
  if (!pdfUrl) return <div className="certificate-preview-loading">Loading certificate preview…</div>
  return (
    <div>
      {credentialsDemoMode && <p className="achievement-alert">DEMO PDF — NOT VALID. This local sample has no database record and its QR is not a real verification.</p>}
      <a className="achievement-pdf-download" href={pdfUrl} download={`${certificate.certificateNumber}.pdf`}>Download {credentialsDemoMode ? 'demo PDF' : 'PDF'}</a>
      <iframe className="certificate-pdf-frame" src={pdfUrl} title={`Certificate ${certificate.certificateNumber}`} />
    </div>
  )
}
