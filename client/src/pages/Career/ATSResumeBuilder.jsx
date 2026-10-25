import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Plus, Trash2, Upload } from 'lucide-react'
import { createProject as createResumeProject } from './ResumeWorkspace'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './ATSResumeBuilder.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const emptyExperience = () => ({ role:'',company:'',dates:'',bullets:'' })
const emptyEducation = () => ({ degree:'',institution:'',dates:'' })
const escapeLatex = (value='') => value.replace(/[\\{}$&#_%~^]/g, char => ({'\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','&':'\\&','#':'\\#','_':'\\_','%':'\\%','~':'\\textasciitilde{}','^':'\\textasciicircum{}'}[char]))
const section = (title, body) => body.trim() ? `\\section*{${title}}\n${body.trim()}\n` : ''
const headingPattern = /^(summary|profile|objective|experience|employment|work history|education|skills|technical skills|projects|certifications|certificates|awards|achievements)\s*:?$/i
function parseResumeText(text) {
 const lines=text.split(/\r?\n/).map(line=>line.replace(/[•▪◦]\s*/g,'').trim()).filter(Boolean)
 const headingIndex=lines.findIndex(line=>headingPattern.test(line))
 const nameLine=(headingIndex>0?lines.slice(0,headingIndex):lines.slice(0,5)).find(line=>line.length<80&&!/@|https?:\/\/|www\.|\+?\d[\d ()-]{7,}/i.test(line))||''
 const email=text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0]||''
 const phone=text.match(/\+?\d[\d ().-]{7,}\d/)?.[0]||''
 const sections={}
 let current='intro'
 for(const line of lines){if(headingPattern.test(line)){current=line.toLowerCase().replace(/:$/,'');sections[current]=sections[current]||[];continue}(sections[current]||(sections[current]=[])).push(line)}
 const findSection=(...terms)=>Object.entries(sections).find(([title])=>terms.some(term=>title.includes(term)))?.[1]||[]
 const summary=findSection('summary','profile','objective').join(' ')
 const experienceLines=findSection('experience','employment','work history')
 const bulletLines=experienceLines.filter(line=>/^[-*•]/.test(line))
 const experienceBody=(bulletLines.length?bulletLines:experienceLines.slice(1)).join('\n')
 const experience=experienceLines.length?[{role:experienceLines[0].slice(0,100),company:'',dates:'',bullets:experienceBody}]:[emptyExperience()]
 const educationLines=findSection('education')
 const education=educationLines.length?[{degree:educationLines[0].slice(0,120),institution:educationLines.slice(1,3).join(' · '),dates:''}]:[emptyEducation()]
 const skills=findSection('technical skills','skills').join(', ').replace(/\s*,\s*/g,', ').slice(0,1200)
 const projects=findSection('projects').join('\n').slice(0,3000)
 const certifications=findSection('certifications','certificates','awards','achievements').join('\n').slice(0,1500)
 const links=[...new Set(text.match(/(?:https?:\/\/|www\.)[^\s|,]+/g)||[])].join(', ')
 return {name:nameLine,email,phone,location:'',links,summary,experience,education,projects,skills,certifications,jobDescription:''}
}
function toLatex(data){
 const contact=[data.email,data.phone,data.location].filter(Boolean).map(escapeLatex).join(' \\textbar{} ')
 const links=data.links.split(',').map(item=>escapeLatex(item.trim())).filter(Boolean).join(' \\textbar{} ')
 const experience=data.experience.filter(item=>item.role||item.company).map(item=>`\\textbf{${escapeLatex(item.role)}}${item.company?` — ${escapeLatex(item.company)}`:''}${item.dates?` \\hfill ${escapeLatex(item.dates)}`:''}\n\\begin{itemize}[leftmargin=1.2em]\n${item.bullets.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>`  \\item ${escapeLatex(line.replace(/^[-•]\s*/,''))}`).join('\n')}\n\\end{itemize}`).join('\n\n')
 const education=data.education.filter(item=>item.degree||item.institution).map(item=>`\\textbf{${escapeLatex(item.degree)}}${item.institution?` — ${escapeLatex(item.institution)}`:''}${item.dates?` \\hfill ${escapeLatex(item.dates)}`:''}`).join('\\\\\n')
 const projects=data.projects.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>`\\item ${escapeLatex(line)}`).join('\n')
 const skills=data.skills.split(',').map(item=>escapeLatex(item.trim())).filter(Boolean).join(', ')
 const certifications=data.certifications.split('\n').map(item=>item.trim()).filter(Boolean).map(escapeLatex).join('\\\\\n')
 return String.raw`\documentclass[10pt,a4paper]{article}
\usepackage[margin=1.6cm]{geometry}
\usepackage[T1]{fontenc}
\usepackage[hidelinks]{hyperref}
\usepackage{enumitem}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlist[itemize]{leftmargin=1.2em,itemsep=1pt,topsep=2pt}
\begin{document}
{\LARGE \textbf{${escapeLatex(data.name||'Your Name')}}}\\
${data.headline?`{\\large ${escapeLatex(data.headline)}}\\\n`:''}${contact}${contact&&links?'\\\\\n':''}${links}
${section('Summary',escapeLatex(data.summary))}${section('Experience',experience)}${section('Education',education)}${section('Projects',projects?`\\begin{itemize}\n${projects}\n\\end{itemize}`:'')}${section('Skills',skills)}${section('Certifications',certifications)}
\end{document}`
}
function analyze(data, source){
 const text=[data.name,data.headline,data.email,data.phone,data.location,data.summary,...data.experience.map(item=>`${item.role} ${item.company} ${item.bullets}`),...data.education.map(item=>`${item.degree} ${item.institution}`),data.projects,data.skills,data.certifications].join(' ')
 const stopWords=new Set(['about','after','also','from','have','into','more','must','our','role','team','that','their','this','with','will','work','years','your','ability','experience','skills','responsibilities','required','preferred'])
 const jobTerms=[...new Set((data.jobDescription.toLowerCase().match(/[a-z][a-z+#.]{2,}/g)||[]).filter(term=>!stopWords.has(term)))]
 const matchedTerms=jobTerms.filter(term=>text.toLowerCase().includes(term))
 const checks=[
  {label:'Contact email is present',ok:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()),detail:'Add a working email address recruiters can use.'},
  {label:'Professional summary is present',ok:data.summary.trim().length>=35,detail:'Add a short summary describing your role and strengths.'},
  {label:'Experience or projects are included',ok:data.experience.some(item=>item.role||item.company)||data.projects.trim().length>0,detail:'Include experience, internships, or relevant projects.'},
  {label:'Education is included',ok:data.education.some(item=>item.degree||item.institution),detail:'Add your degree or most relevant education.'},
  {label:'Skills are listed',ok:data.skills.split(',').filter(item=>item.trim()).length>=3,detail:'List at least three relevant skills using job-posting terminology.'},
  {label:'Impact numbers are present',ok:/\b\d+\s?(%|x|k\+?|m\+?|hours?|days?|users?|customers?|projects?)\b/i.test(text),detail:'Where accurate, quantify outcomes such as time saved, users reached, or error reduction.'},
  {label:'Single-column source structure',ok:/\\documentclass/.test(source)&&!source.includes('multicol'),detail:'A single-column document is easier for many ATS parsers to read.'},
  {label:'Job-description keywords are reflected',ok:!data.jobDescription.trim()||matchedTerms.length>0,detail:data.jobDescription.trim()?`${matchedTerms.length} of ${jobTerms.length} useful terms appear in your resume.`:'Paste a job description to see relevant terms to consider.'},
 ]
 return {checks,score:Math.round(checks.filter(item=>item.ok).length/checks.length*100)}
}

export default function ATSResumeBuilder(){
 const navigate=useNavigate()
 const [data,setData]=useState({name:'',headline:'',email:'',phone:'',location:'',links:'',summary:'',experience:[emptyExperience()],education:[emptyEducation()],projects:'',skills:'',certifications:'',jobDescription:''})
 const [showAnalysis,setShowAnalysis]=useState(false)
 const [pdfStatus,setPdfStatus]=useState('')
 const source=useMemo(()=>toLatex(data),[data])
 const analysis=useMemo(()=>analyze(data,source),[data,source])
 const update=(key,value)=>setData(current=>({...current,[key]:value}))
 const updateRow=(key,index,field,value)=>setData(current=>({...current,[key]:current[key].map((row,i)=>i===index?{...row,[field]:value}:row)}))
 const addRow=key=>setData(current=>({...current,[key]:[...current[key],key==='experience'?emptyExperience():emptyEducation()]}))
 const removeRow=(key,index)=>setData(current=>({...current,[key]:current[key].filter((_,i)=>i!==index)}))
 const importPdf=async event=>{
  const file=event.target.files?.[0]
  event.target.value=''
  if(!file)return
  if(file.type!=='application/pdf'&& !file.name.toLowerCase().endsWith('.pdf')){setPdfStatus('Choose a PDF file.');return}
  if(file.size>10*1024*1024){setPdfStatus('PDF files must be 10 MB or smaller.');return}
  setPdfStatus('Extracting PDF text…')
  try{
   const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise
   const pageTexts=[]
   for(let pageNumber=1;pageNumber<=Math.min(pdf.numPages,20);pageNumber++){
    const page=await pdf.getPage(pageNumber)
    const content=await page.getTextContent()
    pageTexts.push(content.items.map(item=>`${item.str}${item.hasEOL?'\n':' '}`).join('').replace(/ +\n/g,'\n'))
   }
   const text=pageTexts.join('\n')
   if(!text.trim())throw new Error('No selectable text was found. This PDF may be scanned; OCR is not enabled yet.')
   const extracted=parseResumeText(text)
   setData(current=>({...current,...extracted,headline:current.headline||''}))
   setPdfStatus(`Extracted text from ${Math.min(pdf.numPages,20)} page${pdf.numPages===1?'':'s'}. Review and edit the reconstructed fields below.`)
  }catch(error){setPdfStatus(error.message||'Could not read this PDF. Try a text-based PDF instead.')}
 }
 const createProject=()=>{
  const project=createResumeProject(data.name?`${data.name} Resume`:'ATS Resume',source,[{name:'main.tex',content:source}],'ats-guided-resume')
  navigate(`/career/resume/editor/${project.id}`)
 }
 return <main className="ats-builder"><button className="ats-back" onClick={()=>navigate('/career/resume')}><ArrowLeft size={16}/> Resume Builder</button><header className="ats-heading"><span className="latex-eyebrow">{'{guided resume workspace}'}</span><h1>Create an ATS-friendly resume</h1><p>Fill in what applies, review the transparent checks, then open the generated LaTeX to customize every detail.</p></header><div className="ats-layout"><div className="ats-form">
  <section className="ats-card"><h2>Personal details</h2><div className="ats-fields"><label>Full name<input value={data.name} onChange={e=>update('name',e.target.value)} placeholder="Alex Morgan"/></label><label>Target role<input value={data.headline} onChange={e=>update('headline',e.target.value)} placeholder="Software Engineer"/></label><label>Email<input type="email" value={data.email} onChange={e=>update('email',e.target.value)} placeholder="alex@example.com"/></label><label>Phone<input value={data.phone} onChange={e=>update('phone',e.target.value)} placeholder="+1 555 010 1234"/></label><label>Location<input value={data.location} onChange={e=>update('location',e.target.value)} placeholder="City, Country"/></label><label>Links, separated by commas<input value={data.links} onChange={e=>update('links',e.target.value)} placeholder="linkedin.com/in/alex, github.com/alex"/></label><label className="ats-full">Professional summary<textarea rows="4" value={data.summary} onChange={e=>update('summary',e.target.value)} placeholder="Summarize your focus, experience, and strongest outcomes."/></label><label className="ats-full">Target job description for keyword review<textarea rows="5" value={data.jobDescription} onChange={e=>update('jobDescription',e.target.value)} placeholder="Paste the job posting to compare its terms with your resume content. It stays in this browser."/></label></div></section>
  <section className="ats-card"><div className="ats-card-heading"><h2>Experience</h2><button onClick={()=>addRow('experience')}><Plus size={15}/> Add experience</button></div>{data.experience.map((row,index)=><div className="ats-repeat" key={index}><div className="ats-fields"><label>Role<input value={row.role} onChange={e=>updateRow('experience',index,'role',e.target.value)}/></label><label>Company<input value={row.company} onChange={e=>updateRow('experience',index,'company',e.target.value)}/></label><label>Dates<input value={row.dates} onChange={e=>updateRow('experience',index,'dates',e.target.value)} placeholder="2023 – Present"/></label><label className="ats-full">Achievements, one per line<textarea rows="3" value={row.bullets} onChange={e=>updateRow('experience',index,'bullets',e.target.value)} placeholder="Built a reporting workflow that reduced weekly processing time by 30%."/></label></div>{data.experience.length>1&&<button className="ats-remove" onClick={()=>removeRow('experience',index)} aria-label="Remove experience"><Trash2 size={15}/></button>}</div>)}</section>
  <section className="ats-card"><div className="ats-card-heading"><h2>Education</h2><button onClick={()=>addRow('education')}><Plus size={15}/> Add education</button></div>{data.education.map((row,index)=><div className="ats-fields ats-repeat" key={index}><label>Degree<input value={row.degree} onChange={e=>updateRow('education',index,'degree',e.target.value)} placeholder="B.S. Computer Science"/></label><label>Institution<input value={row.institution} onChange={e=>updateRow('education',index,'institution',e.target.value)}/></label><label>Dates<input value={row.dates} onChange={e=>updateRow('education',index,'dates',e.target.value)}/></label>{data.education.length>1&&<button className="ats-remove" onClick={()=>removeRow('education',index)} aria-label="Remove education"><Trash2 size={15}/></button>}</div>)}</section>
  <section className="ats-card"><h2>Projects, skills, and certifications</h2><div className="ats-fields"><label className="ats-full">Projects, one per line<textarea rows="3" value={data.projects} onChange={e=>update('projects',e.target.value)} placeholder="Open-source contributor — improved build times by 20%."/></label><label className="ats-full">Skills, separated by commas<textarea rows="2" value={data.skills} onChange={e=>update('skills',e.target.value)} placeholder="JavaScript, React, Node.js, SQL"/></label><label className="ats-full">Certifications and achievements, one per line<textarea rows="2" value={data.certifications} onChange={e=>update('certifications',e.target.value)}/></label></div></section>
  <div className="ats-actions"><button className="latex-button" onClick={()=>setShowAnalysis(value=>!value)}>{showAnalysis?'Hide':'Analyze'} resume</button><button className="latex-button" onClick={()=>{setShowAnalysis(false);window.setTimeout(()=>window.print(),100)}}>Print / Save as PDF</button><button className="latex-button primary" onClick={createProject}><FileText size={16}/> Open in LaTeX editor</button></div>
  <section className="ats-pdf-note"><Upload size={18}/><div><b>Import an existing PDF resume</b><p>Text-based PDFs are parsed in this browser and mapped to editable fields. Scanned PDFs need OCR and are not supported.</p><label className="latex-button" htmlFor="resume-pdf-upload">Choose PDF</label><input id="resume-pdf-upload" type="file" accept="application/pdf,.pdf" onChange={importPdf}/>{pdfStatus&&<small role="status">{pdfStatus}</small>}</div></section>
 </div><aside className="ats-preview"><div className="ats-preview-title"><div><b>ATS checks</b><small>Heuristic guidance, not a hiring guarantee</small></div><span>{analysis.score}%</span></div>{showAnalysis?<div className="ats-checks">{analysis.checks.map(check=><div key={check.label} className={check.ok?'pass':'todo'}><b>{check.ok?'✓':'○'} {check.label}</b>{!check.ok&&<small>{check.detail}</small>}</div>)}</div>:<div className="ats-preview-content"><div>{data.name||'Your Name'}</div><small>{data.headline||'Target role'}{data.email?` · ${data.email}`:''}</small><hr/><b>Summary</b><p>{data.summary||'Your professional summary will appear here.'}</p><b>Experience</b>{data.experience.map((row,index)=><p key={index}>{row.role||'Role'}{row.company?` · ${row.company}`:''}<br/>{row.bullets||'Add achievement statements with clear outcomes.'}</p>)}<b>Education</b>{data.education.map((row,index)=><p key={index}>{row.degree||'Degree'}{row.institution?` · ${row.institution}`:''}</p>)}<b>Skills</b><p>{data.skills||'Your skills will appear here.'}</p>{data.projects.trim()&&<><b>Projects</b><p>{data.projects}</p></>}{data.certifications.trim()&&<><b>Certifications</b><p>{data.certifications}</p></>}</div>}</aside></div></main>
}
