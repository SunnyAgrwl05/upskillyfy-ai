import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import House from 'lucide-react/dist/esm/icons/house.mjs'
import Menu from 'lucide-react/dist/esm/icons/menu.mjs'
import X from 'lucide-react/dist/esm/icons/x.mjs'
import UserCircle from 'lucide-react/dist/esm/icons/user-circle.mjs'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './HackathonPortalShell.css'

const navigation = [
  ['/hackathons', 'Home'],
  ['/hackathons/all', 'All Hackathons'],
  ['/hackathons/my-registrations', 'My Registrations'],
  ['/hackathons/my-teams', 'My Teams'],
  ['/hackathons/dashboard', 'Dashboard'],
  ['/hackathons/profile', 'My Profile'],
]

export default function HackathonLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/hackathons' || location.pathname === '/community/hackathons'

  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="hackathon-portal-app">
      <header className="hackathon-portal-header">
        <div className="hackathon-portal-header-inner">
          <Link className="hackathon-portal-brand" to="/hackathons" onClick={() => setOpen(false)}>
            <span className="hackathon-portal-mark">U</span>
            <span><strong>Upskillyfy</strong><small>Hackathons</small></span>
          </Link>
          <button className="hackathon-portal-menu" type="button" aria-label={open ? 'Close portal navigation' : 'Open portal navigation'} aria-expanded={open} onClick={() => setOpen(value => !value)}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`hackathon-portal-nav${open ? ' is-open' : ''}`} aria-label="Hackathon portal">
            {navigation.map(([to, label]) => <NavLink key={to} to={to} end={to === '/hackathons'} onClick={() => setOpen(false)}>{label}</NavLink>)}
          </nav>
          <div className="hackathon-portal-actions">
            <Link className="hackathon-main-website" to="/" aria-label="Visit the main Upskillyfy website"><House size={17} /><span>Main Website</span></Link>
            <Link className="hackathon-portal-search" to="/hackathons/all" aria-label="Search hackathons"><Search size={18} /></Link>
            {user ? <Link className="hackathon-portal-account" to="/hackathons/dashboard"><UserCircle size={18} /><span>{user.name?.split(' ')[0] || 'Account'}</span></Link> : <Link className="hackathon-portal-login" to="/hackathons/login">Log in</Link>}
          </div>
        </div>
      </header>
      <div className="hackathon-portal-back-row">
        <div className="container">
          <button className="hackathon-portal-back" type="button" onClick={goBack}>
            <ArrowLeft size={17} aria-hidden="true" />
            <span>Back</span>
          </button>
        </div>
      </div>
      {!isLanding && <div className="hackathon-portal-breadcrumb"><div className="container"><Link to="/hackathons">Hackathons</Link><span>/</span><strong>{location.pathname.includes('/all') ? 'All Hackathons' : location.pathname.includes('/dashboard') ? 'Dashboard' : location.pathname.includes('/profile') ? 'My Profile' : 'Participant space'}</strong></div></div>}
      <Outlet />
    </div>
  )
}
