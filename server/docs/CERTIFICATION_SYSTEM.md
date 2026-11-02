# Upskillyfy Certification System

## 1. Overview

This module provides manually reviewed course certificates, private student documents, PDF download, QR-based public verification, revocation, and an authenticated Achievements dashboard. It does not automatically infer course completion: the current course player and `/api/courses/:id/progress` endpoint do not provide authoritative completion evidence.

Course certificates are immutable PDF snapshots. Offer letters and internship/experience letters are separate private records and are never presented as course-completion certificates.

## 2. Architecture

- **Authentication and authorization:** existing JWT `protect` and `adminOnly` middleware, with the current `User` model as the identity/role source.
- **Course details:** `courseApiService.getLicensedCourses()` and `transformCourse()` provide the trusted course slug/title. Manual admin review is the only supported issuance eligibility check.
- **Credential services:** `certificateService.js` owns issuance, revocation, ownership checks, and public verification. `documentService.js` owns official document records.
- **Rendering and verification:** HTML/CSS templates are rendered by Puppeteer. QR codes contain random 256-bit URL-safe tokens; MongoDB stores their SHA-256 hash and an AES-GCM encrypted copy for authenticated owner links.
- **Storage:** PDF bytes are stored in the `credentialFiles` MongoDB GridFS bucket. MongoDB stores only document metadata and a GridFS file ID.
- **Frontend:** `/learning/certifications` lists the logged-in user's records; `/verify/:token` is public; admin pages call protected `/api/admin/credentials` routes.

## 3. Folder Structure

New backend files:

```text
server/
  docs/CERTIFICATION_SYSTEM.md
  models/Certificate.js
  models/CertificateAuditLog.js
  models/StudentDocument.js
  routes/adminCredentials.js
  routes/certificates.js
  routes/documents.js
  routes/verification.js
  scripts/promoteAdmin.js
  services/certificateService.js
  services/certificateTemplates.js
  services/documentService.js
  services/pdfGenerator.js
  services/qrService.js
  services/storageService.js
  templates/certificates/course-completion.html
  templates/certificates/course-completion.css
  tests/certification.test.js
```

New frontend files:

```text
client/src/pages/Achievements/Achievements.jsx
client/src/pages/Achievements/Achievements.css
client/src/pages/Achievements/CertificateDetails.jsx
client/src/pages/Achievements/CertificatePreview.jsx
client/src/pages/Admin/AdminCertificates.jsx
client/src/pages/Admin/AdminDocuments.jsx
client/src/pages/Admin/AdminCredentials.css
client/src/pages/Verification/CertificateVerification.jsx
client/src/pages/Verification/CertificateVerification.css
```

Integration changes are in `server/index.js`, `server/middleware/auth.js`, `server/routes/auth.js`, `server/routes/courses.js`, `server/services/courseApiService.js`, `server/.env.example`, `client/src/App.jsx`, `client/src/api.js`, and `client/src/pages/Dashboard/Dashboard.jsx`.

## 4. Database Models

All records use Mongoose and the existing MongoDB connection.

- **`Certificate`** (`server/models/Certificate.js`): student reference, recipient-name snapshot, course slug/title snapshot, unique certificate number, hidden verification-token hash and ciphertext, completion/issue dates, issuer, template version, GridFS file ID, status, manual-review source, private admin notes, and revocation metadata. Unique indexes enforce one certificate per `{ user, courseSlug }`, one certificate number, and one token hash. Reissuance after revocation is intentionally not supported in this release.
- **`StudentDocument`** (`server/models/StudentDocument.js`): student, `OFFER_LETTER` / `INTERNSHIP_COMPLETION_LETTER` / `EXPERIENCE_LETTER` type, title/company, optional `Application` reference, GridFS file ID/name, issuing admin, status, and revocation metadata. Course certificates are not duplicated here.
- **`CertificateAuditLog`** (`server/models/CertificateAuditLog.js`): actor, action, optional certificate/document reference, timestamp, reason, and limited metadata. Actions include issuance, revocation, download, upload, and document revocation.

## 5. Certificate Issuance Workflow

1. An administrator searches for an existing student and selects a licensed course.
2. The administrator records a past completion date and private review notes after independently checking evidence.
3. `issueCourseCertificate(input, dependencies = {})` loads the student name from `User` and the course title from the licensed catalog; submitted names/titles are ignored.
4. It generates an unpredictable verification token, a unique certificate number, QR image, and PDF snapshot.
5. The PDF is written to GridFS, then the certificate and `ISSUED` audit record are written to MongoDB.
6. Unique database indexes reject duplicate issuance for the same student/course. An uploaded file is cleaned up when certificate creation fails.
7. The authenticated student sees the issued certificate and can preview/download it.

No automatic issuance or completion-proof validation is implemented. An admin-supplied `completionDate` and review note are records of manual review, not independent machine verification.

## 6. Admin Authorization

Admin endpoints apply `protect` followed by `adminOnly`; the server reloads the account and checks its database role. Public registration continues to permit only student/faculty roles.

`JWT_SECRET` is required; the previous hardcoded JWT fallback was removed. Use `node scripts/promoteAdmin.js` from `server` with `MONGODB_URI` and `ADMIN_EMAIL` configured to promote an existing account. Do not expose an admin role selector or place admin credentials in frontend code.

The admin pages also hide forms for non-admin UI users, but this is only presentation logic; the API middleware provides the security boundary.

## 7. PDF Generation

`generateCertificatePdf(data)` in `server/services/pdfGenerator.js` renders the selected HTML/CSS template using Puppeteer and Chromium, then returns a PDF `Buffer`. `renderCertificateHtml(data)` is separately exported for template verification. PDF generation fails explicitly if Chromium cannot launch; configure `CHROME_EXECUTABLE_PATH` when the runtime does not expose Puppeteer's installed browser.

The generated PDF is stored as a GridFS snapshot. Changing the template does not alter already-issued files.

For a database-free design preview, run `npm run preview:certificate` in `server`. `server/scripts/previewCertificate.js` calls `generateCertificatePdf()` directly with sample-only data, the existing `course-v1` template, a demo verification URL, and `isDemo: true`. It saves `DEMO-NOT-VALID-course-certificate.pdf` under the operating system temporary directory `upskillyfy-credential-previews`. No MongoDB, GridFS, user model, audit log, or issuance service is imported or called. The template overlays a visible `DEMO - NOT A VALID CREDENTIAL` watermark only when `isDemo` is passed.

## 8. Certificate Template Customization

The current registry in `server/services/certificateTemplates.js` contains `course-v1`, backed by `server/templates/certificates/course-completion.html` and `course-completion.css`.

Edit these areas in `course-completion.css`:

- Background: `html, body` and `.certificate`.
- Border and inset: `.certificate__inner`.
- Fonts/typography: `body`, `.certificate__recipient`, and `.certificate__course`.
- Colors: the color declarations in the stylesheet.
- Logo sizing: `.certificate__logo`; configure an optional PNG/JPEG/SVG via `CERTIFICATE_LOGO_PATH`. With no logo, the branded text mark is used.
- Signature artwork/line: `.certificate__signature-image` and `.certificate__signature`; configure a trusted PNG/JPEG/SVG file with `CERTIFICATE_SIGNATURE_PATH`. With no file, a signature line appears beside issuer name/title.
- Recipient position/format: `.certificate__content` and `.certificate__recipient`.
- Course title position: `.certificate__course`.
- QR position/size: `.certificate__verification`.

HTML placeholders (`{{recipientName}}`, `{{courseTitle}}`, dates, certificate number, issuer, QR, and logo) are populated from trusted backend data and HTML-escaped. `CERTIFICATE_ISSUER_NAME` and `CERTIFICATE_ISSUER_TITLE` configure issuer details. To introduce a design, add a versioned HTML/CSS pair and register its paths in `certificateTemplates.js`; issue records retain the selected `templateVersion`.

## 9. QR Verification

`createVerificationToken()` creates a 32-byte cryptographic random token encoded as base64url. The QR points to `${CLIENT_URL}/verify/<token>`. `hashVerificationToken(token)` is used for database lookup. The raw token is not stored; the encrypted value is available only to authenticated certificate detail/list responses so the owner can reopen the verification link.

`GET /api/verification/:token` is public and rate-limited to 30 requests per minute per IP. It returns only recipient name, course title, certificate number, issue date, issuer, and `ISSUED` / `REVOKED` / `INVALID` status. It never returns user IDs, emails, notes, file IDs, or storage URLs.

## 10. MongoDB GridFS Storage

`uploadFile(buffer, metadata)`, `getFileStream(fileId)`, and `deleteFile(fileId)` are exported from `server/services/storageService.js`. They use a `GridFSBucket` named `credentialFiles` on the existing Mongoose connection. A disconnected database returns an explicit 503 storage error.

Admin uploads are limited to one PDF of at most 5 MB and check both the declared MIME type and `%PDF-` file signature. Downloads require authentication and ownership or admin authorization; revoked student documents cannot be downloaded.

## 11. Student Achievements Frontend

`/learning/certifications` is now the Achievements dashboard (the old Resources placeholder was removed from this route). It has All, Course certificates, Internship documents, and Offer letters filters, loading/error/empty states, revoked status, certificate detail/preview, verification link, and PDF download. The existing dashboard links to this section.

API calls are defined in `client/src/api.js` as `certificateAPI`, `documentAPI`, and `verificationAPI`. The frontend never submits a student ID to student list/download endpoints.

### Development-only frontend demo

Set `VITE_CREDENTIALS_DEMO=true` in the client process environment and start/restart Vite in development. On Windows PowerShell, from `client`:

```powershell
$env:VITE_CREDENTIALS_DEMO = 'true'
npm run dev
```

Open `/learning/certifications` for the student preview, `/learning/certifications/demo-certificate-web` for the sample certificate detail, `/admin/credentials` for the sample admin console, and `/admin/documents` for the sample document upload UI. Use the visible state selector to inspect student records, empty, loading, and error states; sample records include a revoked certificate. The admin screen includes sample students/courses and pending-review examples.

Demo issue/revoke/document interactions mutate only module-scoped JavaScript data in the current page runtime. They do not call credential APIs, upload file bytes, write localStorage, mint tokens, write to MongoDB, or survive reload. The file input stores only the selected file name in demo memory. Demo downloads are synthetic PDFs visibly marked `DEMO - NOT VALID`; their QR square is a labelled placeholder and the separate server-generated sample PDF contains a QR to `/verify/DEMO-NOT-A-REAL-CREDENTIAL`. The verification page explicitly says it did not check production.

`credentialsDemoMode` in `client/src/credentialsDemo.js` requires both `import.meta.env.DEV` and `VITE_CREDENTIALS_DEMO === 'true'`. A production Vite build has `DEV === false`, even if the Vite flag is set; demo shortcuts are therefore disabled in production. Disable preview by stopping Vite and restarting it with `VITE_CREDENTIALS_DEMO` unset/false. This mode is only a frontend visual preview: backend `protect` and `adminOnly` middleware are unchanged and always apply to real API requests. Outside the demo flag, these pages use the existing authentication context and real backend APIs.

## 12. Internship Document Management

The admin uploads a PDF for a selected student, choosing an offer, internship-completion, or experience document type. An optional application reference accepts the MongoDB application ID or existing `applicationId`; when supplied, it must belong to the selected student by user reference or email. The document remains separate from an internship completion certificate.

The current `Application` schema has no offer-issued or internship-completed state. Consequently, documents are manually uploaded by an admin; shortlist status does not automatically create an offer.

## 13. API Documentation

All JSON responses below are implemented response shapes. Binary download/preview routes return `application/pdf`; private routes require `Authorization: Bearer <JWT>`. Admin routes require role `admin`.

| Method and path | Access | Request | Response |
|---|---|---|---|
| `GET /api/admin/credentials/students?search=...` | Admin | Search string (2+ chars) | `{ "students": [{ "id": "...", "name": "...", "email": "..." }] }` |
| `GET /api/admin/credentials/courses` | Admin | — | `{ "courses": [{ "slug": "...", "title": "..." }] }` |
| `POST /api/admin/credentials/certificates/preview` | Admin | `{ "userId", "courseSlug", "completionDate" }` | PDF preview, not stored/issued |
| `POST /api/admin/credentials/certificates` | Admin | `{ "userId", "courseSlug", "completionDate": "YYYY-MM-DD", "verificationSource": "ADMIN_REVIEW", "adminNotes": "" }` | `201 { "certificate": { "id", "recipientName", "courseTitle", "courseSlug", "certificateNumber", "completionDate", "issuedAt", "status" }, "verificationUrl": "..." }` |
| `GET /api/admin/credentials/certificates` | Admin | — | `{ "certificates": [...] }` (up to 100 newest) |
| `PATCH /api/admin/credentials/certificates/:id/revoke` | Admin | `{ "reason": "..." }` | `{ "certificate": { "id", "certificateNumber", "status": "REVOKED", "revokedAt": "..." } }` |
| `GET /api/certificates/my` | Authenticated | — | `{ "certificates": [...] }` for current user |
| `GET /api/certificates/:id` | Owner/admin | — | `{ "certificate": { ... } }`; admin view additionally includes private admin notes/user ID |
| `GET /api/certificates/:id/download` | Owner/admin | — | Private PDF attachment |
| `GET /api/verification/:token` | Public, rate-limited | Opaque QR token | `{ "valid": true, "status": "ISSUED", "certificate": { "recipientName", "courseTitle", "certificateNumber", "issuedAt", "issuer" } }`; invalid returns `{ "valid": false, "status": "INVALID", "certificate": null }` |
| `GET /api/admin/credentials/documents` | Admin | — | `{ "documents": [...] }` (up to 100 newest) |
| `POST /api/admin/credentials/documents` | Admin | Multipart `userId`, `documentType`, `title`, optional `company`/`applicationId`, and PDF `file` | `201 { "document": { "id", "userId", "documentType", "title", "company", "issuedAt", "status" } }` |
| `PATCH /api/admin/credentials/documents/:id/revoke` | Admin | `{ "reason": "..." }` (5–500 chars) | `{ "document": { "id", "status": "REVOKED", "revokedAt": "..." } }` |
| `GET /api/documents/my` | Authenticated | — | `{ "documents": [...] }` for current user |
| `GET /api/documents/:id` | Owner/admin | — | `{ "document": { ... } }` |
| `GET /api/documents/:id/download` | Owner/admin | — | Private PDF attachment; revoked document returns 410 |

Expected validation/authorization statuses include 400/422 for invalid input, 401 for missing/invalid authentication, 403 for wrong role/owner, 404 for absent student/course/record, 409 for duplicate issuance/already revoked, 410 for revoked document download, 413 for oversized upload, and 503 for unavailable MongoDB/course catalog/renderer configuration. See section 19 for executed checks; end-to-end issuance requires a configured MongoDB and licensed course provider.

## 14. Authentication Integration

`protect(req, res, next)` reads and verifies the bearer JWT, loads the current `User`, and attaches it as `req.user`. `adminOnly(req, res, next)` checks `req.user.role`. `JWT_SECRET` must be a strong private deployment secret. Register/login fail explicitly if it is missing; no default signing key is used.

The frontend's existing `AuthContext` uses localStorage for session persistence, but the backend remains authoritative for identity and authorization. No certificate endpoint accepts a client-supplied owner ID for the current user's list/download.

## 15. Course Integration

The current provider is `courseApiService.getLicensedCourses()` and `courseApiService.transformCourse(rawCourse)`. The stable handoff contract for a future completion provider is:

```js
await issueCourseCertificate({
  userId,
  courseSlug,
  completionDate,
  issuedBy,
  verificationSource: 'ADMIN_REVIEW',
  adminNotes,
})
```

At present, only the admin route can initiate issuance and only `ADMIN_REVIEW` is accepted. `User.completedLessons`, localStorage progress, and the optional-auth course progress endpoint are not sufficient eligibility evidence. A trusted completion event/provider is not implemented.

## 16. Internship Integration

`StudentDocument.application` references the existing `Application` model. The current workflow checks that the optional reference belongs to the target student, then stores the issuer, type, and PDF. No internship state-machine changes or automatic offer generation were made. A future trusted internship provider should authorize an offer/completion event and call `createStudentDocument({ userId, documentType, title, company, applicationId, file, issuedBy })` or add a separately authenticated service-to-service interface.

## 17. Environment Variables

Required/relevant server environment:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Existing MongoDB database and GridFS bucket |
| `JWT_SECRET` | JWT signing/verification and AES-GCM encryption key derivation; use a strong random secret |
| `CLIENT_URL` | Frontend origin(s); first configured URL is used for certificate verification links |
| `COURSE_API_BASE_URL` | Licensed course API base URL |
| `COURSE_API_KEY` | Licensed course API credential; no source-code fallback is used |
| `CHROME_EXECUTABLE_PATH` | Optional path to installed Chromium/Chrome for Puppeteer |
| `CERTIFICATE_ISSUER_NAME` | Optional public issuer label (default `Upskillyfy AI`) |
| `CERTIFICATE_ISSUER_TITLE` | Optional signature title |
| `CERTIFICATE_LOGO_PATH` | Optional server-readable PNG/JPEG/SVG logo path |
| `CERTIFICATE_SIGNATURE_PATH` | Optional server-readable PNG/JPEG/SVG authorized signature path |
| `ADMIN_EMAIL` | One-time input to `npm run admin:promote`; email of the existing account to promote |
| `PORT` | Optional Express listen port (default `5000`) |

Never commit a real `.env` file or credentials. Rotating `JWT_SECRET` also prevents decryption of previously encrypted verification links; previously printed QR tokens still verify from their stored hashes. Plan key rotation before changing it.

## 18. Installation and Execution

1. Configure the variables above in `server/.env`; ensure MongoDB can create/use GridFS collections.
2. Install frontend/backend dependencies from the repository root with `npm run install-all` (or `npm install` in each package).
3. Start the server with `cd server && npm run dev`.
4. Start the frontend separately with `cd client && npm run dev`.
5. To preview the student/admin frontend with no login and no database, set `VITE_CREDENTIALS_DEMO=true` in the Vite process as described in section 11. To render the actual HTML/CSS certificate template without MongoDB, run `npm run preview:certificate` in `server`; the output path is printed.
6. For real APIs, promote a pre-existing, trusted account by running `ADMIN_EMAIL=...` and `node scripts/promoteAdmin.js` from `server` (on Windows PowerShell, set `$env:ADMIN_EMAIL='...'` first).
7. Open `/admin/credentials` to manually issue, or `/admin/documents` to upload private official documents.

Puppeteer must be able to launch Chromium in the deployed server runtime. Configure `CHROME_EXECUTABLE_PATH` where necessary; the frontend's Vercel SPA rewrite is not itself a deployment configuration for the Express/MongoDB backend.

## 19. Testing

The built-in Node test suite is `npm test` from `server`. `server/tests/certification.test.js` covers token entropy/hash behavior, safe HTML rendering/QR embedding, PDF output, dynamic data population, duplicate rollback, course/student validation, document validation/upload, ownership, audit rollback, public valid/revoked/invalid response shaping, and admin-role rejection. The project has no configured server lint script.

Validation in this implementation environment:

- `npm test`: 16 tests passed, including a real Chromium landscape-A4 PDF render.
- `npm run build` in `client`: passed.
- `npm run lint` in `client`: completed with pre-existing warnings in unrelated assessment/resume files; no certification UI files were reported.
- HTTP smoke checks with MongoDB intentionally unset: `GET /api/health` returned HTTP 200 with `{ "status": "ok", "message": "Upskillyfy API running 🚀", "time": "<ISO date>" }`; `GET /api/verification/invalid-token` returned HTTP 503 with `{ "message": "Verification is temporarily unavailable.", "code": "DATABASE_UNAVAILABLE" }`; unauthenticated `GET /api/certificates/my` returned HTTP 401 with `{ "message": "Authentication required. Please login." }`.

A no-database smoke response proves route registration and explicit unavailability only; it does not prove a MongoDB/GridFS issuance, upload, or real public lookup. Run the complete manual issuance/download/revocation flow against a non-production MongoDB before deployment.

## 20. Known Limitations

- There is no authoritative course-completion provider; manual admin review is required.
- There is no course database model in this repository; issuance relies on the external licensed catalog.
- There are no offer-issued/completed application states or trusted internship integration; documents are admin uploads.
- A student can receive only one certificate per course, including after revocation; reissue policy is not implemented.
- MongoDB state changes and audit writes are not wrapped in a transaction. Issuance, document upload, and revocation attempt compensating rollback when audit logging fails; investigate any logged rollback failure before retrying.
- Uploaded PDFs are checked for MIME type, size, and PDF header, but are not malware-scanned.
- PDF creation requires Chromium and can require deployment-specific runtime/memory configuration.
- Verification-token ciphertext uses a key derived from `JWT_SECRET`; rotating the secret can remove owner-visible verification links as described above.
- The repository does not include deployed integration credentials or a test MongoDB, so production database workflows must be validated in the target environment.
- Frontend demo fixtures and interactions are development-only and in-memory. They do not substitute for authentication, course eligibility, document upload, verification, or persistent credential issuance.
- The standalone PDF is deliberately watermarked and its demo QR URL is not an issued credential or production verification link.

## 21. Integration Checklist for Other Developers

### INTEGRATION CHECKLIST FOR OTHER DEVELOPERS

- **Authentication:** provide a trusted authenticated user ID and database role in `req.user`; keep `JWT_SECRET` configured and provision admins out-of-band. Do not accept client-supplied user IDs for student-owned reads.
- **Course management:** provide stable slugs and verified course completion evidence. Until then, keep issuance behind the admin review API. A future provider should call `issueCourseCertificate({ userId, courseSlug, completionDate, issuedBy, verificationSource, adminNotes })`.
- **Profile:** ensure `User.name` is verified and suitable for formal certificates; the issued certificate snapshots this value.
- **Internship:** add trusted offer/completion statuses or events and provide a validated application reference. Current `createStudentDocument({ userId, documentType, title, company, applicationId, file, issuedBy })` is called only from the admin upload route.
- **Storage/operations:** keep MongoDB available with GridFS enabled; if storage changes, preserve `uploadFile(buffer, metadata)`, `getFileStream(fileId)`, and `deleteFile(fileId)` behavior, private access checks, and immutable snapshots.
- **PDF/design:** keep Chromium available or preserve `generateCertificatePdf(data)` semantics. Add template versions without mutating files used by previously issued records.
- **Deployment:** configure `MONGODB_URI`, strong `JWT_SECRET`, `CLIENT_URL`, `COURSE_API_BASE_URL`, `COURSE_API_KEY`, and Chromium path as needed. Do not claim completion integration until trusted evidence is wired and tested.
- **Preview mode:** use `VITE_CREDENTIALS_DEMO=true` only with the Vite dev server. Unset the variable to return to real authenticated UI; production builds cannot enable the demo branch.

## 22. Future Enhancements

Potential follow-ups are a signed course-completion event, internship state integration, controlled reissue/version history, transaction-backed audit writes, malware scanning, configurable admin template authoring, additional versioned designs, and deployment-specific PDF runtime hardening. AI-generated credentials, blockchain, third-party credential providers, and automatic offer generation are intentionally out of scope.
