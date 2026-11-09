import { Link } from 'react-router-dom'

const sections = [
  ['Account information', 'Your name, email address, password hash, account role and any profile details you choose to provide are stored in the application database (MongoDB). Passwords are hashed with bcrypt; the original password is not stored.'],
  ['Optional profile details', 'College or university, branch and graduation year are optional profile fields. You can leave them blank and update them later.'],
  ['Resume Analyzer uploads', 'The analyzer accepts PDF files and processes the uploaded file in server memory. The uploaded PDF and extracted raw text are not written to the application database by this analysis route. Extracted text is sent to the AI provider configured by the site operator to generate feedback. Do not upload information you are not comfortable sharing for this processing.'],
  ['Resume analysis history', 'Analysis results are not saved automatically. A signed-in user must select the explicit “Save this analysis to my account history” option before analysis results are retained in the account history. Saved structured analysis can be deleted from the history interface.'],
  ['Resume Builder projects', 'When you explicitly save a Resume Builder project while signed in, its project name and source files are stored in MongoDB and associated with your account. Guest drafts may remain in your browser storage according to the editor implementation.'],
  ['Marketing messages', 'Marketing email consent is optional and off by default. Essential account and security messages may still be sent to operate the service.'],
  ['Account access and deletion', 'Account profile and saved-work controls are being expanded. Until self-service deletion and export controls are available, contact the site operator through the Contact page to request access, correction or deletion. Some records may need to be retained where required for security, legal or operational reasons.'],
  ['Security and third parties', 'The service uses authentication and access controls, but no internet service can promise absolute security. The AI provider and infrastructure providers process information needed to deliver the features. Their own terms and retention practices also apply.'],
]

export default function PrivacyPolicy() {
  return <main className="legal-page">
    <div className="legal-page-inner">
      <p className="legal-eyebrow">UPSKILLYFY AI · POLICY VERSION 2026-11-09</p>
      <h1>Privacy Policy</h1>
      <p className="legal-intro">This page explains what information the current Upskillyfy AI application stores and how resume-related information is handled. Please review it before creating an account or uploading a document.</p>
      {sections.map(([title, body]) => <section className="legal-section" key={title}><h2>{title}</h2><p>{body}</p></section>)}
      <p className="legal-footnote">Questions or requests? Use the <Link to="/contact">Contact page</Link>. This policy should be reviewed by the service operator for the actual deployed vendors, retention periods and applicable legal requirements before production launch.</p>
      <Link to="/register">Back to create account</Link>
    </div>
  </main>
}
