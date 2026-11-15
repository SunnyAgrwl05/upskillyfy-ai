// Pure helpers for the guest compile flow in OverleafEditor.jsx and the
// `next` redirect in Login.jsx. Kept framework-free so node:test can cover
// the security rules without a DOM.

const FALLBACK_NEXT = '/dashboard'

/**
 * Accept only a same-origin relative path for the `next` redirect parameter.
 * Rejects absolute URLs, protocol-relative URLs, backslash escapes, and
 * control characters that could break out of the path.
 */
export function safeRedirectPath(value, fallback = FALLBACK_NEXT) {
  if (typeof value !== 'string' || !value) return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//')) return fallback
  if (value.includes('\\')) return fallback
  if (/[\r\n\t]/.test(value)) return fallback
  return value
}

/** Build the login URL that returns the visitor to `next` afterwards. */
export function loginUrl(nextPath, fallback = FALLBACK_NEXT) {
  const target = safeRedirectPath(nextPath, fallback)
  return `/login?next=${encodeURIComponent(target)}`
}

/** Toolbar and empty-preview button label, driven by auth state. */
export function compileButtonLabel({ isLoggedIn, compiling }) {
  if (compiling) return 'Compiling…'
  return isLoggedIn ? 'Recompile' : 'Login to compile'
}

/**
 * Map a compile failure to a clear log message. `status`/`body` come from
 * the axios error (body already parsed); `networkMessage` is used when the
 * request never reached the server.
 */
export function compileErrorMessage(status, body, networkMessage) {
  if (status === 401) return { message: 'Session expired. Please log in again.', redirectToLogin: true }
  if (status === 429) return { message: 'Too many compiles. Wait a minute and retry.' }
  if (status === 503) {
    if (body?.code === 'COMPILER_UNAVAILABLE') return { message: 'Compiler is temporarily unavailable. Try again shortly.' }
    return { message: body?.message || 'The isolated LaTeX compiler is temporarily unavailable.' }
  }
  if (status === 504) return { message: 'Compilation timed out. Simplify the document.' }
  if (status === 404) {
    return { message: 'The compile service was not found on the server. Deploy the server routes (/api/resume-projects/compile) and a TeX Live install, then try again.' }
  }
  if (!status) return { message: networkMessage || 'Could not reach the compile server. Check that the backend is running and VITE_API_URL is set.' }
  return { message: body?.message || 'Compilation failed.' }
}
