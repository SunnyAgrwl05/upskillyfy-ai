import { NavLink } from 'react-router-dom'
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.mjs'
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import Award from 'lucide-react/dist/esm/icons/award.mjs'
import Bell from 'lucide-react/dist/esm/icons/bell.mjs'
import UserCircle from 'lucide-react/dist/esm/icons/user-circle.mjs'

const ITEMS = [
  ['dashboard', 'Overview', LayoutDashboard],
  ['my-hackathons', 'My Hackathons', CalendarDays],
  ['my-teams', 'My Teams', Users],
  ['submissions', 'Submissions', Upload],
  ['certificates', 'Certificates', Award],
  ['notifications', 'Notifications', Bell],
  ['profile', 'Profile & portfolio', UserCircle],
]

export default function DashboardSidebar() {
  return <aside className="hackathon-dashboard-sidebar"><div className="hackathon-sidebar-label">Participant portal</div>{ITEMS.map(([path, label, Icon]) => <NavLink key={path} to={`/hackathons/${path === 'dashboard' ? 'dashboard' : path === 'my-hackathons' ? 'my-registrations' : path}`} end><Icon size={17} />{label}</NavLink>)}</aside>
}
