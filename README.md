<div align="center">

# 🚀 Upskillyfy AI

### Learn. Build. Grow. Transform.

**Empowering students with skills, opportunities and industry-ready experience.**

A full-stack learning and career platform where students learn new technologies, build real-world projects, prepare for placements, and connect with a growing tech community.

[![Live Website](https://img.shields.io/badge/Website-Live-2563EB?style=for-the-badge&logo=vercel&logoColor=white)](https://upskillyfy-ai.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/SunnyAgrwl05/upskillyfy-ai)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[**Live Demo**](https://upskillyfy-ai.vercel.app/) · [**Report a Bug**](https://github.com/SunnyAgrwl05/upskillyfy-ai/issues) · [**Request a Feature**](https://github.com/SunnyAgrwl05/upskillyfy-ai/issues)

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Resume Builder and LaTeX Workspace](#-resume-builder-and-latex-workspace)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [LaTeX Compile Service](#-latex-compile-service)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🌟 About the Project

Students often face a gap between academic knowledge and industry requirements. Finding the right learning resources, practical experience, internships and career guidance is hard.

**Upskillyfy AI** closes that gap with one connected platform: learning, career preparation, internship discovery, community events and professional growth tools.

### 🎯 Our Mission

To make quality learning, practical exposure and career opportunities accessible to every student, whatever their college, background or location.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Registration, login and JWT-based sessions with refresh tokens. |
| 👤 **User Dashboard** | A personalised dashboard after sign-in. |
| 🚀 **Internship Portal** | Browse internships with branch and work-mode filters. |
| 🎯 **Placements** | Campus and off-campus hiring drives in one place. |
| 🧠 **Skill Assessments** | Student and faculty assessment portals with a full-screen exam engine. |
| 💻 **DSA Hub** | Practice resources for data structures and algorithms. |
| 🎓 **Learning** | Course catalogue and learning resources. |
| 📄 **Resume Builder** | ATS-friendly resume form plus an Overleaf-style LaTeX workspace. |
| 🌍 **Community Events** | Discover events powered by MongoDB. |
| 📬 **Newsletter and Contact** | Subscribe for updates and reach the team through an integrated form. |
| 🌗 **Dark and Light Mode** | Theme switching with saved preferences. |
| 📱 **Responsive UI** | Works on mobile, tablet and desktop. |

---

## 📄 Resume Builder and LaTeX Workspace

The Resume section lives under `/career/resume` and has three parts.

### 1. Template gallery (`/career/resume`)
Browse LaTeX templates by category (CVs and résumés, cover letters, journal articles, reports, presentations and more), preview the source, and open any template as an editable project.

### 2. ATS Resume Builder (`/career/resume/create`)
A guided form for personal details, experience, education, projects, skills and leadership. It exports clean single-column LaTeX, shows structural ATS checks, compares your resume with a pasted job description, and can import text-based PDF resumes.

### 3. Project dashboard and editor (`/career/resume/projects`)
An Overleaf-style workspace for LaTeX projects.

**Dashboard**
- Sidebar views: all projects, your projects, archived, trash
- Tags, search and sortable columns (title, last modified)
- Copy, rename, download, archive, trash and restore
- New project from a Resume, Cover letter, Article or Blank starter, or upload a `.tex` or `.zip`

**Editor**
- Menu bar (File, Edit, Insert, View, Format, Help) and a formatting toolbar
- File tree with folders, new file, rename, delete, upload, drag and drop, and a main-file setting
- Tabs, file outline and search across the whole project
- Code editor with LaTeX syntax highlighting, find and replace, and spell check
- Visual view that renders common LaTeX (sections, lists, bold, links) and jumps to the source on click
- PDF preview with page navigation, zoom and fit-to-width
- Compile log with the error line when a build fails, plus optional auto-compile
- Version history with restore, word count and keyboard shortcuts
- Share link that gives the receiver their own copy of the project

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + Enter` | Recompile |
| `Cmd/Ctrl + S` | Save a version to History |
| `Cmd/Ctrl + F` | Find and replace |
| `Cmd/Ctrl + Z` / `Shift + Z` | Undo / redo |

> **Saving:** projects are saved in your browser first. Version history and tags also stay in this browser.

> **Not included yet:** real-time collaboration and comments. They need a live server connection and a sharing model. See the [Roadmap](#-roadmap).

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Editor | CodeMirror 6 (LaTeX mode), pdf.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, MongoDB Atlas |
| Authentication | JWT |
| API | REST |
| LaTeX compiler | TeX Live and `latexmk` in a Docker service |
| Deployment | Vercel (frontend), Render (backend and compile service) |

---

## 📁 Project Structure

```text
upskillyfy-ai/
│
├── client/                              # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   └── Career/                  # Resume section
│       │       ├── ResumeWorkspace.jsx  # Template gallery and template detail
│       │       ├── ATSResumeBuilder.jsx # Guided resume form
│       │       ├── OverleafDashboard.jsx# Project dashboard
│       │       ├── OverleafEditor.jsx   # LaTeX editor
│       │       ├── PdfViewer.jsx        # PDF rendering, zoom, pages
│       │       ├── latexVisual.jsx      # Visual view of LaTeX source
│       │       ├── ResumeShareImport.jsx# Opens shared project links
│       │       └── ovStore.js           # Local project storage helpers
│       ├── components/                  # Reusable UI components
│       ├── context/                     # Authentication and theme context
│       └── api.js                       # API integration
│
├── server/                              # Node.js + Express backend
│   ├── config/                          # Environment loading and validation
│   ├── models/                          # MongoDB models
│   ├── routes/                          # REST API routes
│   ├── validation/                      # Request schemas
│   ├── tests/                           # API tests
│   └── index.js                         # Entry point
│
├── latex-service/                       # Standalone LaTeX compile service
│   ├── server.js                        # POST /compile
│   ├── Dockerfile                       # TeX Live + latexmk
│   └── README.md
│
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- A MongoDB Atlas account

### Step 1: Clone the repository

```bash
git clone https://github.com/SunnyAgrwl05/upskillyfy-ai.git
cd upskillyfy-ai
```

### Step 2: Install dependencies

Open two terminals.

**Terminal 1: frontend**

```bash
cd client
npm install
```

**Terminal 2: backend**

```bash
cd server
npm install
```

### Step 3: Configure MongoDB

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create an **M0 Free Cluster**.
3. Go to **Connect → Drivers** and copy the connection string.
4. Create a `server/.env` file (see [Environment Variables](#-environment-variables)).

> **Security:** never commit `.env` files, database credentials or JWT secrets.

### Step 4: Run the app

```bash
# Terminal 1
cd client
npm run dev        # http://localhost:5173
```

```bash
# Terminal 2
cd server
npm run dev        # http://localhost:5000
```

---

## 🔑 Environment Variables

### `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/upskillyfy
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173

# Optional email delivery (Gmail or custom SMTP)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=Upskillyfy <your_email@example.com>
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# EMAIL_SECURE=false

# Optional Google Identity Services client ID (verified server-side)
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Optional private Cloudflare R2 storage for Hackathon attachments
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_bucket_scoped_access_key
R2_SECRET_ACCESS_KEY=your_bucket_scoped_secret_key
R2_BUCKET_NAME=your_private_bucket_name
```

R2 is optional. Without all four R2 values, upload URL requests return `503 STORAGE_UNAVAILABLE`; the app does not expose uploaded objects publicly. Create a private bucket and an API token scoped to that bucket. Configure the bucket's CORS policy to allow `PUT` from the frontend origin in `CLIENT_URL`, allow the `Content-Type` request header, and expose `ETag` if the client needs it. Do not configure a public bucket domain for user uploads.

Hackathon attachment flow: create a draft submission, then request `POST /api/hackathons/:slug/submissions/upload-url` with `{ "fileName": "deck.pptx", "contentType": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "size": 12345 }`; upload the bytes with `PUT` to the returned `uploadUrl` using the returned headers; then confirm with `POST /api/hackathons/:slug/submissions/:submissionId/files/confirm` and the returned `key` plus file metadata. The API accepts PDF, PPT, PPTX, DOC, DOCX and ZIP files up to 20 MB. Download requests are authorized and return a short-lived signed URL.

### `client/.env` (optional)

```env
# Backend API base URL. Leave empty to use the default.
VITE_API_URL=http://localhost:5000/api

# URL of the LaTeX compile service. Needed for PDF preview in the editor.
VITE_LATEX_API=http://localhost:8080
```

---

## 🧪 LaTeX Compile Service

The editor sends your project to a small service that runs `latexmk` and returns the PDF. It is separate from the main API so it can run in its own container.

**What it does**
- `POST /compile` with `{ files, mainFile }` returns a PDF, or an error with the LaTeX log
- Runs with shell escape disabled, safe file paths only, a time limit, size limits and rate limiting
- `GET /health` for uptime checks

**Run it locally with Docker**

```bash
cd latex-service
docker build -t upskillyfy-latex .
docker run -p 8080:8080 -e ALLOWED_ORIGINS=http://localhost:5173 upskillyfy-latex
```

Then set `VITE_LATEX_API=http://localhost:8080` in `client/.env` and restart the frontend.

---

## 🚢 Deployment

| Part | Platform | Notes |
|---|---|---|
| Frontend (`client/`) | Vercel | Auto-deploys from `main`. Set `VITE_API_URL` and `VITE_LATEX_API` in project settings. |
| Backend (`server/`) | Render | Set the variables from `server/.env`. |
| Compile service (`latex-service/`) | Render (Docker) | Root Directory `latex-service`, runtime Docker, env `ALLOWED_ORIGINS=https://upskillyfy-ai.vercel.app`. |

After adding `VITE_LATEX_API` in Vercel, redeploy so the new value is built into the app.

---

## 🔮 Roadmap

- [x] Authentication, internships, community, newsletter and contact
- [x] Skill assessments (student and faculty portals)
- [x] Resume Builder and Overleaf-style LaTeX workspace
- [ ] Real-time collaboration on LaTeX projects
- [ ] Comments and shared project permissions
- [ ] Cloud sync for versions and tags
- [ ] AI-powered learning and career assistance
- [ ] Portfolio builder

---

## 🤝 Contributing

Contributions from developers, students and technology enthusiasts are welcome.

1. Fork this repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Commit and push your branch.
5. Open a Pull Request.

```bash
git checkout -b feature/your-feature-name
git add <the files you changed>
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

Please keep Pull Requests focused on one change.

---

## 📬 Contact

- 📧 **Email:** upskillyfy@gmail.com
- 📸 **Instagram:** [@upskillyfy](https://www.instagram.com/upskillyfy/)
- 💼 **LinkedIn:** [Upskillyfy AI](https://www.linkedin.com/company/upskillyfy-ai/)
- 📍 **Location:** Patna, Bihar, India

---

<div align="center">

### 🚀 Upskillyfy AI

**Learn. Build. Grow. Transform.**

Made with ❤️ for the next generation of builders.

⭐ If you find this project useful, consider giving it a star!

</div>

