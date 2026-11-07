import { NavLink } from 'react-router-dom'
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.mjs'
import Map from 'lucide-react/dist/esm/icons/map.mjs'
import UserRoundPlus from 'lucide-react/dist/esm/icons/user-round-plus.mjs'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Flag from 'lucide-react/dist/esm/icons/flag.mjs'
import Upload from 'lucide-react/dist/esm/icons/upload.mjs'
import FolderOpen from 'lucide-react/dist/esm/icons/folder-open.mjs'
import MessagesSquare from 'lucide-react/dist/esm/icons/messages-square.mjs'
import Megaphone from 'lucide-react/dist/esm/icons/megaphone.mjs'
import Trophy from 'lucide-react/dist/esm/icons/trophy.mjs'

const TABS = [
  ['overview', 'Overview', LayoutDashboard],
  ['roadmap', 'Roadmap', Map],
  ['registration', 'Registration', UserRoundPlus],
  ['team', 'Team Management', Users],
  ['challenges', 'Challenges', Flag],
  ['submissions', 'Submissions', Upload],
  ['resources', 'Resources', FolderOpen],
  ['interactions', 'Discussions', MessagesSquare],
  ['announcements', 'Announcements', Megaphone],
  ['results', 'Results', Trophy],
]

export default function WorkspaceNavigation({ slug }) {
  return <nav className="workspace-tabs" aria-label="Hackathon workspace">{TABS.map(([tab, label, Icon]) => <NavLink key={tab} to={`/hackathons/${encodeURIComponent(slug)}/workspace/${tab}`} end={tab === 'overview'}><Icon size={16} />{label}</NavLink>)}</nav>
}
