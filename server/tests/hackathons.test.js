import test from 'node:test'
import assert from 'node:assert/strict'
import hackathonRoutes from '../routes/hackathons.js'

test('hackathon API router loads and exposes route handlers', () => {
  assert.equal(typeof hackathonRoutes, 'function')
  assert.ok(Array.isArray(hackathonRoutes.stack))
  assert.ok(hackathonRoutes.stack.length > 0)
})
