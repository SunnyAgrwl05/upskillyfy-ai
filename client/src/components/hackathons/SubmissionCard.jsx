import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import CheckCircle2 from 'lucide-react/dist/esm/icons/circle-check.mjs'

export default function SubmissionCard({ submission }) {
  return <article className="submission-card"><div><span className="hackathon-kicker">Submission history</span><h3>{submission?.title || 'Untitled project'}</h3><p>{submission?.description || 'No description provided.'}</p><small>{submission?.updatedAt ? new Date(submission.updatedAt).toLocaleString() : 'Saved submission'}</small></div><span className={`submission-status ${submission?.isDraft ? 'draft' : 'submitted'}`}>{submission?.isDraft ? <Upload size={14} /> : <CheckCircle2 size={14} />}{submission?.isDraft ? 'Draft' : 'Submitted'}</span></article>
}
