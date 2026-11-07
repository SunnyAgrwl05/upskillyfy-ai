import AlertCircle from 'lucide-react/dist/esm/icons/circle-alert.mjs'

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="hackathon-empty-state hackathon-error-state" role="alert">
      <AlertCircle size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button type="button" className="btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  )
}
