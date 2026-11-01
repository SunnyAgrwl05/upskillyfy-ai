/**
 * Jest global setup.
 *
 * Connects Mongoose to a dedicated TEST database and wipes it between test
 * files, so a run never touches development or production data.
 *
 * The database must be reachable. Locally that is a local mongod on 27017;
 * in CI the `mongodb-github-action` step provides one.
 */
import mongoose from 'mongoose'

const TEST_DB_NAME = 'upskillyfy_test'

const baseUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'

beforeAll(async () => {
  const uri = baseUri.includes('?')
    ? `${baseUri}&db=${TEST_DB_NAME}`
    : `${baseUri.replace(/\/[^/?]*$/, '')}/${TEST_DB_NAME}`

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

afterEach(async () => {
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})
