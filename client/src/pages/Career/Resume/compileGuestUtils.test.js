import assert from 'node:assert/strict'
import test from 'node:test'
import { compileButtonLabel, compileErrorMessage, loginUrl, safeRedirectPath } from './compileGuestUtils.js'

test('guest sees "Login to compile" and signed-in users see "Recompile"', () => {
  assert.equal(compileButtonLabel({ isLoggedIn: false, compiling: false }), 'Login to compile')
  assert.equal(compileButtonLabel({ isLoggedIn: true, compiling: false }), 'Recompile')
  assert.equal(compileButtonLabel({ isLoggedIn: false, compiling: true }), 'Compiling…')
})

test('401 maps to the session-expired message and requests a login redirect', () => {
  const result = compileErrorMessage(401, {}, 'axios error')
  assert.equal(result.message, 'Session expired. Please log in again.')
  assert.equal(result.redirectToLogin, true)
})

test('compile error codes map to clear log messages', () => {
  assert.equal(compileErrorMessage(429, {}, '').message, 'Too many compiles. Wait a minute and retry.')
  assert.equal(compileErrorMessage(503, { code: 'COMPILER_UNAVAILABLE' }, '').message, 'Compiler is temporarily unavailable. Try again shortly.')
  assert.equal(compileErrorMessage(503, { code: 'DATABASE_UNAVAILABLE', message: 'Busy' }, '').message, 'Busy')
  assert.equal(compileErrorMessage(504, {}, '').message, 'Compilation timed out. Simplify the document.')
  assert.equal(compileErrorMessage(404, {}, '').message, 'The compile service was not found on the server. Deploy the server routes (/api/resume-projects/compile) and a TeX Live install, then try again.')
  assert.equal(compileErrorMessage(0, null, '').message, 'Could not reach the compile server. Check that the backend is running and VITE_API_URL is set.')
  assert.equal(compileErrorMessage(422, { message: 'LaTeX compilation failed.' }, '').message, 'LaTeX compilation failed.')
  assert.equal(compileErrorMessage(422, null, '').message, 'Compilation failed.')
})

test('next redirect accepts same-origin relative paths only', () => {
  assert.equal(safeRedirectPath('/career/resume/editor/abc'), '/career/resume/editor/abc')
  assert.equal(safeRedirectPath(''), '/dashboard')
  assert.equal(safeRedirectPath(null), '/dashboard')
  assert.equal(safeRedirectPath('https://evil.example.com'), '/dashboard')
  assert.equal(safeRedirectPath('//evil.example.com'), '/dashboard')
  assert.equal(safeRedirectPath('\\/career'), '/dashboard')
  assert.equal(safeRedirectPath('/career\r\nX'), '/dashboard')
})

test('login URL encodes the validated return path', () => {
  assert.equal(loginUrl('/career/resume/editor/p1'), '/login?next=%2Fcareer%2Fresume%2Feditor%2Fp1')
  assert.equal(loginUrl('https://evil.example.com'), '/login?next=%2Fdashboard')
})
