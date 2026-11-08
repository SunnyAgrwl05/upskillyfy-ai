import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { LATEX_TEMPLATES } from '../data/latexTemplates.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const outputDir = path.join(root, 'client/public/resume-templates')
const requiredIds = [
  'ats-friendly-resume', 'fresher-resume', 'software-engineer-resume',
  'experienced-professional-resume', 'academic-cv',
]
const sha256 = (value) => createHash('sha256').update(value).digest('hex')

async function compile(source, mainFile, outDir) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.TECTONIC_BIN || 'tectonic', [
      '--untrusted', '--outdir', outDir, mainFile,
    ], { cwd: source, stdio: ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH || '/usr/bin:/bin' } })
    let log = ''
    child.stdout.on('data', (chunk) => { if (log.length < 16000) log += chunk.toString() })
    child.stderr.on('data', (chunk) => { if (log.length < 16000) log += chunk.toString() })
    child.once('error', reject)
    child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`Tectonic exited with ${code}: ${log}`)))
  })
}

await mkdir(outputDir, { recursive: true })
const manifest = {}
for (const id of requiredIds) {
  const template = LATEX_TEMPLATES.find((entry) => entry.id === id)
  if (!template) throw new Error(`Missing required template: ${id}`)
  const main = template.files.find((file) => file.path === template.mainFile)
  if (!main || typeof main.content !== 'string') throw new Error(`Missing source for ${id}`)
  const sourceDir = await mkdtemp(path.join(tmpdir(), 'upskillyfy-template-pdf-'))
  try {
    await writeFile(path.join(sourceDir, template.mainFile), main.content, { flag: 'wx', mode: 0o600 })
    await compile(sourceDir, template.mainFile, sourceDir)
    const pdf = await readFile(path.join(sourceDir, `${path.basename(template.mainFile, '.tex')}.pdf`))
    if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`Compiler output for ${id} is not a PDF.`)
    await writeFile(path.join(outputDir, `${id}.pdf`), pdf)
    manifest[id] = {
      sourceSha256: sha256(main.content),
      pdfSha256: sha256(pdf),
      pdfPath: `/resume-templates/${id}.pdf`,
      sourcePath: `/api/latex-templates/${id}`,
    }
    console.log(`Generated ${id}.pdf (${pdf.length} bytes)`)
  } finally {
    await rm(sourceDir, { recursive: true, force: true })
  }
}

await writeFile(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
