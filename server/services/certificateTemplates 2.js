import path from 'node:path'
import { fileURLToPath } from 'node:url'

const templatesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../templates/certificates')

const templates = Object.freeze({
  'course-v1': Object.freeze({
    version: 'course-v1',
    htmlPath: path.join(templatesDirectory, 'course-completion.html'),
    cssPath: path.join(templatesDirectory, 'course-completion.css'),
  }),
})

export const DEFAULT_CERTIFICATE_TEMPLATE = 'course-v1'

export function getCertificateTemplate(version = DEFAULT_CERTIFICATE_TEMPLATE) {
  const template = templates[version]
  if (!template) throw Object.assign(new Error('Certificate template version is not supported.'), { status: 422 })
  return template
}
