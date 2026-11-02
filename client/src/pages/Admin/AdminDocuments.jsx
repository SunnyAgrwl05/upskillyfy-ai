import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminCredentialAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import {
  addDemoDocument,
  createDemoPdfBlob,
  credentialsDemoMode,
  DEMO_ADMIN,
  DEMO_STUDENTS,
  getDemoDocuments,
  revokeDemoDocument,
} from '../../credentialsDemo'
import CredentialsDemoBar from '../Achievements/CredentialsDemoBar'
import './AdminCredentials.css'

const DOCUMENT_TYPES = [
  ['OFFER_LETTER', 'Offer letter'],
  ['INTERNSHIP_COMPLETION_LETTER', 'Internship completion letter'],
  ['EXPERIENCE_LETTER', 'Experience letter'],
]

export default function AdminDocuments() {
  const { user: authenticatedUser, loading: authLoading } = useAuth()
  const user = credentialsDemoMode ? DEMO_ADMIN : authenticatedUser
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [documentType, setDocumentType] = useState('OFFER_LETTER')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const loadDocuments = async () => {
    if (credentialsDemoMode) {
      setDocuments(getDemoDocuments())
      return
    }
    const response = await adminCredentialAPI.getDocuments()
    setDocuments(response.data.documents || [])
  }

  useEffect(() => {
    if (credentialsDemoMode || user?.role === 'admin') loadDocuments().catch(() => setError('Could not load student documents.'))
  }, [user?.role])

  const searchStudents = async (event) => {
    event.preventDefault()
    if (credentialsDemoMode) {
      const matcher = search.trim().toLowerCase()
      setStudents(matcher.length < 2 ? [] : DEMO_STUDENTS.filter((student) => (
        student.name.toLowerCase().includes(matcher) || student.email.toLowerCase().includes(matcher)
      )))
      return
    }
    try {
      const response = await adminCredentialAPI.findStudents(search)
      setStudents(response.data.students || [])
    } catch {
      setError('Student search failed.')
    }
  }

  const upload = async (event) => {
    event.preventDefault()
    if (credentialsDemoMode) {
      const selectedStudent = DEMO_STUDENTS.find((student) => student.id === studentId)
      if (!selectedStudent || !file) return
      addDemoDocument({
        student: selectedStudent,
        documentType,
        title,
        company,
        fileName: file.name,
      })
      setNotice('Added a sample document to temporary memory only. The selected file was not uploaded or saved.')
      setTitle('')
      setCompany('')
      setApplicationId('')
      setFile(null)
      event.target.reset()
      setDocuments(getDemoDocuments())
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await adminCredentialAPI.uploadDocument({ userId: studentId, documentType, title, company, applicationId, file })
      setNotice('Student document uploaded.')
      setTitle('')
      setCompany('')
      setApplicationId('')
      setFile(null)
      event.target.reset()
      await loadDocuments()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Document upload failed. Only valid PDF files up to 5 MB are accepted.')
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (document) => {
    if (credentialsDemoMode) {
      revokeDemoDocument(document.id)
      setDocuments(getDemoDocuments())
      setNotice(`${document.title} was revoked in demo memory only.`)
      return
    }
    const reason = window.prompt(`Why are you revoking "${document.title}"?`)
    if (!reason) return
    try {
      await adminCredentialAPI.revokeDocument(document.id, reason)
      await loadDocuments()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Document revocation failed.')
    }
  }

  if (!credentialsDemoMode && authLoading) return <main className="admin-credentials"><div className="container">Loading…</div></main>
  if (!credentialsDemoMode && user?.role !== 'admin') return <main className="admin-credentials"><div className="container"><h1>Administrator access required</h1></div></main>

  return (
    <main className="admin-credentials">
      <div className="container">
        {credentialsDemoMode && <CredentialsDemoBar onReset={loadDocuments} />}
        <header className="admin-credentials__header">
          <div><span className="achievements-eyebrow">ADMINISTRATION</span><h1>Student documents</h1><p>Upload authorized offer and internship documents for a selected student.</p></div>
          <Link to="/admin/credentials">Manage course certificates →</Link>
        </header>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        {notice && <div className="admin-success" role="status">{notice}</div>}
        <section className="admin-panel">
          <h2>Upload official document</h2>
          {credentialsDemoMode && <p className="admin-alert">DEMO ONLY: selecting a file stores only its name in temporary browser memory. No file or request is sent to a server.</p>}
          <form onSubmit={searchStudents} className="admin-search-form">
            <label>Find student by name or email<input value={search} onChange={(event) => setSearch(event.target.value)} minLength="2" placeholder="Search at least two characters" /></label>
            <button type="submit" className="btn-primary">Search students</button>
          </form>
          <form onSubmit={upload} className="admin-issue-form">
            <label className="admin-field admin-field--wide">Student
              <select value={studentId} onChange={(event) => setStudentId(event.target.value)} required>
                <option value="">Select a student</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.email}</option>)}
              </select>
            </label>
            <label className="admin-field">Document type
              <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                {DOCUMENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="admin-field">Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength="160" required /></label>
            <label className="admin-field">Company<input value={company} onChange={(event) => setCompany(event.target.value)} maxLength="120" /></label>
            <label className="admin-field">Application reference (optional)<input value={applicationId} onChange={(event) => setApplicationId(event.target.value)} placeholder="MongoDB ID or applicationId" /></label>
            <label className="admin-field admin-field--wide">PDF file<input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} required /></label>
            <div className="admin-actions admin-field--wide"><button className="btn-primary" disabled={busy || !studentId || !file}>{busy ? 'Uploading…' : 'Upload document'}</button></div>
          </form>
        </section>
        <section className="admin-panel">
          <h2>Recently uploaded documents</h2>
          {documents.length === 0 ? <p className="admin-help">No documents have been uploaded.</p> : (
            <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>Student</th><th>Document</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{documents.map((document) => <tr key={document.id}>
                <td>{document.user?.name}<small>{document.user?.email}</small></td>
                <td>{document.title}</td>
                <td>{document.documentType.replaceAll('_', ' ')}</td>
                <td>{document.status}</td>
                <td className="admin-document-actions">
                  {document.status === 'ACTIVE' && <button className="admin-text-button" type="button" onClick={() => revoke(document)}>Revoke</button>}
                  {credentialsDemoMode && document.status === 'ACTIVE' && (
                    <button
                      className="admin-text-button"
                      type="button"
                      onClick={() => {
                        const blob = createDemoPdfBlob(document)
                        const url = URL.createObjectURL(blob)
                        const link = window.document.createElement('a')
                        link.href = url
                        link.download = document.fileName
                        link.click()
                        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
                      }}
                    >
                      Download demo PDF
                    </button>
                  )}
                </td>
              </tr>)}</tbody>
            </table></div>
          )}
        </section>
      </div>
    </main>
  )
}
