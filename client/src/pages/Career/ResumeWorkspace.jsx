import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { oneDark } from '@codemirror/theme-one-dark'
import { Search, FileText, Plus, ArrowLeft, Download, Play, FolderOpen, Code2, Trash2, Upload, ChevronRight, ChevronDown, Folder, ExternalLink, Copy } from 'lucide-react'
import { latexTemplateAPI, resumeProjectAPI } from '../../api'
import './ResumeWorkspace.css'

const categories = ['Journal Articles','Bibliographies','Books','Calendars','CVs and Résumés','Formal Letters','Assignments','Newsletters','Posters','Presentations','Theses and Dissertations','Research Papers','Reports','Cover Letters']
const starter = String.raw`\documentclass[11pt,a4paper]{article}
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
const templates = [
 {id:'ats-resume',title:'ATS-Friendly Resume',category:'CVs and Résumés',kind:'Templates',author:'Upskillyfy AI',description:'A clean single-column resume starter designed to keep your experience easy to scan.',tags:['ATS','Resume','Single column'],source:starter},
 {id:'software-engineer',title:'Software Engineer Resume',category:'CVs and Résumés',kind:'Templates',author:'Upskillyfy AI',description:'A technical resume with focused experience, skills, and project sections.',tags:['Engineering','Projects'],source:starter.replace('Your Name','Jordan Ellis')},
 {id:'academic-cv',title:'Academic CV',category:'CVs and Résumés',kind:'Templates',author:'Upskillyfy AI',description:'An adaptable academic CV structure for education, research, and publications.',tags:['Academic','CV'],source:starter.replace('Software Engineer','Researcher')},
 {id:'cover-letter',title:'Cover Letter',category:'Cover Letters',kind:'Templates',author:'Upskillyfy AI',description:'A minimal letter layout for a tailored application.',tags:['Letter','Career'],source:starter.replace('Your Name','Your Name')},
 {id:'quick-guide',title:'A Quick Guide to LaTeX',category:'Examples',kind:'Examples',author:'Upskillyfy AI',description:'A compact example project showing the basic structure of a LaTeX document.',tags:['Guide','LaTeX'],source:starter},
 {id:'research-report',title:'Scientific Research Report',category:'Reports',kind:'Examples',author:'Upskillyfy AI',description:'A sample report structure with abstract, methods, results, and references.',tags:['Research','Report'],source:starter},
 {id:'thesis',title:'Mathematics Thesis',category:'Theses and Dissertations',kind:'Examples',author:'Upskillyfy AI',description:'An original thesis structure with chapter and bibliography placeholders.',tags:['Thesis','Mathematics'],source:starter},
 {id:'journal',title:'Basic Academic Journal Article',category:'Journal Articles',kind:'Templates',author:'Upskillyfy AI',description:'A lightweight article starter for an abstract, sections, and references.',tags:['Article','Academic'],source:starter},
 {id:'presentation',title:'University Presentation',category:'Presentations',kind:'Examples',author:'Upskillyfy AI',description:'A simple presentation project outline. Replace the article class with Beamer to extend it.',tags:['Slides','University'],source:starter},
 {id:'conference-proceedings',title:'Conference Proceedings',category:'Research Papers',kind:'Examples',author:'Upskillyfy AI',description:'An original proceedings layout for paper titles, abstracts, and author details.',tags:['Conference','Proceedings'],source:starter},
 {id:'undergraduate-thesis',title:'Undergraduate Thesis',category:'Theses and Dissertations',kind:'Examples',author:'Upskillyfy AI',description:'A starting outline for an undergraduate thesis with front matter and chapters.',tags:['Thesis','Undergraduate'],source:starter},
 {id:'dissertation',title:'University Dissertation',category:'Theses and Dissertations',kind:'Examples',author:'Upskillyfy AI',description:'A long-form dissertation outline with chapter and reference placeholders.',tags:['Dissertation','University'],source:starter},
 {id:'math-philosophy',title:'Mathematical Philosophy Journal',category:'Journal Articles',kind:'Examples',author:'Upskillyfy AI',description:'An original sample journal manuscript structure for mathematical philosophy.',tags:['Journal','Mathematics'],source:starter},
 {id:'engineering-project',title:'Computer Engineering Project',category:'Reports',kind:'Examples',author:'Upskillyfy AI',description:'A project report layout for engineering objectives, implementation, and results.',tags:['Engineering','Project'],source:starter},
 {id:'academic-article',title:'Academic Article',category:'Journal Articles',kind:'Templates',author:'Upskillyfy AI',description:'A concise scholarly article template with the common manuscript sections.',tags:['Article','Academic'],source:starter},
 {id:'community-guide',title:'Preparing a Reproducible LaTeX Project',category:'Reports',kind:'Community',author:'Upskillyfy AI',description:'An original community guide to keeping source files and assets organized in a LaTeX project.',tags:['Community','Guide'],source:starter},
]
const localTemplateAliases = {
 'ats-friendly-resume':'ats-resume',
 'software-engineer-resume':'software-engineer',
 'fresher-resume':'ats-resume',
 'experienced-professional-resume':'software-engineer',
 'research-paper':'conference-proceedings',
 'journal-article':'journal',
 'technical-report':'research-report',
 'poster':'presentation',
 'assignment':'undergraduate-thesis',
 'formal-letter':'cover-letter',
 'newsletter':'community-guide',
 'calendar':'community-guide',
 'bibliography':'community-guide',
 'book':'thesis',
}
function findLocalTemplate(templateId){
 const localId=localTemplateAliases[templateId]||templateId
 return templates.find(template=>template.id===localId)
}
function normalizeTemplate(template){
 const mainFile=template.mainFile||template.files?.[0]?.path||'main.tex'
 const files=template.files?.map(file=>({name:file.path,content:file.content,isBinary:file.isBinary===true}))||[{name:'main.tex',content:template.source||''}]
 return {...template,source:files.find(file=>file.name===mainFile)?.content||files[0]?.content||'',files}
}
function filterLocalTemplates(search,kind,category){
 const normalizedSearch=search.trim().toLowerCase()
 return templates.filter(template=>{
  const searchable=`${template.title} ${template.description} ${template.author} ${template.category} ${(template.tags||[]).join(' ')}`.toLowerCase()
  return (kind==='All'||template.kind===kind)&&(category==='All'||template.category===category)&&(!normalizedSearch||searchable.includes(normalizedSearch))
 })
}
const key='upskillyfy-latex-projects-v1'
function getProjects(){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return []}}
function writeProjectsLocal(items){localStorage.setItem(key,JSON.stringify(items))}
function currentUserId(){try{const part=localStorage.getItem('token')?.split('.')[1];if(!part)return null;const base64=part.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length/4)*4,'='))).id||null}catch{return null}}
function visibleProjects(){const owner=currentUserId();return getProjects().filter(project=>!project.cloudOwner||project.cloudOwner===owner)}
const cloudTimers = new Map()
const cloudBusy = new Set()
function cloudPayload(project){return {id:project.id,name:project.title,mainFile:project.mainFile,templateId:project.templateId,files:project.files.map(file=>({path:file.name,content:file.content,isBinary:file.isBinary===true}))}}
function scheduleCloudSave(project){
 const owner=currentUserId()
 if(!owner||project.cloudOwner&&project.cloudOwner!==owner)return
 clearTimeout(cloudTimers.get(project.id))
 cloudTimers.set(project.id,setTimeout(async()=>{
  const latest=getProjects().find(item=>item.id===project.id)
  if(!latest)return
  if(cloudBusy.has(project.id)){scheduleCloudSave(latest);return}
  cloudBusy.add(project.id)
  const snapshot=JSON.stringify(cloudPayload(latest))
  try{
   const payload=cloudPayload(latest)
   if(latest.cloudSaved&&latest.cloudOwner===owner)await resumeProjectAPI.update(latest.id,payload)
   else await resumeProjectAPI.create(payload)
   const current=getProjects()
   writeProjectsLocal(current.map(item=>item.id===latest.id?{...item,cloudSaved:true,cloudOwner:owner}:item))
   window.dispatchEvent(new CustomEvent('resume-project-cloud-saved',{detail:latest.id}))
  }catch(error){
   window.dispatchEvent(new CustomEvent('resume-project-cloud-save-failed',{detail:{id:project.id,message:error.response?.data?.message||'Cloud save failed. Your local draft is still safe.'}}))
  }
  cloudBusy.delete(project.id)
  cloudTimers.delete(project.id)
  const current=getProjects().find(item=>item.id===project.id)
  if(current&&JSON.stringify(cloudPayload(current))!==snapshot)scheduleCloudSave(current)
 },600))
}
function saveProjects(items){
 const before=getProjects()
 const normalized=items.map(item=>before.some(previous=>previous.id===item.id&&previous.cloudSaved)?{...item,cloudSaved:true}:item)
 writeProjectsLocal(normalized)
 for(const item of normalized){
  const previous=before.find(old=>old.id===item.id)
  if(!previous||JSON.stringify(previous)!==JSON.stringify(item))scheduleCloudSave(item)
 }
 for(const previous of before){
  if(!normalized.some(item=>item.id===previous.id)&&previous.cloudSaved&&previous.cloudOwner===currentUserId())resumeProjectAPI.remove(previous.id).catch(()=>{})
 }
}
export function createProject(title='Untitled Resume', source=starter, files=[{name:'main.tex',content:source}], templateId=null, mainFile='main.tex'){const projects=getProjects();const p={id:crypto.randomUUID(),title,mainFile,files,templateId,cloudOwner:currentUserId(),updatedAt:new Date().toISOString()};saveProjects([p,...projects]);return p}
function localProject(remote,owner){return {id:remote.id,title:remote.name,mainFile:remote.mainFile,templateId:remote.templateId,files:remote.files.map(file=>({name:file.path,content:file.content,isBinary:file.isBinary===true})),updatedAt:remote.updatedAt,cloudSaved:true,cloudOwner:owner}}
async function importProjectFile(file,navigate){
 if(!file)return
 const extension=file.name.split('.').pop().toLowerCase()
 if(extension==='zip'){
  if(!localStorage.getItem('token')){alert('Sign in to import a ZIP project.');return}
  if(file.size>5*1024*1024){alert('ZIP archives must be 5 MB or smaller.');return}
  try{
   const {data}=await resumeProjectAPI.importZip(file)
   const mainFile=data.mainFiles.length>1?prompt(`Choose the main .tex file:\n${data.mainFiles.join('\n')}`,data.mainFile):data.mainFile
   if(!mainFile||!data.mainFiles.includes(mainFile))return
   const files=data.files.map(entry=>({name:entry.path,content:entry.content,isBinary:entry.isBinary}))
   const main=files.find(entry=>entry.name===mainFile)
   const project=createProject(file.name.replace(/\.zip$/i,''),main.content,files,null,mainFile)
   navigate(`/career/resume/editor/${project.id}`)
  }catch(error){alert(error.response?.data?.message||'Could not import this ZIP project.')}
  return
 }
 if(extension!=='tex'){alert('Import a .tex file or a ZIP project archive.');return}
 if(file.size>2*1024*1024){alert('TeX files must be 2 MB or smaller.');return}
 const reader=new FileReader()
 reader.onload=()=>{const content=String(reader.result);const project=createProject(file.name.replace(/\.tex$/i,''),content,[{name:file.name,content}]);navigate(`/career/resume/editor/${project.id}`)}
 reader.readAsText(file)
}
function download(name,content,type='text/plain'){const url=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
function Preview({title,category}){return <div className="latex-paper"><div className="paper-kicker">UPSKILLYFY AI · ORIGINAL DEMO</div><h3>{title}</h3><div className="paper-rule"/><div className="paper-meta">{category}</div><div className="paper-lines"><i/><i/><i/><i/><i/><i/><i/></div><b>Experience</b><div className="paper-lines"><i/><i/><i/><i/></div><b>Education</b><div className="paper-lines"><i/><i/><i/></div></div>}
function createFrom(template){const normalized=normalizeTemplate(template);const p=createProject(normalized.title,normalized.source,normalized.files,normalized.id,normalized.mainFile||normalized.files[0]?.name||'main.tex');return p}

export function ResumeGallery(){
 const [q,setQ]=useState('')
 const [kind,setKind]=useState('All')
 const [category,setCategory]=useState('All')
 const [page,setPage]=useState(1)
 const [items,setItems]=useState([])
 const [pagination,setPagination]=useState({page:1,pages:1,total:0})
 const [catalogStatus,setCatalogStatus]=useState('Loading templates…')
 const navigate=useNavigate()
 useEffect(()=>{let active=true;latexTemplateAPI.list({search:q,kind,category,page,limit:6}).then(({data})=>{if(!active)return;setItems(data.templates.map(normalizeTemplate));setPagination(data.pagination);setCatalogStatus('')}).catch(()=>{if(active){const local=filterLocalTemplates(q,kind,category);setItems(local.map(normalizeTemplate).slice((page-1)*6,page*6));setPagination({page,pages:Math.max(1,Math.ceil(local.length/6)),total:local.length});setCatalogStatus('Offline template catalogue')}});return()=>{active=false}},[q,kind,category,page])
 useEffect(()=>setPage(1),[q,kind,category])
 return <main className="latex-wrap"><div className="latex-hero"><div className="latex-eyebrow">{'{upskillyfy template gallery}'}</div><h1>LaTeX templates</h1><p>LaTeX templates for journal articles, academic papers, CVs and résumés, presentations, and more.</p><form className="latex-search" onSubmit={e=>e.preventDefault()}><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search templates, authors, categories…" aria-label="Search templates"/><button className="latex-button primary">Search</button></form><div className="latex-quick"><button onClick={()=>navigate('/career/resume/create')}><FileText size={16}/> Create Resume</button><button onClick={()=>navigate('/career/resume/projects')}><FolderOpen size={16}/> My Projects</button><button onClick={()=>navigate(`/career/resume/editor/${createProject().id}`)}><Plus size={16}/> Write Your Own LaTeX Code</button><label className="latex-button"><Upload size={16}/> Import Existing Project<input type="file" accept=".tex,.zip,text/plain,application/zip" hidden onChange={e=>{importProjectFile(e.target.files?.[0],navigate);e.target.value=''}}/></label></div></div>{catalogStatus&&<p role="status" className="latex-catalog-status">{catalogStatus}</p>}<section className="latex-section"><h2>Categories</h2><p>Browse a document type to get started.</p><div className="latex-categories">{categories.map((c,i)=><button className={`latex-category ${category===c?'selected':''}`} key={c} onClick={()=>setCategory(category===c?'All':c)}><span>{String(i+1).padStart(2,'0')}</span><b>{c}</b><small>{['Articles and submissions','Citations and references','Long-form documents','Planning and scheduling','Professional profiles','Formal correspondence','Coursework and classes','Editorial projects','Research communication','Talks and slides','Graduate research','Academic studies','Findings and analysis','Job applications'][i]}</small></button>)}</div></section><section className="latex-section"><div className="latex-section-head"><div><h2>Templates</h2><p>Original Upskillyfy AI document starters.</p></div><Link to="/career/resume/projects">My Projects <ChevronRight size={16}/></Link></div><div className="latex-filters">{['All','Templates','Examples','Community'].map(k=><button key={k} className={kind===k?'active':''} onClick={()=>setKind(k)}>{k==='Community'?'Community articles':k}</button>)}<select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select></div>{items.length?<div className="latex-grid">{items.map(t=><article className="latex-card" key={t.id}><Link to={`/career/resume/templates/${t.id}`} className="latex-card-preview"><Preview title={t.title} category={t.category}/></Link><div className="latex-card-copy"><span>{t.category}</span><Link to={`/career/resume/templates/${t.id}`}><h3>{t.title}</h3></Link><p>{t.description}</p><small>{t.author} · {t.kind}</small></div><button className="latex-card-open" onClick={()=>{const p=createFrom(t);navigate(`/career/resume/editor/${p.id}`)}}>Open as template <ChevronRight size={15}/></button></article>)}</div>:<div className="latex-empty"><FileText/><h3>No matching documents</h3><p>Try another search or clear the selected category.</p></div>}<div className="latex-pagination"><span>{pagination.total} results</span><button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {pagination.pages}</span><button disabled={page>=pagination.pages} onClick={()=>setPage(page+1)}>Next</button></div></section></main>
}
export function ResumeTemplateDetail(){
 const {templateId}=useParams()
 const navigate=useNavigate()
 const [showSource,setShowSource]=useState(false)
 const [template,setTemplate]=useState(()=>normalizeTemplate(findLocalTemplate(templateId)||{}))
 const [loading,setLoading]=useState(true)
 const [catalogStatus,setCatalogStatus]=useState('')
 useEffect(()=>{let active=true;setLoading(true);setCatalogStatus('');latexTemplateAPI.get(templateId).then(({data})=>{if(active)setTemplate(normalizeTemplate(data.template))}).catch(()=>{if(active&&findLocalTemplate(templateId))setCatalogStatus('Offline template catalogue')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[templateId])
 if(loading&&!template.id)return <main className="latex-wrap"><div className="latex-empty"><h3>Loading template…</h3></div></main>
 if(!template.id)return <main className="latex-wrap"><h1>Template not found</h1><Link to="/career/resume">Back to templates</Link></main>
 return <main className="latex-wrap">
  <Link className="latex-back" to="/career/resume"><ArrowLeft size={16}/> Back to all templates</Link>
  {catalogStatus&&<p role="status" className="latex-catalog-status">{catalogStatus}</p>}
  <div className="latex-detail-head"><div><span className="latex-eyebrow">{template.category}</span><h1>{template.title}</h1><p>{template.description}</p><div className="latex-detail-actions"><button className="latex-button primary" onClick={()=>{const project=createFrom(template);navigate(`/career/resume/editor/${project.id}`)}}><Code2 size={16}/> Open as Template</button><button className="latex-button" onClick={()=>setShowSource(true)}><Code2 size={16}/> View Source</button><button className="latex-button" onClick={()=>download('main.tex',template.source)}><Download size={16}/> Download Source</button><button className="latex-button" disabled title="No compiled PDF is available">PDF unavailable</button></div></div></div>
  <div className="latex-detail-grid"><aside className="latex-metadata"><h3>About this project</h3><p>{template.description}</p><dl><dt>Author</dt><dd>{template.author}</dd><dt>License</dt><dd>Not provided · original demo</dd><dt>Last updated</dt><dd>Not provided</dd><dt>Compiler</dt><dd>Not provided</dd><dt>Source files</dt><dd>main.tex</dd></dl><div className="latex-tags">{template.tags.map(tag=><span key={tag}>{tag}</span>)}</div></aside><div className="latex-detail-preview"><div className="latex-no-pdf"><FileText size={34}/><b>PDF preview unavailable</b><p>No compiled PDF is available for this original demo template. Open it as a project to edit its source.</p></div></div></div>
  {showSource&&<div className="latex-source-overlay" role="dialog" aria-modal="true" aria-label={`${template.title} source`}><section><header><div><b>main.tex</b><small>{template.title} · original demo source</small></div><button onClick={()=>setShowSource(false)} aria-label="Close source">Close</button></header><pre><code>{template.source}</code></pre><footer><button className="latex-button" onClick={()=>download('main.tex',template.source)}><Download size={15}/> Download source</button><button className="latex-button primary" onClick={()=>{const project=createFrom(template);navigate(`/career/resume/editor/${project.id}`)}}>Open as project</button></footer></section></div>}
 </main>
}
export function ResumeProjects(){
 const [items,setItems]=useState(visibleProjects)
 const [loading,setLoading]=useState(Boolean(localStorage.getItem('token')))
 const [query,setQuery]=useState('')
 const navigate=useNavigate()
 useEffect(()=>{
  let active=true
  const owner=currentUserId()
  if(!owner)return undefined
  resumeProjectAPI.list().then(({data})=>{
   if(!active)return
   const remote=data.projects.map(project=>localProject(project,owner))
   const hidden=getProjects().filter(project=>project.cloudOwner&&project.cloudOwner!==owner)
   const local=visibleProjects()
   const remoteById=new Map(remote.map(project=>[project.id,project]))
   const merged=[...remote]
   const pending=[]
   for(const draft of local){
    const saved=remoteById.get(draft.id)
    if(!saved){merged.unshift(draft);pending.push(draft);continue}
    if(new Date(draft.updatedAt)>new Date(saved.updatedAt)){
     const newest={...draft,cloudSaved:true}
     const index=merged.findIndex(project=>project.id===draft.id)
     merged[index]=newest
     pending.push(newest)
    }
   }
   writeProjectsLocal([...merged,...hidden])
   pending.forEach(scheduleCloudSave)
   setItems(merged)
  }).catch(()=>{}).finally(()=>{if(active)setLoading(false)})
  return ()=>{active=false}
 },[])
 const duplicate=project=>{createProject(`${project.title} (copy)`,'',project.files.map(file=>({...file})),project.templateId,project.mainFile);setItems(visibleProjects())}
 const shown=items.filter(p=>p.title.toLowerCase().includes(query.toLowerCase()))
 const remove=id=>{const next=items.filter(x=>x.id!==id);const hidden=getProjects().filter(project=>project.cloudOwner&&project.cloudOwner!==currentUserId());saveProjects([...next,...hidden]);setItems(next)}
 return <main className="latex-wrap"><Link className="latex-back" to="/career/resume"><ArrowLeft size={16}/> Resume Builder</Link><div className="latex-section-head"><div><div className="latex-eyebrow">{'{your workspace}'}</div><h1>My Projects</h1><p>{loading?'Syncing projects…':localStorage.getItem('token')?'Projects sync with your account and remain available on this device.':'Saved on this device in this browser.'}</p></div><button className="latex-button primary" onClick={()=>{const p=createProject();navigate(`/career/resume/editor/${p.id}`)}}><Plus size={16}/> New project</button></div>{items.length>0&&<div className="latex-search latex-project-search"><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search projects" aria-label="Search projects"/></div>}{shown.length?<div className="latex-project-list">{shown.map(p=><article key={p.id}><FileText/><div><b>{p.title}</b><small>{p.cloudSaved?'Synced · ': 'Local draft · '}{new Date(p.updatedAt).toLocaleString()}</small></div><button onClick={()=>navigate(`/career/resume/editor/${p.id}`)}>Continue editing</button><button aria-label="Duplicate project" title="Duplicate" onClick={()=>duplicate(p)}><Copy size={16}/></button><button aria-label="Delete project" onClick={()=>remove(p.id)}><Trash2 size={16}/></button></article>)}</div>:<div className="latex-empty"><FileText/><h3>{loading?'Loading projects…':items.length?'No matching projects':'No projects yet'}</h3><p>Create a resume from a template or start with a blank document.</p><button onClick={()=>{const p=createProject();navigate(`/career/resume/editor/${p.id}`)}}>Start blank project</button></div>}</main>
}
export function ResumeEditor(){
 const {projectId}=useParams()
 const navigate=useNavigate()
 const [project,setProject]=useState(()=>visibleProjects().find(item=>item.id===projectId))
 const [loadingProject,setLoadingProject]=useState(!visibleProjects().some(item=>item.id===projectId))
 const [active,setActive]=useState(()=>visibleProjects().find(item=>item.id===projectId)?.mainFile||'main.tex')
 const [openFiles,setOpenFiles]=useState(()=>[visibleProjects().find(item=>item.id===projectId)?.mainFile||'main.tex'])
 const [fileSearch,setFileSearch]=useState('')
 const [editorFontSize,setEditorFontSize]=useState(()=>Math.min(24,Math.max(11,Number(localStorage.getItem('latex-editor-font-size'))||14)))
 const [status,setStatus]=useState('Saved locally')
 const [pdfUrl,setPdfUrl]=useState('')
 const [compileError,setCompileError]=useState('')
 const [compilerLog,setCompilerLog]=useState('')
 const [compiling,setCompiling]=useState(false)
 const [collapsed,setCollapsed]=useState(()=>new Set())
 const [autoCompile,setAutoCompile]=useState(()=>localStorage.getItem('latex-auto-compile')==='1')
 const compileRef=useRef(null)
 const editorRef=useRef(null)
 const file=project?.files.find(item=>item.name===active)||project?.files[0]
 const outline=useMemo(()=>file&&!file.isBinary?[...file.content.matchAll(/\\(?:chapter|section|subsection|subsubsection)\*?\{([^}]+)\}/g)].map(match=>({label:match[1],index:match.index})):[],[file])
 useEffect(()=>{
  let active=true
  if(project){setLoadingProject(false);return undefined}
  if(!localStorage.getItem('token')){setLoadingProject(false);return undefined}
  resumeProjectAPI.get(projectId).then(({data})=>{
   if(!active)return
   const restored=localProject(data.project,currentUserId())
   writeProjectsLocal([restored,...getProjects().filter(item=>item.id!==restored.id)])
   setProject(restored)
   setActive(restored.mainFile)
   setOpenFiles([restored.mainFile])
  }).catch(()=>{}).finally(()=>{if(active)setLoadingProject(false)})
  return ()=>{active=false}
 },[project,projectId])
 useEffect(()=>{if(!loadingProject&&!project)navigate('/career/resume/projects',{replace:true})},[loadingProject,project,navigate])
 useEffect(()=>()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl)},[pdfUrl])
 useEffect(()=>{const synced=event=>{if(event.detail!==projectId)return;setProject(current=>current?{...current,cloudSaved:true}:current);setStatus('Saved to your account')};window.addEventListener('resume-project-cloud-saved',synced);return()=>window.removeEventListener('resume-project-cloud-saved',synced)},[projectId])
 useEffect(()=>{const failed=event=>{if(event.detail?.id===projectId)setStatus(event.detail.message)};window.addEventListener('resume-project-cloud-save-failed',failed);return()=>window.removeEventListener('resume-project-cloud-save-failed',failed)},[projectId])
 useEffect(()=>{const onKey=event=>{if((event.metaKey||event.ctrlKey)&&event.key==='Enter'){event.preventDefault();compileRef.current?.()}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])
 useEffect(()=>{if(!autoCompile||!project||!localStorage.getItem('token'))return undefined;const timer=setTimeout(()=>compileRef.current?.(),3500);return()=>clearTimeout(timer)},[autoCompile,project?.updatedAt])
 if(loadingProject)return <main className="latex-wrap"><div className="latex-empty"><h3>Loading project…</h3><p>Restoring the latest saved workspace.</p></div></main>
 if(!project)return null
 const persist=(next,message='Saved locally')=>{
  const updated={...next,updatedAt:new Date().toISOString()}
  setProject(updated)
  saveProjects(getProjects().map(item=>item.id===updated.id?updated:item))
  setStatus(localStorage.getItem('token')?'Saved locally · syncing':'Saved locally')
  window.setTimeout(()=>setStatus(message),700)
 }
 const openFile=name=>{setOpenFiles(current=>current.includes(name)?current:[...current,name]);setActive(name)}
 const updateSource=value=>persist({...project,files:project.files.map(item=>item.name===file.name?{...item,content:value}:item)},'Saved locally')
 const addFile=()=>{
  const name=prompt('File path (for example references.bib)')
  if(!name)return
  if(!/^[\w .()/-]+\.(tex|bib|sty|cls|txt|md)$/i.test(name)||name.split('/').some(part=>!part||part==='.'||part==='..')){alert('Use a relative path ending in .tex, .bib, .sty, .cls, .txt, or .md.');return}
  if(project.files.some(item=>item.name===name)){alert('A file with that name already exists.');return}
  const next={...project,files:[...project.files,{name,content:''}]}
  persist(next);openFile(name)
 }
 const importFile=event=>{
  const uploaded=event.target.files?.[0]
  event.target.value=''
  if(!uploaded)return
  if(uploaded.size>2*1024*1024){alert('Files must be 2 MB or smaller.');return}
  if(project.files.length>=100){alert('A project can contain at most 100 files.');return}
  if(!/\.(tex|bib|sty|cls|txt|md|png|jpe?g|pdf)$/i.test(uploaded.name)){alert('Unsupported file. Use .tex, .bib, .sty, .cls, .txt, .md, .png, .jpg, .jpeg, or .pdf.');return}
  if(project.files.some(item=>item.name===uploaded.name)){alert('A file with that name already exists.');return}
  const binary=/\.(png|jpe?g|pdf)$/i.test(uploaded.name)
  const reader=new FileReader()
  reader.onload=()=>{
   const result=String(reader.result)
   const content=binary?result.slice(result.indexOf(',')+1):result
   const next={...project,files:[...project.files,{name:uploaded.name,content,isBinary:binary}]}
   persist(next);openFile(uploaded.name)
  }
  if(binary) reader.readAsDataURL(uploaded)
  else reader.readAsText(uploaded)
 }
 const removeFile=name=>{
  if(name===project.mainFile){alert('Choose another main .tex file before removing this one.');return}
  if(!confirm(`Remove ${name} from this project?`))return
  const next={...project,files:project.files.filter(item=>item.name!==name)}
  persist(next)
  setOpenFiles(current=>{const remaining=current.filter(item=>item!==name);if(active===name)setActive(remaining[0]||next.mainFile);return remaining.length?remaining:[next.mainFile]})
 }
 const renameFile=name=>{
  const nextName=prompt('New relative file path',name)
  if(!nextName||nextName===name)return
  if(!/^[\w .()/-]+\.(tex|bib|sty|cls|txt|md|png|jpe?g|pdf)$/i.test(nextName)||nextName.split('/').some(part=>!part||part==='.'||part==='..')||project.files.some(item=>item.name===nextName)){alert('Choose a unique supported relative file path.');return}
  const next={...project,mainFile:project.mainFile===name?nextName:project.mainFile,files:project.files.map(item=>item.name===name?{...item,name:nextName}:item)}
  persist(next);setOpenFiles(current=>current.map(item=>item===name?nextName:item));if(active===name)setActive(nextName)
 }
 const setMain=name=>{if(!/\.tex$/i.test(name))return;persist({...project,mainFile:name},'Main document saved')}
 const insertSnippet=snippet=>{
  const view=editorRef.current
  if(!view||!file||file.isBinary)return
  const {from,to}=view.state.selection.main
  view.dispatch({changes:{from,to,insert:snippet},selection:{anchor:from+snippet.length},scrollIntoView:true})
  view.focus()
 }
 const navigateOutline=index=>{
  const view=editorRef.current
  if(!view)return
  view.dispatch({selection:{anchor:index},scrollIntoView:true})
  view.focus()
 }
 const compile=async()=>{
  if(!localStorage.getItem('token')){setCompileError('Sign in to compile this project with the isolated compiler service.');return}
  if(compiling)return
  setCompiling(true);setCompileError('');setCompilerLog('');setStatus('Compiling…')
  try{
   const {data,headers}=await resumeProjectAPI.compile(cloudPayload(project))
   if(pdfUrl)URL.revokeObjectURL(pdfUrl)
   setPdfUrl(URL.createObjectURL(data))
   const encodedLog=headers['x-compiler-log']
   if(encodedLog){try{setCompilerLog(atob(encodedLog))}catch{setCompilerLog('Compilation finished.')}}
   setStatus('PDF compiled')
  }catch(error){
   const response=error.response?.data
   let message=error.message
   if(response instanceof Blob){try{const body=JSON.parse(await response.text());message=body.message||message;setCompilerLog(body.log||'')}catch{}}
   else if(response?.message)message=response.message
   setCompileError(message||'Compilation failed.');setStatus('Compilation failed')
  }finally{setCompiling(false)}
 }
 compileRef.current=compile
 const problems=[...compilerLog.matchAll(/^(error|warning):\s*(?:([^\s:]+\.(?:tex|sty|cls|bib)):(\d+):\s*)?(.+)$/gim)].map(match=>({level:match[1].toLowerCase(),file:match[2]||'',line:Number(match[3]||0),message:match[4].trim()}))
 const jumpTo=problem=>{
  if(problem.file&&project.files.some(item=>item.name===problem.file))openFile(problem.file)
  if(!problem.line)return
  window.setTimeout(()=>{const view=editorRef.current;if(!view)return;const line=view.state.doc.line(Math.min(problem.line,view.state.doc.lines));view.dispatch({selection:{anchor:line.from},scrollIntoView:true});view.focus()},80)
 }
 const toggleFolder=dir=>setCollapsed(current=>{const next=new Set(current);if(next.has(dir))next.delete(dir);else next.add(dir);return next})
 const treeRows=(()=>{
  const query=fileSearch.toLowerCase()
  const list=project.files.filter(item=>item.name.toLowerCase().includes(query)).sort((a,b)=>{const ap=a.name.split('/'),bp=b.name.split('/');for(let i=0;i<Math.min(ap.length,bp.length);i++){if(ap[i]!==bp[i]){const ad=i<ap.length-1,bd=i<bp.length-1;if(ad!==bd)return ad?-1:1;return ap[i].localeCompare(bp[i])}}return ap.length-bp.length})
  const rows=[];const seen=new Set()
  for(const item of list){const parts=item.name.split('/');let hidden=false
   for(let i=0;i<parts.length-1;i++){const dir=parts.slice(0,i+1).join('/');if(!seen.has(dir)){seen.add(dir);if(!hidden)rows.push({folder:dir,depth:i})}if(collapsed.has(dir))hidden=true}
   if(!hidden)rows.push({item,depth:parts.length-1})}
  return rows
 })()
 const downloadPdf=()=>{if(!pdfUrl)return;const link=document.createElement('a');link.href=pdfUrl;link.download=`${project.title.replace(/[^\w-]/g,'-')}.pdf`;link.click()}
 const downloadZip=async()=>{if(!localStorage.getItem('token')){setCompileError('Sign in to download the project ZIP.');return}try{const {data}=await resumeProjectAPI.sourceZip(project.id);download(`${project.title.replace(/[^\w-]/g,'-')}.zip`,data,'application/zip')}catch(error){setCompileError(error.response?.data?.message||'Could not download the source ZIP. Save the project to your account and try again.')}}
 const downloadSource=()=>download(`${file.name.split('/').pop()||'source.tex'}`,file.isBinary?Uint8Array.from(atob(file.content),char=>char.charCodeAt(0)):file.content,file.isBinary?'application/octet-stream':'text/plain')
 const closeTab=(name,event)=>{event.stopPropagation();const remaining=openFiles.filter(item=>item!==name);setOpenFiles(remaining.length?remaining:[project.mainFile]);if(active===name)setActive(remaining[remaining.length-1]||project.mainFile)}
 return <div className="latex-editor">
  <header className="latex-editor-top"><Link to="/career/resume/projects"><ArrowLeft size={17}/></Link><input value={project.title} aria-label="Project name" onChange={event=>persist({...project,title:event.target.value})}/><span>{status}</span><button onClick={compile} disabled={compiling} title="Recompile (Ctrl/Cmd + Enter)"><Play size={15}/> {compiling?'Compiling…':'Recompile'}</button><label className="latex-autocompile" title="Recompile automatically after you stop typing"><input type="checkbox" checked={autoCompile} onChange={event=>{setAutoCompile(event.target.checked);localStorage.setItem('latex-auto-compile',event.target.checked?'1':'0')}}/> Auto</label>{pdfUrl&&<button onClick={downloadPdf}><Download size={15}/> PDF</button>}<button onClick={downloadZip}><Download size={15}/> Source ZIP</button><button onClick={downloadSource}><Download size={15}/> File</button></header>
  <div className="latex-editor-body">
   <aside className="latex-filepane"><div className="latex-pane-title">PROJECT FILES <button onClick={addFile} title="New file"><Plus size={15}/></button></div>
    <input className="latex-file-search" value={fileSearch} onChange={event=>setFileSearch(event.target.value)} placeholder="Search files" aria-label="Search project files"/>
    {treeRows.map(row=>{const item=row.item;return row.folder?<button className="latex-folder-row" key={'dir:'+row.folder} style={{paddingLeft:12+row.depth*12}} onClick={()=>toggleFolder(row.folder)}>{collapsed.has(row.folder)?<ChevronRight size={14}/>:<ChevronDown size={14}/>}<Folder size={14}/>{row.folder.split('/').pop()}</button>:<div className="latex-file-row" key={item.name} style={{paddingLeft:row.depth*12}}><button className={item.name===active?'active':''} onClick={()=>openFile(item.name)} title={item.name}><FileText size={15}/>{item.name.split('/').pop()}{item.name===project.mainFile&&<small>main</small>}</button>{/\.tex$/i.test(item.name)&&<button title="Set main document" aria-label={`Set ${item.name} as the main document`} onClick={()=>setMain(item.name)}>{item.name===project.mainFile?'●':'○'}</button>}<button title="Rename file" aria-label={`Rename ${item.name}`} onClick={()=>renameFile(item.name)}>✎</button><button title="Delete file" aria-label={`Delete ${item.name}`} onClick={()=>removeFile(item.name)}>×</button></div>})}
    <label className="latex-upload">Upload source or asset<input type="file" accept=".tex,.bib,.sty,.cls,.txt,.md,.png,.jpg,.jpeg,.pdf" hidden onChange={importFile}/></label>
    <div className="latex-outline"><b>OUTLINE</b>{outline.length?outline.map(item=><button key={`${item.index}-${item.label}`} onClick={()=>navigateOutline(item.index)}>{item.label}</button>):<small>No sections in this file</small>}</div>
    <div className="latex-editor-note">{project.cloudSaved?'Account-synced project':'Local draft'} · source autosaves as you edit.</div>
   </aside>
   <section className="latex-codepane"><div className="latex-open-tabs">{openFiles.map(name=><button className={name===active?'active':''} key={name} onClick={()=>setActive(name)}>{name.split('/').pop()}<span onClick={event=>closeTab(name,event)}>×</span></button>)}</div><div className="latex-insert-tools"><label className="latex-font-size">Editor text<select aria-label="Editor font size" value={editorFontSize} onChange={event=>{const size=Number(event.target.value);setEditorFontSize(size);localStorage.setItem('latex-editor-font-size',String(size))}}>{[12,13,14,15,16,18,20,22,24].map(size=><option key={size} value={size}>{size}px</option>)}</select></label><button onClick={()=>insertSnippet('\\section*{New section}\n')}>Section</button><button onClick={()=>insertSnippet('\\begin{itemize}\n  \\item New item\n\\end{itemize}\n')}>List</button><button onClick={()=>insertSnippet('\\begin{figure}[ht]\n  \\centering\n  \\includegraphics[width=0.8\\linewidth]{image.png}\n  \\caption{Caption}\n\\end{figure}\n')}>Figure</button><button onClick={()=>insertSnippet('\\cite{citation-key}')}>Citation</button><button onClick={()=>insertSnippet('\\ref{section-label}')}>Reference</button></div>{file?.isBinary?<div className="latex-binary-file"><FileText size={30}/><b>{file.name}</b><p>Binary asset · {Math.round(atob(file.content).length/1024)} KB</p></div>:<CodeMirror value={file?.content||''} height="calc(100vh - 205px)" style={{fontSize:`${editorFontSize}px`}} extensions={[StreamLanguage.define(stex)]} theme={document.documentElement.dataset.theme==='dark'?oneDark:undefined} onChange={updateSource} onCreateEditor={view=>{editorRef.current=view}} basicSetup={{lineNumbers:true,foldGutter:true,highlightActiveLine:true,indentOnInput:true,tabSize:2}}/>}{compileError&&<div className="latex-compile-error" role="alert">{compileError}</div>}{compilerLog&&<details className="latex-compiler-log"><summary>Compiler log</summary><pre>{compilerLog}</pre></details>}</section>
   <aside className="latex-pdfpane"><div className="latex-pane-title">PDF PREVIEW{pdfUrl&&<a className="latex-pdf-open" href={pdfUrl} target="_blank" rel="noreferrer" title="Open PDF in new tab"><ExternalLink size={14}/></a>}</div>{pdfUrl?<iframe title="Compiled PDF" src={`${pdfUrl}#view=FitH`}/>:<div className="latex-no-pdf"><FileText size={34}/><b>Compile to preview your PDF</b><p>Successful compilation creates the real document preview here.</p><button onClick={compile} disabled={compiling}>{compiling?'Compiling…':'Recompile'}</button></div>}{problems.length>0&&<div className="latex-problems"><b>Problems ({problems.length})</b>{problems.slice(0,50).map((item,index)=><button key={index} className={`latex-problem ${item.level}`} onClick={()=>jumpTo(item)}>{item.file&&<span>{item.file}{item.line?`:${item.line}`:''}</span>}{item.message}</button>)}</div>}</aside>
  </div>
  <div className="latex-editor-mobilebar"><Link to="/career/resume/projects">Projects</Link><label>Upload<input type="file" accept=".tex,.bib,.sty,.cls,.txt,.md,.png,.jpg,.jpeg,.pdf" hidden onChange={importFile}/></label><button onClick={compile}>Recompile</button>{pdfUrl&&<button onClick={downloadPdf}>PDF</button>}</div>
 </div>
}
