import { Link } from 'react-router-dom'

export default function Cloud() {
  return (
    <div>
      <section className="ph" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Cloud Services</div>
          <h1 className="h1" style={{ marginBottom: 12, color: 'var(--text-h)' }}><span className="grad">Cloud & DevOps</span></h1>
          <p className="lead" style={{ color: 'var(--muted)' }}>Scale your applications with reliable cloud setup, CI/CD pipelines and DevOps best practices.</p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="g2" style={{ gap: 48, alignItems: 'center', marginBottom: 48 }}>
            <div>
              <div className="eyebrow">Modern Infrastructure</div>
              <h2 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Build, deploy, and scale with confidence.</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                We help you leverage the full power of cloud computing with expert setup, management, and optimization. From AWS to Kubernetes, we ensure your infrastructure is secure, scalable, and cost-effective.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link to="/contact" className="btn-primary">Get Cloud Consultation →</Link>
              </div>
            </div>
            <div>
              <div className="card" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>☁️</div>
                <h3 style={{ marginBottom: 12, color: 'var(--text-h)' }}>Cloud Platforms</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                  Expertise across major cloud providers.
                </p>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="bdg bdg-b">AWS</span>
                  <span className="bdg bdg-p">Azure</span>
                  <span className="bdg bdg-o">Google Cloud</span>
                </div>
              </div>
            </div>
          </div>

          <div className="g2" style={{ gap: 48, alignItems: 'start', marginBottom: 48 }}>
            <div>
              <div className="eyebrow">DevOps Practices</div>
              <h2 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Automate your delivery pipeline.</h2>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>CI/CD Pipelines</li>
                <li>Docker Containerization</li>
                <li>Kubernetes Orchestration</li>
                <li>GitHub Actions</li>
                <li>Monitoring & Alerts</li>
                <li>Auto Scaling</li>
                <li>Infrastructure as Code</li>
              </ul>
            </div>
            <div>
              <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <div className="card-ico" style={{ fontSize: '2rem' }}>📊</div>
                <h3 style={{ margin: '16px 0 8px', color: 'var(--text-h)' }}>Cloud Benefits</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                  Why move to cloud with expert guidance?
                </p>
                <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                  <li>Scalability on demand</li>
                  <li>Reduced infrastructure costs</li>
                  <li>Improved reliability and uptime</li>
                  <li>Faster time to market</li>
                  <li>Enhanced security and compliance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="g4" style={{ gap: 20 }}>
            {[
              { icon: '☁️', title: 'AWS Services', desc: 'EC2 Setup & Management, S3 Storage, RDS Database, Lambda Functions, CloudFront CDN, IAM Security' },
              { icon: '🔵', title: 'Azure Services', desc: 'Virtual Machines, Azure App Service, Azure DevOps, Blob Storage, Azure Functions, Active Directory' },
              { icon: '🟡', title: 'Google Cloud', desc: 'GCE Compute, Cloud Storage, Firebase Setup, Cloud Run, BigQuery, GKE Kubernetes' },
              { icon: '🔄', title: 'DevOps', desc: 'CI/CD Pipelines, Docker Containerization, Kubernetes Orchestration, GitHub Actions, Monitoring & Alerts, Auto Scaling' },
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

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="cta-band" style={{ margin: 0, background: 'var(--cta-bg)', borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12, color: 'var(--text-h)' }}>Ready for the cloud?</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Let's build your scalable infrastructure.</p>
            <Link to="/contact" className="btn-primary">Get Started →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}