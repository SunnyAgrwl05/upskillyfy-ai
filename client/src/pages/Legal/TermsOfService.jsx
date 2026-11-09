import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return <main className="legal-page">
    <div className="legal-page-inner">
      <p className="legal-eyebrow">UPSKILLYFY AI · POLICY VERSION 2026-11-09</p>
      <h1>Terms of Service</h1>
      <p className="legal-intro">By creating an account or using Upskillyfy AI, you agree to use the service responsibly and in accordance with these terms.</p>
      <section className="legal-section"><h2>Accounts</h2><p>Provide accurate account information, keep your login credentials confidential and notify the service operator if you suspect unauthorized access. You are responsible for activity performed through your account.</p></section>
      <section className="legal-section"><h2>Resume and AI tools</h2><p>Resume analysis is automated assistance, not a guarantee of employment, ATS acceptance or factual verification. Review generated suggestions and verify all education, employment, certification and achievement claims yourself. Do not upload documents unless you have the right to share their contents for processing.</p></section>
      <section className="legal-section"><h2>Your content</h2><p>You retain responsibility for the documents and project content you submit. You must not upload unlawful content, malicious files, or information you are not authorized to share. Saved projects and analysis are associated with your account and should be deleted when no longer needed.</p></section>
      <section className="legal-section"><h2>Acceptable use</h2><p>Do not attempt to disrupt, reverse engineer, abuse or gain unauthorized access to the service, other accounts or connected infrastructure.</p></section>
      <section className="legal-section"><h2>Availability and changes</h2><p>Features may change as the platform develops. The service is provided on an as-available basis and may be interrupted for maintenance, security or operational reasons.</p></section>
      <section className="legal-section"><h2>Contact</h2><p>For questions about these terms, use the <Link to="/contact">Contact page</Link>.</p></section>
      <p className="legal-footnote">These draft terms require review by the service operator and qualified counsel before being treated as final legal terms.</p>
      <Link to="/register">Back to create account</Link>
    </div>
  </main>
}
