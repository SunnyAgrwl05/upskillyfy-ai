const STATUS_LABELS = {
  registration_open: 'Registration open',
  live: 'Live now',
  ended: 'Ended',
  results_published: 'Results published',
}

export default function HackathonStatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status?.replaceAll('_', ' ') || 'Status unavailable'
  const tone = status === 'live' ? 'live' : status === 'ended' ? 'ended' : status === 'results_published' ? 'results' : 'open'

  return <span className={`hackathon-status hackathon-status-${tone}`}>{label}</span>
}
