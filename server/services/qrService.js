import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import QRCode from 'qrcode'

const encryptionKey = () => {
  if (!process.env.JWT_SECRET) {
    throw Object.assign(new Error('JWT_SECRET is required to protect verification links.'), { status: 503 })
  }
  return createHash('sha256').update(process.env.JWT_SECRET).digest()
}

export function createVerificationToken() {
  return randomBytes(32).toString('base64url')
}

export function hashVerificationToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function encryptVerificationToken(token) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64url')).join('.')
}

export function decryptVerificationToken(encryptedToken) {
  const [iv, authTag, ciphertext] = encryptedToken.split('.').map((part) => Buffer.from(part, 'base64url'))
  if (!iv || !authTag || !ciphertext || iv.length !== 12 || authTag.length !== 16) {
    throw new Error('Stored certificate verification link is invalid.')
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

export function createVerificationUrl(token) {
  const baseUrl = process.env.CLIENT_URL?.split(',')[0]?.trim()
  if (!baseUrl) {
    throw Object.assign(new Error('CLIENT_URL must be configured to issue certificates.'), { status: 503 })
  }
  return `${baseUrl.replace(/\/+$/, '')}/verify/${encodeURIComponent(token)}`
}

export function generateQrDataUrl(url) {
  return QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 1, width: 220 })
}
