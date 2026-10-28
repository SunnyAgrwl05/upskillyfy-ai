import express from 'express'
import { spawn } from 'node:child_process'
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

const router = express.Router()
const VALID_FILE = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[\w .()/-]+\.(?:tex|bib|sty|cls|txt|md|png|jpe?g|pdf)$/i
const MAX_FILES = 100
const MAX_FILE_CHARS = 7_000_000
const MAX_TOTAL_CHARS = 7_000_000
const MAX_PDF_BYTES = 20 * 1024 * 1024
const COMPILER_TIMEOUT_MS = 30_000
const zipUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } })
const compileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  message: { message: 'Compilation limit reached. Try again later.', code: 'RATE_LIMITED' },
})

function cleanInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('A project object is required.'), { status: 422 })
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const mainFile = typeof body.mainFile === 'string' ? body.mainFile : ''
  const clientId = typeof body.id === 'string' && /^[a-z0-9-]{10,64}$/i.test(body.id) ? body.id : ''
  if (!clientId) throw Object.assign(new Error('A valid project id is required.'), { status: 422 })
  if (!name) throw Object.assign(new Error('Project name is required.'), { status: 422 })
  if (!Array.isArray(body.files) || body.files.length < 1 || body.files.length > MAX_FILES) throw Object.assign(new Error(`Projects must contain 1–${MAX_FILES} files.`), { status: 422 })
  let total = 0
  const paths = new Set()
  const files = body.files.map((file) => {
    if (!file || typeof file.path !== 'string' || !VALID_FILE.test(file.path) || file.path.includes('\\') || file.path.split('/').some((part) => !part || part === '.' || part === '..')) {
      throw Object.assign(new Error('A file path is invalid. Use a relative path with a supported LaTeX source or asset extension.'), { status: 422 })
    }
    if (paths.has(file.path)) throw Object.assign(new Error(`Duplicate file path: ${file.path}`), { status: 422 })
    const isBinary = file.isBinary === true
    const binaryPath = /\.(?:png|jpe?g|pdf)$/i.test(file.path)
    if (binaryPath !== isBinary) throw Object.assign(new Error(`${file.path} has an invalid file encoding.`), { status: 422 })
    if (typeof file.content !== 'string' || file.content.length > MAX_FILE_CHARS || (isBinary && !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content))) throw Object.assign(new Error(`${file.path} is too large or has invalid content.`), { status: 413 })
    total += file.content.length
    if (total > MAX_TOTAL_CHARS) throw Object.assign(new Error('Project files exceed the 7 MB limit.'), { status: 413 })
    paths.add(file.path)
    return { path: file.path, content: file.content, isBinary }
  })
  if (!paths.has(mainFile) || !/\.tex$/i.test(mainFile) || files.find((file) => file.path === mainFile)?.isBinary) throw Object.assign(new Error('The main file must point to a text .tex file in this project.'), { status: 422 })
  return { clientId, name, mainFile, files, templateId: typeof body.templateId === 'string' ? body.templateId.slice(0, 120) : null }
}

function publicProject(project) {
  return { id: project.clientId || String(project._id), name: project.name, mainFile: project.mainFile, templateId: project.templateId, files: project.files, createdAt: project.createdAt, updatedAt: project.updatedAt }
}

router.use(protect)

router.get('/', asyncHandler(async (req, res) => {
  const projects = await ResumeProject.find({ owner: req.user._id }).sort({ updatedAt: -1 }).lean()
  res.json({ projects: projects.map(publicProject) })
}))

router.post('/', asyncHandler(async (req, res) => {
  const input = cleanInput(req.body)
  const project = await ResumeProject.findOneAndUpdate(
    { owner: req.user._id, clientId: input.clientId },
    { $set: input, $setOnInsert: { owner: req.user._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  res.status(201).json({ project: publicProject(project) })
}))

router.get('/:projectId', asyncHandler(async (req, res) => {
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id }).lean()
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.json({ project: publicProject(project) })
}))

router.get('/:projectId/source.zip', asyncHandler(async (req, res, next) => {
  const project = await ResumeProject.findOne({ clientId: req.params.projectId, owner: req.user._id }).lean()
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
  const project = await ResumeProject.findOneAndUpdate(
    { clientId: req.params.projectId, owner: req.user._id },
    { $set: { ...input, clientId: req.params.projectId } },
    { new: true, runValidators: true },
  )
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.json({ project: publicProject(project) })
}))

router.delete('/:projectId', asyncHandler(async (req, res) => {
  const project = await ResumeProject.findOneAndDelete({ clientId: req.params.projectId, owner: req.user._id })
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
    if (entryPath.startsWith('/') || entryPath.includes('\0') || normalized === '..' || normalized.startsWith('../') || normalized !== entryPath || mode === 0xa000) {
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
  const image = process.env.LATEX_COMPILER_IMAGE
  if (!image || !/^[\w./:-]+$/.test(image)) return res.status(503).json({ message: 'Isolated LaTeX compiler is not configured.', code: 'COMPILER_UNAVAILABLE' })
  const input = cleanInput(req.body)
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
      await writeFile(destination, file.isBinary ? Buffer.from(file.content, 'base64') : file.content, { flag: 'wx', mode: 0o644 })
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
    if (result.code !== 0) return res.status(422).json({ message: 'LaTeX compilation failed.', code: 'COMPILE_FAILED', log })
    const pdfPath = path.join(outputDir, `${path.basename(input.mainFile, path.extname(input.mainFile))}.pdf`)
    const pdf = await readFile(pdfPath)
    if (pdf.length > MAX_PDF_BYTES) return res.status(413).json({ message: 'Generated PDF exceeds the 20 MB limit.' })
    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': String(pdf.length), 'Cache-Control': 'no-store', 'X-Compiler-Log': Buffer.from(log.slice(0, 4000)).toString('base64') })
    res.send(pdf)
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message, code: error.status === 504 ? 'COMPILE_TIMEOUT' : 'COMPILER_UNAVAILABLE', log })
    if (error.code === 'ENOENT') return res.status(503).json({ message: 'Docker is unavailable for isolated compilation.', code: 'COMPILER_UNAVAILABLE' })
    throw error
  } finally {
    if (child?.exitCode === null) child.kill('SIGKILL')
    await rm(root, { recursive: true, force: true })
  }
}))

export default router
