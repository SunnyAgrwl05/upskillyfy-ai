import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../../config/env.js'

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
const ALLOWED_TYPES = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['application/zip', new Set(['.zip'])],
  ['application/x-zip-compressed', new Set(['.zip'])],
  ['application/vnd.ms-powerpoint', new Set(['.ppt'])],
  ['application/vnd.openxmlformats-officedocument.presentationml.presentation', new Set(['.pptx'])],
  ['application/msword', new Set(['.doc'])],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', new Set(['.docx'])],
])

const configuredValues = [env.R2_ENDPOINT, env.R2_ACCESS_KEY_ID, env.R2_SECRET_ACCESS_KEY, env.R2_BUCKET_NAME]
export const r2Configured = configuredValues.every(Boolean)
const client = r2Configured ? new S3Client({
  endpoint: env.R2_ENDPOINT,
  region: 'auto',
  forcePathStyle: true,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
}) : null

export function validateUpload({ fileName, contentType, size }) {
  if (typeof fileName !== 'string' || fileName.length > 255 || path.basename(fileName) !== fileName || /[\0/\\]/.test(fileName)) {
    return { valid: false, message: 'Choose a valid file name.' }
  }
  const extensions = ALLOWED_TYPES.get(contentType)
  if (!extensions || !extensions.has(path.extname(fileName).toLowerCase())) {
    return { valid: false, message: 'Upload a PDF, PPT, PPTX, DOC, DOCX, or ZIP file.' }
  }
  if (!Number.isInteger(size) || size < 1 || size > MAX_UPLOAD_BYTES) {
    return { valid: false, message: 'Files must be between 1 byte and 20 MB.' }
  }
  return { valid: true }
}

export async function createUploadUrl({ userId, fileName, contentType, size }) {
  if (!client) throw Object.assign(new Error('Private file storage is not configured.'), { code: 'STORAGE_UNAVAILABLE', status: 503 })
  const extension = path.extname(fileName).toLowerCase()
  const key = `uploads/${userId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`
  const command = new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: contentType, ContentLength: size })
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 })
  return { key, uploadUrl, expiresIn: 300, headers: { 'Content-Type': contentType } }
}

export async function getStoredObjectMetadata(key) {
  if (!client) throw Object.assign(new Error('Private file storage is not configured.'), { code: 'STORAGE_UNAVAILABLE', status: 503 })
  const result = await client.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
  return { size: result.ContentLength, contentType: result.ContentType }
}

export async function createDownloadUrl(key) {
  if (!client) throw Object.assign(new Error('Private file storage is not configured.'), { code: 'STORAGE_UNAVAILABLE', status: 503 })
  return getSignedUrl(client, new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }), { expiresIn: 300 })
}

export async function deleteStoredObject(key) {
  if (!client) throw Object.assign(new Error('Private file storage is not configured.'), { code: 'STORAGE_UNAVAILABLE', status: 503 })
  await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
}
