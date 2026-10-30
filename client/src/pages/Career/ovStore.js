import { resumeProjectAPI } from '../../api'
// Shared storage for the Overleaf-style dashboard + editor.
// Uses the SAME localStorage key as the existing ResumeWorkspace, so projects you
// already created keep showing up. Unknown fields on a project are always preserved.
export const STORE_KEY = 'upskillyfy-latex-projects-v1'

export const readProjects = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') } catch { return [] }
}
export const writeProjects = (items) => localStorage.setItem(STORE_KEY, JSON.stringify(items))

export const uid = () =>
  (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
  `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const BLANK_TEX = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[margin=1.6cm]{geometry}
\usepackage[T1]{fontenc}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\begin{document}
{\Huge \textbf{Your Name}}\par
you@example.com \hfill City, Country
\section*{Summary}
Write a concise professional summary here.
\section*{Experience}
\textbf{Company} --- Role \hfill 2023--Present
\begin{itemize}[leftmargin=1.2em]
  \item Describe a measurable achievement and the impact you made.
\end{itemize}
\section*{Education}
\textbf{University} --- B.Tech, Computer Science \hfill 2027
\section*{Skills}
JavaScript, React, Node.js, Python
\end{document}
`

export function makeProject(title = 'Untitled Project', source = BLANK_TEX, extra = {}) {
  const now = new Date().toISOString()
  return {
    id: uid(),
    title,
    mainFile: 'main.tex',
    files: [{ name: 'main.tex', content: source, isBinary: false }],
    createdAt: now,
    updatedAt: now,
    tags: [],
    archived: false,
    trashed: false,
    ...extra,
  }
}

export function upsertProject(project) {
  const items = readProjects()
  const i = items.findIndex((p) => p.id === project.id)
  const next = { ...project, updatedAt: new Date().toISOString() }
  if (i >= 0) items[i] = next
  else items.unshift(next)
  writeProjects(items)
  return next
}

export function removeProject(id) {
  writeProjects(readProjects().filter((p) => p.id !== id))
  try { if (localStorage.getItem('token')) resumeProjectAPI.remove(id).catch(() => {}) } catch { /* ignore */ }
}

export function duplicateProject(project) {
  const copy = makeProject(`${project.title || 'Untitled'} (copy)`, '', {
    ...project,
    id: uid(),
    title: `${project.title || 'Untitled'} (copy)`,
    files: project.files.map((f) => ({ ...f })),
    createdAt: new Date().toISOString(),
    cloudSaved: false,
    archived: false,
    trashed: false,
  })
  copy.id = uid()
  return upsertProject(copy)
}

export function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.round(h / 24)
  return `${d} day${d > 1 ? 's' : ''} ago`
}

export function downloadBlob(name, content, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---- cloud sync helpers (FINAL-OVERLEAF-PATCH) ---- */
const SUPPORTED = /^(?!\/)[\w .()/-]+\.(?:tex|bib|sty|cls|bst|cfg|txt|md|png|jpe?g|pdf)$/i
const BINARY = /\.(?:png|jpe?g|pdf)$/i
const mimeOf = (path) => (/\.png$/i.test(path) ? 'image/png' : /\.jpe?g$/i.test(path) ? 'image/jpeg' : 'application/pdf')

export function toCloud(p) {
  const files = (p.files || [])
    .filter((f) => !/(^|\/)\.gitkeep$/.test(f.name) && SUPPORTED.test(f.name) && !f.name.split('/').some((x) => !x || x === '.' || x === '..'))
    .map((f) => {
      const binary = BINARY.test(f.name)
      let content = f.content || ''
      if (binary && content.startsWith('data:')) content = content.slice(content.indexOf(',') + 1)
      return { path: f.name, content, isBinary: binary }
    })
  const main = files.some((f) => f.path === p.mainFile) ? p.mainFile : (files.find((f) => /\.tex$/i.test(f.path)) || {}).path
  return { id: p.id, name: (p.title || '').trim() || 'Untitled Project', mainFile: main, templateId: p.templateId || null, files }
}

export function filesFromCloud(files = []) {
  return files.map((f) => {
    const name = f.path || f.name
    const raw = String(f.content ?? '')
    const binary = !!f.isBinary
    return { name, isBinary: binary, content: binary && !raw.startsWith('data:') ? 'data:' + mimeOf(name) + ';base64,' + raw : raw }
  })
}

export function fromCloud(c) {
  return {
    id: c.id, title: c.name, mainFile: c.mainFile, templateId: c.templateId || null,
    files: filesFromCloud(c.files), createdAt: c.createdAt, updatedAt: c.updatedAt,
    cloudSaved: true, tags: [], archived: false, trashed: false,
  }
}

export async function syncFromCloud() {
  if (!localStorage.getItem('token')) return false
  const { data } = await resumeProjectAPI.list()
  const local = readProjects()
  const byId = new Map(local.map((p) => [p.id, p]))
  let changed = false
  for (const c of data.projects || []) {
    const mine = byId.get(c.id)
    if (!mine) { local.push(fromCloud(c)); changed = true }
    else if (new Date(c.updatedAt) > new Date(mine.updatedAt || 0)) {
      Object.assign(mine, fromCloud(c), { tags: mine.tags || [], archived: !!mine.archived, trashed: !!mine.trashed })
      changed = true
    }
  }
  if (changed) writeProjects(local)
  return changed
}
