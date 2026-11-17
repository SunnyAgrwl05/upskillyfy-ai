import express from 'express'
import { spawn } from 'node:child_process'
import { compatTex } from '../services/texCompat.js'
import { chmod, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import multer from 'multer'
import AdmZip from 'adm-zip'
import archiver from 'archiver'
import rateLimit from 'express-rate-limit'
import { protect } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import ResumeProject from '../models/ResumeProject.js'
import { randomUUID } from 'node:crypto'
import { getPrivateObject, putPrivateObject, r2Configured } from '../services/storage/r2.js'

const router = express.Router()
const VALID_FILE = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[\w .()/-]+\.(?:tex|bib|sty|cls|bst|cfg|txt|md|png|jpe?g|pdf)$/i
const MAX_FILES = 100
const MAX_FILE_CHARS = 7_000_000
const MAX_TOTAL_CHARS = 7_000_000
const MAX_PDF_BYTES = 20 * 1024 * 1024
const COMPILER_TIMEOUT_MS = 30_000
const MAX_HISTORY_CHARS = 4_000_000
const zipUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } })
const compileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.COMPILE_LIMIT_PER_HOUR) || 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: { message: 'Compilation limit reached. Try again later.', code: 'RATE_LIMITED' },
})

function cleanInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('A project object is required.'), { status: 422 })
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const mainFile = typeof body.mainFile === 'string' ? body.mainFile : ''
  const clientId = typeof body.id === 'string' && /^[a-z0-9-]{10,64}$/i.test(body.id) ? body.id : ''
  if (!clientId) throw Object.assign(new Error('A valid project id is required.'), { status: 422 })
  if (!name || name.length > 120) throw Object.assign(new Error('Project name is required and must be at most 120 characters.'), { status: 422 })
  if (!Array.isArray(body.files) || body.files.length < 1 || body.files.length > MAX_FILES) throw Object.assign(new Error(`Projects must contain 1–${MAX_FILES} files.`), { status: 422 })
  let total = 0
  const paths = new Set()
  const files = body.files.map((file) => {
    if (!file || typeof file.path !== 'string' || file.path.length > 240 || !VALID_FILE.test(file.path) || file.path.includes('\\') || file.path.split('/').some((part) => !part || part === '.' || part === '..')) {
      throw Object.assign(new Error('A file path is invalid. Use a relative path with a supported LaTeX source or asset extension.'), { status: 422 })
    }
    if (paths.has(file.path)) throw Object.assign(new Error(`Duplicate file path: ${file.path}`), { status: 422 })
    const isBinary = file.isBinary === true
    const binaryPath = /\.(?:png|jpe?g|pdf)$/i.test(file.path)
    if (binaryPath !== isBinary) throw Object.assign(new Error(`${file.path} has an invalid file encoding.`), { status: 422 })
    if (typeof file.content !== 'string' || file.content.length > MAX_FILE_CHARS || (isBinary && !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content))) throw Object.assign(new Error(`${file.path} is too large or has invalid content.`), { status: 413 })
    if (isBinary) {
      const bytes = Buffer.from(file.content, 'base64')
      const validSignature = /\.png$/i.test(file.path)
        ? bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        : /\.jpe?g$/i.test(file.path)
          ? bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
          : bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))
      if (!validSignature) throw Object.assign(new Error(`${file.path} does not match its declared file type.`), { status: 422 })
    }
    total += file.content.length
    if (total > MAX_TOTAL_CHARS) throw Object.assign(new Error('Project files exceed the 7 MB limit.'), { status: 413 })
    paths.add(file.path)
    return { path: file.path, content: file.content, isBinary }
  })
  if (!paths.has(mainFile) || !/\.tex$/i.test(mainFile) || files.find((file) => file.path === mainFile)?.isBinary) throw Object.assign(new Error('The main file must point to a text .tex file in this project.'), { status: 422 })
  const tags = body.tags === undefined ? [] : body.tags
  if (!Array.isArray(tags) || tags.length > 30 || tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.trim().length > 40 || /[\u0000-\u001f\u007f]/.test(tag))) {
    throw Object.assign(new Error('Project tags must contain at most 30 non-empty values of 40 characters or fewer.'), { status: 422 })
  }
  if (body.archived !== undefined && typeof body.archived !== 'boolean') throw Object.assign(new Error('Project archived state must be a boolean.'), { status: 422 })
  if (body.trashed !== undefined && typeof body.trashed !== 'boolean') throw Object.assign(new Error('Project trashed state must be a boolean.'), { status: 422 })
  const result = {
    clientId, name, mainFile, files,
    templateId: typeof body.templateId === 'string' ? body.templateId.slice(0, 120) : null,
  }
  if (body.tags !== undefined) result.tags = [...new Set(tags.map(tag => tag.trim()))]
  if (body.archived !== undefined) result.archived = body.archived
  if (body.trashed !== undefined) result.trashed = body.trashed
  return result
}

function publicProject(project) {
  return {
    id: project.clientId || String(project._id), name: project.name, mainFile: project.mainFile,
    templateId: project.templateId, files: project.files, tags: project.tags || [],
    archived: project.archived === true, trashed: project.trashed === true,
    createdAt: project.createdAt, updatedAt: project.updatedAt,
    compileStatus: project.compileStatus || 'never', lastCompiledAt: project.lastCompiledAt || null,
    pdfVersion: project.pdfVersions?.at(-1)?.version || 0, hasPdf: Boolean(project.pdfVersions?.length),
    pdfVersions: (project.pdfVersions || []).map(({ version, size, compiledAt }) => ({ version, size, compiledAt })),
  }
}

function recordSourceVersion(project, label) {
  const files = project.files.map((file) => ({ path: file.path, content: file.content, isBinary: file.isBinary }))
  const size = files.reduce((total, file) => total + file.content.length, 0)
  if (size > MAX_HISTORY_CHARS) return
  project.sourceVersions.unshift({ label, files, mainFile: project.mainFile, savedAt: new Date() })
  let retained = 0
  project.sourceVersions = project.sourceVersions.filter((version) => {
    const versionSize = version.files.reduce((total, file) => total + file.content.length, 0)
    retained += versionSize
    return retained <= MAX_HISTORY_CHARS
  }).slice(0, 20)
}

router.use(protect)

router.get('/', asyncHandler(async (req, res) => {
  const projects = await ResumeProject.find({ owner: req.user._id }).sort({ updatedAt: -1 }).lean()
  res.json({ projects: projects.map(publicProject) })
}))

router.post('/', asyncHandler(async (req, res) => {
  const input = cleanInput(req.body)
  let project = await ResumeProject.findOne({ owner: req.user._id, clientId: input.clientId })
  if (project) {
    if (project.mainFile !== input.mainFile || JSON.stringify(project.files) !== JSON.stringify(input.files)) {
      recordSourceVersion(project, 'Autosaved version')
    }
    Object.assign(project, input)
    await project.save()
  } else {
    project = await ResumeProject.create({ ...input, owner: req.user._id })
  }
  res.status(201).json({ project: publicProject(project) })
}))

router.get('/:projectId', asyncHandler(async (req, res) => {
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id, trashed: { $ne: true } }).lean()
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.json({ project: publicProject(project) })
}))

router.get('/:projectId/history', asyncHandler(async (req, res) => {
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id, trashed: { $ne: true } }).select('sourceVersions').lean()
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.json({ versions: (project.sourceVersions || []).map((version, index) => ({ ...version, index })) })
}))

router.post('/:projectId/history/:versionIndex/restore', asyncHandler(async (req, res) => {
  const index = Number(req.params.versionIndex)
  if (!Number.isInteger(index) || index < 0) return res.status(422).json({ message: 'Version is invalid.' })
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id })
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  const version = project.sourceVersions[index]
  if (!version) return res.status(404).json({ message: 'Version not found.' })
  recordSourceVersion(project, 'Before restore')
  project.files = version.files
  project.mainFile = version.mainFile
  await project.save()
  res.json({ project: publicProject(project) })
}))

router.get('/:projectId/pdf', asyncHandler(async (req, res) => {
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id, trashed: { $ne: true } }).select('name pdfVersions').lean()
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  const requestedVersion = req.query.version === undefined ? null : Number(req.query.version)
  if (requestedVersion !== null && (!Number.isInteger(requestedVersion) || requestedVersion < 1)) return res.status(422).json({ message: 'PDF version is invalid.' })
  const artifact = requestedVersion === null
    ? project.pdfVersions?.at(-1)
    : project.pdfVersions?.find((item) => item.version === requestedVersion)
  if (!artifact) return res.status(404).json({ message: 'No compiled PDF is available.' })
  const object = await getPrivateObject(artifact.key)
  const safeName = project.name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '') || 'resume'
  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': String(artifact.size), 'Content-Disposition': `${req.query.download === '1' ? 'attachment' : 'inline'}; filename="${safeName}.pdf"`, 'Cache-Control': 'private, no-store' })
  object.Body.pipe(res)
}))

router.get('/:projectId/source.zip', asyncHandler(async (req, res, next) => {
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id, trashed: { $ne: true } }).lean()
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  const safeName = project.name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '') || 'latex-project'
  res.set({ 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${safeName}.zip"`, 'Cache-Control': 'no-store' })
  const archive = archiver('zip', { zlib: { level: 6 } })
  archive.on('error', (error) => { if (res.headersSent) res.destroy(error); else next(error) })
  archive.pipe(res)
  for (const file of project.files) {
    const content = file.isBinary ? Buffer.from(file.content, 'base64') : Buffer.from(file.content, 'utf8')
    archive.append(content, { name: file.path })
  }
  await archive.finalize()
}))

router.put('/:projectId', asyncHandler(async (req, res) => {
  const input = cleanInput(req.body)
  if (input.clientId !== req.params.projectId) return res.status(422).json({ message: 'Project id must match the URL.', code: 'PROJECT_ID_MISMATCH' })
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id })
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  if (project.mainFile !== input.mainFile || JSON.stringify(project.files) !== JSON.stringify(input.files)) {
    recordSourceVersion(project, 'Autosaved version')
  }
  Object.assign(project, input, { clientId: req.params.projectId })
  await project.save()
  res.json({ project: publicProject(project) })
}))

router.delete('/:projectId', asyncHandler(async (req, res) => {
  const project = await ResumeProject.findOneAndUpdate({ clientId: req.params.projectId, owner: req.user._id }, { $set: { trashed: true } }, { new: true })
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.status(204).end()
}))

router.post('/import-zip', zipUpload.single('archive'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(422).json({ message: 'Choose a ZIP archive to import.' })
  let entries
  try { entries = new AdmZip(req.file.buffer).getEntries() } catch { return res.status(422).json({ message: 'The ZIP archive could not be read.' }) }
  if (entries.length > MAX_FILES * 2) return res.status(413).json({ message: 'Archive contains too many entries.' })
  const files = []
  const seenPaths = new Set()
  let total = 0
  for (const entry of entries) {
    if (entry.isDirectory) continue
    const entryPath = entry.entryName.replaceAll('\\', '/')
    const normalized = path.posix.normalize(entryPath)
    const mode = (entry.header.attr >>> 16) & 0xf000
    if (entryPath.length > 240 || entryPath.startsWith('/') || entryPath.includes('\0') || normalized === '..' || normalized.startsWith('../') || normalized !== entryPath || mode === 0xa000) {
      return res.status(422).json({ message: `Unsafe archive entry: ${entry.entryName}` })
    }
    if (!VALID_FILE.test(entryPath)) return res.status(422).json({ message: `Unsupported project file: ${entryPath}` })
    if (seenPaths.has(entryPath)) return res.status(422).json({ message: `Duplicate archive entry: ${entryPath}` })
    seenPaths.add(entryPath)
    if (entry.header.size > 2 * 1024 * 1024) return res.status(413).json({ message: `Archive entry is too large: ${entryPath}` })
    if (files.length >= MAX_FILES) return res.status(413).json({ message: 'Archive contains more than 100 files.' })
    let content
    try { content = entry.getData() } catch { return res.status(422).json({ message: `Could not extract archive entry: ${entryPath}` }) }
    if (!Buffer.isBuffer(content)) return res.status(422).json({ message: `Could not extract archive entry: ${entryPath}` })
    total += content.length
    if (total > 5 * 1024 * 1024) return res.status(413).json({ message: 'Uncompressed project exceeds 5 MB.' })
    const isBinary = /\.(?:png|jpe?g|pdf)$/i.test(entryPath)
    files.push({ path: entryPath, content: isBinary ? content.toString('base64') : content.toString('utf8'), isBinary })
  }
  const mainFiles = files.filter((file) => /\.tex$/i.test(file.path)).map((file) => file.path)
  if (!mainFiles.length) return res.status(422).json({ message: 'The archive does not contain a .tex document.' })
  const mainFile = mainFiles.includes('main.tex') ? 'main.tex' : mainFiles[0]
  res.json({ files, mainFile, mainFiles })
}))

router.post('/compile', compileLimiter, asyncHandler(async (req, res) => {
  const input = cleanInput(req.body)
  const image = process.env.LATEX_COMPILER_IMAGE
  if (!image || !/^[\w./:-]+$/.test(image)) {
    return res.status(503).json({ message: 'The isolated LaTeX compiler is not configured.', code: 'COMPILER_UNAVAILABLE' })
  }

  // User-authored source runs only in the network-disabled Docker sandbox.
  {
    const root = await mkdtemp(path.join(tmpdir(), 'upskillyfy-latex-'))
    const sourceDir = path.join(root, 'source')
    const outputDir = path.join(root, 'output')
    let child
    let log = ''
    try {
      await mkdir(sourceDir)
      await mkdir(outputDir)
      await chmod(sourceDir, 0o755)
      await chmod(outputDir, 0o777)
      for (const file of input.files) {
        const destination = path.resolve(sourceDir, file.path)
        if (!destination.startsWith(`${sourceDir}${path.sep}`)) return res.status(422).json({ message: 'Unsafe project path.' })
        await mkdir(path.dirname(destination), { recursive: true, mode: 0o755 })
        await writeFile(destination, file.isBinary ? Buffer.from(file.content, 'base64') : compatTex(file.path, file.content), { flag: 'wx', mode: 0o644 })
      }
      const args = [
        'run', '--rm', '--pull=never', '--network=none', '--read-only', '--memory=512m', '--cpus=1', '--pids-limit=64',
        '--ulimit', 'fsize=20971520:20971520', '--cap-drop=ALL', '--security-opt=no-new-privileges',
        '--user=1000:1000', '--tmpfs=/tmp:rw,noexec,nosuid,size=128m', '--workdir=/work',
        '--mount', `type=bind,src=${sourceDir},dst=/work,readonly`,
        '--mount', `type=bind,src=${outputDir},dst=/out`,
        image, 'tectonic', '--untrusted', '--only-cached', '--keep-logs', '--outdir', '/out', input.mainFile,
      ]
      const result = await new Promise((resolve, reject) => {
        child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH || '/usr/bin:/bin' } })
        const chunks = []
        let bytes = 0
        const append = (chunk) => {
          bytes += chunk.length
          if (bytes < 64_000) chunks.push(chunk)
        }
        child.stdout.on('data', append)
        child.stderr.on('data', append)
        const timer = setTimeout(() => { child.kill('SIGKILL'); reject(Object.assign(new Error('Compilation timed out after 30 seconds.'), { status: 504 })) }, COMPILER_TIMEOUT_MS)
        child.once('error', (error) => { clearTimeout(timer); reject(error) })
        child.once('close', (code) => { clearTimeout(timer); resolve({ code, log: Buffer.concat(chunks).toString('utf8') }) })
      })
      log = result.log
      if (result.code !== 0) {
        await ResumeProject.updateOne({ clientId: input.clientId, owner: req.user._id }, { $set: { compileStatus: 'failed', compileLog: log.slice(0, 4000) } })
        return res.status(422).json({ message: 'LaTeX compilation failed.', code: 'COMPILE_FAILED', log })
      }
      const pdfPath = path.join(outputDir, `${path.basename(input.mainFile, path.extname(input.mainFile))}.pdf`)
      const pdf = await readFile(pdfPath)
      if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) return res.status(422).json({ message: 'Compiler output is not a valid PDF.', code: 'INVALID_COMPILER_OUTPUT' })
      if (pdf.length > MAX_PDF_BYTES) return res.status(413).json({ message: 'Generated PDF exceeds the 20 MB limit.' })
      if (!r2Configured) return res.status(503).json({ message: 'Persistent PDF storage is not configured.', code: 'STORAGE_UNAVAILABLE' })
      const key = `resume-pdfs/${req.user._id}/${input.clientId}/${randomUUID()}.pdf`
      await putPrivateObject({ key, body: pdf, contentType: 'application/pdf' })
      let project = await ResumeProject.findOne({ clientId: input.clientId, owner: req.user._id })
      if (!project) project = await ResumeProject.create({ ...input, owner: req.user._id })
      else {
        if (project.mainFile !== input.mainFile || JSON.stringify(project.files) !== JSON.stringify(input.files)) {
          recordSourceVersion(project, 'Before compilation')
        }
        Object.assign(project, input)
      }
      const version = (project.pdfVersions.at(-1)?.version || 0) + 1
      project.pdfVersions.push({ key, version, size: pdf.length, compiledAt: new Date() })
      project.compileStatus = 'success'
      project.lastCompiledAt = new Date()
      project.compileLog = log.slice(0, 4000)
      await project.save()
      res.set({ 'Content-Type': 'application/pdf', 'Content-Length': String(pdf.length), 'Cache-Control': 'no-store', 'X-Compiler-Log': Buffer.from(log.slice(0, 4000)).toString('base64') })
      return res.send(pdf)
    } catch (dockerErr) {
      if (dockerErr.status === 504) return res.status(504).json({ message: 'LaTeX compilation timed out.', code: 'COMPILE_TIMEOUT' })
      console.error('[resume-compiler] isolated compiler failed:', dockerErr.message)
      return res.status(503).json({ message: 'The isolated LaTeX compiler is temporarily unavailable.', code: 'COMPILER_UNAVAILABLE' })
    } finally {
      if (child?.exitCode === null) child.kill('SIGKILL')
      await rm(root, { recursive: true, force: true }).catch(() => {})
    }
  }
}))

export default router
