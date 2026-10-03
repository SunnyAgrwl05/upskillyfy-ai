import { useState } from 'react'
import { Link } from 'react-router-dom'

const BRANCHES = {
  CSE: [{ e: '🌐', t: 'Web Dev Roadmap', d: 'React, Node.js, MongoDB full-stack guide' }, { e: '🤖', t: 'AI/ML Resources', d: 'Python, TensorFlow, Scikit-learn, projects' }, { e: '🧠', t: 'DSA Sheets', d: '450+ curated problems for placements' }, { e: '☁️', t: 'Cloud Computing', d: 'AWS, GCP, Azure fundamentals & certifications' }],
  ECE: [{ e: '🔌', t: 'Embedded Systems', d: 'Microcontrollers, Arduino, Raspberry Pi' }, { e: '📡', t: 'IoT Development', d: 'MQTT, sensors, cloud integration' }, { e: '🔧', t: 'VLSI Design', d: 'Verilog, VHDL, digital design basics' }, { e: '📻', t: 'Communication Systems', d: 'Digital comms, signal processing' }],
  ME: [{ e: '📐', t: 'CAD Software', d: 'SolidWorks, AutoCAD, CATIA tutorials' }, { e: '🔬', t: 'FEA & Simulation', d: 'ANSYS, simulation basics, structural analysis' }, { e: '🏭', t: 'Manufacturing', d: 'CNC, 3D Printing, manufacturing processes' }, { e: '⚡', t: 'EV Technology', d: 'Electric vehicle systems and components' }],
  EE: [{ e: '⚡', t: 'Power Systems', d: 'Generation, transmission, distribution' }, { e: '🔋', t: 'Renewable Energy', d: 'Solar, wind energy design and systems' }, { e: '🎛️', t: 'Control Systems', d: 'PID, MATLAB, Simulink control design' }, { e: '📊', t: 'Electrical Machines', d: 'Motors, transformers, drives' }],
  Civil: [{ e: '🏗️', t: 'AutoCAD & Revit', d: '2D drafting, BIM fundamentals' }, { e: '🧱', t: 'Structural Analysis', d: 'Load analysis, structural design basics' }, { e: '📋', t: 'Project Management', d: 'Construction planning, estimation' }, { e: '🌍', t: 'Environmental Engg', d: 'Water treatment, environmental impact' }],
  MBA: [{ e: '📈', t: 'Marketing Fundamentals', d: 'Digital marketing, consumer behavior' }, { e: '💰', t: 'Finance', d: 'Financial modeling, investment analysis' }, { e: '👥', t: 'HR Management', d: 'Talent acquisition, organizational behavior' }, { e: '📊', t: 'Business Analytics', d: 'Excel, Tableau, data-driven decisions' }],
}

export default function Resources() {
  const [active, setActive] = useState('CSE')
  return (
    <div>
      <section className="ph">
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>Learning Hub</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>Branch-wise <span className="grad">Resources</span></h1>
          <p className="lead">Curated courses, notes, projects and certifications sorted by your branch.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="ftabs" style={{ justifyContent: 'center', marginBottom: 48 }}>
            {Object.keys(BRANCHES).map(b => <button key={b} className={`ftab${active === b ? ' on' : ''}`} onClick={() => setActive(b)}>{b}</button>)}
          </div>
          <div className="g2">
            {BRANCHES[active].map((r, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{r.e}</div>
                <div><h3>{r.t}</h3><p style={{ marginTop: 8, fontSize: '.87rem' }}>{r.d}</p><Link to="/contact" className="btn-g btn-xs" style={{ marginTop: 14, display: 'inline-flex' }}>Access →</Link></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}