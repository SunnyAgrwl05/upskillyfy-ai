import test from 'node:test'
import assert from 'node:assert/strict'
import { safePostAuthDestination } from './authRedirect.js'

globalThis.window = { location: { origin: 'https://upskillyfy.example' } }

test('preserves an internal course destination and its query and hash', () => {
  assert.equal(
    safePostAuthDestination('/learning/courses/ai-ml-gemini?unit=2#practice'),
    '/learning/courses/ai-ml-gemini?unit=2#practice',
  )
})

test('rejects external and authentication redirect targets', () => {
  assert.equal(safePostAuthDestination('//attacker.example/path'), '/dashboard')
  assert.equal(safePostAuthDestination('https://attacker.example/path'), '/dashboard')
  assert.equal(safePostAuthDestination('/login?next=/private'), '/dashboard')
  assert.equal(safePostAuthDestination('/register'), '/dashboard')
})

test('supports location objects and rejects malformed destinations', () => {
  assert.equal(
    safePostAuthDestination({ pathname: '/assessments/sql', search: '?start=1', hash: '#details' }),
    '/assessments/sql?start=1#details',
  )
  assert.equal(safePostAuthDestination('/\\attacker.example'), '/dashboard')
})
