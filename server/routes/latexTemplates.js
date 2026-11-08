import express from 'express'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LATEX_TEMPLATE_CATEGORIES,
  LATEX_TEMPLATE_KINDS,
  LATEX_TEMPLATES,
} from '../data/latexTemplates.js'

const router = express.Router()
const pdfTemplateIds = new Set([
  'ats-friendly-resume', 'fresher-resume', 'software-engineer-resume',
  'experienced-professional-resume', 'academic-cv',
])
const pdfAssetDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/public/resume-templates')
let pdfManifestPromise

// Template catalogue responses are small and static; avoid stale conditional 304s in the browser.
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

const ALIASES = {
  'ats-resume': 'ats-friendly-resume',
  'software-engineer': 'software-engineer-resume',
  'fresher-resume': 'ats-friendly-resume',
  'experienced-professional-resume': 'software-engineer-resume',
}

const publicTemplate = (template) => ({
  id: template.id,
  title: template.title,
  description: template.description,
  category: template.category,
  kind: template.kind,
  author: template.author,
  license: template.license,
  lastUpdated: template.lastUpdated,
  abstract: template.abstract,
  tags: template.tags,
  compiler: template.compiler,
  mainFile: template.mainFile,
  featured: template.featured === true,
  demo: template.demo === true,
  files: template.files,
  ...(pdfTemplateIds.has(template.id) ? { previewPdf: `/api/latex-templates/${template.id}/preview.pdf` } : {}),
})

router.get('/:templateId/preview.pdf', async (req, res) => {
  const template = LATEX_TEMPLATES.find((item) => item.id === req.params.templateId && pdfTemplateIds.has(item.id))
  if (!template) return res.status(404).json({ message: 'A compiled PDF preview is not available for this template.', code: 'TEMPLATE_PDF_NOT_FOUND' })
  const main = template.files.find((file) => file.path === template.mainFile)
  if (!main || typeof main.content !== 'string') return res.status(503).json({ message: 'The template source is unavailable.', code: 'TEMPLATE_SOURCE_UNAVAILABLE' })

  try {
    pdfManifestPromise ||= readFile(path.join(pdfAssetDirectory, 'manifest.json'), 'utf8').then(JSON.parse)
    const manifest = await pdfManifestPromise
    const metadata = manifest[template.id]
    const sourceHash = createHash('sha256').update(main.content).digest('hex')
    if (!metadata || metadata.sourceSha256 !== sourceHash) {
      pdfManifestPromise = null
      return res.status(503).json({ message: 'This template PDF is being regenerated. Please try again later.', code: 'TEMPLATE_PDF_STALE' })
    }
    const pdf = await readFile(path.join(pdfAssetDirectory, `${template.id}.pdf`))
    const pdfHash = createHash('sha256').update(pdf).digest('hex')
    if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-')) || pdfHash !== metadata.pdfSha256) {
      pdfManifestPromise = null
      return res.status(503).json({ message: 'The compiled template PDF failed its integrity check.', code: 'TEMPLATE_PDF_INVALID' })
    }
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      'Content-Disposition': `inline; filename="${template.id}.pdf"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ETag: `"${pdfHash}"`,
      'X-Resume-Template-Source-SHA256': sourceHash,
      'X-Resume-Template-PDF-SHA256': pdfHash,
      'X-Content-Type-Options': 'nosniff',
    })
    return res.send(pdf)
  } catch {
    pdfManifestPromise = null
    return res.status(503).json({ message: 'The compiled template PDF is temporarily unavailable.', code: 'TEMPLATE_PDF_UNAVAILABLE' })
  }
})

router.get('/', (req, res) => {
  const invalid = (message) => res.status(422).json({ message, code: 'INVALID_QUERY' })
  const searchValue = req.query.search ?? ''
  const categoryValue = req.query.category ?? 'All'
  const kindValue = req.query.kind ?? 'All'
  const pageValue = req.query.page ?? '1'
  const limitValue = req.query.limit ?? '12'
  if (typeof searchValue !== 'string' || searchValue.length > 100) return invalid('Search must be a string no longer than 100 characters.')
  if (typeof categoryValue !== 'string' || typeof kindValue !== 'string') return invalid('Category and kind must be single values.')
  if (typeof pageValue !== 'string' || !/^[1-9]\d{0,5}$/.test(pageValue)) return invalid('Page must be a positive integer.')
  if (typeof limitValue !== 'string' || !/^[1-9]\d{0,2}$/.test(limitValue) || Number(limitValue) > 50) return invalid('Limit must be between 1 and 50.')

  const search = searchValue.trim().toLowerCase()
  const category = categoryValue
  const kind = kindValue
  const page = Number(pageValue)
  const limit = Number(limitValue)

  if (category !== 'All' && !LATEX_TEMPLATE_CATEGORIES.includes(category)) {
    return res.status(422).json({ message: 'Unknown template category.', code: 'INVALID_CATEGORY' })
  }
  if (kind !== 'All' && !LATEX_TEMPLATE_KINDS.includes(kind)) {
    return res.status(422).json({ message: 'Unknown template kind.', code: 'INVALID_KIND' })
  }

  const filtered = LATEX_TEMPLATES.filter((template) => {
    const searchable = `${template.title} ${template.description} ${template.author} ${template.category} ${template.tags.join(' ')}`.toLowerCase()
    return (category === 'All' || template.category === category)
      && (kind === 'All' || template.kind === kind)
      && (!search || searchable.includes(search))
  })
  const start = (page - 1) * limit

  // Static templates can be cached by the in-app Axios layer. Avoid a bare
  // 304 reaching the gallery without its JSON body after a cold page load.
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.json({
    templates: filtered.slice(start, start + limit).map(publicTemplate),
    categories: LATEX_TEMPLATE_CATEGORIES,
    kinds: LATEX_TEMPLATE_KINDS,
    pagination: {
      page,
      limit,
      total: filtered.length,
      pages: Math.max(1, Math.ceil(filtered.length / limit)),
    },
  })
})

router.get('/:templateId', (req, res) => {
  const targetId = ALIASES[req.params.templateId] || req.params.templateId
  const template = LATEX_TEMPLATES.find((item) => item.id === targetId || item.id === req.params.templateId)
  if (!template) return res.status(404).json({ message: 'Template not found.', code: 'TEMPLATE_NOT_FOUND' })
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.json({ template: publicTemplate(template) })
})

export default router
