import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { oneDark } from '@codemirror/theme-one-dark'
import { undo, redo } from '@codemirror/commands'
import {
  ArrowLeft, Play, Download, FilePlus, FolderPlus, Upload, Pencil, Trash2,
  ChevronRight, ChevronDown, File as FileIcon, Folder, Bold, Italic, List,
  Sigma, Link2, Heading, Undo2, Redo2, History, Columns, X, RefreshCw, AlertTriangle,
  Underline, Table, Share2, Copy, Check,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { resumeProjectAPI } from '../../../api'
import { readProjects, upsertProject, downloadBlob } from './ovStore'
import { fromResumeProjectPayload, getCurrentUserId } from './resumeWorkspaceUtils'
import { compileButtonLabel, compileErrorMessage, loginUrl } from './compileGuestUtils'
import './OverleafEditor.css'

const HIDDEN = '.gitkeep'
const LAYOUTS = ['split', 'editor', 'pdf']
const histKey = (id) => `ov-history-${id}`

function buildTree(files) {
  const root = { dirs: {}, files: [] }
  files.forEach((f) => {
    const parts = f.name.split('/')
    let node = root
    parts.slice(0, -1).forEach((p) => {
      node.dirs[p] = node.dirs[p] || { dirs: {}, files: [] }
      node = node.dirs[p]
    })
    node.files.push({ ...f, base: parts[parts.length - 1] })
  })
  return root
}

function readHistory(id) {
  try { return JSON.parse(localStorage.getItem(histKey(id)) || '[]') } catch { return [] }
}

export default function OverleafEditor() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isLoggedIn = Boolean(user)
  const goLogin = (path = '') => navigate(loginUrl(path), { replace: false })
  const [project, setProject] = useState(() => readProjects().find((p) => p.id === projectId))
  const [loadingProject, setLoadingProject] = useState(() => !readProjects().some((p) => p.id === projectId))
  const [active, setActive] = useState(null)
  const [tabs, setTabs] = useState([])
  const [collapsed, setCollapsed] = useState(new Set())
  const [status, setStatus] = useState('Saved locally')
  const [pdfUrl, setPdfUrl] = useState('')
  const [zoom, setZoom] = useState('page-width')
  const [compiling, setCompiling] = useState(false)
  const [log, setLog] = useState('')
  const [showLog, setShowLog] = useState(false)
  const [auto, setAuto] = useState(false)
  const [layout, setLayout] = useState('split')
  const [mobileView, setMobileView] = useState('code')
  const [mobileFilesOpen, setMobileFilesOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [dlOpen, setDlOpen] = useState(false)
  const [mode, setMode] = useState('code') // code | visual
  const [menuOpen, setMenuOpen] = useState(null) // 'file'|'edit'|'insert'|'view'|'format'|'help'|null
  const [shareOpen, setShareOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [pageNum, pageNumRef] = useState(1)
  const [maxPages, setMaxPages] = useState(1)
  const viewRef = useRef(null)
  const projectRef = useRef(project)
  const cloudTimer = useRef(null)
  const cloudQueue = useRef(Promise.resolve())
  const autoTimer = useRef(null)
  const uploadRef = useRef(null)
  const pdfRef = useRef('')
  const menuRef = useRef(null)

  projectRef.current = project

  useEffect(() => {
    if (!project) {
      if (!localStorage.getItem('token')) {
        setLoadingProject(false)
        navigate('/career/resume/projects', { replace: true })
        return undefined
      }
      let activeRequest = true
      resumeProjectAPI.get(projectId).then(({ data }) => {
        if (!activeRequest) return
        const restored = fromResumeProjectPayload(data.project, getCurrentUserId())
        if (!restored) throw new Error('The saved project response is invalid.')
        const saved = upsertProject(restored)
        setProject(saved)
        setActive(saved.mainFile || saved.files[0]?.name || null)
        setTabs([saved.mainFile || saved.files[0]?.name].filter(Boolean))
        setHistory(readHistory(saved.id))
        setLoadingProject(false)
      }).catch(() => {
        if (!activeRequest) return
        setLoadingProject(false)
        navigate('/career/resume/projects', { replace: true })
      })
      return () => { activeRequest = false }
    }
    setLoadingProject(false)
    if (!active) {
      const first = project.mainFile || project.files[0]?.name
      setActive(first)
      setTabs([first])
      setHistory(readHistory(project.id))
    }
  }, [project, projectId, active, navigate])

  useEffect(() => () => { if (pdfRef.current) URL.revokeObjectURL(pdfRef.current) }, [])

  useEffect(() => {
    if (!isLoggedIn) return undefined
    let activeRequest = true
    resumeProjectAPI.get(projectId).then(({ data }) => {
      if (!activeRequest || !data?.project) return
      const restored = fromResumeProjectPayload(data.project, getCurrentUserId())
      if (!restored) return
      const current = projectRef.current
      if (current && Date.parse(current.updatedAt || 0) >= Date.parse(restored.updatedAt || 0)) return
      const saved = upsertProject(restored)
      setProject(saved)
      setActive(saved.mainFile || saved.files[0]?.name || null)
      setTabs([saved.mainFile || saved.files[0]?.name].filter(Boolean))
    }).catch(() => {})
    resumeProjectAPI.pdf(projectId).then(({ data }) => {
      if (!activeRequest) return
      const url = URL.createObjectURL(data)
      pdfRef.current = url
      setPdfUrl(url)
    }).catch(() => {})
    return () => { activeRequest = false }
  }, [isLoggedIn, projectId])

  const file = project?.files.find((f) => f.name === active)
  const tree = useMemo(() => buildTree(project?.files || []), [project?.files])

  const outline = useMemo(() => {
    if (!file || file.isBinary) return []
    return [...file.content.matchAll(/\\(part|chapter|section|subsection|subsubsection)\*?\{([^}]*)\}/g)]
      .map((m) => ({ level: m[1], label: m[2], index: m.index }))
  }, [file])

  const stats = useMemo(() => {
    const t = file && !file.isBinary ? file.content : ''
    return { lines: t ? t.split('\n').length : 0, words: (t.match(/\S+/g) || []).length }
  }, [file])

  /* ---------- persistence ---------- */
  const scheduleCloud = useCallback((p) => {
    if (!localStorage.getItem('token')) return
    clearTimeout(cloudTimer.current)
    cloudTimer.current = setTimeout(async () => {
      try {
        cloudQueue.current = cloudQueue.current.catch(() => {}).then(async () => {
          try { return await resumeProjectAPI.create(p) }
          catch (error) {
            await new Promise(resolve => window.setTimeout(resolve, 700))
            return resumeProjectAPI.create(p)
          }
        })
        await cloudQueue.current
        const owner = getCurrentUserId()
        const current = readProjects().find((item) => item.id === p.id) || p
        upsertProject({ ...current, cloudSaved: true, cloudOwner: owner || current.cloudOwner })
        setStatus('Saved to your account')
      } catch {
        setStatus('Saved locally (cloud save failed)')
      }
    }, 1500)
  }, [])

  useEffect(() => {
    const owner = getCurrentUserId()
    if (!project || !owner || (project.cloudSaved && project.cloudOwner === owner)) return
    scheduleCloud(project)
  }, [project?.id, project?.cloudSaved, project?.cloudOwner, scheduleCloud])

  const persist = useCallback((next, msg = 'Saved locally') => {
    const saved = upsertProject(next)
    setProject(saved)
    setStatus(msg)
    scheduleCloud(saved)
  }, [scheduleCloud])

  const snapshot = (label) => {
    const p = projectRef.current
    if (!p) return
    const entry = { at: new Date().toISOString(), label, files: p.files.map((f) => ({ ...f })) }
    const list = [entry, ...readHistory(p.id)].slice(0, 20)
    try { localStorage.setItem(histKey(p.id), JSON.stringify(list)) } catch { /* storage full */ }
    setHistory(list)
  }

  const restore = async (entry) => {
    if (!window.confirm('Restore this version? Your current files will be replaced (save a version first if you want to keep them).')) return
    if (isLoggedIn && Number.isInteger(entry.index)) {
      try {
        const { data } = await resumeProjectAPI.restore(project.id, entry.index)
        const restored = fromResumeProjectPayload(data.project, getCurrentUserId())
        if (restored) {
          persist(restored, 'Version restored')
          setActive(restored.mainFile)
          setTabs([restored.mainFile])
          setHistory(readHistory(project.id))
          return
        }
      } catch { setStatus('Could not restore the saved version') ; return }
    }
    persist({ ...project, files: entry.files.map((f) => ({ ...f })) }, 'Version restored')
    setActive(project.mainFile)
    setTabs([project.mainFile])
  }

  const loadHistory = async () => {
    setShowHistory(true)
    if (!isLoggedIn) { setHistory(readHistory(project.id)); return }
    try {
      const { data } = await resumeProjectAPI.history(project.id)
      setHistory((data.versions || []).map(v => ({ ...v, at: v.savedAt, files: v.files.map(f => ({ name: f.path, content: f.content, isBinary: f.isBinary })) })))
    } catch { setHistory(readHistory(project.id)) }
  }

  /* ---------- editing ---------- */
  const onChange = (value) => {
    if (!file || file.isBinary) return
    persist({ ...project, files: project.files.map((f) => (f.name === file.name ? { ...f, content: value } : f)) })
    if (auto) {
      clearTimeout(autoTimer.current)
      autoTimer.current = setTimeout(() => compile(), 3000)
    }
  }

  const wrap = (before, after = '', placeholder = '') => {
    const v = viewRef.current
    if (!v) return
    const { from, to } = v.state.selection.main
    const picked = v.state.sliceDoc(from, to) || placeholder
    v.dispatch({
      changes: { from, to, insert: before + picked + after },
      selection: { anchor: from + before.length, head: from + before.length + picked.length },
    })
    v.focus()
  }

  const jump = (index) => {
    const v = viewRef.current
    if (!v) return
    v.dispatch({ selection: { anchor: index }, scrollIntoView: true })
    v.focus()
  }

  /* ---------- files ---------- */
  const openFile = (name) => {
    setActive(name)
    setTabs((t) => (t.includes(name) ? t : [...t, name]))
  }
  const closeTab = (name) => {
    setTabs((t) => {
      const next = t.filter((x) => x !== name)
      if (active === name) setActive(next[next.length - 1] || project.mainFile)
      return next.length ? next : [project.mainFile]
    })
  }
  const exists = (name) => project.files.some((f) => f.name === name)
  const cleanName = (n) => n.trim().replace(/^\/+/, '').replace(/\\/g, '/')

  const newFile = (dir = '') => {
    const raw = window.prompt('New file name', dir ? `${dir}/` : 'chapter.tex')
    if (!raw) return
    const name = cleanName(raw)
    if (!name || name.endsWith('/')) return
    if (exists(name)) { window.alert('A file with this name already exists.'); return }
    persist({ ...project, files: [...project.files, { name, content: '', isBinary: false }] })
    openFile(name)
  }
  const newFolder = (dir = '') => {
    const raw = window.prompt('New folder name', dir ? `${dir}/` : 'figures')
    if (!raw) return
    const name = cleanName(raw).replace(/\/+$/, '')
    if (!name) return
    const marker = `${name}/${HIDDEN}`
    if (exists(marker)) return
    persist({ ...project, files: [...project.files, { name: marker, content: '', isBinary: false }] })
  }
  const renameFile = (f) => {
    const raw = window.prompt('Rename file', f.name)
    if (!raw) return
    const name = cleanName(raw)
    if (!name || name === f.name) return
    if (exists(name)) { window.alert('A file with this name already exists.'); return }
    persist({
      ...project,
      mainFile: project.mainFile === f.name ? name : project.mainFile,
      files: project.files.map((x) => (x.name === f.name ? { ...x, name } : x)),
    })
    setTabs((t) => t.map((x) => (x === f.name ? name : x)))
    if (active === f.name) setActive(name)
  }
  const deleteFile = (f) => {
    if (f.name === project.mainFile) { window.alert('The main file cannot be deleted. Set another file as main first.'); return }
    if (!window.confirm(`Delete ${f.name}?`)) return
    persist({ ...project, files: project.files.filter((x) => x.name !== f.name) })
    closeTab(f.name)
  }
  const setMain = (f) => persist({ ...project, mainFile: f.name }, 'Main file changed')

  const uploadFiles = async (list) => {
    const add = []
    for (const f of list) {
      const isText = /\.(tex|bib|sty|cls|txt|md|bst|cfg)$/i.test(f.name)
      const isBinaryAsset = /\.(png|jpe?g|pdf)$/i.test(f.name)
      if ((!isText && !isBinaryAsset) || f.size > 5 * 1024 * 1024) {
        setStatus(`Skipped ${f.name}: use supported LaTeX, PNG, JPEG or PDF files up to 5 MB.`)
        continue
      }
      const content = isText
        ? await f.text()
        : await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.readAsDataURL(f) })
      let name = f.name
      let n = 1
      while (exists(name) || add.some((a) => a.name === name)) name = `${n++}-${f.name}`
      add.push({ name, content, isBinary: !isText })
    }
    if (add.length) persist({ ...project, files: [...project.files, ...add] })
  }

  /* ---------- compile & download ---------- */
  const compile = async () => {
    if (!isLoggedIn) { goLogin(`/career/resume/editor/${projectId}`); return }
    const p = projectRef.current
    if (!p) return
    setCompiling(true)
    setLog('')
    try {
      const { data } = await resumeProjectAPI.compile(p)
      if (data.type && data.type.includes('json')) {
        const body = JSON.parse(await data.text())
        throw Object.assign(new Error(body.message || 'Compile failed'), { detail: body.log || body.details })
      }
      if (pdfRef.current) URL.revokeObjectURL(pdfRef.current)
      const url = URL.createObjectURL(data)
      pdfRef.current = url
      setPdfUrl(url)
      setShowLog(false)
      snapshot('Compiled version')
    } catch (e) {
      let msg = e.message
      let detail = e.detail
      let b = e.response?.data
      if (b instanceof Blob) {
        try { const j = JSON.parse(await b.text()); b = j } catch { b = null }
      }
      if (e.response?.status) {
        const mapped = compileErrorMessage(e.response.status, b, e.message)
        msg = mapped.message
        if (mapped.redirectToLogin) goLogin(`/career/resume/editor/${projectId}`)
        if (b?.log || b?.details) detail = b.log || b.details
      } else if (!e.response && !e.detail) {
        msg = 'Could not reach the compile server. Check that the backend is running and VITE_API_URL is set.'
      }
      setLog([msg, detail].filter(Boolean).join('\n\n'))
      setShowLog(true)
    } finally {
      setCompiling(false)
    }
  }

  const downloadZip = async () => {
    try {
      const { data } = await resumeProjectAPI.sourceZip(project.id)
      downloadBlob(`${project.title || 'project'}.zip`, data)
    } catch {
      setStatus('ZIP needs the server. Download the .tex file instead, or save to your account first.')
    }
  }

  const titleBlur = (e) => {
    const t = e.target.value.trim() || 'Untitled Project'
    if (t !== project.title) persist({ ...project, title: t })
  }

  /* ---------- render helpers ---------- */
  const renderNode = (node, prefix = '') => (
    <>
      {Object.keys(node.dirs).sort().map((d) => {
        const path = prefix ? `${prefix}/${d}` : d
        const shut = collapsed.has(path)
        return (
          <div key={path}>
            <div className="ove-row dir">
              <button className="ove-name" onClick={() => setCollapsed((s) => { const n = new Set(s); n.has(path) ? n.delete(path) : n.add(path); return n })}>
                {shut ? <ChevronRight size={14} /> : <ChevronDown size={14} />}<Folder size={14} /> {d}
              </button>
              <span className="ove-ops">
                <button title="New file here" aria-label="New file here" onClick={() => newFile(path)}><FilePlus size={13} /></button>
                <button title="New folder here" aria-label="New folder here" onClick={() => newFolder(path)}><FolderPlus size={13} /></button>
              </span>
            </div>
            {!shut && <div className="ove-indent">{renderNode(node.dirs[d], path)}</div>}
          </div>
        )
      })}
      {node.files.filter((f) => f.base !== HIDDEN).sort((a, b) => a.base.localeCompare(b.base)).map((f) => (
        <div key={f.name} className={`ove-row ${active === f.name ? 'on' : ''}`}>
          <button className="ove-name" onClick={() => openFile(f.name)}>
            <FileIcon size={14} /> {f.base}{project.mainFile === f.name && <em title="Main document">main</em>}
          </button>
          <span className="ove-ops">
            {project.mainFile !== f.name && /\.tex$/i.test(f.name) && <button title="Set as main" aria-label="Set as main file" onClick={() => setMain(f)}>M</button>}
            <button title="Rename" aria-label="Rename" onClick={() => renameFile(f)}><Pencil size={13} /></button>
            <button title="Delete" aria-label="Delete" onClick={() => deleteFile(f)}><Trash2 size={13} /></button>
          </span>
        </div>
      ))}
    </>
  )

  if (loadingProject) return <div className="ove-loading" role="status">Restoring your saved project…</div>
  if (!project) return null

  const isImage = file?.isBinary && /\.(?:png|jpe?g)$/i.test(file.name)

  return (
    <div className={`ove ${mobileView === 'pdf' ? 'ove-mobile-pdf' : ''} ${mobileFilesOpen ? 'ove-mobile-files' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); uploadFiles([...e.dataTransfer.files]) }}>
      <div className="ove-menu-bar">
        <div className="ove-mb-group">
          <button className="ove-mb-dd" onClick={() => setMenuOpen(menuOpen === 'file' ? null : 'file')}>File ▾</button>
          {menuOpen === 'file' && (
            <div className="ove-menu" ref={menuRef} onMouseLeave={() => setMenuOpen(null)}>
              <button onClick={() => { setMenuOpen(null); newFile() }}>New file</button>
              <button onClick={() => { setMenuOpen(null); uploadRef.current?.click() }}>Upload</button>
              <button onClick={() => { setMenuOpen(null); downloadZip() }}>Download project (.zip)</button>
              <button onClick={() => { setMenuOpen(null); const m = project.files.find((f) => f.name === project.mainFile); downloadBlob(project.mainFile, m?.content || '') }}>Download main source (.tex)</button>
            </div>
          )}
        </div>
        <div className="ove-mb-group">
          <button className="ove-mb-dd" onClick={() => setMenuOpen(menuOpen === 'edit' ? null : 'edit')}>Edit ▾</button>
          {menuOpen === 'edit' && (
            <div className="ove-menu" ref={menuRef} onMouseLeave={() => setMenuOpen(null)}>
              <button onClick={() => { setMenuOpen(null); viewRef.current && undo(viewRef.current) }}>Undo</button>
              <button onClick={() => { setMenuOpen(null); viewRef.current && redo(viewRef.current) }}>Redo</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\textbf{', '}', 'bold') }}>Bold</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\textit{', '}', 'italic') }}>Italic</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\underline{', '}', 'text') }}>Underline</button>
            </div>
          )}
        </div>
        <div className="ove-mb-group">
          <button className="ove-mb-dd" onClick={() => setMenuOpen(menuOpen === 'insert' ? null : 'insert')}>Insert ▾</button>
          {menuOpen === 'insert' && (
            <div className="ove-menu" ref={menuRef} onMouseLeave={() => setMenuOpen(null)}>
              <button onClick={() => { setMenuOpen(null); wrap('\\section{', '}', 'Title') }}>Section</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\begin{itemize}\n  \\item ', '\n\\end{itemize}', 'item') }}>Bullet list</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\begin{enumerate}\n  \\item ', '\n\\end{enumerate}', 'item') }}>Numbered list</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\begin{tabular}{ll}\n  \\hline\n  A & B \\\\\n  \\hline\n  1 & 2 \\\\\n  \\hline\n\\end{tabular}\n') }}>Table</button>
              <button onClick={() => { setMenuOpen(null); wrap('$', '$', 'x^2') }}>Inline math</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\href{https://}{', '}', 'text') }}>Link</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\includegraphics[width=0.8\\linewidth]{', '}', 'image.png') }}>Image</button>
            </div>
          )}
        </div>
        <div className="ove-mb-group">
          <button className="ove-mb-dd" onClick={() => setMenuOpen(menuOpen === 'view' ? null : 'view')}>View ▾</button>
          {menuOpen === 'view' && (
            <div className="ove-menu" ref={menuRef} onMouseLeave={() => setMenuOpen(null)}>
              <button onClick={() => { setMenuOpen(null); setLayout(LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length]) }}>Cycle layout</button>
              <button onClick={() => { setMenuOpen(null); setAuto(a => !a) }}>{auto ? 'Turn off' : 'Turn on'} auto-compile</button>
              <button onClick={() => { setMenuOpen(null); setShowLog(l => !l) }}>{showLog ? 'Hide' : 'Show'} compile log</button>
            </div>
          )}
        </div>
        <div className="ove-mb-group">
          <button className="ove-mb-dd" onClick={() => setMenuOpen(menuOpen === 'format' ? null : 'format')}>Format ▾</button>
          {menuOpen === 'format' && (
            <div className="ove-menu" ref={menuRef} onMouseLeave={() => setMenuOpen(null)}>
              <button onClick={() => { setMenuOpen(null); wrap('\\textbf{', '}', 'bold') }}>Bold</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\textit{', '}', 'italic') }}>Italic</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\underline{', '}', 'text') }}>Underline</button>
              <button onClick={() => { setMenuOpen(null); wrap('\\section{', '}', 'Title') }}>Section</button>
            </div>
          )}
        </div>
        <div className="ove-mb-group">
          <button className="ove-mb-dd" onClick={() => setMenuOpen(menuOpen === 'help' ? null : 'help')}>Help ▾</button>
          {menuOpen === 'help' && (
            <div className="ove-menu" ref={menuRef} onMouseLeave={() => setMenuOpen(null)}>
              <button onClick={() => { setMenuOpen(null); window.open('https://www.overleaf.com/learn', '_blank', 'noopener,noreferrer') }}>Overleaf help centre</button>
              <button onClick={() => { setMenuOpen(null); window.alert('Shortcuts: Ctrl/Cmd+B bold, Ctrl/Cmd+I italic, Ctrl/Cmd+F find, Tab indent, Shift+Tab outdent') }}>Keyboard shortcuts</button>
            </div>
          )}
        </div>
        <div className="ove-spacer" />
        <button className="ove-btn" onClick={() => { setShareLink(`${window.location.origin}/career/resume/editor/${project.id}`); setShareOpen(true) }}><Download size={15} /> Share</button>
      </div>
      <header className="ove-top">
        <button className="ove-brand-back" onClick={() => navigate(location.state?.from || '/career/resume/projects')} aria-label="Back to previous resume page"><ArrowLeft size={18} /><span className="ove-brand-mark">U</span><b>Upskillyfy AI</b></button>
        <input className="ove-title" defaultValue={project.title} key={project.id} onBlur={titleBlur} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} aria-label="Project name" />
        <span className="ove-status" role="status">{status}</span>
        <div className="ove-spacer" />
        <button className="ove-btn" onClick={() => showHistory ? setShowHistory(false) : loadHistory()}><History size={15} /> History</button>
        <button className="ove-btn" onClick={() => setLayout(LAYOUTS[(LAYOUTS.indexOf(layout) + 1) % LAYOUTS.length])} title="Cycle layout: split, editor only, PDF only"><Columns size={15} /> Layout: {layout}</button>
        <div className="ove-dd">
          <button className="ove-btn" onClick={() => setDlOpen((v) => !v)}><Download size={15} /> Download <ChevronDown size={13} /></button>
          {dlOpen && (
            <div className="ove-menu" onMouseLeave={() => setDlOpen(false)}>
              <button onClick={() => { setDlOpen(false); const m = project.files.find((f) => f.name === project.mainFile); downloadBlob(project.mainFile, m?.content || '') }}>Main source (.tex)</button>
              <button onClick={() => { setDlOpen(false); downloadZip() }}>Project (.zip)</button>
              <button disabled={!pdfUrl} onClick={async () => { setDlOpen(false); if (isLoggedIn) { try { const { data } = await resumeProjectAPI.pdf(project.id, true); downloadBlob(`${project.title || 'resume'}.pdf`, data, 'application/pdf'); return } catch {} } const a = document.createElement('a'); a.href = pdfUrl; a.download = `${project.title || 'resume'}.pdf`; a.click() }}>PDF {pdfUrl ? '' : '(compile first)'}</button>
            </div>
          )}
        </div>
        <label className="ove-auto"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-compile</label>
        <button className="ove-btn go" onClick={compile} disabled={compiling}>
          {compiling ? <RefreshCw size={15} className="spin" /> : <Play size={15} />} {compileButtonLabel({ isLoggedIn, compiling })}
        </button>
      </header>
      <nav className="ove-mobile-tabs" aria-label="Editor panels">
        <button aria-pressed={mobileFilesOpen} onClick={() => setMobileFilesOpen(v => !v)}>Files</button>
        <button aria-pressed={mobileView === 'code'} onClick={() => { setMobileFilesOpen(false); setMobileView('code') }}>Code</button>
        <button aria-pressed={mobileView === 'pdf'} onClick={() => { setMobileFilesOpen(false); setMobileView('pdf') }}>Preview</button>
      </nav>
      {/* Share modal */}
      {shareOpen && (
        <div className="ove-share" onClick={() => setShareOpen(false)}>
          <div className="ove-share-card" onClick={(e) => e.stopPropagation()}>
            <b>Share link</b>
            <p className="muted">Anyone with this link can open the editor for this project.</p>
            <div className="ove-share-input">
              <input readOnly value={shareLink} />
              <button className="ove-btn small" onClick={() => {
                navigator.clipboard.writeText(shareLink)
                setShareOpen(false)
              }}><Copy size={14} /> Copy</button>
            </div>
            <button className="ove-btn small" onClick={() => setShareOpen(false)}>Close</button>
          </div>
        </div>
      )}
      <style>{`
        .ove-share{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:40;display:flex;align-items:center;justify-content:center}
        .ove-share-card{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:16px;min-width:320px;max-width:90vw}
        .ove-share-input{display:flex;gap:8px;margin-top:10px}
        .ove-share-input input{flex:1;background:var(--bg);border:1px solid var(--line);border-radius:5px;padding:6px 8px;color:var(--text);font-family:monospace;font-size:12px}
        .ove-share-input button{padding:6px 10px}
      `}</style>
      <div className={`ove-body layout-${layout}`}>
        <aside className="ove-left">
          <div className="ove-left-head">
            <b>File tree</b>
            <span className="ove-ops show">
              <button title="New file" aria-label="New file" onClick={() => newFile()}><FilePlus size={15} /></button>
              <button title="New folder" aria-label="New folder" onClick={() => newFolder()}><FolderPlus size={15} /></button>
              <button title="Upload files" aria-label="Upload files" onClick={() => uploadRef.current?.click()}><Upload size={15} /></button>
            </span>
            <input ref={uploadRef} type="file" multiple hidden onChange={(e) => { uploadFiles([...e.target.files]); e.target.value = '' }} />
          </div>
          <div className="ove-tree">{renderNode(tree)}</div>
          <div className="ove-left-head outline"><b>File outline</b></div>
          <div className="ove-outline">
            {outline.length === 0 && <p className="muted">No sections found in this file.</p>}
            {outline.map((o, i) => (
              <button key={i} className={`lvl-${o.level}`} onClick={() => jump(o.index)}>{o.label || '(untitled)'}</button>
            ))}
          </div>
        </aside>

        <section className="ove-center">
          <div className="ove-tabs" role="tablist">
            {tabs.filter(exists).map((t) => (
              <div key={t} role="tab" aria-selected={active === t} className={`ove-tab ${active === t ? 'on' : ''}`}>
                <button onClick={() => setActive(t)}>{t.split('/').pop()}</button>
                {tabs.length > 1 && <button aria-label={`Close ${t}`} onClick={() => closeTab(t)}><X size={12} /></button>}
              </div>
            ))}
          </div>
          <div className="ove-mode">
            <button className={mode === 'code' ? 'on' : ''} onClick={() => setMode('code')}>Code</button>
            <button className={mode === 'visual' ? 'on' : ''} onClick={() => setMode('visual')} disabled={!file || file.isBinary}>Visual</button>
            <select value="" onChange={(e) => { if (e.target.value) { setMode(e.target.value); e.target.value = '' } }} aria-label="Editor mode">
              <option value="" disabled>Editing ▾</option>
              <option value="code">Code</option>
              <option value="visual">Visual</option>
            </select>
          </div>
          <div className="ove-toolbar">
            <button aria-label="Undo" title="Undo" onClick={() => viewRef.current && undo(viewRef.current)}><Undo2 size={15} /></button>
            <button aria-label="Redo" title="Redo" onClick={() => viewRef.current && redo(viewRef.current)}><Redo2 size={15} /></button>
            <i />
            <button aria-label="Section" title="Section" onClick={() => wrap('\\section{', '}', 'Title')}><Heading size={15} /></button>
            <button aria-label="Bold" title="Bold" onClick={() => wrap('\\textbf{', '}', 'bold')}><Bold size={15} /></button>
            <button aria-label="Italic" title="Italic" onClick={() => wrap('\\textit{', '}', 'italic')}><Italic size={15} /></button>
            <button aria-label="Underline" title="Underline" onClick={() => wrap('\\underline{', '}', 'text')}><Underline size={15} /></button>
            <button aria-label="Table" title="Table" onClick={() => wrap('\\begin{tabular}{ll}\n  \\hline\n  A & B \\\\\n  \\hline\n  1 & 2 \\\\\n  \\hline\n\\end{tabular}\n')}><Table size={15} /></button>
            <button aria-label="Math" title="Inline math" onClick={() => wrap('$', '$', 'x^2')}><Sigma size={15} /></button>
            <button aria-label="Link" title="Link" onClick={() => wrap('\\href{https://}{', '}', 'text')}><Link2 size={15} /></button>
            <button aria-label="Bullet list" title="Bullet list" onClick={() => wrap('\\begin{itemize}\n  \\item ', '\n\\end{itemize}', 'item')}><List size={15} /></button>
            <span className="ove-hint">Ctrl/Cmd + F to find and replace</span>
          </div>
          <div className="ove-editor">
            {file && !file.isBinary && (
              <CodeMirror
                key={file.name}
                value={file.content}
                height="100%"
                theme={oneDark}
                extensions={[StreamLanguage.define(stex)]}
                onChange={onChange}
                onCreateEditor={(v) => { viewRef.current = v }}
                basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, searchKeymap: true }}
              />
            )}
            {file?.isBinary && (
              <div className="ove-binary">
                {isImage ? <img src={`data:${/\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg'};base64,${file.content}`} alt={file.name} /> : <p>{file.name} is a binary file. It is included when you compile but cannot be edited here.</p>}
              </div>
            )}
          </div>
          <footer className="ove-foot">{file?.name} · {stats.lines} lines · {stats.words} words</footer>
        </section>

        <section className="ove-right">
          <div className="ove-pdfbar">
            <b>PDF preview</b>
            <button className={`ove-btn small ${log ? 'warn' : ''}`} onClick={() => setShowLog((v) => !v)}><AlertTriangle size={13} /> Logs</button>
            <div className="ove-pdf-nav">
              <button disabled={!pdfUrl || pageNum <= 1} onClick={() => setPageNum(p => p - 1)}>‹</button>
              <span className="ove-pdf-page">{pageNum} / {maxPages}</span>
              <button disabled={!pdfUrl || pageNum >= maxPages} onClick={() => setPageNum(p => p + 1)}>›</button>
            </div>
            <select value={zoom} onChange={(e) => setZoom(e.target.value)} aria-label="Zoom">
              <option value="page-width">Fit width</option>
              <option value="page-fit">Fit page</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
              <option value="150">150%</option>
            </select>
          </div>
          <div className="ove-pdf">
            {pdfUrl
              ? <iframe title="PDF preview" src={`${pdfUrl}#zoom=${zoom}&toolbar=1`} />
              : (
                <div className="ove-pdf-empty">
                  <FileIcon size={30} />
                  <h3>Compile to preview your PDF</h3>
                  {isLoggedIn
                    ? <p>Press Recompile. The PDF appears here once the build succeeds.</p>
                    : <p>You can edit and save locally. Log in to compile and preview the PDF.</p>
                  }
                  {isLoggedIn
                    ? <button className="ove-btn go" onClick={compile} disabled={compiling}><Play size={15} /> {compileButtonLabel({ isLoggedIn: true, compiling: false })}</button>
                    : <button className="ove-btn go" onClick={() => goLogin(`/career/resume/editor/${projectId}`)}><Play size={15} /> {compileButtonLabel({ isLoggedIn: false, compiling: false })}</button>
                  }
                </div>
              )}
            {showLog && (
              <div className="ove-log" role="alert">
                <div><b>Compile log</b><button onClick={() => setShowLog(false)} aria-label="Close log"><X size={14} /></button></div>
                <pre>{log || 'No errors. Last compile succeeded.'}</pre>
              </div>
            )}
          </div>
        </section>

        {showHistory && (
          <aside className="ove-history">
            <div className="ove-history-head">
              <b>History</b>
              <button className="ove-btn small" onClick={() => snapshot('Manual version')}>Save version</button>
              <button className="ove-icon" onClick={() => setShowHistory(false)} aria-label="Close history"><X size={15} /></button>
            </div>
            {history.length === 0 && <p className="muted pad">No saved versions yet. A version is saved every time a compile succeeds.</p>}
            {history.map((h, i) => (
              <div className="ove-hist-row" key={i}>
                <div><b>{h.label}</b><small>{new Date(h.at).toLocaleString()} · {h.files.length} files</small></div>
                <button className="ove-btn small" onClick={() => restore(h)}>Restore</button>
              </div>
            ))}
            <p className="muted pad">{isLoggedIn ? 'Saved source versions are synced to your account.' : 'Versions are stored in this browser only.'}</p>
          </aside>
        )}
      </div>
    </div>
  )
}
