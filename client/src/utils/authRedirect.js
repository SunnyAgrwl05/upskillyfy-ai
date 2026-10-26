export function safePostAuthDestination(from) {
  let destination = from
  if (from && typeof from === 'object') {
    destination = `${from.pathname || ''}${from.search || ''}${from.hash || ''}`
  }
  if (typeof destination !== 'string' || !destination.startsWith('/') || destination.startsWith('//') || destination.startsWith('/\\')) {
    return '/dashboard'
  }
  try {
    const url = new URL(destination, window.location.origin)
    if (url.origin !== window.location.origin || ['/login', '/register'].includes(url.pathname)) return '/dashboard'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/dashboard'
  }
}
