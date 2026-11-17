import { z } from 'zod'

/**
 * Environment contract.
 *
 * The process refuses to boot when a required variable is missing or
 * malformed. Failing fast at startup beats a confusing runtime error in
 * production, and it keeps secrets from ever having a fallback default.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  // Comma-separated list of extra origins allowed to call the API.
  EXTRA_CORS_ORIGINS: z.string().optional(),

  // Set to "true" to enable Secure cookie flags (required behind HTTPS).
  SECURE_COOKIES: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // Optional mail transport for password reset emails.
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.coerce.number().int().positive().optional(),
  EMAIL_SECURE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  R2_ENDPOINT: z.string().url().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openrouter/free'),
  OLLAMA_BASE_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().default('llama3.2:3b'),
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().max(180000).default(45000),
})

// Under test the real secrets are absent by design, so fall back to
// throwaway values rather than aborting the run. Production and development
// keep the strict "no fallback" behaviour below.
if (process.env.NODE_ENV === 'test') {
  process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/upskillyfy_test'
  process.env.JWT_SECRET ||= 'test_only_secret_key_that_is_at_least_32_chars'
}

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  console.error(`\n❌ Invalid environment configuration:\n${details}\n`)
  console.error('Copy server/.env.example to server/.env and fill in the values.\n')
  process.exit(1)
}

export const env = parsed.data

export const isProduction = env.NODE_ENV === 'production'

export const corsOrigins = [
  env.CLIENT_URL,
  ...(env.EXTRA_CORS_ORIGINS ? env.EXTRA_CORS_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean)
