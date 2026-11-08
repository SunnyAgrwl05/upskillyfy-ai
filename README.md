# Upskillyfy AI

> **Learn. Build. Grow. Transform.**  
> A full-stack EdTech and career acceleration platform featuring adaptive video streaming, branch-specific assessments, verified internships, and modern enterprise IT services.

---

## 🌟 Key Highlights

- **Interactive Learning & Video Workspace**: Stream licensed technical courses in high-definition MPEG-DASH (1080p, 720p, 480p) with synchronized audio/video, dynamic progress tracking, and interactive quizzes.
- **Assessment & Examination Portal**: Dedicated full-screen testing environment for students and faculty with branch filtering, real-time timer, and result analysis.
- **Career & Internship Hub**: Browse, filter, and apply for verified technical internships with resume tools and placement resources.
- **Enterprise IT & AI Services**: Showcase of production consulting services covering Cloud Infrastructure, GenAI Automation, and Full-Stack Engineering.
- **Modern Design & Accessibility**: Fully responsive layouts, theme persistence (Dark / Light mode), and Google Cloud design system tokens.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Dash.js (MPEG-DASH player), Lucide React, CSS3 Design Tokens
- **Backend**: Node.js, Express.js (ESM), Mongoose / MongoDB Atlas, JWT Authentication
- **Streaming & Storage**: MPEG-DASH manifest demuxing, Google Cloud Storage CDN
- **Security**: Server-side API key masking, bcrypt password hashing, CORS protection

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.0.0 or later; Node 22+ is recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or free MongoDB Atlas cluster)

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/upskillyfy-ai/upskillyfy-ai.git
cd upskillyfy-ai

# Install root, client, and server dependencies
npm run install-all
```

Alternatively, install in separate terminals:

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

---

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory (you can copy `server/.env.example`):

```env
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/upskillyfy
JWT_SECRET=your_super_secret_jwt_key_2026


```

---

### 3. Start Development Servers

Run both services in separate terminals:

**Terminal 1 — Client (Vite):**
```bash
cd client
npm run dev
# Running at http://localhost:5173
```

**Terminal 2 — Server (Express API):**
```bash
cd server
npm run dev
# Running at http://localhost:5000
```

---

## 📁 Repository Structure

```
upskillyfy-ai/
├── client/                     # Frontend Single Page Application
│   ├── public/                 # Static branding assets
│   ├── src/
│   │   ├── components/         # Global navigation, footer, carousels
│   │   ├── context/            # Auth, Theme, and Language providers
│   │   ├── data/               # Seed data for courses, roadmaps, and tests
│   │   ├── pages/              # Routes: Learning, Career, Assessments, Services
│   │   ├── services/           # Assessment calculation and logic
│   │   ├── api.js              # Centralized Axios API client
│   │   ├── App.jsx             # Main router and layout definitions
│   │   └── main.jsx            # Application entry point
│   ├── index.html              # HTML shell with Dash.js CDN loader
│   └── vite.config.js          # Vite build configuration
│
├── server/                     # Backend REST API
│   ├── data/                   # Initial seeds
│   ├── middleware/             # JWT auth validation
│   ├── models/                 # Mongoose schemas (User, Internship, Assessment, etc.)
│   ├── routes/                 # Express route handlers
│   │   ├── assessments.js      # Testing and attempt submission
│   │   ├── auth.js             # User login and registration
│   │   ├── courses.js          # Course catalog, sections, and video playback
│   │   ├── internships.js      # Internship listings and applications
│   │   └── newsletter.js       # Email subscriptions
│   ├── services/
│   │   └── courseApiService.js # External Course Licensing API integration
│   ├── index.js                # Server entry point
│   └── .env.example            # Environment blueprint
│
├── .gitignore                  # Exclusions for node_modules, builds, and keys
├── package.json                # Root scripts helper
└── README.md                   # Project documentation
```

---

## 👥 Community & Support

- **Organization**: [Upskillyfy AI](https://github.com/upskillyfy-ai)
- **Email**: upskillyfy@gmail.com
- **LinkedIn**: [Upskillyfy AI](https://www.linkedin.com/company/upskillyfy-ai/)
- **Instagram**: [@upskillyfy](https://www.instagram.com/upskillyfy/)

---

### ATS Resume PDFs and AI Resume Analyzer

The Resume Builder includes compiled PDF previews for the five ATS templates. The PDFs are generated from the catalog's checked-in `main.tex` files with Tectonic and are stored in `client/public/resume-templates/`. `manifest.json` records source and PDF SHA-256 hashes. The public preview API checks those hashes against the current server template source before serving a PDF.

Regenerate the template assets after editing one of these template sources:

```bash
cd server
npm run resume:build-template-pdfs
```

Tectonic must be installed. It may download LaTeX bundle resources the first time. The compiler runs with `--untrusted`; generated PDFs are checked in, so production preview does not require a compiler.

The AI Resume Analyzer is available at `/career/resume-analyzer`. It accepts a PDF up to 10 MB and 30 pages, extracts selectable text in a bounded worker with memory, time, and concurrency limits, and does not retain the uploaded PDF or raw extracted text. Scanned PDFs need OCR and are rejected with an explicit message. Extracted text is sent to the configured server-side OpenAI-compatible provider. The `OPENAI_API_KEY` is never sent to the browser. Set `OPENAI_API_KEY`, `OPENAI_MODEL`, and optionally `OPENAI_BASE_URL` in `server/.env`; without a key, analysis returns an explicit unavailable response.

For signed-in users, structured extracted resume details and feedback are saved in MongoDB until the user deletes the analysis. Guest results remain in page memory. Target job description text is used for in-request keyword matching and is not stored. No resume claims are externally verified. Users must review all nine extracted sections before the application transfers the data to the existing ATS Resume Builder. The transfer creates a new editable project and does not replace existing projects.

Resume analysis endpoints:

- `POST /api/resume-analysis` — upload `resume` as multipart PDF; optionally include `jobDescription`.
- `GET /api/resume-analysis?page=1&limit=10` — signed-in user's paginated history.
- `GET /api/resume-analysis/:analysisId` — read an owned analysis.
- `PATCH /api/resume-analysis/:analysisId/review` — save corrected fields and section confirmations.
- `DELETE /api/resume-analysis/:analysisId` — delete an owned analysis.
- `GET /api/latex-templates/:templateId/preview.pdf` — source-hash checked PDF preview/download.

Run the local PDF and analyzer service tests with `cd server && npm run test:resume`. The Mongo-backed route integration tests require an explicitly isolated local `TEST_MONGODB_URI` whose database name includes `resume_builder_test`; never point it at the application database. `npm test` includes the existing project tests as well.

The deterministic ATS score reports document completeness and text readability checks only; it is not a hiring prediction. AI feedback and user confirmation do not verify degrees, employment, certificates, awards, or achievements.

## 📄 License

This project is licensed under the MIT License.
