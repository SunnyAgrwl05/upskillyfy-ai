import Inbox from 'lucide-react/dist/esm/icons/inbox.mjs'

export default function EmptyState({ title, description, action }) {
  return (
    <div className="hackathon-empty-state">
      <Inbox size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  )
}
