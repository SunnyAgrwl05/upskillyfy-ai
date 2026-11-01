# Production Readiness Plan — Upskillyfy Backend

## Goal
Make the LIVE server (`/server/`) production-ready with all hardening from the nested copy PLUS the assessment feature, so adding future features won't break things.

## Phase 1 — Dependencies & Config
- [ ] Add `helmet`, `express-rate-limit`, `cookie-parser`, `zod` to `server/package.json`
- [ ] Add `config/dotenv.js` — loads `.env` first (ESM order-safe)
- [ ] Add `config/env.js` — Zod schema validation, fail fast on bad/missing env

## Phase 2 — Middleware Hardening
- [ ] Rewrite `middleware/error.js` — centralized error handling, never leak internals, `asyncHandler` wrapper
- [ ] Add `middleware/security.js` — helmet (CSP, HSTS, XSS) + rate limiters (api/auth/write)
- [ ] Add `middleware/validate.js` — zod body/params/query validation
- [ ] Enhance `middleware/auth.js` — proper async/await, token version check support

## Phase 3 — Routes (production-ready)
- [ ] `routes/auth.js` — validate schemas, cookie-based refresh, rate limit, error handler
- [ ] `routes/internships.js` — validate, asyncHandler, 404 handling
- [ ] `routes/assessments.js` — FIX `submit` bug (use attemptId→assessment lookup), asyncHandler, validation
- [ ] `routes/contact.js`, `routes/users.js`, `routes/community.js`, `routes/newsletter.js` — validate + asyncHandler

## Phase 4 — index.js Rewrite
- [ ] Security middleware first (helmet, CORS, rate limit, body limits, cookie-parser)
- [ ] MongoDB connect with retry + backoff
- [ ] Graceful shutdown (SIGTERM/SIGINT/unhandledRejection/uncaughtException)
- [ ] Health endpoint with DB status
- [ ] 404 + error handler last

## Phase 5 — Infrastructure
- [ ] `Dockerfile` (multi-stage, non-root user)
- [ ] `docker-compose.yml` (server + mongo)
- [ ] `.github/workflows/ci.yml` (lint + test)
- [ ] Tests with Jest + Supertest (auth, internships, assessments submit fix)

## Phase 6 — Client Hardening
- [ ] `api.js` — 401 interceptor (clear token, redirect), HttpOnly cookie support
- [ ] `AuthContext.jsx` — error boundaries, loading states, cookie token flow
