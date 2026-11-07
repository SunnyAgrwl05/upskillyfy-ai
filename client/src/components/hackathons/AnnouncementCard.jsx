import Megaphone from 'lucide-react/dist/esm/icons/megaphone.mjs'

export default function AnnouncementCard({ announcement }) {
  return <article className="announcement-card"><Megaphone size={18} /><div><span>{announcement?.publishedAt ? new Date(announcement.publishedAt).toLocaleDateString() : 'Announcement'}</span><h3>{announcement?.title || 'Organizer update'}</h3><p>{announcement?.content || 'No announcement content available.'}</p></div></article>
}
