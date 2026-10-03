import { Link } from 'react-router-dom'

const TRACKS = [
  { level: '01', title: 'Foundations', tag: 'Beginner', icon: '🌱', cls: 'ico-g', fill: 100, problems: 120, topics: ['Arrays & Strings', 'Basic Recursion', 'Sorting Algorithms', 'Searching (Binary)', 'Time & Space Complexity', 'Hashing Basics'] },
  { level: '02', title: 'Core Data Structures', tag: 'Intermediate', icon: '🔗', cls: 'ico-b', fill: 65, problems: 150, topics: ['Linked Lists', 'Stacks & Queues', 'Trees & BST', 'Heaps', 'Tries', 'Graphs Intro'] },
  { level: '03', title: 'Advanced Patterns', tag: 'Advanced', icon: '🧠', cls: 'ico-p', fill: 30, problems: 180, topics: ['Dynamic Programming', 'Graph Algorithms', 'Backtracking', 'Greedy Algorithms', 'Segment Trees', 'Advanced DP'] },
]

const SHEETS = [
  { icon: '⭐', title: 'Striver A2Z DSA Sheet', desc: '450+ problems, most comprehensive sheet for placements.' },
  { icon: '🔥', title: 'Love Babbar 450', desc: '450 handpicked DSA questions covering all important topics.' },
  { icon: '💎', title: 'NeetCode 150', desc: '150 curated LeetCode problems for FAANG preparation.' },
  { icon: '🎯', title: 'Company-wise Sheets', desc: 'Google, Microsoft, Amazon, Flipkart specific sets.' },
]

export default function DSAHub() {
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>DSA Hub</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Master <span className="grad">DSA & Algorithms</span></h1>
          <p className="lead">Structured tracks from beginner to advanced — ace your coding interviews and competitive programming.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-head">
            <div className="eyebrow">Learning Tracks</div>
            <h2 className="h2">Choose Your <span className="grad">DSA Track</span></h2>
          </div>
          <div className="g3" style={{ marginBottom: 64 }}>
            {TRACKS.map((t, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div className={`card-ico ${t.cls}`} style={{ marginBottom: 0 }}>{t.icon}</div>
                  <span className="bdg bdg-b">{t.tag}</span>
                </div>
                <div style={{ fontSize: '.7rem', color: 'var(--faint2)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em' }}>TRACK {t.level}</div>
                <h3>{t.title}</h3>
                <p style={{ marginTop: 8, fontSize: '.85rem' }}>{t.topics.slice(0, 4).join(', ')}...</p>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.76rem', color: 'var(--faint2)', marginBottom: 6 }}>
                    <span>{t.problems} problems</span><span>{t.fill}% coverage</span>
                  </div>
                  <div className="prog"><div className="prog-f" style={{ width: `${t.fill}%` }} /></div>
                </div>
                <Link to="/contact" className="btn-g btn-sm" style={{ marginTop: 18, display: 'inline-flex' }}>Start Track →</Link>
              </div>
            ))}
          </div>
          <div className="sec-head">
            <div className="eyebrow">Resources</div>
            <h2 className="h2">Popular <span className="grad">DSA Sheets</span></h2>
          </div>
          <div className="g4">
            {SHEETS.map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontSize: '1rem' }}>{s.title}</h3>
                <p style={{ marginTop: 8, fontSize: '.83rem' }}>{s.desc}</p>
                <Link to="/contact" className="btn-g btn-xs" style={{ marginTop: 16, display: 'inline-flex' }}>Access →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}