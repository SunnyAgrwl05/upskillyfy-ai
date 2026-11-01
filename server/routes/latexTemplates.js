import express from 'express'
import {
  LATEX_TEMPLATE_CATEGORIES,
  LATEX_TEMPLATE_KINDS,
  LATEX_TEMPLATES,
} from '../data/latexTemplates.js'

const router = express.Router()

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
})

router.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
  const category = typeof req.query.category === 'string' ? req.query.category : 'All'
  const kind = typeof req.query.kind === 'string' ? req.query.kind : 'All'
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12))

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
  const template = LATEX_TEMPLATES.find((item) => item.id === req.params.templateId)
  if (!template) return res.status(404).json({ message: 'Template not found.', code: 'TEMPLATE_NOT_FOUND' })
  res.json({ template: publicTemplate(template) })
})

export default router
