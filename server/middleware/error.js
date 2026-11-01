/**
 * Centralised error handling.
 *
 * Every route should call `next(err)` and let this middleware decide what the
 * client sees. That keeps internal details (stack traces, driver errors) out of
 * responses while still returning useful messages for expected failures like a
 * duplicate key.
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  })
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500
  let message = err.message || 'Something went wrong.'
  let code = err.code || null

  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413
    message = 'Uploaded archive exceeds the 5 MB limit.'
    code = 'UPLOAD_TOO_LARGE'
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    status = 409
    message = 'An account with this email already exists.'
    code = 'DUPLICATE_KEY'
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 422
    message = 'Please correct the highlighted fields.'
    code = 'VALIDATION_ERROR'
    // Surface which fields failed so the client can render inline errors.
    const fields = Object.keys(err.errors || {}).reduce((acc, key) => {
      acc[key] = err.errors[key].message
      return acc
    }, {})
    if (Object.keys(fields).length) message = 'Please correct the highlighted fields.'
    return res.status(status).json({ message, code, fields })
  }

  // Malformed ObjectId
  if (err.name === 'CastError') {
    status = 400
    message = 'Invalid identifier.'
    code = 'INVALID_ID'
  }

  // JWT failures
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401
    message = 'Your session has expired. Please sign in again.'
    code = 'AUTH_ERROR'
  }

  if (status >= 500) {
    console.error('[error]', req.method, req.originalUrl, '-', err.stack || err)
    // Never leak internals to the client on a server fault.
    message = 'Something went wrong on our end. Please try again.'
  }

  res.status(status).json({ message, code })
}

/**
 * Wraps an async route handler so a rejected promise reaches the error
 * middleware instead of hanging the request.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
