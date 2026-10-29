import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, Plus, Copy, Archive, Trash2, Download, RotateCcw, FileText,
  FolderOpen, Tag, ChevronDown, X,
} from 'lucide-react'
import { resumeProjectAPI } from '../../api'
import {
  readProjects, upsertProject, removeProject, duplicateProject,
  makeProject, timeAgo, downloadBlob, uid,
} from './ovStore'
import './OverleafDashboard.css'

const VIEWS = [
  { id: 'all', label: 'All projects' },
  { id: 'mine', label: 'Your projects' },
  { id: 'archived', label: 'Archived projects' },
  { id: 'trash', label: 'Trashed projects' },
]

export default function OverleafDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState(readProjects)
  const [view, setView] = useState('mine')
  const [tag, setTag] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [sort, setSort] = useState({ key: 'updatedAt', dir: 'desc' })
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  const refresh = () => setProjects(readProjects())
  useEffect(() => {
    const onStorage = () => refresh()
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const allTags = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tags || []))].sort(),
    [projects],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = projects.filter((p) => {
      if (view === 'trash') return p.trashed
      if (p.trashed) return false
      if (view === 'archived') return p.archived
      if (view === 'mine') return !p.archived
      return true
    })
      .filter((p) => !tag || (p.tags || []).includes(tag))
      .filter((p) => !q || (p.title || '').toLowerCase().includes(q))
    const dir = sort.dir === 'asc' ? 1 : -1
    return list.sort((a, b) => {
      const x = a[sort.key] || ''
      const y = b[sort.key] || ''
      return x > y ? dir : x < y ? -dir : 0
    })
  }, [projects, view, tag, query, sort])

  const counts = useMemo(() => ({
    all: projects.filter((p) => !p.trashed).length,
    mine: projects.filter((p) => !p.trashed && !p.archived).length,
    archived: projects.filter((p) => !p.trashed && p.archived).length,
    trash: projects.filter((p) => p.trashed).length,
  }), [projects])

  const patch = (ids, changes) => {
    ids.forEach((id) => {
      const p = projects.find((x) => x.id === id)
      if (p) upsertProject({ ...p, ...changes })
    })
    setSelected(new Set())
    refresh()
  }

  const toggle = (id) => setSelected((s) => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)))

  const open = (p) => navigate(`/career/resume/editor/${p.id}`)

  const createBlank = () => {
    const name = window.prompt('Project name', 'Untitled Project')
    if (name === null) return
    const p = upsertProject(makeProject(name.trim() || 'Untitled Project'))
    open(p)
  }

  const importFile = async (file) => {
    if (!file) return
    setMenuOpen(false)
    try {
      if (/\.tex$/i.test(file.name)) {
        const text = await file.text()
        open(upsertProject(makeProject(file.name.replace(/\.tex$/i, ''), text)))
      } else if (/\.zip$/i.test(file.name)) {
        const { data } = await resumeProjectAPI.importZip(file)
        const incoming = data.project || data
        if (!incoming?.files) throw new Error('Unexpected server response')
        open(upsertProject({ ...makeProject(incoming.title || file.name), ...incoming, id: uid() }))
      } else {
        setNotice('Upload a .tex file or a .zip project.')
      }
    } catch (e) {
      setNotice(e.response?.data?.message || 'Could not import this file. Check that it is a valid .tex or .zip.')
    }
  }

  const addTag = (ids) => {
    const name = window.prompt('Tag name')
    if (!name?.trim()) return
    ids.forEach((id) => {
      const p = projects.find((x) => x.id === id)
      if (p) upsertProject({ ...p, tags: [...new Set([...(p.tags || []), name.trim()])] })
    })
    refresh()
  }

  const downloadSource = (p) => {
    const main = p.files.find((f) => f.name === p.mainFile) || p.files[0]
    downloadBlob(`${(p.title || 'project').replace(/\W+/g, '-')}.tex`, main?.content || '')
  }

  const emptyTrash = () => {
    if (!window.confirm('Permanently delete all trashed projects? This cannot be undone.')) return
    projects.filter((p) => p.trashed).forEach((p) => removeProject(p.id))
    refresh()
  }

  const sortBy = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))
  const arrow = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '')
  const sel = [...selected]

  return (
    <div className="ovd">
      <aside className="ovd-side">
        <div className="ovd-new">
          <button className="ovd-btn primary" onClick={() => setMenuOpen((v) => !v)}>
            <Plus size={16} /> New project <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="ovd-menu" role="menu">
              <button onClick={() => { setMenuOpen(false); createBlank() }}>Blank project</button>
              <button onClick={() => { setMenuOpen(false); navigate('/career/resume') }}>Example from templates</button>
              <button onClick={() => fileRef.current?.click()}>Upload project (.tex / .zip)</button>
            </div>
          )}
          <input ref={fileRef} type="file" hidden accept=".tex,.zip" onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = '' }} />
        </div>

        <nav className="ovd-nav" aria-label="Project views">
          {VIEWS.map((v) => (
            <button key={v.id} className={view === v.id && !tag ? 'active' : ''} onClick={() => { setView(v.id); setTag(null); setSelected(new Set()) }}>
              <span>{v.label}</span><small>{counts[v.id]}</small>
            </button>
          ))}
        </nav>

        <div className="ovd-tags">
          <h4>Organize tags</h4>
          {allTags.length === 0 && <p className="muted">No tags yet. Select a project and choose Add tag.</p>}
          {allTags.map((t) => (
            <button key={t} className={tag === t ? 'active' : ''} onClick={() => setTag(tag === t ? null : t)}>
              <Tag size={13} /> {t}
            </button>
          ))}
        </div>

        <Link className="ovd-back" to="/career/resume">Template gallery</Link>
      </aside>

      <main className="ovd-main">
        <header className="ovd-head">
          <h1>{tag ? `Tag: ${tag}` : VIEWS.find((v) => v.id === view)?.label}</h1>
          <div className="ovd-search">
            <Search size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search in your projects…" aria-label="Search projects" />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}
          </div>
        </header>

        {notice && <div className="ovd-notice" role="status">{notice} <button onClick={() => setNotice('')}>Dismiss</button></div>}

        <div className="ovd-bulk" aria-live="polite">
          {sel.length > 0 ? (
            <>
              <span>{sel.length} selected</span>
              {view !== 'trash' && <>
                <button onClick={() => addTag(sel)}><Tag size={14} /> Add tag</button>
                {view === 'archived'
                  ? <button onClick={() => patch(sel, { archived: false })}><RotateCcw size={14} /> Restore</button>
                  : <button onClick={() => patch(sel, { archived: true })}><Archive size={14} /> Archive</button>}
                <button onClick={() => patch(sel, { trashed: true })}><Trash2 size={14} /> Trash</button>
              </>}
              {view === 'trash' && <>
                <button onClick={() => patch(sel, { trashed: false })}><RotateCcw size={14} /> Restore</button>
                <button className="danger" onClick={() => { if (window.confirm('Delete permanently?')) { sel.forEach(removeProject); setSelected(new Set()); refresh() } }}>Delete forever</button>
              </>}
            </>
          ) : view === 'trash' && counts.trash > 0 ? (
            <button className="danger" onClick={emptyTrash}>Empty trash</button>
          ) : <span className="muted">Select projects to archive, tag or trash them.</span>}
        </div>

        <table className="ovd-table">
          <thead>
            <tr>
              <th className="chk"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" /></th>
              <th><button onClick={() => sortBy('title')}>Title{arrow('title')}</button></th>
              <th>Owner</th>
              <th><button onClick={() => sortBy('updatedAt')}>Last modified{arrow('updatedAt')}</button></th>
              <th className="act">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={selected.has(p.id) ? 'sel' : ''}>
                <td className="chk"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.title}`} /></td>
                <td>
                  {p.trashed
                    ? <span className="ovd-title dim"><FileText size={15} /> {p.title || 'Untitled'}</span>
                    : <button className="ovd-title" onClick={() => open(p)}><FileText size={15} /> {p.title || 'Untitled'}</button>}
                  {(p.tags || []).map((t) => <span className="ovd-chip" key={t}>{t}</span>)}
                </td>
                <td>You</td>
                <td title={p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ''}>{timeAgo(p.updatedAt)}</td>
                <td className="act">
                  {!p.trashed && <>
                    <button title="Copy" aria-label="Copy project" onClick={() => { duplicateProject(p); refresh() }}><Copy size={15} /></button>
                    <button title="Download source" aria-label="Download source" onClick={() => downloadSource(p)}><Download size={15} /></button>
                    <button title={p.archived ? 'Unarchive' : 'Archive'} aria-label="Archive" onClick={() => patch([p.id], { archived: !p.archived })}><Archive size={15} /></button>
                    <button title="Move to trash" aria-label="Trash" onClick={() => patch([p.id], { trashed: true })}><Trash2 size={15} /></button>
                  </>}
                  {p.trashed && <>
                    <button title="Restore" aria-label="Restore" onClick={() => patch([p.id], { trashed: false })}><RotateCcw size={15} /></button>
                    <button title="Delete forever" aria-label="Delete forever" onClick={() => { if (window.confirm('Delete permanently?')) { removeProject(p.id); refresh() } }}><Trash2 size={15} /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="ovd-empty">
            <FolderOpen size={30} />
            <h3>{query ? 'No projects match your search' : view === 'trash' ? 'Trash is empty' : 'No projects yet'}</h3>
            {!query && view !== 'trash' && <button className="ovd-btn primary" onClick={createBlank}><Plus size={16} /> Create your first project</button>}
          </div>
        )}
        <p className="ovd-foot">Showing {rows.length} of {projects.filter((p) => !p.trashed || view === 'trash').length} projects</p>
      </main>
    </div>
  )
}
