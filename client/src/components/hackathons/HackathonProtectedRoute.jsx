import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function HackathonProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="hackathon-page-shell"><div className="container">Loading your portal...</div></main>
  if (!user) return <Navigate to="/hackathons/login" replace state={{ from: location }} />
  if (admin && user.role !== 'admin') return <Navigate to="/hackathons/dashboard" replace />
  return children
}
