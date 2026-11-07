import LockKeyhole from 'lucide-react/dist/esm/icons/lock-keyhole.mjs'

export default function BackendIntegrationPending({ title = 'Backend integration pending', description = 'This area is designed for the documented platform workflow and will activate when its API is available.' }) {
  return (
    <div className="hackathon-pending" role="status">
      <LockKeyhole size={22} aria-hidden="true" />
      <div><strong>{title}</strong><p>{description}</p></div>
    </div>
  )
}
