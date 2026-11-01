/**
 * Express middleware that validates request body / params / query against a
 * Zod schema and returns a structured 422 response on failure.
 *
 * Usage:
 *   router.post('/', validate(createSchema), asyncHandler(handler))
 *
 * Pass an object like { body, params, query } to validate specific parts.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const fields = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      fields[path] = issue.message
    }
    return res.status(422).json({
      message: 'Please correct the highlighted fields.',
      code: 'VALIDATION_ERROR',
      fields,
    })
  }
  req.body = result.data
  next()
}

/**
 * Validates URL/query params (e.g. Mongo ObjectIds) before they hit the route.
 */
export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params)
  if (!result.success) {
    const fields = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      fields[path] = issue.message
    }
    return res.status(422).json({
      message: 'Please correct the highlighted fields.',
      code: 'VALIDATION_ERROR',
      fields,
    })
  }
  req.params = result.data
  next()
}
