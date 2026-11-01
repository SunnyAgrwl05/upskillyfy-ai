import { Plus, Trash2, GripVertical } from 'lucide-react'
import './VisualResumeEditor.css'

const defaultEntry = () => ({ name: '', description: '', details: '', status: '' })

function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <textarea rows={2} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
    case 'bullets':
      return <>
        <input type="text" placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
        <textarea rows={2} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
      </>
    case 'toggle':
      return <label className="toggle-label"><input type="checkbox" checked={!!field.value} onChange={e => onChange(e.target.checked)}/> {field.label}</label>
    default:
      return <input type={field.type} placeholder={field.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />
  }
}

function SectionEditor({ title, icon, children }) {
  return (
    <div className="visual-section">
      <div className="visual-section-header">
        <span className="visual-section-title">
          {icon && <span className="visual-section-icon">{icon}</span>}
          {title}
        </span>
        {children}
      </div>
    </div>
  )
}

export default function VisualResumeEditor({ data, onChange, title = 'Visual Editor' }) {
  const updateList = (key, index, field, value) => {
    onChange(current => {
      const list = current[key] || []
      if (!Array.isArray(list)) return current
      const next = list.map((row, i) => i === index ? { ...row, [field]: value } : row)
      return { ...current, [key]: next }
    })
  }

  const addItem = key => {
    onChange(current => {
      const base = defaultEntry()
      const next = [...(current[key] || []), base]
      return { ...current, [key]: next }
    })
  }

  const removeItem = (key, index) => {
    onChange(current => {
      const list = current[key] || []
      if (!Array.isArray(list)) return current
      if (list.length === 1) return current // keep at least one entry so visual mode always shows something
      return { ...current, [key]: list.filter((_, i) => i !== index) }
    })
  }
  const moveSection = (index, dir) => {
    const sections = ['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'leadership', 'languages', 'optionalSections']
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    onChange(current => {
      const order = [...(data.order || sections)]
      const aIdx = order.indexOf(sections[index])
      const bIdx = order.indexOf(sections[target])
      if (bIdx < 0 || aIdx < 0 || bIdx === aIdx) return current
      const nextOrder = [...order]
      if (dir === -1) {
        nextOrder.splice(aIdx, 1); nextOrder.splice(bIdx, 0, sections[index])
      } else {
        nextOrder.splice(bIdx, 1); nextOrder.splice(aIdx, 0, sections[target])
      }
      return { ...current, order: nextOrder }
    })
  }

  const sections = [
    { key: 'personal', title: 'Personal Information', icon: '👤',
      fields: [
        { type: 'text', label: 'Full Name', placeholder: 'Jane Doe' },
        { type: 'text', label: 'Target Role / Title', placeholder: 'Software Engineer' },
        { type: 'email', label: 'Email', placeholder: 'jane@example.com' },
        { type: 'tel', label: 'Phone', placeholder: '+1 555 123 4567' },
        { type: 'text', label: 'Location / City', placeholder: 'San Francisco, CA' },
        { type: 'text', label: 'Links (LinkedIn, GitHub, portfolio, etc.)', placeholder: 'linkedin.com/in/jane, github.com/jane' },
      ]},
    { key: 'summary', title: 'Professional Summary', icon: '📝',
      fields: [{ type: 'textarea', label: 'Summary', placeholder: 'Summarize your role, experience, and strongest outcomes.' }] },
    { key: 'experience', title: 'Work Experience & Internships', icon: '💼',
      fields: [
        { type: 'text', label: 'Role', placeholder: 'Software Engineer' },
        { type: 'text', label: 'Company / Organization', placeholder: 'Acme Corp' },
        { type: 'text', label: 'Dates', placeholder: '2023 – Present' },
        { type: 'bullets', label: 'Achievements, one per line', placeholder: 'Built a reporting workflow that reduced weekly processing time by 30%' },
      ]},
    { key: 'education', title: 'Education', icon: '🎓',
      fields: [
        { type: 'text', label: 'Degree', placeholder: 'B.S. Computer Science' },
        { type: 'text', label: 'Institution', placeholder: 'University of California' },
        { type: 'text', label: 'Dates', placeholder: '2020 – 2024' },
        { type: 'toggle', label: 'Include GPA?', value: true },
        { type: 'text', label: 'GPA (optional)', placeholder: '3.8' },
      ]},
    { key: 'projects', title: 'Projects', icon: '🚀',
      fields: [
        { type: 'text', label: 'Project Name', placeholder: 'Open Source Auth Library' },
        { type: 'text', label: 'Link (GitHub, portfolio)', placeholder: 'github.com/example/auth' },
        { type: 'bullets', label: 'Description & impact, one per line', placeholder: 'Improved authentication response time by 40%' },
      ]},
    { key: 'skills', title: 'Technical Skills', icon: '⚙️',
      fields: [{ type: 'text', label: 'Skills (comma-separated)', placeholder: 'JavaScript, React, Node.js, SQL' }] },
    { key: 'certifications', title: 'Certifications', icon: '🏅',
      fields: [
        { type: 'text', label: 'Certification Name', placeholder: 'AWS Solutions Architect' },
        { type: 'text', label: 'Issuing Organization', placeholder: 'Amazon Web Services' },
        { type: 'text', label: 'Date Earned', placeholder: '2024' },
      ]},
    { key: 'achievements', title: 'Achievements & Competitive Programming', icon: '🏆',
      fields: [{ type: 'bullets', label: 'Achievements, one per line', placeholder: 'Won 1st place in HackerRank Category Coding Challenge' }] },
    { key: 'leadership', title: 'Leadership, Volunteering & Extracurriculars', icon: '🤝',
      fields: [{ type: 'bullets', label: 'Activities, one per line', placeholder: 'Organized a volunteer team that raised $5K for school STEM club' }] },
    { key: 'languages', title: 'Languages', icon: '🌐',
      fields: [{ type: 'text', label: 'Languages (comma-separated)', placeholder: 'English, Spanish, Mandarin' }] },
    { key: 'optionalSections', title: 'Optional Sections', icon: '🔌',
      fields: [
        { type: 'toggle', label: 'Include hobbies section?', value: true },
        { type: 'bullets', label: 'Hobbies, one per line (if included)', placeholder: 'Running, hiking, reading' },
        { type: 'toggle', label: 'Include hobbies label?', value: true },
      ]},
  ]

  return (
    <div className="visual-resume-editor">
      <h2 className="visual-resume-title">{title}</h2>
      <div className="visual-resume-sections">
        {sections.map((section, sIndex) => {
          const items = Array.isArray(data[section.key]) ? data[section.key] : []
          const hasItems = items.length > 0
          return (
            <div className="visual-section-wrap" key={section.key}>
              <SectionEditor title={section.title} icon={section.icon}>
                <div className="visual-section-actions">
                  <button className="visual-move-up" disabled={!hasItems || sIndex === 0} title="Move section up" onClick={() => moveSection(sIndex, -1)}>↑</button>
                  <span className="visual-grip"><GripVertical size={13}/></span>
                  <button className="visual-move-down" disabled={!hasItems || sIndex === sections.length - 1} title="Move section down" onClick={() => moveSection(sIndex, 1)}>↓</button>
                  <button className="visual-add-item" disabled={false} title="Add entry" onClick={() => addItem(section.key)}>
                    <Plus size={14}/> Add {section.title.toLowerCase()}
                  </button>
                </div>
                {hasItems ? items.map((entry, eIndex) => (
                  <div className="visual-entry" key={`${section.key}-${eIndex}`}>
                    <div className="visual-entry-tools">
                      <button className="visual-remove-item" title="Remove this entry" onClick={() => removeItem(section.key, eIndex)}><Trash2 size={13}/></button>
                    </div>
                    {Array.isArray(section.fields) && section.fields.map((field, fIndex) => (
                      field.type === 'bullets' ?
                        <>
                          <label className="visual-field-label">{field.label}</label>
                          <input type="text" placeholder={field.placeholder} value={entry.name || entry.description || ''} onChange={e => updateList(section.key, eIndex, fIndex === 0 ? 'name' : fIndex, e.target.value)} />
                          <textarea rows={2} placeholder={field.placeholder} value={entry.details || ''} onChange={e => updateList(section.key, eIndex, fIndex === 0 ? 'details' : fIndex + 1, e.target.value)} />
                        </> :
                        <>
                          <label className="visual-field-label">{field.label}</label>
                          <FieldInput field={field} value={entry.name || entry.description || entry.details || ''} onChange={v => updateList(section.key, eIndex, fIndex, v)} />
                        </>
                    ))}
                  </div>
                )) : (
                  <p className="visual-empty-hint">No entries yet. Click "Add {section.title.toLowerCase()}" to start.</p>
                )}
              </SectionEditor>
            </div>
          )
        })}
      </div>
    </div>
  )
}
