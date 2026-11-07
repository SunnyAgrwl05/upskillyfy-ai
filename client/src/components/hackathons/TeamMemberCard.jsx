import UserRound from 'lucide-react/dist/esm/icons/user-round.mjs'

export default function TeamMemberCard({ member, leader }) {
  const name = member?.name || member?.email || 'Participant'
  return <div className="team-member-card"><div className="team-member-avatar"><UserRound size={18} /></div><div><strong>{name}</strong><span>{leader ? 'Team leader' : member?.role || 'Member'}</span></div></div>
}
