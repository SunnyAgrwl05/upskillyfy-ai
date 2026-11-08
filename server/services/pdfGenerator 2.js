import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import puppeteer from 'puppeteer'
import { getCertificateTemplate } from './certificateTemplates.js'
import { generateQrDataUrl } from './qrService.js'

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character])

async function getAssetDataUrl(assetPath, assetName) {
  if (!assetPath) return ''

  const extension = extname(assetPath).toLowerCase()
  const mimeType = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' }[extension]
  if (!mimeType) throw Object.assign(new Error(`${assetName} must point to a PNG, JPEG, or SVG file.`), { status: 503 })
  const asset = await readFile(assetPath)
  return `data:${mimeType};base64,${asset.toString('base64')}`
}

export async function renderCertificateHtml(data) {
  const template = getCertificateTemplate(data.templateVersion)
  const [htmlTemplate, css, qrCode, logoDataUrl, signatureDataUrl] = await Promise.all([
    readFile(template.htmlPath, 'utf8'),
    readFile(template.cssPath, 'utf8'),
    generateQrDataUrl(data.verificationUrl),
    getAssetDataUrl(process.env.CERTIFICATE_LOGO_PATH, 'CERTIFICATE_LOGO_PATH'),
    getAssetDataUrl(process.env.CERTIFICATE_SIGNATURE_PATH, 'CERTIFICATE_SIGNATURE_PATH'),
  ])
  const values = {
    styles: css,
    recipientName: escapeHtml(data.recipientName),
    courseTitle: escapeHtml(data.courseTitle),
    certificateNumber: escapeHtml(data.certificateNumber),
    completionDate: escapeHtml(data.completionDate),
    issueDate: escapeHtml(data.issueDate),
    verificationUrl: escapeHtml(data.verificationUrl),
    qrCode,
    logoDataUrl,
    signatureDataUrl,
    demoWatermarkClass: data.isDemo ? 'is-demo' : '',
    demoWatermark: data.isDemo ? 'DEMO - NOT A VALID CREDENTIAL' : '',
    issuerName: escapeHtml(process.env.CERTIFICATE_ISSUER_NAME || 'Upskillyfy AI'),
    issuerTitle: escapeHtml(process.env.CERTIFICATE_ISSUER_TITLE || 'Authorized Issuer'),
  }

  return htmlTemplate.replace(/\{\{(\w+)\}\}/g, (_match, key) => values[key] ?? '')
}

export async function generateCertificatePdf(data) {
  const html = await renderCertificateHtml(data)
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(process.env.CHROME_EXECUTABLE_PATH ? { executablePath: process.env.CHROME_EXECUTABLE_PATH } : {}),
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true, preferCSSPageSize: true })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
