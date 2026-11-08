import mongoose from 'mongoose'
import { Readable } from 'node:stream'

const BUCKET_NAME = 'credentialFiles'

function getBucket() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw Object.assign(new Error('MongoDB document storage is unavailable.'), { status: 503, code: 'STORAGE_UNAVAILABLE' })
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME })
}

export function uploadFile(buffer, metadata) {
  const bucket = getBucket()
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(metadata.fileName, {
      contentType: metadata.contentType,
      metadata,
    })
    uploadStream.once('error', reject)
    uploadStream.once('finish', () => resolve(uploadStream.id))
    Readable.from([buffer]).pipe(uploadStream)
  })
}

export function getFileStream(fileId) {
  if (!mongoose.isValidObjectId(fileId)) {
    throw Object.assign(new Error('Invalid stored file identifier.'), { status: 404 })
  }
  return getBucket().openDownloadStream(new mongoose.Types.ObjectId(fileId))
}

export async function deleteFile(fileId) {
  if (!mongoose.isValidObjectId(fileId)) return
  await getBucket().delete(new mongoose.Types.ObjectId(fileId))
}
