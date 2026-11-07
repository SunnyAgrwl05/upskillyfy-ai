# Hackathon API Reference (/api/hackathons)

## Overview
The Hackathon API supports a full portal for creating, managing, registering, and participating in hackathons. All endpoints are mounted under `/api/hackathons`. It uses JWT authentication; the user's role (`student`, `admin`) is enforced by the server.

## Authentication
- Use the `Authorization` header (Bearer token) or the HttpOnly cookie set on login/register.
- Endpoints that require authentication include `protect` middleware (any logged-in user).
- Organizer-only endpoints add `adminOnly` middleware (role must be `admin`).

## Models
All IDs follow MongoDB ObjectIds; request/response bodies use `id` and `slug` fields.

### Hackathon
```json
{
  "_id": "64ff1e2a9c3d2a001f8c4b2d",
  "slug": "tech-fest-2026",
  "title": "Tech Fest 2026",
  "description": "A 48-hour hackathon focused on cloud-native applications.",
  "logo": "https://example.com/logo.png",
  "organiser": "Tech Club",
  "organiserEmail": "organiser@example.com",
  "mode": "Hybrid",
  "isFree": true,
  "fee": null,
  "registrationStart": "2026-11-01T10:00:00.000Z",
  "registrationDeadline": "2026-12-31T23:59:59.000Z",
  "startDate": "2027-01-15T09:00:00.000Z",
  "endDate": "2027-01-17T18:00:00.000Z",
  "domains": [
    {
      "domainId": "ai",
      "name": "AI/ML",
      "description": "Machine learning and data science projects.",
      "sampleProblemStatements": [
        "Build an ML model to predict urban traffic congestion.",
        "Create an NLP assistant for resume screening."
      ],
      "domainDeadline": "2027-01-10T23:59:59.000Z",
      "teamSizeMin": 1,
      "teamSizeMax": 4,
      "seatsTotal": 50,
      "seatsTaken": 12,
      "prizes": "₹50,000 + mentorship"
    }
  ],
  "rounds": [
    {
      "roundId": "reg",
      "title": "Registration",
      "description": "Sign up for the hackathon.",
      "startDate": "2026-11-01T10:00:00.000Z",
      "endDate": "2026-12-31T23:59:59.000Z",
      "isCompleted": false
    }
  ],
  "eligibility": "Open to all undergraduate students.",
  "rules": "No commercial code; max one submission per team.",
  "timeline": "Check the dashboard for round updates.",
  "judges": [
    {
      "name": "Dr. Alice",
      "title": "Professor",
      "company": "Tech University",
      "photo": "https://example.com/judge1.jpg"
    }
  ],
  "mentors": [...],
  "partners": [...],
  "faqs": [...],
  "announcements": [],
  "status": "registration_open",
  "isPublished": true,
  "resultsPublishedAt": null,
  "createdBy": "64ff1e2a9c3d2a001f8c4b2d",
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:00:00.000Z"
}
```

### HackathonTeam
```json
{
  "_id": "64ff2a5b9c3d2a001f8c4b3e",
  "hackathonId": "64ff1e2a9c3d2a001f8c4b2d",
  "domainId": "ai",
  "teamName": "Data Wizards",
  "inviteCode": "XYZ123",
  "leader": "64ff2a5c9c3d2a001f8c4b3f",
  "members": ["64ff2a5c9c3d2a001f8c4b3f", "64ff2a5d9c3d2a001f8c4b40"],
  "maxSize": 4,
  "createdAt": "2026-11-05T12:00:00.000Z"
}
```

### HackathonRegistration
```json
{
  "_id": "64ff2b6c9c3d2a001f8c4b41",
  "hackathonId": "64ff1e2a9c3d2a001f8c4b2d",
  "userId": "64ff2a5c9c3d2a001f8c4b3f",
  "domainId": "ai",
  "teamId": "64ff2a5b9c3d2a001f8c4b3e",
  "status": "registered",
  "registeredAt": "2026-11-05T12:00:00.000Z"
}
```

### HackathonSubmission
```json
{
  "_id": "64ff2c7d9c3d2a001f8c4b42",
  "hackathonId": "64ff1e2a9c3d2a001f8c4b2d",
  "teamId": "64ff2a5b9c3d2a001f8c4b3e",
  "domainId": "ai",
  "title": "AI Resume Scanner",
  "description": "An application that uses NLP to screen resumes.",
  "techStack": ["React", "Node.js", "TensorFlow"],
  "repoUrl": "https://github.com/example/resume-scanner",
  "demoUrl": "https://example.com/demo",
  "videoUrl": "https://example.com/video",
  "isDraft": true,
  "submittedAt": "2026-12-20T15:30:00.000Z",
  "submittedBy": "64ff2a5c9c3d2a001f8c4b3f"
}
```

### HackathonScore
```json
{
  "_id": "64ff2d8e9c3d2a001f8c4b43",
  "submissionId": "64ff2c7d9c3d2a001f8c4b42",
  "judgeId": "64ff2a5e9c3d2a001f8c4b44",
  "innovation": 8,
  "impact": 7,
  "technicalDepth": 9,
  "design": 6,
  "presentation": 8,
  "average": 7.6,
  "comments": "Great idea, needs more robustness.",
  "isPublished": false
}
```

### HackathonAnnouncement
```json
{
  "_id": "64ff2e9f9c3d2a001f8c4b45",
  "hackathonId": "64ff1e2a9c3d2a001f8c4b2d",
  "title": "Registration Extended",
  "content": "Due to popular demand, registration deadline extended to Dec 31.",
  "authorId": "64ff2a5f9c3d2a001f8c4b46",
  "isPublished": true,
  "publishedAt": "2026-11-01T10:00:00.000Z"
}
```

## Endpoints

### List & Detail (public)

#### GET /api/hackathons
- **Auth**: none
- **Role**: any
- **Query params**: `status` (Open|Live|Ended), `mode` (Virtual|Hybrid|In Person), `domain` (domainId), `isFree` (true|false), `search` (string), `page` (1), `limit` (20)
- **Response**: `{ success: true, data: [{hackathon}, ...], pagination: { page, limit, total, pages } }`

#### GET /api/hackathons/:slug
- **Auth**: none
- **Role**: any
- **Response**: `{ success: true, data: {hackathon} }`

#### GET /api/hackathons/:slug/results
- **Auth**: none (only if hackathon.status === "results_published")
- **Role**: any
- **Response**: `{ success: true, data: { hackathonId, slug, title, winners: [{domainId, teamId, rank, score}] } }`

### Registration (authenticated)

#### POST /api/hackathons/:slug/register
- **Auth**: protect
- **Role**: student
- **Body**: `{ domainId: "ai" }`
- **Success**: 201
- **Response**: `{ success: true, data: { registrationId, domainId, status } }`
- **Error**: 400 (registration closed/full/no seats), 422 (invalid domain), 409 (already registered for this hackathon)

#### DELETE /api/hackathons/:slug/register
- **Auth**: protect
- **Role**: student
- **Response**: `{ success: true, message: "Registration cancelled" }`
- **Error**: 404 (registration not found)

#### GET /api/hackathons/my/registrations
- **Auth**: protect
- **Role**: student
- **Response**: `{ success: true, data: [{hackathonId, slug, title, domainId, status, registeredAt}] }`

### Team (authenticated)

#### POST /api/hackathons/:slug/team
- **Auth**: protect
- **Role**: student
- **Body**: `{ domainId, teamName }`
- **Success**: 201
- **Response**: `{ success: true, data: { teamId, inviteCode, domainId } }`
- **Error**: 400 (already registered or in another team), 422 (domain not available)

#### POST /api/hackathons/:slug/team/join
- **Auth**: protect
- **Role**: student
- **Body**: `{ inviteCode }`
- **Response**: `{ success: true, message: "Joined team" }`
- **Error**: 400 (invite code invalid/used), 404 (team not found)

#### POST /api/hackathons/:slug/team/leave
- **Auth**: protect
- **Role**: student
- **Body**: none
- **Response**: `{ success: true, message: "Left team" }`
- **Error**: 400 (only leader can leave), 404 (team not found)

#### DELETE /api/hackathons/:slug/team/member/:userId
- **Auth**: protect
- **Role**: student (only leader)
- **Response**: `{ success: true, message: "Member removed" }`
- **Error**: 403 (not leader), 404 (member not found)

#### GET /api/hackathons/:slug/team
- **Auth**: protect
- **Role**: student
- **Response**: `{ success: true, data: { teamId, teamName, domainId, members, leader } }`

### Submissions (authenticated)

#### POST /api/hackathons/:slug/submissions
- **Auth**: protect
- **Role**: student (team member)
- **Body**: submission object (see model). Set `isDraft: true` for drafts.
- **Success**: 201
- **Response**: `{ success: true, data: { submissionId, isDraft } }`

#### PUT /api/hackathons/:slug/submissions/:submissionId
- **Auth**: protect
- **Role**: student (owner of submission)
- **Body**: fields to update
- **Response**: `{ success: true, message: "Submission updated" }`

#### POST /api/hackathons/:slug/submissions/:submissionId/submit
- **Auth**: protect
- **Role**: student (team lead)
- **Response**: `{ success: true, message: "Submission submitted" }`
- **Error**: 400 (deadline passed, already submitted)

#### GET /api/hackathons/:slug/submissions/my
- **Auth**: protect
- **Role**: student
- **Response**: `{ success: true, data: [submission] }`

### Organizer (admin only)

#### POST /api/hackathons
- **Auth**: protect, adminOnly
- **Role**: admin
- **Body**: Full hackathon object (all fields). Must include slug.
- **Success**: 201
- **Response**: `{ success: true, data: { hackathonId, slug } }`
- **Error**: 422 (validation), 409 (slug or organiserEmail duplicate)

#### PUT /api/hackathons/:slug
- **Auth**: protect, adminOnly
- **Role**: admin
- **Body**: Partial fields to update.
- **Success**: 200
- **Response**: `{ success: true, data: { hackathon } }`
- **Error**: 404 (not found), 422 (validation)

#### DELETE /api/hackathons/:slug
- **Auth**: protect, adminOnly
- **Role**: admin
- **Response**: `{ success: true, message: "Hackathon deleted" }`

#### GET /api/hackathons/:slug/registrations
- **Auth**: protect, adminOnly
- **Role**: admin
- **Query params**: `domainId`, `status` (registered|team_formed|submitted), `search` (email), `page`, `limit`
- **Response**: CSV export if `export=1` query param, else `{ success: true, data: [{userId, email, name, domainId, status, registeredAt}], pagination }`
- **Error**: 404

#### GET /api/hackathons/:slug/submissions
- **Auth**: protect, adminOnly
- **Role**: admin
- **Response**: `{ success: true, data: [{submission}, ...] }`

#### POST /api/hackathons/:slug/submissions/:submissionId/score
- **Auth**: protect, adminOnly
- **Role**: admin
- **Body**: `{ innovation, impact, technicalDepth, design, presentation (1-10 each), comments }`
- **Success**: 200
- **Response**: `{ success: true, data: { score } }`
- **Error**: 404 (submission), 400 (score out of range)

#### POST /api/hackathons/:slug/announcements
- **Auth**: protect, adminOnly
- **Role**: admin
- **Body**: `{ title, content }`
- **Success**: 201
- **Response**: `{ success: true, data: { announcementId } }`

#### PUT /api/hackathons/:slug/announcements/:id
- **Auth**: protect, adminOnly
- **Role**: admin
- **Body**: Partial fields
- **Response**: `{ success: true, message: "Announcement updated" }`

#### POST /api/hackathons/:slug/publish-results
- **Auth**: protect, adminOnly
- **Role**: admin
- **Response**: `{ success: true, message: "Results published" }`
- **Error**: 400 (not ready, missing scores), 404 (hackathon)

## Error Codes

All errors return `{ message, code }` where `code` is one of:

- `AUTH_ERROR`, `NO_TOKEN`, `FORBIDDEN` (authorization)
- `VALIDATION_ERROR` (422)
- `NOT_FOUND` (404)
- `DUPLICATE_KEY` (409)
- `RATE_LIMITED` (429)
- `UPLOAD_TOO_LARGE` (413)
- `EMAIL_TAKEN` (409)
- `INVALID_CREDENTIALS` (401)
- `SESSION_INVALID` (401)
- `TOKEN_EXPIRED` (401)
- `NO_REFRESH_TOKEN` (401)
- `INVALID_ID` (400)

See `server/middleware/error.js` for structured error handling.

---

*Generated from the Hackathon portal models and routes. All API responses are wrapped in `{ success, data? }`.*