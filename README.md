# ðŸš€ upskillyfy-ai â€” Complete Full Stack Website

**Learn. Build. Grow. Transform.**

---

## âš¡ Quick Start â€” 3 Simple Steps

### Step 1 â€” Install

Open **2 terminals** in VS Code:

From Windows PowerShell in a `\\wsl.localhost\...` workspace, use the root `npm run dev` command; it maps the client folder before launching Vite. Running `npx vite` directly from a WSL UNC path can make Windows CMD fall back to `C:\Windows\System32`. Alternatively, use a VS Code WSL terminal with Node.js/npm installed in Ubuntu, or keep the project on a local Windows drive.

**Terminal 1 (Frontend):**
```bash
npm --prefix client install
```

**Terminal 2 (Backend):**
```bash
cd server
npm install
```

---

### Step 2 â€” MongoDB Setup (FREE)

1. Go to **https://mongodb.com/atlas** â†’ Sign up free
2. Create a **Free Cluster** (M0 - Free Forever)
3. Click **Connect** â†’ **Drivers** â†’ Copy connection string
4. Copy `server/.env.example` to `server/.env` and replace its placeholders. In `client/`, copy `client/.env.example` to `client/.env` and set the API URL.

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/upskillyfy
JWT_SECRET=<generate-a-long-random-secret>
CLIENT_URL=http://localhost:5173
```

---

### Step 3 â€” Run Both Servers

**Terminal 1:**
```bash
npm run dev
```
â†’ Opens at **http://localhost:5173** âœ…

**Terminal 2:**
```bash
cd server
npm run dev
```
â†’ Runs at **http://localhost:5000** âœ…

---

## âœ¨ Features

| Feature | Details |
|---------|---------|
| ðŸŒ— Dark / Light Mode | Toggle in navbar â€” saves preference |
| ðŸ“¬ Newsletter Subscribe | Footer â€” saves email to MongoDB |
| ðŸ” User Auth | Register, Login, JWT tokens |
| ðŸ‘¤ Dashboard | Personalized user dashboard |
| ðŸš€ Internships | Filter by branch & mode, connected to DB |
| ðŸŽ¯ Community Events | Live events from MongoDB |
| ðŸ“© Contact Form | Saves to MongoDB |
| ðŸ’» 20+ Pages | All services, career, learning, community |
| ðŸ“± Responsive | Works on mobile, tablet, desktop |

---

## ðŸ“ Project Structure

```
upskillyfy-final/
â”œâ”€â”€ client/          â† React + Vite frontend
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ pages/       â† 20+ pages
â”‚       â”œâ”€â”€ components/  â† Navbar, Footer
â”‚       â”œâ”€â”€ context/     â† Auth + Theme
â”‚       â””â”€â”€ api.js       â† All API calls
â”‚
â””â”€â”€ server/          â† Node.js + Express backend
    â”œâ”€â”€ models/      â† User, Internship, Contact, Subscriber, Community
    â”œâ”€â”€ routes/      â† auth, internships, contact, newsletter, users, community
    â””â”€â”€ index.js     â† Main server file
```

---

## Learning progress and assessments

MongoDB is the source of truth for course enrollments, completed lessons, last visited lessons, roadmap skill mastery, assessment attempts, saved answers, and scores. Learner API records are scoped to the authenticated JWT user; the browser does not submit scores or pass/fail results. Course and roadmap content is currently sourced from the existing client data modules.

The server inserts four published MCQ assessments (Java, DSA, Python, and SQL) on first connection. Their answer keys stay server-side; each attempt snapshots its questions and rules, uses a server-created deadline, and can be resumed after a refresh. Run server tests with `npm test` from `server/`, and client redirect tests with `npm test` from `client/`.

Assessment endpoints are mounted under `/api/assessments`. Catalog/detail reads are public; starting an attempt, saving answers, viewing history, and submitting require login. Assessment authoring endpoints under `/api/assessments/admin` additionally require the existing `admin` user role. To assign the role, an authorized database operator can update a specific user in MongoDB:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Do not expose that database operation in a public registration or profile API. The admin interface is at `/assessments/admin`.

Course progress is recorded only when a learner explicitly marks a lesson complete or advances to the next lesson; opening a lesson alone does not complete it. Roadmap skill changes are saved to that signed-in user's MongoDB record.

Secure code execution is not configured. No source code is run by this application, and coding challenges are clearly unavailable until a separately secured code-judging integration is implemented and configured. MCQ assessments do not depend on that service.

## Deployment notes

The existing project has a Vite static client and a separately run Express API; it does not contain a Vercel serverless backend adapter. Deploy `client/` as the Vercel project root and provide `VITE_API_URL` for a separately hosted API. Configure the API's `MONGODB_URI`, a strong `JWT_SECRET`, and `CLIENT_URL` for the deployed client origin. Apply MongoDB network/access rules for the API host. Direct client routes are rewritten to the Vite app entry by [`client/vercel.json`](./client/vercel.json).

The approved logo asset was not present in the checked-in public/assets directories or the supplied project archive during this implementation. Existing logo treatments were therefore not replaced with a newly invented mark; supply the approved transparent logo/favicon asset to finish the branding requirement. No production deployment or external code-evaluation integration was performed or verified.

## ðŸŒ Contact

- ðŸ“§ upskillyfy@gmail.com
- ðŸ“· [@upskillyfy](https://www.instagram.com/upskillyfy/)
- ðŸ’¼ [LinkedIn](https://www.linkedin.com/company/upskillyfy-ai/)
- ðŸ“ Patna, Bihar, India
