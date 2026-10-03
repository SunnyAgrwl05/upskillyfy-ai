import { Link } from 'react-router-dom'

export default function AIAutomation() {
  return (
    <div>
      <section className="ph" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>AI Solutions</div>
          <h1 className="h1" style={{ marginBottom: 12, color: 'var(--text-h)' }}><span className="grad">AI Automation</span></h1>
          <p className="lead" style={{ color: 'var(--muted)' }}>From intelligent chatbots to business automation and data analytics — we bring AI to your workflow.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, background: 'var(--bg)' }}>
        <div className="container">
          <div className="g2" style={{ gap: 48, alignItems: 'center', marginBottom: 48 }}>
            <div>
              <div className="eyebrow">Intelligent Automation</div>
              <h2 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Let AI handle the repetitive work.</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                Upskillyfy builds AI-powered solutions that automate repetitive tasks, enhance customer interactions, and turn data into actionable insights. From chatbots to predictive analytics, we help you work smarter.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link to="/contact" className="btn-primary">Explore AI Solutions →</Link>
              </div>
            </div>
            <div>
              <div className="card" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤖</div>
                <h3 style={{ marginBottom: 12, color: 'var(--text-h)' }}>AI-Powered Workflow</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>
                  Intelligent automation that learns, adapts, and scales with your business needs.
                </p>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="bdg bdg-p">Chatbots</span>
                  <span className="bdg bdg-b">Automation</span>
                  <span className="bdg bdg-g">Analytics</span>
                  <span className="bdg bdg-o">Integration</span>
                </div>
              </div>
            </div>
          </div>

          <div className="g4" style={{ gap: 20 }}>
            {[
              { icon: '🤖', title: 'AI Chatbots', desc: 'Customer Support Bots, Lead Generation Bots, WhatsApp Chatbots, Telegram Bots, Multi-language Bots' },
              { icon: '⚡', title: 'Business Automation', desc: 'Workflow Automation, Email Automation, CRM Automation, Invoice Processing, Report Generation' },
              { icon: '📊', title: 'Data Analytics', desc: 'BI Dashboards, Data Visualization, Sales Analytics, KPI Tracking, Predictive Analytics' },
              { icon: '🧠', title: 'AI Integration', desc: 'OpenAI / Gemini API, AI-powered Search, Content Generation, Image Recognition, Recommendation Systems' },
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
            <h2 style={{ marginBottom: 40, color: 'var(--text-h)' }}>AI Integration Stack</h2>
          </div>
          <div className="g2" style={{ gap: 24, alignItems: 'start' }}>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', padding: 24 }}>
              <h3 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Technology Stack</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['OpenAI', 'Advanced language models and generative AI'],
                  ['Gemini', 'Google AI for multimodal intelligence'],
                  ['Python', 'Machine learning and data science'],
                  ['TensorFlow', 'Deep learning model development'],
                  ['PyTorch', 'Neural network research and production'],
                  ['MLOps', 'Model deployment and monitoring'],
                ].map(([name, desc], i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, color: 'var(--accent)' }}>{i + 1}</div>
                    <div>
                      <strong style={{ color: 'var(--text-h)' }}>{name}</strong>
                      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ background: 'var(--bg)', borderColor: 'var(--border)', padding: 24 }}>
              <h3 style={{ marginBottom: 20, color: 'var(--text-h)' }}>Use Cases</h3>
              <ul className="slist" style={{ color: 'var(--muted)', fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li>Customer support automation</li>
                <li>Lead qualification and scoring</li>
                <li>Document processing</li>
                <li>Predictive maintenance</li>
                <li>Personalized recommendations</li>
                <li>Business intelligence dashboards</li>
              </ul>
              <div style={{ marginTop: 28 }}>
                <Link to="/contact" className="btn-g" style={{ display: 'inline-flex' }}>Discuss Your Use Case →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="cta-band" style={{ margin: 0, background: 'var(--cta-bg)', borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12, color: 'var(--text-h)' }}>Ready to automate?</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Transform your workflow with AI.</p>
            <Link to="/contact" className="btn-primary">Get Started →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}