# Hackathon Portal Implementation Plan

## Overview
Build an India-level HACKATHON PORTAL in the style of Hack2Skill (hack2skill.com): clean, white, professional, enterprise-trustworthy. Following existing project patterns exactly.

---

## Phase 1: Models, Schemas, Routes, Tests

### 1.1 Server Models (new files)
- `server/models/Hackathon.js` - Main hackathon model with embedded domains[] and rounds[]
- `server/models/HackathonTeam.js` - Team model
- `server/models/HackathonRegistration.js` - User registration per hackathon
- `server/models/HackathonSubmission.js` - Team submissions
- `server/models/HackathonScore.js` - Judge scores
- `server/models/HackathonAnnouncement.js` - Organizer announcements

### 1.2 Validation Schemas (new file)
- `server/validation/hackathonSchemas.js` - Zod schemas for create/update

### 1.3 API Routes (new file)
- `server/routes/hackathons.js` - All endpoints under `/api/hackathons`

### 1.4 Seed Script (new file)
- `server/scripts/seedHackathons.js` - 5 hackathons in different states with domains, rounds, sample teams

### 1.5 Tests (new file)
- `server/tests/hackathons.test.js` - Registration window, seat race, team rules, deadline lock, result visibility, role protection

---

## Phase 2: Hackathons List and Hackathon Page with Domain Cards

### 2.1 Client API (update existing)
- `client/src/api.js` - Add `hackathonAPI` object

### 2.2 Pages (new files)
- `client/src/pages/Community/HackathonsList.jsx` - `/community/hackathons` with tabs (Open, Live, Past), search, filters, pagination
- `client/src/pages/Community/HackathonDetail.jsx` - `/community/hackathons/:slug` with header, sections, domain cards

### 2.3 Styles (new files)
- `client/src/pages/Community/HackathonsList.css`
- `client/src/pages/Community/HackathonDetail.css`

### 2.4 Router Update
- `client/src/App.jsx` - Add new routes

---

## Phase 3: Participate Stepper (signed-in only)

### 3.1 Pages (new files)
- `client/src/pages/Community/HackathonParticipate.jsx` - Full-page stepper with 5 steps

### 3.2 Styles (new file)
- `client/src/pages/Community/HackathonParticipate.css`

---

## Phase 4: My Dashboard and Event Workspace

### 4.1 Pages (new files)
- `client/src/pages/Dashboard/HackathonsDashboard.jsx` - `/dashboard/hackathons` (My Initiatives)
- `client/src/pages/Dashboard/HackathonWorkspace.jsx` - `/dashboard/hackathons/:slug` (Participant workspace with tabs: Roadmap, Team Management, Submissions, Announcements, Resources)

### 4.2 Styles (new files)
- `client/src/pages/Dashboard/HackathonsDashboard.css`
- `client/src/pages/Dashboard/HackathonWorkspace.css`

---

## Phase 5: Organizer Pages and Judging

### 5.1 Pages (new files)
- `client/src/pages/Organizer/HackathonManage.jsx` - Create/edit hackathon
- `client/src/pages/Organizer/HackathonRegistrations.jsx` - Registrations table per domain
- `client/src/pages/Organizer/HackathonSubmissions.jsx` - Submissions with judging
- `client/src/pages/Organizer/HackathonAnnouncements.jsx` - Post announcements
- `client/src/pages/Organizer/HackathonResults.jsx` - Publish winners

### 5.2 Styles (new files)
- Various CSS files for organizer pages

---

## Phase 6: Results, Seed Data, Accessibility and Polish

### 6.1 Public Results Page
- `client/src/pages/Community/HackathonResults.jsx` - `/community/hackathons/:slug/results`

### 6.2 Final integration and testing

---

## Data Model Details (Mongoose)

### Hackathon
```javascript
{
  slug: { type: String, unique: true, index: true },
  title: String,
  description: String,
  logo: String,
  organiser: String,
  organiserEmail: String,
  mode: { type: String, enum: ['Virtual', 'Hybrid', 'In Person'] },
  isFree: Boolean,
  fee: Number, // if not free
  registrationStart: Date,
  registrationDeadline: Date,
  startDate: Date,
  endDate: Date,
  domains: [{
    domainId: String,
    name: String,
    description: String,
    sampleProblemStatements: [String],
    domainDeadline: Date,
    teamSizeMin: Number,
    teamSizeMax: Number,
    seatsTotal: Number,
    seatsTaken: { type: Number, default: 0 },
    prizes: String,
  }],
  rounds: [{
    roundId: String,
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    isCompleted: { type: Boolean, default: false },
  }],
  eligibility: String,
  rules: String,
  timeline: String,
  judges: [{ name: String, title: String, company: String, photo: String }],
  mentors: [{ name: String, title: String, company: String, photo: String }],
  partners: [{ name: String, logo: String, url: String }],
  faqs: [{ question: String, answer: String }],
  announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HackathonAnnouncement' }],
  status: { type: String, enum: ['draft', 'published', 'registration_open', 'live', 'ended', 'results_published'], default: 'draft' },
  isPublished: { type: Boolean, default: false },
  resultsPublishedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }
```

### HackathonTeam
```javascript
{
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', index: true },
  domainId: String,
  teamName: String,
  inviteCode: { type: String, unique: true, index: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxSize: Number,
}, { timestamps: true }
```

### HackathonRegistration
```javascript
{
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  domainId: String,
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonTeam' },
  status: { type: String, enum: ['registered', 'team_formed', 'submitted'], default: 'registered' },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true }
// Unique compound index: hackathonId + userId
```

### HackathonSubmission
```javascript
{
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', index: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonTeam', index: true },
  domainId: String,
  title: String,
  description: String,
  techStack: [String],
  repoUrl: String,
  demoUrl: String,
  videoUrl: String,
  isDraft: { type: Boolean, default: true },
  submittedAt: Date,
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }
```

### HackathonScore
```javascript
{
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'HackathonSubmission', index: true },
  judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  innovation: { type: Number, min: 1, max: 10 },
  impact: { type: Number, min: 1, max: 10 },
  technicalDepth: { type: Number, min: 1, max: 10 },
  design: { type: Number, min: 1, max: 10 },
  presentation: { type: Number, min: 1, max: 10 },
  average: Number,
  comments: String,
  isPublished: { type: Boolean, default: false },
}, { timestamps: true }
```

### HackathonAnnouncement
```javascript
{
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', index: true },
  title: String,
  content: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true }
```

---

## API Endpoints (under `/api/hackathons`)

### Public
- `GET /` - List hackathons with filters (status, mode, domain, free/paid), search, pagination
- `GET /:slug` - Get single hackathon detail
- `GET /:slug/results` - Get published results (leaderboard, winners)

### Participant (authenticated)
- `POST /:slug/register` - Register for a hackathon (pick domain)
- `DELETE /:slug/register` - Cancel registration
- `GET /my/registrations` - My hackathon registrations

### Team Management (authenticated)
- `POST /:slug/team` - Create team (with domain)
- `POST /:slug/team/join` - Join team with invite code
- `POST /:slug/team/leave` - Leave team
- `DELETE /:slug/team/member/:userId` - Remove member (team lead only)
- `GET /:slug/team` - Get my team info

### Submissions (authenticated)
- `POST /:slug/submissions` - Save draft submission
- `PUT /:slug/submissions/:submissionId` - Update draft
- `POST /:slug/submissions/:submissionId/submit` - Submit final
- `GET /:slug/submissions/my` - Get my team's submission

### Organizer (admin/faculty only)
- `POST /` - Create hackathon
- `PUT /:slug` - Update hackathon
- `DELETE /:slug` - Delete hackathon
- `GET /:slug/registrations` - Registrations table (per domain, search, approve/reject, CSV export)
- `GET /:slug/submissions` - Submissions list with judging
- `POST /:slug/submissions/:submissionId/score` - Score a submission
- `POST /:slug/announcements` - Post announcement
- `PUT /:slug/announcements/:id` - Update announcement
- `POST /:slug/publish-results` - Publish winners/results

---

## Design Rules (Strict)

- White page background, very light grey (#f6f7fa) for panels/table headers
- White cards with 1px light border, 8px radius, very soft shadows
- Brand navy blue (#2d57a5) for primary buttons, active tabs, pagination, links, countdown
- Dark navy (#1a1828) for dark footer and text headings
- Green (#11a12e) ONLY for success/"You are registered"
- Amber/red ONLY for warnings/errors
- NO gradients, NO purple/violet, NO neon, NO glow, NO glassmorphism, NO sparkle icons
- Poppins/Inter typography (follow existing site)
- Secondary buttons: outlined (navy border, navy text, white fill)
- Keep existing navbar and footer
- Support existing dark/light theme
- Mobile first, keyboard accessible, visible focus rings, labelled inputs, aria-live for errors

---

## Server-Side Enforcement (Never Trust Client)

- Registration only before deadline and while seats remain (atomic updates)
- One registration per user per hackathon
- Team size limits per domain
- One team per user per hackathon
- Submission only by registered team member before domain deadline
- Results, scores, judge comments hidden until published
- Role checks on every organizer route
- Validate everything with zod
- Allow only http/https URLs
- Rate limit register and submit
- Never return other users' emails or personal data
- Same error format and auth middleware as rest of server
- All dates stored in UTC, displayed in IST

---

## Quality Requirements

- Seed script with 5 hackathons (different states), 3-4 domains each, round list, sample teams
- Tests for: registration window, seat race, team rules, deadline lock, result visibility, role protection
- Client build and existing tests must still pass
- Add `hackathonAPI` object to `client/src/api.js`
- No new heavy dependency without asking

---

## Git and Safety

- Work on new branch: `feature/hackathon-portal`
- Never run "git add ." - stage only files created/changed for this feature
- Do NOT touch Resume section (Overleaf*, Resume*, ovStore.js, visualLatex.js, PdfViewer.jsx, server/routes/resumeProjects.js, latexTemplates.js)
- Do NOT touch Assessments code
- Never commit .env or secrets
- Do not push to main

---

## Phases Summary

| Phase | Deliverable |
|-------|-------------|
| 1 | Models, schemas, routes, tests, seed script |
| 2 | List page + detail page with domain cards |
| 3 | Participate stepper (5 steps) |
| 4 | My dashboard + event workspace (Roadmap, Team, Submissions) |
| 5 | Organizer pages + judging |
| 6 | Results page, seed data, accessibility, polish |

---

## Ready to start Phase 1?