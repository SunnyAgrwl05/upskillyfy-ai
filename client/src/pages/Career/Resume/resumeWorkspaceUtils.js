export const RESUME_CATEGORIES = [
  'Journal Articles', 'Bibliographies', 'Books', 'Calendars', 'CVs and Résumés',
  'Formal Letters', 'Assignments', 'Newsletters', 'Posters', 'Presentations',
  'Theses and Dissertations', 'Research Papers', 'Reports', 'Cover Letters',
]

export const RESUME_STARTER = String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[margin=1.6cm]{geometry}
\usepackage[T1]{fontenc}
\usepackage[hidelinks]{hyperref}
\usepackage{enumitem}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\begin{document}
{\Huge \textbf{Your Name}}
\par
Software Engineer \hfill \href{mailto:you@example.com}{you@example.com}
\vspace{8pt}\hrule\vspace{8pt}
\section*{Summary}
Write a concise professional summary here.
\section*{Experience}
\textbf{Company Name} — Software Engineer \hfill 2023--Present
\begin{itemize}[leftmargin=1.2em]
  \item Describe a measurable achievement and the impact you made.
\end{itemize}
\section*{Education}
\textbf{University Name} — B.Tech, Computer Science \hfill 2023
\section*{Skills}
JavaScript, React, Node.js, Python
\end{document}`

const localTemplates = [
  ['ats-friendly-resume', 'ATS-Friendly Resume', 'CVs and Résumés', 'Templates', 'A clean single-column resume starter designed for readable, machine-friendly sections.', ['ATS', 'Resume', 'Single column'], RESUME_STARTER],
  ['software-engineer-resume', 'Software Engineer Resume', 'CVs and Résumés', 'Templates', 'A technical resume structure for experience, projects, education, and engineering skills.', ['Engineering', 'Projects'], RESUME_STARTER.replace('Your Name', 'Jordan Ellis')],
  ['fresher-resume', 'Fresher Resume', 'CVs and Résumés', 'Templates', 'An entry-level resume emphasizing education, projects, internships, and transferable skills.', ['Fresher', 'Entry level'], RESUME_STARTER.replace('Software Engineer', 'Graduate Software Engineer')],
  ['experienced-professional-resume', 'Experienced Professional Resume', 'CVs and Résumés', 'Templates', 'A resume structure for experienced candidates highlighting scope, outcomes, and leadership.', ['Experienced', 'Impact'], RESUME_STARTER.replace('Your Name', 'Jordan Ellis')],
  ['academic-cv', 'Academic CV', 'CVs and Résumés', 'Templates', 'An adaptable academic CV structure for education, research, and publications.', ['Academic', 'CV'], RESUME_STARTER.replace('Software Engineer', 'Researcher')],
  ['cover-letter', 'Cover Letter', 'Cover Letters', 'Templates', 'A minimal letter layout for a tailored application.', ['Letter', 'Career'], RESUME_STARTER],
  ['research-paper', 'Research Paper', 'Research Papers', 'Templates', 'A research paper structure for an abstract, methodology, findings, and references.', ['Research', 'Paper'], RESUME_STARTER.replace('Software Engineer', 'Research Paper')],
  ['journal-article', 'Journal Article', 'Journal Articles', 'Templates', 'A journal manuscript starter with an abstract, sections, and references.', ['Article', 'Academic'], RESUME_STARTER.replace('Software Engineer', 'Journal Article')],
  ['thesis', 'Thesis and Dissertation', 'Theses and Dissertations', 'Templates', 'A long-form research document structure with chapter placeholders.', ['Thesis', 'Research'], RESUME_STARTER.replace('Software Engineer', 'Thesis')],
  ['technical-report', 'Technical Report', 'Reports', 'Examples', 'A report structure for objectives, implementation, findings, and recommendations.', ['Technical', 'Report'], RESUME_STARTER.replace('Software Engineer', 'Technical Report')],
  ['presentation', 'Presentation', 'Presentations', 'Examples', 'A presentation project outline to adapt into a Beamer slide deck.', ['Slides', 'University'], RESUME_STARTER.replace('Software Engineer', 'Presentation')],
  ['poster', 'Poster', 'Posters', 'Examples', 'A concise research poster outline for a project summary and findings.', ['Poster', 'Research'], RESUME_STARTER.replace('Software Engineer', 'Research Poster')],
  ['assignment', 'Assignment', 'Assignments', 'Community', 'A coursework document starter for a title, questions, and responses.', ['Coursework', 'Assignment'], RESUME_STARTER.replace('Software Engineer', 'Assignment')],
  ['formal-letter', 'Formal Letter', 'Formal Letters', 'Community', 'A simple formal correspondence layout with sender and recipient details.', ['Letter', 'Formal'], RESUME_STARTER.replace('Software Engineer', 'Formal Letter')],
  ['newsletter', 'Newsletter', 'Newsletters', 'Community', 'A newsletter layout for announcements and short editorial sections.', ['Newsletter', 'Editorial'], RESUME_STARTER.replace('Software Engineer', 'Newsletter')],
  ['calendar', 'Calendar', 'Calendars', 'Community', 'A calendar document outline for schedules and dated items.', ['Calendar', 'Planning'], RESUME_STARTER.replace('Software Engineer', 'Calendar')],
  ['bibliography', 'Bibliography', 'Bibliographies', 'Community', 'A compact bibliography project starter for citations and references.', ['Bibliography', 'References'], RESUME_STARTER.replace('Software Engineer', 'Bibliography')],
  ['book', 'Book Chapter', 'Books', 'Community', 'A book chapter outline with title, section, and reference placeholders.', ['Book', 'Chapter'], RESUME_STARTER.replace('Software Engineer', 'Book Chapter')],
].map(([id, title, category, kind, description, tags, source]) => ({
  id, title, category, kind, author: 'Upskillyfy AI', description, tags, source,
}))

const legacyTemplateAliases = {
  'ats-resume': 'ats-friendly-resume',
  'software-engineer': 'software-engineer-resume',
  'quick-guide': 'technical-report',
  'research-report': 'technical-report',
  'conference-proceedings': 'research-paper',
  'undergraduate-thesis': 'thesis',
  dissertation: 'thesis',
  'math-philosophy': 'journal-article',
  'engineering-project': 'technical-report',
  'academic-article': 'journal-article',
  'community-guide': 'technical-report',
}

function templateId(id) {
  return legacyTemplateAliases[id] || id
}

export function normalizeTemplate(template) {
  if (!template || typeof template !== 'object' || typeof template.id !== 'string' || !template.id) return null

  const files = Array.isArray(template.files)
    ? template.files.filter(file => file && typeof (file.path || file.name) === 'string' && typeof file.content === 'string')
      .map(file => ({ name: file.path || file.name, content: file.content, isBinary: file.isBinary === true }))
    : []
  const mainFile = files.some(file => file.name === template.mainFile)
    ? template.mainFile
    : files.find(file => /\.tex$/i.test(file.name) && !file.isBinary)?.name || 'main.tex'
  const main = files.find(file => file.name === mainFile && !file.isBinary)
  const fallback = localTemplates.find(item => templateId(item.id) === templateId(template.id))
  const source = main?.content || (typeof template.source === 'string' ? template.source : fallback?.source || RESUME_STARTER)
  const normalizedFiles = files.some(file => file.name === mainFile && !file.isBinary)
    ? files
    : [...files, { name: mainFile, content: source, isBinary: false }]

  return {
    ...fallback,
    ...template,
    id: template.id,
    title: typeof template.title === 'string' && template.title.trim() ? template.title : fallback?.title || 'Untitled template',
    description: typeof template.description === 'string' ? template.description : fallback?.description || '',
    category: typeof template.category === 'string' ? template.category : fallback?.category || 'CVs and Résumés',
    kind: typeof template.kind === 'string' ? template.kind : fallback?.kind || 'Templates',
    author: typeof template.author === 'string' ? template.author : fallback?.author || 'Upskillyfy AI',
    tags: Array.isArray(template.tags) ? template.tags.filter(tag => typeof tag === 'string') : fallback?.tags || [],
    mainFile,
    files: normalizedFiles,
    source,
  }
}

export function findLocalTemplate(id) {
  if (typeof id !== 'string') return null
  const target = templateId(id)
  const found = localTemplates.find(item => item.id === target || item.id === id)
  return found ? normalizeTemplate(found) : null
}

export function filterLocalTemplates(search = '', kind = 'All', category = 'All') {
  const query = typeof search === 'string' ? search.trim().toLowerCase() : ''
  return localTemplates.filter(template => {
    const searchable = `${template.id} ${template.title} ${template.description} ${template.author} ${template.category} ${template.tags.join(' ')}`.toLowerCase()
    return (kind === 'All' || template.kind === kind)
      && (category === 'All' || template.category === category)
      && (!query || searchable.includes(query))
  }).map(normalizeTemplate)
}

export function getCurrentUserId(token = globalThis.localStorage?.getItem('token')) {
  if (!token || typeof token !== 'string') return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function'
      ? atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
      : Buffer.from(normalized, 'base64').toString('utf8')
    const decoded = JSON.parse(json)
    return typeof decoded.id === 'string' ? decoded.id : typeof decoded.sub === 'string' ? decoded.sub : null
  } catch {
    return null
  }
}

export function toResumeProjectPayload(project) {
  return {
    id: project.id,
    name: project.name ?? project.title,
    mainFile: project.mainFile,
    templateId: project.templateId || null,
    tags: Array.isArray(project.tags) ? project.tags : [],
    archived: project.archived === true,
    trashed: project.trashed === true,
    files: (Array.isArray(project.files) ? project.files : []).map(file => ({
      path: file.path ?? file.name,
      content: file.content,
      isBinary: file.isBinary === true,
    })),
  }
}

export function fromResumeProjectPayload(project, owner = null) {
  if (!project || typeof project !== 'object' || typeof project.id !== 'string' || !Array.isArray(project.files)) return null
  return {
    ...project,
    id: project.id,
    title: project.name || project.title || 'Untitled Project',
    mainFile: project.mainFile,
    files: project.files.map(file => ({
      name: file.name || file.path,
      content: file.content,
      isBinary: file.isBinary === true,
    })),
    cloudSaved: true,
    ...(owner ? { cloudOwner: owner } : {}),
  }
}

export function isValidTexUpload(file) {
  return Boolean(file && typeof file.name === 'string' && /\.tex$/i.test(file.name)
    && Number.isFinite(file.size) && file.size >= 0 && file.size <= 2 * 1024 * 1024)
}

export function isValidZipUpload(file) {
  return Boolean(file && typeof file.name === 'string' && /\.zip$/i.test(file.name)
    && Number.isFinite(file.size) && file.size >= 0 && file.size <= 5 * 1024 * 1024)
}

export { localTemplates as LOCAL_RESUME_TEMPLATES }
