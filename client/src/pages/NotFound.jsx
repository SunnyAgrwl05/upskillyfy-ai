import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>The page you requested does not exist or may have moved.</p>
        <Link className="btn-primary" to="/">Return home</Link>
      </div>
    </main>
  )
}
