import { Link } from 'react-router-dom'

export default function ITConsulting() {
  return (
    <div>
      <section className="ph" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Technology Consulting</div>
          <h1 className="h1" style={{ marginBottom: 12, color: 'var(--text-h)' }}><span className="grad">IT Consulting</span></h1>
          <p className="lead" style={{ color: 'var(--muted)' }}>Helping startups and businesses make the right technology decisions for sustainable growth.</p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="g2" style={{ gap: 48, alignItems: 'center', marginBottom: 64 }}>
            <div>
              <div className="eyebrow">Our Approach</div>
              <h2 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Strategy first. Technology second.</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>
                We work closely with your team to understand your business goals, then map technology to those goals. Every recommendation is backed by practical experience and real-world constraints.
              </p>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                Whether you're a startup choosing your first tech stack or an enterprise modernizing legacy systems, our consulting approach ensures you get the right solution.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link to="/contact" className="btn-primary">Book Consultation →</Link>
              </div>
            </div>
            <div>
              <div className="term-card" style={{ marginLeft: 0, maxWidth: '100%' }}>
                <div className="term-bar">
                  <div className="tdot tr"></div>
                  <div className="tdot ty"></div>
                  <div className="tdot tg"></div>
                  <div className="term-title">upskillyfy-consulting.json</div>
                </div>
                <div className="term-body">
                  <div className="t-row">
                    <span className="t-prompt">{'>'}</span>
                    <span className="t-cmd">Understand business goals</span>
                  </div>
                  <div className="t-row">
                    <span className="t-prompt">{'>'}</span>
                    <span className="t-cmd">Assess current technology</span>
                  </div>
                  <div className="t-row">
                    <span className="t-prompt">{'>'}</span>
                    <span className="t-comment">// Map strategy to stack</span>
                  </div>
                  <div className="t-row">
                    <span className="t-prompt">{'>'}</span>
                    <span className="t-cmd">Define roadmap & KPIs</span>
                  </div>
                  <div className="t-row">
                    <span className="t-prompt">{'>'}</span>
                    <span className="t-cmd">Execute & iterate</span>
                  </div>
                  <div className="t-foot">
                    <div>
                      <div className="t-foot-l">Consulting Process</div>
                      <div className="t-foot-n">5-stage methodology</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" style={{ background: 'var(--bg-alt)' }}>
        <div className="container">
          <div className="sec-head">
            <h2 style={{ marginBottom: 40, color: 'var(--text-h)' }}>Consulting Services</h2>
          </div>
          <div className="g2" style={{ gap: 24 }}>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🚀</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Startup Consulting</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Tech Stack Selection</li>
                <li>MVP Planning & Development</li>
                <li>Product Roadmap</li>
                <li>Team Building Guidance</li>
                <li>Scaling Strategy</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🔄</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Digital Transformation</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Business Process Automation</li>
                <li>Legacy System Migration</li>
                <li>Cloud Adoption Strategy</li>
                <li>Workflow Optimization</li>
                <li>Digital Roadmap</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>📊</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Technology Strategy</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>IT Budget Planning</li>
                <li>Technology Assessment</li>
                <li>Software Architecture Review</li>
                <li>Build vs Buy Analysis</li>
                <li>Risk Management</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🤖</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>AI Consulting</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>AI Readiness Assessment</li>
                <li>AI Integration Strategy</li>
                <li>Automation Opportunities</li>
                <li>Data Analytics Planning</li>
                <li>MLOps Consulting</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>☁️</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Cloud Migration</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Cloud Readiness Assessment</li>
                <li>Migration Strategy</li>
                <li>Platform Selection</li>
                <li>Cost Optimization</li>
                <li>Security Planning</li>
              </ul>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
              <div className="card-ico" style={{ fontSize: '2rem' }}>🔐</div>
              <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Cybersecurity Consulting</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Security Assessment</li>
                <li>Risk Analysis</li>
                <li>Compliance Guidance</li>
                <li>Security Architecture</li>
                <li>Best Practices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="cta-band" style={{ margin: 0, background: 'var(--cta-bg)', borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12, color: 'var(--text-h)' }}>Ready for expert guidance?</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Let's discuss your technology strategy.</p>
            <Link to="/contact" className="btn-primary">Book Consultation →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}