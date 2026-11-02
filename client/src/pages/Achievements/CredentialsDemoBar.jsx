import { Link } from 'react-router-dom'
import { resetCredentialDemoState } from '../../credentialsDemo'
import './CredentialsDemoBar.css'

export default function CredentialsDemoBar({ children, onReset }) {
  const reset = () => {
    resetCredentialDemoState()
    onReset?.()
  }

  return (
    <aside className="credentials-demo-bar" role="status">
      <div>
        <strong>DEMO PREVIEW — NOT REAL CREDENTIALS</strong>
        <p>Sample records only. Interactions stay in memory; no API, upload, or issuance requests are made.</p>
        {children}
      </div>
      <nav aria-label="Demo preview navigation">
        <Link to="/learning/certifications">Student</Link>
        <Link to="/admin/credentials">Admin</Link>
        <Link to="/admin/documents">Documents</Link>
        <button type="button" onClick={reset}>Reset demo</button>
      </nav>
    </aside>
  )
}
