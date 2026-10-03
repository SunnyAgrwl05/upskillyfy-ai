import { Link } from 'react-router-dom'

export default function UIUX() {
  return (
    <div>
      <section className="ph" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Design Services</div>
          <h1 className="h1" style={{ marginBottom: 12, color: 'var(--text-h)' }}><span className="grad">UI/UX Design</span></h1>
          <p className="lead" style={{ color: 'var(--muted)' }}>Beautiful, user-centric designs for websites, apps and brands — from wireframes to final handoff.</p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="g2" style={{ gap: 48, alignItems: 'center', marginBottom: 48 }}>
            <div>
              <div className="eyebrow">User-Centered Design</div>
              <h2 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Design that users love.</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                We create intuitive interfaces that combine aesthetic appeal with seamless usability. Every design decision is grounded in user research and tested with real users to ensure maximum engagement and satisfaction.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link to="/contact" className="btn-primary">Start a Design Project →</Link>
              </div>
            </div>
            <div>
              <div className="card" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎨</div>
                <h3 style={{ marginBottom: 12, color: 'var(--text-h)' }}>Design Disciplines</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                  We work across all aspects of product design.
                </p>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="bdg bdg-b">Website Design</span>
                  <span className="bdg bdg-p">Mobile Design</span>
                  <span className="bdg bdg-o">Brand Identity</span>
                  <span className="bdg bdg-c">UX Research</span>
                  <span className="bdg bdg-c">Component Libraries</span>
                </div>
              </div>
            </div>
          </div>

          <div className="g4" style={{ gap: 20, marginTop: 48 }}>
            {[
              { icon: '🖥️', title: 'Website Design', desc: 'Landing pages, multi-page websites, dashboard design, portfolio design, CMS design' },
              { icon: '📱', title: 'Mobile App Design', desc: 'iOS app design, Android app design, user flow design, onboarding screens, component libraries' },
              { icon: '🎨', title: 'Brand Identity', desc: 'Logo design, color palette, typography system, brand guidelines, social media kit' },
              { icon: '🔬', title: 'UX Research', desc: 'User interviews, usability testing, persona creation, journey mapping, competitive analysis' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <div className="card-ico" style={{ fontSize: '2rem', marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>{item.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" style={{ background: 'var(--bg-alt)' }}>
        <div className="container">
          <div className="sec-head">
            <h2 style={{ marginBottom: 40, color: 'var(--text-h)' }}>Design Process</h2>
          </div>
          <div className="g3" style={{ gap: 32 }}>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: 'var(--text-h)' }}>1. Discover</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                We research your users, business goals, and competitive landscape to find the right opportunities.
            </p>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: 'var(--text-h)' }}>2. Define</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                We create user personas, journey maps, and product requirements that guide every design decision.
            </p>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', padding: 24 }}>
              <h3 style={{ marginBottom: 16, color: 'var(--text-h)' }}>3. Design</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                We create wireframes, prototypes, and high-fidelity designs that balance aesthetics and usability.
            </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="cta-band" style={{ margin: 0, background: 'var(--cta-bg)', borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12, color: 'var(--text-h)' }}>Let's create something beautiful.</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Get in touch to discuss your design project.</p>
            <Link to="/contact" className="btn-primary">Contact Designer →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}