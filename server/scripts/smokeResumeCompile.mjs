// Manual smoke test for the guest->login->compile flow.
// Usage: node server/scripts/smokeResumeCompile.mjs [BASE_URL]
//   BASE_URL defaults to http://localhost:5000  (use https://staging... for staging)
// Exits non-zero on the first failed check. Does not need Docker until the
// final compile step; auth checks (401 without cookie) run anywhere.

const BASE_URL = (process.argv[2] || 'http://localhost:5000').replace(/\/$/, '')
const email = `smoke-${Date.now()}@example.test`
const password = 'Smoke-Test-123!'

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) process.exitCode = 1
}

const MINIMAL_TEX = String.raw`\documentclass{article}
\begin{document}
Hello from the smoke test.
\end{document}`

const projectPayload = {
  id: `smoke-${Date.now()}`,
  name: 'Smoke Test Project',
  mainFile: 'main.tex',
  tags: [],
  archived: false,
  trashed: false,
  files: [{ path: 'main.tex', content: MINIMAL_TEX, isBinary: false }],
}

let cookie = ''

console.log(`Base URL: ${BASE_URL}\n`)

// 1. Register
let res = await fetch(`${BASE_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name: 'Smoke Tester', email, password, termsAccepted: true }),
})
const setCookie = res.headers.get('set-cookie') || ''
if (res.status === 201 && /upskillyfy_token=/.test(setCookie)) {
  cookie = setCookie.split(';')[0]
  check('register issues HttpOnly session cookie', true)
} else {
  check('register issues HttpOnly session cookie', false, `status ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

// 2. /me with cookie proves the session works
res = await fetch(`${BASE_URL}/api/auth/me`, { headers: { cookie } })
check('GET /auth/me with cookie returns 200', res.status === 200, `status ${res.status}`)

// 3. /compile WITHOUT a cookie must be 401
res = await fetch(`${BASE_URL}/api/resume-projects/compile`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(projectPayload),
})
check('POST /compile without cookie returns 401', res.status === 401, `status ${res.status}`)

// 4. /compile WITH a cookie. With Docker + LATEX_COMPILER_IMAGE this returns a PDF.
res = await fetch(`${BASE_URL}/api/resume-projects/compile`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie },
  body: JSON.stringify(projectPayload),
})
const body = await res.arrayBuffer()
const head = Buffer.from(body.subarray(0, 5)).toString('ascii')
if (res.status === 200 && head === '%PDF-') {
  check('POST /compile with cookie returns a valid PDF', true, `${body.byteLength} bytes, %PDF header`)
} else {
  const text = Buffer.from(body).toString('utf8').slice(0, 200)
  check(
    'POST /compile with cookie returns a valid PDF',
    false,
    `status ${res.status}, body: ${text} (expected 200 + %PDF header; needs Docker and LATEX_COMPILER_IMAGE set)`,
  )
}

console.log(`\n${results.filter(r => r.ok).length}/${results.length} checks passed`)
