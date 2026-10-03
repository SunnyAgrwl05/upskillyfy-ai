import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { communityAPI } from '../../api'

const FALLBACK = [
  { _id: '1', title: 'DSA Bootcamp', type: 'Workshop', description: 'Intensive 2-week DSA training with live sessions and problem-solving practice.', date: 'July 2026', mode: 'Online' },
  { _id: '2', title: 'HackUpskillyfy 2026', type: 'Hackathon', description: '48-hour hackathon. Cash prizes + internship offers.', date: 'August 2026', mode: 'Hybrid' },
  { _id: '3', title: 'Placement Prep Webinar', type: 'Webinar', description: 'Weekly sessions on aptitude, coding and HR rounds.', date: 'Every Saturday', mode: 'Online' },
  { _id: '4', title: 'Web Dev Workshop', type: 'Workshop', description: 'Hands-on React.js workshop. Build 3 projects in 3 days.', date: 'July 2026', mode: 'Online' },
  { _id: '5', title: 'AI for Students Summit', type: 'Summit', description: 'Industry leaders on AI careers and opportunities.', date: 'September 2026', mode: 'Hybrid' },
  { _id: '6', title: 'Startup Pitch Night', type: 'Event', description: 'Students pitch startup ideas to investors and mentors.', date: 'October 2026', mode: 'Offline' },
]

const TYPE_COLOR = { Workshop: 'bdg-b', Hackathon: 'bdg-p', Webinar: 'bdg-c', Summit: 'bdg-o', Event: 'bdg-g' }
const EMOJIS = { Workshop: '🎯', Hackathon: '🏆', Webinar: '💼', Summit: '🤖', Event: '🚀' }

export default function Events() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    communityAPI.getAll().then(r => setEvents(r.data)).catch(() => setEvents(FALLBACK))
  }, [])

  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Community</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Events & <span className="grad">Programs</span></h1>
          <p className="lead">Workshops, hackathons, webinars and community meetups — stay connected and keep growing.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="g3">
            {(events.length ? events : FALLBACK).map((e, i) => (
              <div key={e._id || i} className="card">
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{EMOJIS[e.type] || '🎯'}</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span className={`bdg ${TYPE_COLOR[e.type] || 'bdg-b'}`}>{e.type}</span>
                  <span className="bdg bdg-c">{e.mode}</span>
                </div>
                <h3>{e.title}</h3>
                <p style={{ margin: '8px 0' }}>{e.description}</p>
                <div style={{ fontSize: '.8rem', color: 'var(--faint2)', marginTop: 10 }}>📅 {e.date}</div>
                <Link to="/contact" className="btn-primary btn-sm" style={{ marginTop: 16, display: 'inline-flex' }}>Register →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}