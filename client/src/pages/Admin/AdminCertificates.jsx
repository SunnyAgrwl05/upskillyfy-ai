import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminCredentialAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import {
  createDemoPdfBlob,
  credentialsDemoMode,
  DEMO_ADMIN,
  DEMO_COURSES,
  DEMO_STUDENTS,
  DEMO_VERIFICATION_URL,
  getDemoCertificates,
  issueDemoCertificate,
  revokeDemoCertificate,
} from '../../credentialsDemo'
import CredentialsDemoBar from '../Achievements/CredentialsDemoBar'
import './AdminCredentials.css'

const today = () => new Date().toISOString().slice(0, 10)
const DEMO_COMPLETION_REVIEWS = [
  { studentId: 'demo-student-01', courseSlug: DEMO_COURSES[0].slug, evidence: 'Sample capstone review pending' },
  { studentId: 'demo-student-02', courseSlug: DEMO_COURSES[1].slug, evidence: 'Sample assessment check pending' },
]

export default function AdminCertificates() {
  const { user: authenticatedUser, loading: authLoading } = useAuth()
  const user = credentialsDemoMode ? DEMO_ADMIN : authenticatedUser
  const [courses, setCourses] = useState(credentialsDemoMode ? [...DEMO_COURSES] : [])
  const [certificates, setCertificates] = useState([])
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState([])
  const [student, setStudent] = useState(null)
  const [courseSlug, setCourseSlug] = useState('')
  const [completionDate, setCompletionDate] = useState(today())
  const [adminNotes, setAdminNotes] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [verificationUrl, setVerificationUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadData = async () => {
    if (credentialsDemoMode) {
      setCourses([...DEMO_COURSES])
      setCertificates(getDemoCertificates())
      return
    }
    const [courseResponse, certificateResponse] = await Promise.all([
      adminCredentialAPI.getCourses(),
      adminCredentialAPI.getCertificates(),
    ])
    setCourses(courseResponse.data.courses || [])
    setCertificates(certificateResponse.data.certificates || [])
  }

  useEffect(() => {
    if (credentialsDemoMode || user?.role === 'admin') loadData().catch(() => setError('Could not load certificate administration data.'))
  }, [user?.role])

  const findStudents = async (event) => {
    event.preventDefault()
    setError('')
    if (credentialsDemoMode) {
      const matcher = search.trim().toLowerCase()
      setStudents(matcher.length < 2 ? [] : DEMO_STUDENTS.filter((item) => (
        item.name.toLowerCase().includes(matcher) || item.email.toLowerCase().includes(matcher)
      )))
      return
    }
    try {
      const response = await adminCredentialAPI.findStudents(search)
      setStudents(response.data.students || [])
    } catch {
      setError('Student search failed. Please try again.')
    }
  }

  const previewCertificate = async () => {
    if (!student || !courseSlug || !completionDate) {
      setError('Choose a student, course, and completion date before previewing.')
      return
    }
    setBusy(true)
    setError('')
    if (credentialsDemoMode) {
      try {
        const pdfBlob = createDemoPdfBlob({
          kind: 'certificate',
          recipientName: student.name,
          courseTitle: courses.find((course) => course.slug === courseSlug)?.title || 'Sample course',
          certificateNumber: 'DEMO-PREVIEW-NOT-VALID',
          status: 'PREVIEW ONLY',
        })
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(URL.createObjectURL(pdfBlob))
      } finally {
        setBusy(false)
      }
      return
    }
    try {
      const response = await adminCredentialAPI.previewCertificate({ userId: student.id, courseSlug, completionDate })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(response.data))
    } catch {
      setError('Certificate preview failed. Confirm the course catalog and PDF renderer are available.')
    } finally {
      setBusy(false)
    }
  }

  const issueCertificate = async (event) => {
    event.preventDefault()
    if (!student || !courseSlug || !completionDate) {
      setError('Choose a student, course, and completion date before issuing.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    if (credentialsDemoMode) {
      const selectedCourse = courses.find((course) => course.slug === courseSlug)
      if (!selectedCourse) {
        setError('Choose a sample course before issuing.')
        setBusy(false)
        return
      }
      const certificate = issueDemoCertificate({ student, course: selectedCourse, completionDate })
      setCertificates(getDemoCertificates())
      setVerificationUrl(DEMO_VERIFICATION_URL)
      setNotice(`Created ${certificate.certificateNumber} in temporary demo memory only; no credential was issued.`)
      setBusy(false)
      return
    }
    try {
      const response = await adminCredentialAPI.issueCertificate({
        userId: student.id,
        courseSlug,
        completionDate,
        verificationSource: 'ADMIN_REVIEW',
        adminNotes,
      })
      setVerificationUrl(response.data.verificationUrl)
      setNotice(`Issued ${response.data.certificate.certificateNumber}.`)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Certificate issuance failed.')
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (certificate) => {
    if (credentialsDemoMode) {
      revokeDemoCertificate(certificate.id)
      setCertificates(getDemoCertificates())
      setNotice(`${certificate.certificateNumber} is revoked in demo memory only.`)
      return
    }
    const reason = window.prompt(`Why are you revoking ${certificate.certificateNumber}?`)
    if (!reason) return
    setError('')
    try {
      await adminCredentialAPI.revokeCertificate(certificate.id, reason)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Certificate revocation failed.')
    }
  }

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  if (!credentialsDemoMode && authLoading) return <main className="admin-credentials"><div className="container">Loading…</div></main>
  if (!credentialsDemoMode && user?.role !== 'admin') return <main className="admin-credentials"><div className="container"><h1>Administrator access required</h1></div></main>

  return (
    <main className="admin-credentials">
      <div className="container">
        {credentialsDemoMode && <CredentialsDemoBar onReset={loadData} />}
        <header className="admin-credentials__header">
          <div><span className="achievements-eyebrow">ADMINISTRATION</span><h1>Course certificates</h1><p>Manually verify completion evidence before issuing a credential.</p></div>
          <Link to="/admin/documents">Manage student documents →</Link>
        </header>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        {notice && <div className="admin-success" role="status">{notice} {verificationUrl && <a href={verificationUrl} target="_blank" rel="noreferrer">Verify certificate</a>}</div>}

        <section className="admin-panel">
          <h2>Issue a certificate</h2>
          <p className="admin-help">{credentialsDemoMode ? 'DEMO ONLY: sample completion reviews and in-memory interactions. This form cannot issue real certificates.' : 'Course progress is not currently an authoritative completion source. Record only completion you have independently reviewed.'}</p>
          {credentialsDemoMode && (
            <div className="admin-demo-reviews">
              <strong>Sample completion reviews (not authoritative)</strong>
              {DEMO_COMPLETION_REVIEWS.map((review) => {
                const reviewStudent = DEMO_STUDENTS.find((item) => item.id === review.studentId)
                const reviewCourse = DEMO_COURSES.find((item) => item.slug === review.courseSlug)
                return (
                  <button
                    key={review.studentId}
                    type="button"
                    onClick={() => {
                      setStudent(reviewStudent)
                      setCourseSlug(review.courseSlug)
                      setAdminNotes(review.evidence)
                    }}
                  >
                    {reviewStudent.name} · {reviewCourse.title} — {review.evidence}
                  </button>
                )
              })}
            </div>
          )}
          <form onSubmit={findStudents} className="admin-search-form">
            <label>Find student by name or email<input value={search} onChange={(event) => setSearch(event.target.value)} minLength="2" placeholder="Search at least two characters" /></label>
            <button type="submit" className="btn-primary">Search students</button>
          </form>
          {students.length > 0 && (
            <label className="admin-field">Student
              <select value={student?.id || ''} onChange={(event) => setStudent(students.find((item) => item.id === event.target.value) || null)}>
                <option value="">Select a student</option>
                {students.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.email}</option>)}
              </select>
            </label>
          )}
          {student && <p className="admin-selected">Selected recipient: <strong>{student.name}</strong> ({student.email})</p>}
          <form onSubmit={issueCertificate} className="admin-issue-form">
            <label className="admin-field">Licensed course
              <select value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)} required>
                <option value="">Select a course</option>
                {courses.map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}
              </select>
            </label>
            <label className="admin-field">Completion date
              <input type="date" value={completionDate} max={today()} onChange={(event) => setCompletionDate(event.target.value)} required />
            </label>
            <label className="admin-field admin-field--wide">Completion evidence / review notes
              <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} maxLength="1000" rows="3" placeholder="Describe the evidence reviewed (private admin note)." />
            </label>
            <div className="admin-actions admin-field--wide">
              <button type="button" className="btn-secondary" disabled={busy || !student || !courseSlug} onClick={previewCertificate}>Preview PDF</button>
              <button type="submit" className="btn-primary" disabled={busy || !student || !courseSlug}>{busy ? 'Working…' : 'Issue certificate'}</button>
            </div>
          </form>
          {previewUrl && (
            <div>
              {credentialsDemoMode && <p className="admin-alert">DEMO PDF — NOT VALID. Preview only; no database or issuance request.</p>}
              <a className="admin-preview-download" href={previewUrl} download="DEMO-NOT-VALID-certificate-preview.pdf">Download {credentialsDemoMode ? 'demo preview' : 'preview'} PDF</a>
              <iframe className="admin-pdf-preview" src={previewUrl} title="Certificate preview (not issued)" />
            </div>
          )}
        </section>

        <section className="admin-panel">
          <h2>Recently issued certificates</h2>
          {certificates.length === 0 ? <p className="admin-help">No certificates have been issued.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Student</th><th>Course</th><th>Certificate ID</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>{certificates.map((certificate) => (
                  <tr key={certificate.id}>
                    <td>{certificate.recipientName}<small>{certificate.user?.email}</small></td>
                    <td>{certificate.courseTitle}</td>
                    <td>{certificate.certificateNumber}</td>
                    <td>{certificate.status}</td>
                    <td>{certificate.status === 'ISSUED' && <button className="admin-text-button" type="button" onClick={() => revoke(certificate)}>Revoke</button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
