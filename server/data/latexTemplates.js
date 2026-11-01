/**
 * LaTeX template catalogue.
 *
 * Every template here is an original demo authored for Upskillyfy AI. None of
 * them are affiliated with, or reproduced from, Overleaf or any other template
 * library — the sources are small, self-contained and written for this project.
 *
 * The catalogue lives on the server so that the API can serve it, and the
 * client keeps a mirrored copy in `client/src/data/latexTemplatesData.js` for
 * offline rendering. Both lists carry the same `id` values.
 */

/** Category identifiers, grouped by the gallery filter. */
export const LATEX_TEMPLATE_CATEGORIES = [
  'Journal Articles',
  'Bibliographies',
  'Books',
  'Calendars',
  'CVs and Résumés',
  'Formal Letters',
  'Assignments',
  'Newsletters',
  'Posters',
  'Presentations',
  'Theses and Dissertations',
  'Research Papers',
  'Reports',
  'Cover Letters',
]

/** The "kind" filter shown as All / Templates / Examples / Community. */
export const LATEX_TEMPLATE_KINDS = ['All', 'Templates', 'Examples', 'Community']

/**
 * A minimal, valid resume document used as the blank-project starter.
 * Kept dependency-light so it compiles with only base LaTeX packages.
 */
export const BLANK_RESUME_SOURCE = `\\documentclass[11pt,a4paper]{article}

% ---------------------------------------------------------------------------
% Blank LaTeX resume — edit anything below, or replace it entirely.
% Press Recompile (Ctrl/Cmd + Enter) to build a PDF.
% ---------------------------------------------------------------------------

\\usepackage[margin=1.6cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=1.2em, itemsep=1pt, topsep=2pt}

\\begin{document}

% ----- Header -------------------------------------------------------------
{\\Huge \\textbf{Your Name}}\\\\[2pt]
{\\large Software Engineer} \\hfill \\href{mailto:you@example.com}{you@example.com}

\\vspace{4pt}
\\href{https://linkedin.com/in/yourname}{LinkedIn} $\\cdot$
\\href{https://github.com/yourname}{GitHub} $\\cdot$
\\href{https://yourwebsite.com}{Website}

\\vspace{10pt}
\\hrule
\\vspace{10pt}

% ----- Experience ---------------------------------------------------------
{\\large \\textbf{Experience}} \\hfill \\textit{2023 -- Present}

\\vspace{4pt}
\\textbf{Company Name} -- Senior Software Engineer
\\begin{itemize}
  \\item Shipped a service that reduced p95 latency by 40\\%.
  \\item Led a migration of 12 services to a containerised platform.
\\end{itemize}

% ----- Education ----------------------------------------------------------
{\\large \\textbf{Education}} \\hfill \\textit{2019 -- 2023}

\\vspace{4pt}
\\textbf{University Name} -- B.Tech, Computer Science \\hfill \\textit{2023}

% ----- Skills -------------------------------------------------------------
{\\large \\textbf{Skills}}

\\vspace{4pt}
JavaScript, React, Node.js, Python, PostgreSQL, Docker, Kubernetes, AWS

% ----- Projects -----------------------------------------------------------
{\\large \\textbf{Projects}}

\\vspace{4pt}
\\textbf{Project Name} -- A short description of what you built and why it matters.
\\begin{itemize}
  \\item Built with React, Express and PostgreSQL.
\\end{itemize}

\\end{document}
`

/**
 * Template definitions.
 *
 * `files` is a list of `{ path, content }` pairs — a complete, compilable
 * mini-project. `mainFile` names the entry document.
 */
export const LATEX_TEMPLATES = [
  {
    id: 'ats-friendly-resume',
    title: 'ATS-Friendly Resume',
    description:
      'A single-column, machine-readable resume that recruiter software can parse without mangling your layout.',
    category: 'CVs and Résumés',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-08-14',
    abstract:
      'Designed for applicant tracking systems: no tables, no text boxes, no multi-column layout, and a predictable section order that mirrors the way ATS parsers walk a document.',
    tags: ['ATS', 'Single column', 'One page', 'Minimal packages'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: true,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[10pt,a4paper]{article}

\\usepackage[margin=1.5cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=1.1em, itemsep=0pt, parsep=0pt, topsep=1pt}

\\begin{document}

{\\Large \\textbf{ALEX MORGAN}} \\hfill \\href{mailto:alex@example.com}{alex@example.com} \\\\
{\\small Software Engineer} \\hfill \\href{https://linkedin.com/in/alexmorgan}{linkedin.com/in/alexmorgan} \\\\
\\hfill \\href{https://github.com/alexmorgan}{github.com/alexmorgan} \\\\
\\hfill Austin, TX $\\cdot$ +1 (555) 010-2233

\\vspace{6pt}
\\hrule
\\vspace{6pt}

\\textbf{\\textsc{Experience}} \\hfill \\textit{2022 -- Present}

\\textbf{Staff Software Engineer}, Northwind Analytics \\hfill \\textit{2022 -- Present}
\\begin{itemize}
  \\item Led the rewrite of the ingest pipeline, cutting batch runtime by 60\\%.
  \\item Designed the multi-tenant auth layer now used by 40+ internal teams.
  \\item Reduced infrastructure spend by \\$180K/yr through autoscaling and right-sizing.
\\end{itemize}

\\textbf{Software Engineer}, Lumen Systems \\hfill \\textit{2020 -- 2022}
\\begin{itemize}
  \\item Built a React dashboard that replaced four internal tools.
  \\item Introduced CI with automated integration tests, cutting release time 3x.
\\end{itemize}

\\textbf{\\textsc{Education}} \\hfill \\textit{2016 -- 2020}

\\textbf{B.S. Computer Science}, State University \\hfill \\textit{2020}
\\begin{itemize}
  \\item GPA 3.8/4.0, Dean's List all semesters.
\\end{itemize}

\\textbf{\\textsc{Skills}} \\hfill \\textit{2026}

JavaScript, TypeScript, React, Node.js, Python, Go, PostgreSQL, Redis, Docker, Kubernetes, AWS, GCP

\\end{document}
`,
      },
    ],
  },
  {
    id: 'software-engineer-resume',
    title: 'Software Engineer Resume',
    description:
      'A technical resume tuned for software engineering roles, with a projects section that leads with impact.',
    category: 'CVs and Résumés',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-08-02',
    abstract:
      'Front-loads measurable engineering impact. Each bullet follows an action-verb-plus-result shape, and the projects block highlights shipped systems rather than coursework.',
    tags: ['Engineering', 'Impact metrics', 'Projects'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: true,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=1.6cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=1.2em, itemsep=1pt, topsep=2pt}

\\begin{document}

{\\LARGE \\textbf{Jordan Ellis}} \\hfill \\href{mailto:jordan@example.com}{jordan@example.com}\\\\
{\\large Backend Engineer} \\hfill \\href{https://github.com/jordanellis}{github.com/jordanellis}

\\vspace{8pt}
\\hrule
\\vspace{8pt}

\\textbf{\\textsc{Profile}}

Backend engineer with 5 years building distributed services in Go and Python.
Comfortable owning a service end to end, from schema design through on-call.

\\vspace{6pt}
\\textbf{\\textsc{Experience}} \\hfill \\textit{2021 -- Present}

\\textbf{Senior Backend Engineer}, Helio Pay \\hfill \\textit{2021 -- Present}
\\begin{itemize}
  \\item Rebuilt the payments ledger as an event-sourced service; eliminated \\$1.2M in reconciliation errors.
  \\item Cut p99 API latency from 1.8s to 240ms by adding read-through caching and query batching.
  \\item Mentored 4 engineers; two were promoted within 18 months.
\\end{itemize}

\\textbf{Backend Engineer}, Corvus Labs \\hfill \\textit{2019 -- 2021}
\\begin{itemize}
  \\item Built the notification fan-out service handling 40M messages/day.
  \\item Moved CI from 35 minutes to 6 minutes with parallel test sharding.
\\end{itemize}

\\vspace{6pt}
\\textbf{\\textsc{Projects}}

\\textbf{distqueue} --- An open-source Redis-backed job queue for Go.
\\begin{itemize}
  \\item 2.4K GitHub stars; adopted by three production teams.
\\end{itemize}

\\textbf{otel-gin} --- OpenTelemetry instrumentation for Go HTTP services.
\\begin{itemize}
  \\item Drop-in middleware with zero config; adopted internally by 12 services.
\\end{itemize}

\\vspace{6pt}
\\textbf{\\textsc{Education}} \\hfill \\textit{2015 -- 2019}

\\textbf{B.E. Computer Engineering}, Riverside Institute of Technology \\hfill \\textit{2019}

\\vspace{6pt}
\\textbf{\\textsc{Skills}} \\hfill \\textit{2026}

Go, Python, PostgreSQL, Redis, Kafka, gRPC, Docker, Kubernetes, Terraform, AWS

\\end{document}
`,
      },
    ],
  },
  {
    id: 'fresher-resume',
    title: 'Fresher Resume',
    description:
      'A student-friendly one-pager for final-year applicants with no industry experience yet.',
    category: 'CVs and Résumés',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-07-19',
    abstract:
      'Built for students and fresh graduates. Leads with education, coursework and academic projects, then folds in internships, hackathons and any part-time or freelance work.',
    tags: ['Student', 'One page', 'No experience needed'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=1.7cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=1.2em, itemsep=1pt, topsep=2pt}

\\begin{document}

{\\LARGE \\textbf{Priya Sharma}} \\hfill \\href{mailto:priya@example.com}{priya@example.com}\\\\
{\\small B.Tech, Computer Science} \\hfill \\href{https://linkedin.com/in/priyasharma}{linkedin.com/in/priyasharma} \\\\
\\hfill \\href{https://github.com/priyasharma}{github.com/priyasharma}

\\vspace{8pt}
\\hrule
\\vspace{8pt}

\\textbf{\\textsc{Education}} \\hfill \\textit{2022 -- 2026}

\\textbf{B.Tech, Computer Science}, National Institute of Technology \\hfill \\textit{2026}
\\begin{itemize}
  \\item CGPA 8.9/10. Core coursework: Data Structures, Operating Systems, DBMS, Computer Networks, Machine Learning.
\\end{itemize}

\\textbf{\\textsc{Internships}} \\hfill \\textit{2025}

\\textbf{Backend Developer Intern}, FinEdge \\hfill \\textit{Jun -- Aug 2025}
\\begin{itemize}
  \\item Built REST endpoints for a payments dashboard used by 200+ daily users.
  \\item Wrote 60 unit tests, raising service coverage from 45\\% to 88\\%.
\\end{itemize}

\\textbf{\\textsc{Projects}} \\hfill \\textit{2024 -- 2025}

\\textbf{AttendEase} --- A web app that marks attendance using face recognition.
\\begin{itemize}
  \\item Built the Python/OpenCV pipeline; reached 96\\% recognition accuracy on the class dataset.
  \\item Deployed for 3 departments, tracking 1,200+ students.
\\end{itemize}

\\textbf{StudySync} --- A collaborative revision planner for exam season.
\\begin{itemize}
  \\item Solo-built MERN application with a spaced-repetition scheduler.
\\end{itemize}

\\textbf{\\textsc{Extracurricular}} \\hfill \\textit{2024 -- 2025}

\\begin{itemize}
  \\item Winner, Smart India Hackathon 2024 (regional track, 36 teams).
  \\item Coordinator, college coding club; ran 8 workshops for 200+ students.
\\end{itemize}

\\textbf{\\textsc{Skills}} \\hfill \\textit{2026}

JavaScript, React, Node.js, Express, Python, Java, MySQL, MongoDB, Git, Figma

\\end{document}
`,
      },
    ],
  },
  {
    id: 'experienced-professional-resume',
    title: 'Experienced Professional Resume',
    description:
      'A leadership-oriented resume for senior individual contributors and managers with a decade of experience.',
    category: 'CVs and Résumés',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-08-20',
    abstract:
      'Organised around scope of ownership rather than a flat job list. Adds a leadership section and an impact summary, both written to survive a 30-second skim.',
    tags: ['Senior', 'Leadership', 'Executive'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=1.6cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=1.2em, itemsep=1pt, topsep=2pt}

\\begin{document}

{\\LARGE \\textbf{Samuel Okonkwo}} \\hfill \\href{mailto:samuel@example.com}{samuel@example.com}\\\\
{\\large Director of Engineering} \\hfill \\href{https://linkedin.com/in/samokonkwo}{linkedin.com/in/samokonkwo}

\\vspace{8pt}
\\hrule
\\vspace{8pt}

\\textbf{\\textsc{Impact Summary}} \\hfill \\textit{2026}

\\begin{itemize}
  \\item Lead a 34-person engineering org across 5 squads shipping 3 product lines.
  \\item Owned a \\$14M annual infrastructure budget; cut unit cost per request 46\\%.
  \\item Introduced the on-call and incident process that took change-failure rate from 28\\% to 7\\%.
\\end{itemize}

\\textbf{\\textsc{Leadership}} \\hfill \\textit{2021 -- 2026}

\\textbf{Director of Engineering}, Veridian \\hfill \\textit{2021 -- Present}
\\begin{itemize}
  \\item Grew the org from 11 to 34 engineers while holding delivery commitments.
  \\item Established career ladders and levelling that cut time-to-hire by 30\\%.
  \\item Chaired the architecture review board; retired 4 legacy services and 2 data stores.
\\end{itemize}

\\textbf{Engineering Manager}, Brightline \\hfill \\textit{2018 -- 2021}
\\begin{itemize}
  \\item Managed 3 teams delivering the platform used by 12M monthly users.
  \\item Moved release cadence from monthly to daily without a dedicated release team.
\\end{itemize}

\\textbf{\\textsc{Education}} \\hfill \\textit{2018}

\\textbf{M.S. Computer Science}, Kingsbridge University \\hfill \\textit{2018}

\\textbf{\\textsc{Skills}} \\hfill \\textit{2026}

Engineering leadership, Distributed systems, Reliability, Cost management, Hiring, Org design, Go, Kubernetes, GCP

\\end{document}
`,
      },
    ],
  },
  {
    id: 'academic-cv',
    title: 'Academic CV',
    description:
      'A publication-oriented academic curriculum vitae with sections for research, teaching and conference talks.',
    category: 'CVs and Résumés',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-06-11',
    abstract:
      'Follows the conventions academic hiring committees expect: research interests up front, publications listed newest-first, and separate sections for teaching, talks and service.',
    tags: ['Academic', 'Publications', 'Research'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: true,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=1.7cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=1.2em, itemsep=1pt, topsep=2pt}

\\begin{document}

{\\LARGE \\textbf{Dr. Elena Novak}} \\hfill \\href{mailto:enovak@example.edu}{enovak@example.edu}\\\\
{\\small Associate Professor, Computer Science} \\hfill \\href{https://example.edu/~enovak}{example.edu/~enovak}

\\vspace{8pt}
\\hrule
\\vspace{8pt}

\\textbf{\\textsc{Research Interests}}

Efficient machine learning systems, probabilistic programming, and the theory of
approximate inference in large-scale Bayesian models.

\\vspace{6pt}
\\textbf{\\textsc{Employment}} \\hfill \\textit{2021 -- 2026}

\\textbf{Associate Professor}, Northgate University \\hfill \\textit{2021 -- Present}
\\begin{itemize}
  \\item Lead a group of 4 PhD students and 6 master's students.
  \\item Teach graduate courses in probabilistic machine learning (enrolment: 120/yr).
\\end{itemize}

\\textbf{Assistant Professor}, Coastal Institute of Technology \\hfill \\textit{2017 -- 2021}
\\begin{itemize}
  \\item Designed the graduate sequence in statistical inference.
\\end{itemize}

\\vspace{6pt}
\\textbf{\\textsc{Selected Publications}} \\hfill \\textit{2026}

\\begin{itemize}
  \\item N. Kovacs, E. Novak. \\textit{Scaling Variational Inference with Adaptive Step Sizes}. Proceedings of the 39th Conference on Machine Learning, 2026.
  \\item E. Novak, R. Toure. \\textit{On the Convergence of Discrete Latent Variable Models}. Journal of Statistical Computation, 2025.
  \\item E. Novak. \\textit{Approximate Bayesian Computation at Scale}. PhD Thesis, Coastal Institute of Technology, 2017.
\\end{itemize}

\\textbf{\\textsc{Invited Talks}} \\hfill \\textit{2024 -- 2026}

\\begin{itemize}
  \\item Adaptive Step Sizes for Variational Inference. Invited Keynote, Nordic Machine Learning Symposium, 2026.
  \\item Discrete Latent Variables at Scale. Invited Speaker, Statistical Computing Group, 2025.
\\end{itemize}

\\textbf{\\textsc{Teaching}} \\hfill \\textit{2026}

\\begin{itemize}
  \\item Statistical Machine Learning (graduate) --- 120 students/year.
  \\item Introduction to Probabilistic Programming (undergraduate) --- 200 students/year.
\\end{itemize}

\\textbf{\\textsc{Service}} \\hfill \\textit{2026}

\\begin{itemize}
  \\item Area Chair, International Conference on Machine Learning (2025, 2026).
  \\item Associate Editor, Journal of Statistical Computation (2024 -- present).
\\end{itemize}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter',
    description:
      'A matching cover letter that pairs with any of the resume templates for a complete application.',
    category: 'Cover Letters',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-08-05',
    abstract:
      'A conventional business-letter layout with an optional references section. Designed to sit alongside a one-page resume without duplicating its bullet points.',
    tags: ['Cover letter', 'Application', 'Letter'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.9em}

\\begin{document}

\\textbf{Priya Sharma}\\\\
B.Tech, Computer Science, National Institute of Technology\\\\
\\href{mailto:priya@example.com}{priya@example.com} $\\cdot$ \\href{https://github.com/priyasharma}{github.com/priyasharma}

\\vspace{1.4em}

\\today

\\vspace{1em}

Hiring Manager\\\\
Veridian Technologies

\\vspace{1em}

\\textbf{Re: Backend Engineer Opening}

\\vspace{0.6em}

Dear Hiring Manager,

I am writing to apply for the Backend Engineer position at Veridian Technologies.
As a final-year Computer Science student with two backend internships, I have
built and shipped REST services, written test suites that lifted coverage from
45\\% to 88\\%, and worked directly with a product team to deliver features used
by hundreds of students every day.

What draws me to Veridian is the engineering culture your team has built around
measurable reliability. In my internship at FinEdge I introduced request-level
tracing, which made a recurring latency regression visible within a week. I
would welcome the chance to bring that same instinct for instrumentation to a
team that treats observability as a first-class concern.

My resume and a link to my GitHub profile, where the source for every project
mentioned above is public, are attached. I would be glad to walk through the
AttendEase project in detail, including where it failed and what I changed
afterwards.

Thank you for your time and consideration.

\\vspace{1.4em}

Sincerely,\\\\
Priya Sharma

\\vspace{1.4em}
\\hrule
\\vspace{0.6em}
{\\small \\textbf{References} are available on request.}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'research-paper',
    title: 'Research Paper',
    description:
      'A two-column conference paper skeleton with abstract, keywords, math support and a bibliography.',
    category: 'Research Papers',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-05-30',
    abstract:
      'A compact article skeleton for submissions: abstract and keywords up front, numbered sections, theorem environments, and a BibTeX bibliography.',
    tags: ['Paper', 'Two column', 'Bibliography', 'Math'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[10pt,a4paper,twocolumn]{article}

\\usepackage[margin=1.8cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsthm}
\\usepackage[hidelinks]{hyperref}

\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}[theorem]{Lemma}
\\newtheorem{definition}[theorem]{Definition}

\\title{A Study of Adaptive Step Sizes in Variational Inference}
\\author{Elena Novak \\and Robert Toure}
\\date{}

\\begin{document}

\\maketitle

\\begin{abstract}
We study the effect of adaptive step size schedules on the convergence of
variational inference. We show that a schedule derived from a running
estimate of the local curvature reduces the number of iterations required to
reach a fixed accuracy threshold, without increasing the variance of the
gradient estimator.
\\end{abstract}

\\noindent\\textbf{Keywords:} variational inference, adaptive methods, convergence

\\section{Introduction}

Variational inference approximates the posterior of a latent variable model by
minimising the divergence between the posterior and a tractable family. The
quality of that approximation depends heavily on the optimiser's step size
schedule. Fixed schedules, while simple, are either too aggressive near the
optimum or too conservative far from it.

\\section{Preliminaries}

Let $p(z \\mid x)$ be a log-concave target with parameter $z$, and let
$q_\\theta(z)$ be a variational family. The objective is

\\begin{equation}
\\mathcal{L}(\\theta) = \\mathbb{E}_{q_\\theta(z)}[\\log p(z, x) - \\log q_\\theta(z)].
\\end{equation}

\\begin{lemma}
If the target is log-concave, the optimal step size in a gradient ascent
trajectory is bounded above by twice the inverse local Lipschitz constant.
\\end{lemma}

\\begin{theorem}
Under the assumptions of Lemma 1, the adaptive schedule considered here
converges in a number of iterations bounded independently of the initialisation.
\\end{theorem}

\\section{Method}

We estimate the local curvature online and set the step size as the reciprocal
of that estimate, smoothed by an exponential moving average.

\\section{Results}

Across the eight benchmarks we evaluate, the adaptive schedule reduced median
iterations to convergence by 34\\% relative to a fixed schedule, with no
measurable increase in gradient variance.

\\section{Conclusion}

Adaptive step sizes give a consistent improvement in iteration count for
log-concave targets, and the effect is largest in the high-dimensional regime.

\\begin{thebibliography}{9}
\\bibitem{neal1998} Jordan, M. I., Blei, D. M., and Wainwright, M. I. (1998).
An introduction to variational methods for graphical models.
\\bibitem{vieta2019} Kingma, D. P. and Welling, M. (2019). An introduction to
variational autoencoders.
\\end{thebibliography}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'journal-article',
    title: 'Journal Article',
    description: 'A single-column manuscript layout for journal submissions.',
    category: 'Journal Articles',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-05-12',
    abstract:
      'A traditional single-column manuscript with a title block, abstract, numbered sections and a reference list, suitable for submission to a journal.',
    tags: ['Manuscript', 'Single column', 'Journal'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.4cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage[hidelinks]{hyperref}

\\title{On the Robustness of Sparse Attention Under Distribution Shift}
\\author{Marta Lindqvist \\\\ \\small Institute of Computing Sciences}
\\date{}

\\begin{document}

\\maketitle

\\begin{abstract}
Attention mechanisms rely on a sparsity assumption that degrades when the
input distribution shifts away from the training regime. We characterise the
failure mode and propose a temperature schedule that restores the sparsity
profile, showing a 19\\% reduction in tail latency on a production trace.
\\end{abstract}

\\section{Introduction}

Sparsity in attention is usually presented as an efficiency property. This
paper argues it is also a correctness property, in the sense that models
trained under a sparsity assumption silently lose their sparsity guarantee
when the input distribution changes.

\\section{Related Work}

Prior work has studied attention approximation (Liu et al., 2021) and
distribution shift in sequence models (Kumar et al., 2020). We connect the two
lines and show that the interaction has not been characterised.

\\section{Method}

We define a shifted attention measure and bound the deviation of the induced
sparsity profile from its training-time value.

\\section{Experiments}

We evaluate on three benchmarks and a production traffic trace.

\\section{Conclusion}

The robustness of attention sparsity is measurable, and it degrades earlier
than practitioners expect.

\\begin{thebibliography}{9}
\\bibitem{liu2021} Liu, Z. and Wang, H. (2021). A survey of efficient attention.
\\bibitem{kumar2020} Kumar, R. and Patel, S. (2020). Distribution shift in production models.
\\end{thebibliography}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'thesis',
    title: 'Thesis and Dissertation',
    description: 'A thesis front-matter skeleton with declarations, acknowledgements and a table of contents.',
    category: 'Theses and Dissertations',
    kind: 'Templates',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-04-28',
    abstract:
      'Covers the structural front matter a thesis needs: a title page, a declaration, acknowledgements, an abstract, and a table of contents.',
    tags: ['Thesis', 'Dissertation', 'Table of contents'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.4cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}

\\title{Adaptive Methods for Large-Scale Variational Inference}
\\author{Aisha Rahman}
\\date{September 2026}

\\begin{document}

\\maketitle
\\tableofcontents
\\newpage

\\section*{Declaration}

I declare that this thesis is my own work and that all sources used have been
acknowledged. Where the work of others has been drawn upon, it has been stated
in the text.

\\section*{Acknowledgements}

I am grateful to my supervisor, Dr. Elena Novak, for her guidance throughout
this work, and to the anonymous reviewers whose comments improved the earlier
drafts of Chapters 3 and 4.

\\newpage
\\section*{Abstract}

This thesis investigates adaptive optimisation strategies for variational
inference at scale. We develop a curvature estimator suitable for online use,
prove convergence for the resulting schedule, and evaluate it on large-scale
probabilistic models.

\\newpage
\\section{Introduction}

\\subsection{Motivation}

Variational inference is the workhorse of approximate Bayesian computation.
Its practical reliability depends on choices that are usually made by
convention rather than by analysis.

\\subsection{Contributions}

This thesis makes three contributions. First, an online curvature estimator
that requires only one extra function evaluation per iteration. Second, a
convergence guarantee for the resulting schedule under log-concavity. Third, an
empirical study across sixteen models.

\\newpage
\\section{Background}

\\subsection{Variational Inference}

We review the standard formulation and its assumptions.

\\subsection{Adaptive Methods}

We review step size adaptation strategies and their known failure modes.

\\newpage
\\section{Methodology}

We describe the estimator, derive the schedule, and state the main theorem.

\\newpage
\\section{Results and Discussion}

We evaluate across sixteen models and three datasets.

\\newpage
\\section{Conclusion and Future Work}

We summarise the contributions and outline four directions for further work.

\\begin{thebibliography}{9}
\\bibitem{jordan1998} Jordan, M. I., Blei, D. M., and Wainwright, M. I. (1998).
An introduction to variational methods for graphical models.
\\end{thebibliography}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'technical-report',
    title: 'Technical Report',
    description: 'An engineering report layout with an executive summary and a metrics table.',
    category: 'Reports',
    kind: 'Examples',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-07-03',
    abstract:
      'A report skeleton that leads with an executive summary for non-specialist readers, then presents the technical detail, measurements and recommendations.',
    tags: ['Report', 'Executive summary', 'Metrics'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{booktabs}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.6em}

\\begin{document}

{\\LARGE \\textbf{Postgres Connection Pool Tuning Report}}\\\\
{\\small Infrastructure Engineering \\\\ September 2026}

\\vspace{1em}
\\hrule
\\vspace{1em}

\\textbf{Executive Summary}

Application p99 latency was dominated by connection acquisition rather than
query execution. A pool size increase from 10 to 50, combined with prepared
statement caching, reduced p99 latency by 62\\% with no change in database
CPU. This report details the analysis, the changes applied, and the guardrails
needed to prevent regression.

\\section{Problem}

Requests to the orders service showed a bimodal latency distribution: most
requests completed in under 40ms, while a long tail exceeded 2s. Query
execution time was normal.

\\section{Analysis}

Instrumenting the pool showed that the tail coincided with pool saturation.
At peak load, all 10 connections were held by in-flight requests, and callers
queued for a free connection.

\\section{Changes}

\\begin{center}
\\begin{tabular}{lrr}
\\toprule
Metric & Before & After \\\\
\\midrule
Pool size & 10 & 50 \\\\
p50 latency & 22ms & 19ms \\\\
p95 latency & 310ms & 88ms \\\\
p99 latency & 2.1s & 780ms \\\\
Database CPU & 61\\% & 58\\% \\\\
\\bottomrule
\\end{tabular}
\\end{center}

\\section{Recommendations}

\\begin{enumerate}
  \\item Keep the pool size at 50 and add an alert when saturation exceeds 5\\%.
  \\item Enable prepared statement caching at the driver level.
  \\item Revisit the pool size if the service is horizontally scaled past 20 instances.
\\end{enumerate}

\\section{Appendix}

Full query-level timing histograms and the instrumentation patch are available
in the accompanying runbook.

\\end{document}
`,
      },
    ],
  },
  {
    id: 'presentation',
    title: 'Presentation',
    description: 'A landscape slide deck with a title slide, content slides and a references slide.',
    category: 'Presentations',
    kind: 'Examples',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-06-22',
    abstract:
      'A landscape article-based deck. Each slide is a page break with a large heading, keeping the source plain and editable rather than depending on a slide framework.',
    tags: ['Slides', 'Landscape', 'Talk'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[14pt,a4paper,landscape]{extarticle}

\\usepackage[margin=1.8cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}

\\definecolor{accent}{HTML}{1A73E8}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\newcommand{\\slide}[2]{%
  \\vspace{1.2cm}%
  {\\color{accent}\\rule{\\linewidth}{2pt}}\\par
  \\vspace{0.4cm}%
  {\\Huge \\textbf{#1}}\\par
  \\vspace{0.6cm}%
  #2%
  \\newpage
}

\\begin{document}

{\\color{accent}\\Huge Adaptive Step Sizes in Variational Inference}\\par
\\vspace{0.5cm}
{\\Large Elena Novak --- Nordic ML Symposium 2026}

\\slide{Why step size matters}{
The step size schedule dominates convergence speed. Everything else in the
optimiser is second order by comparison.
}

\\slide{The problem with fixed schedules}{
A fixed schedule is either too aggressive near the optimum, where it oscillates,
or too conservative far from it, where it wastes iterations. Neither failure
is visible from the loss curve alone.
}

\\slide{Our approach}{
We estimate local curvature online and invert it, smoothed by an exponential
moving average. One extra function evaluation per iteration.
}

\\slide{Results}{
\begin{center}
\\begin{tabular}{lrr}
\\toprule
Method & Iterations & p99 (ms) \\\\
\\midrule
Fixed schedule & 1284 & 210 \\\\
Ours & 848 & 171 \\\\
\\bottomrule
\\end{tabular}
\\end{center}
}

\\slide{Where it does not help}{
For heavy-tailed targets the estimator is noisy. We characterise the regime
where the adaptive schedule underperforms a tuned fixed one.
}

\\slide{References}{
\begin{itemize}
  \\item Jordan et al. (1998). An introduction to variational methods for graphical models.
  \\item Kingma and Welling (2019). An introduction to variational autoencoders.
\\end{itemize}
}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'poster',
    title: 'Poster',
    description: 'A large single-page poster layout with a header band, three columns and a footer.',
    category: 'Posters',
    kind: 'Examples',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-06-08',
    abstract:
      'A single large page for a conference poster, with a coloured header band, a three-column body and a references strip along the bottom.',
    tags: ['Poster', 'Single page', 'Conference'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=1.4cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{multicol}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}

\\definecolor{accent}{HTML}{1A73E8}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\columnsep}{0.7cm}

\\begin{document}

{\\setlength{\\fboxsep}{10pt}%
\\fcolorbox{accent}{white}{%
\\begin{minipage}{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule\\relax}
{\\Huge \\textbf{Adaptive Step Sizes in Variational Inference}}\\par
\\vspace{0.2cm}
{\\large Elena Novak, Robert Toure --- Institute of Computing Sciences}
\\end{minipage}}}

\\vspace{0.6cm}

\\begin{multicols}{3}

\\textbf{Motivation}

Variational inference converges slowly when the step size is mismatched to the
local curvature. This mismatch is invisible in the loss curve.

\\vspace{0.4cm}
\\textbf{Method}

We estimate the local curvature online and invert it, smoothed exponentially.
One extra evaluation per iteration.

\\vspace{0.4cm}
\\textbf{Results}

34\\% fewer iterations across eight benchmarks, with no increase in gradient
variance.

\\columnbreak

\\textbf{Setup}

We evaluate on eight models spanning logistic regression, Gaussian mixtures
and a variational autoencoder.

\\vspace{0.4cm}
\\textbf{The estimator}

The estimate $\\hat{\\kappa}_t$ is a running average of the observed ratio of
successive gradient norms.

\\vspace{0.4cm}
\\textbf{Analysis}

Under log-concavity the schedule converges independently of the initialisation.

\\columnbreak

\\textbf{Limitations}

The estimator is noisy for heavy-tailed targets. We characterise the regime
where a tuned fixed schedule wins.

\\vspace{0.4cm}
\\textbf{Conclusion}

Adaptive schedules are a consistent win for log-concave targets, and the
effect grows with dimension.

\\end{multicols}

\\vspace{0.4cm}
\\hrule
\\vspace{0.2cm}
{\\footnotesize \\textbf{References:} Jordan et al. (1998); Kingma and Welling (2019). \\hfill
Contact: \\href{mailto:enovak@example.edu}{enovak@example.edu}}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'assignment',
    title: 'Assignment',
    description: 'A problem-set layout with a statement, numbered questions and a solutions section.',
    category: 'Assignments',
    kind: 'Community',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-05-04',
    abstract:
      'A coursework document with a problem statement, numbered questions, room for worked solutions and a rubric, suitable for a tutorial or take-home exercise.',
    tags: ['Coursework', 'Problems', 'Solutions'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
{\\Large \\textbf{Problem Set 3: Discrete Latent Variable Models}}\\par
\\vspace{0.3cm}
{\\small Distributed Systems and Probabilistic Machine Learning \\hfill Due 14 March 2026}
\\end{center}

\\hrule
\\vspace{0.6cm}

\\section*{Instructions}

Complete all three questions. Show your derivation, not only your final answer.
Submissions are individual. Collaboration on ideas is permitted; identical
submissions are not.

\\section{Question 1}

Consider a mixture model with $K$ components and latent indicator $z$. Show that
the coordinate ascent update for the mixing proportions is

\\begin{equation}
\\pi_k^{\\text{new}} = \\frac{n_k}{n}, \\qquad n_k = \\sum_{i=1}^{N} \\mathbb{1}[z_i = k],
\\end{equation}

and explain why this update cannot decrease the observed-data log-likelihood.

\\section{Question 2}

We now marginalise $z$ rather than estimating it. Derive the coordinate ascent
update for the component parameters under the variational approximation
$q(z) = \\prod_i q(z_i)$ with $q(z_i)$ categorical, and state the condition
under which the update is guaranteed to increase the ELBO.

\\section{Question 3}

Using a data set of your choice, implement variational inference for the model
from Question 2. Plot the ELBO against the iteration count and identify the
point at which additional iterations stop improving the bound. Discuss whether
that point is sensitive to the initialisation.

\\section*{Solution Outline}

For Question 1, the update is the maximiser of the expected complete-data
log-likelihood over the simplex, and it is non-decreasing by the usual
minorisation argument.

\\vfill
\\hrule
\\vspace{0.3cm}
{\\footnotesize \\textbf{Rubric:} 40\\% correctness, 30\\% derivation, 20\\% presentation, 10\\% reproducibility.}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'formal-letter',
    title: 'Formal Letter',
    description: 'A business letter layout with sender, recipient, subject line and sign-off.',
    category: 'Formal Letters',
    kind: 'Community',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-04-17',
    abstract:
      'A conventional formal letter with configurable sender and recipient blocks, a subject line, a body and a sign-off. Useful for applications, requests and official correspondence.',
    tags: ['Letter', 'Business', 'Formal'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.5cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.8em}

\\begin{document}

{\\Large \\textbf{Veridian Technologies}}\\\\
Innovation Drive, Building C\\\\
Dublin, Ireland\\\\
\\href{mailto:hr@veridian.example}{hr@veridian.example}

\\vspace{1.2em}

\\today

\\vspace{1em}

The Head of Talent Acquisition\\\\
Veridian Technologies\\\\
Dublin, Ireland

\\vspace{1em}

\\textbf{Subject: Application for the Backend Engineer Position}

\\vspace{0.6em}

Dear Sir or Madam,

I am writing to enquire about the Backend Engineer position advertised on
your careers site on 2 March 2026.

The role closely matches my background. Over the past two years I have
designed and maintained REST services in Node.js and Go, introduced
request-level tracing across a service estate of twelve applications, and
reduced the p99 latency of a payments API by 71\\%.

I hold a B.Tech in Computer Science with a CGPA of 8.9, and I am comfortable
working across the full delivery range, from schema design through to
on-call support. I would welcome the opportunity to discuss how I could
contribute to the platform team.

My resume is enclosed for your consideration. I would be glad to provide
references or a portfolio of my work at your convenience.

Yours faithfully,

\\vspace{1.6em}
Priya Sharma

\\vspace{1.2em}
\\hrule
\\vspace{0.4em}
{\\footnotesize Enclosure: Resume --- Priya Sharma}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'A one-page newsletter with a masthead, a lead story and a multi-column body.',
    category: 'Newsletters',
    kind: 'Community',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-03-29',
    abstract:
      'A compact editorial layout with a coloured masthead, a lead item, a two-column body of short items, and a subscription footer.',
    tags: ['Newsletter', 'Masthead', 'Multi column'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[10pt,a4paper]{article}

\\usepackage[margin=1.5cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{multicol}
\\usepackage{xcolor}
\\usepackage[hidelinks]{hyperref}

\\definecolor{accent}{HTML}{1A73E8}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.5em}
\\setlength{\\columnsep}{0.6cm}

\\begin{document}

{\\color{accent}\\rule{\\linewidth}{3pt}}\\par
\\vspace{0.3cm}
{\\Huge \\textbf{The Upskillyfy Weekly}}\\par
\\vspace{0.2cm}
{\\small Issue 42 --- 12 October 2026 \\hfill \\href{https://example.com/subscribe}{Subscribe}}

\\vspace{0.4cm}
{\\color{accent}\\rule{\\linewidth}{1pt}}\\par
\\vspace{0.4cm}

\\textbf{\\large Adaptive step sizes, and why your loss curve lies}\\par
Step size schedules dominate the convergence of variational inference, and
the loss curve is almost never enough to tell you when to stop. We walk
through a curvature estimator that costs one extra function evaluation per
iteration, and show where it stops helping.

\\vspace{0.3cm}
\\hrule
\\vspace{0.3cm}

\\begin{multicols}{2}

\\textbf{Postgres pools, measured}

We raised a pool from 10 to 50 and cut p99 latency by 62\\%. Here is the
instrumentation that made the bottleneck obvious.

\\vspace{0.4cm}
\\textbf{Reading a paper in an hour}

Three passes, three questions, and one rule about when to stop. A method that
has survived four years of reading.

\\vspace{0.4cm}
\\textbf{Your first Kubernetes bill}

What actually costs money in a small cluster, and the three settings that
usually matter.

\\columnbreak

\\textbf{Type-safe APIs without codegen}

Using schema inference at the type level to get end-to-end safety with no
build step.

\\vspace{0.4cm}
\\textbf{The office hours format}

Why a shared document works better than a shared call, and how to run one
that people actually attend.

\\vspace{0.4cm}
\\textbf{What we are reading}

Four papers, one blog post and a tool that removes a step from a workflow
we do every week.

\\end{multicols}

\\vspace{0.3cm}
\\hrule
\\vspace{0.3cm}
{\\footnotesize \\textbf{The Upskillyfy Weekly} is written by the Upskillyfy AI engineering team.
\\href{https://example.com/subscribe}{Subscribe} to get it every Monday.}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'A yearly calendar page generated from LaTeX tables, one month per row.',
    category: 'Calendars',
    kind: 'Community',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-02-25',
    abstract:
      'A twelve-month calendar rendered with plain LaTeX tables. Each month is a seven-column grid, and the document can be printed at A4 or A3.',
    tags: ['Calendar', 'Tables', 'Printable'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[10pt,a4paper]{article}

\\usepackage[margin=1.4cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{xcolor}
\\usepackage{array}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\definecolor{accent}{HTML}{1A73E8}

% Renders one month as a seven-column table.
% #1 = month name, #2 = number of days, #3 = weekday the 1st falls on (1=Mon)
\\newcommand{\\month}[3]{%
  \\begin{center}%
  {\\large \\textbf{#1}}\\par\\vspace{0.2cm}%
  \\begin{tabular}{*{7}{>{\\centering\\arraybackslash}p{1.9cm}}}
  \\hline
  Mon & Tue & Wed & Thu & Fri & Sat & Sun \\\\
  \\hline
  \\end{tabular}%
  \\begin{tabular}{*{7}{>{\\centering\\arraybackslash}p{1.9cm}}}
  \\end{tabular}%
  \\end{center}%
  \\vspace{0.2cm}%
}

\\begin{document}

{\\color{accent}\\rule{\\linewidth}{2pt}}\\par
\\vspace{0.3cm}
{\\Huge \\textbf{2026}}\\par
\\vspace{0.5cm}

\\begin{center}
\\begin{tabular}{|c|c|c|c|c|c|c|}
\\hline
Mon & Tue & Wed & Thu & Fri & Sat & Sun \\\\
\\hline
 & & & 1 & 2 & 3 & 4 \\\\
\\hline
5 & 6 & 7 & 8 & 9 & 10 & 11 \\\\
\\hline
12 & 13 & 14 & 15 & 16 & 17 & 18 \\\\
\\hline
19 & 20 & 21 & 22 & 23 & 24 & 25 \\\\
\\hline
26 & 27 & 28 & 29 & 30 & 31 & \\\\
\\hline
\\end{tabular}
\\end{center}

\\vspace{0.4cm}
\\begin{center}
\\begin{tabular}{|c|c|c|c|c|c|c|}
\\hline
Mon & Tue & Wed & Thu & Fri & Sat & Sun \\\\
\\hline
 & & 1 & 2 & 3 & 4 & 5 \\\\
\\hline
6 & 7 & 8 & 9 & 10 & 11 & 12 \\\\
\\hline
13 & 14 & 15 & 16 & 17 & 18 & 19 \\\\
\\hline
20 & 21 & 22 & 23 & 24 & 25 & 26 \\\\
\\hline
27 & 28 & & & & & \\\\
\\hline
\\end{tabular}
\\end{center}

\\vfill
{\\footnotesize Printed by Upskillyfy AI --- \\href{https://example.com}{example.com}}

\\end{document}
`,
      },
    ],
  },
  {
    id: 'bibliography',
    title: 'Bibliography',
    description: 'A standalone reference list with numbered citations and a BibTeX source file.',
    category: 'Bibliographies',
    kind: 'Community',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-01-30',
    abstract:
      'A reference-only document with a numbered citation list, plus a separate BibTeX file so the same references can be reused by a paper or thesis.',
    tags: ['References', 'BibTeX', 'Citations'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.4cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
{\\Large \\textbf{Selected References}}\\par
\\vspace{0.3cm}
{\\small Compiled with a BibTeX source file --- \\texttt{references.bib}}
\\end{center}

\\vspace{0.6cm}

\\begin{thebibliography}{99}

\\bibitem{jordan1998}
Jordan, M. I., Blei, D. M., and Wainwright, M. I. (1998).
An introduction to variational methods for graphical models.
\\emph{Journal of Machine Learning Research} 3, 1--67.

\\bibitem{kingma2019}
Kingma, D. P. and Welling, M. (2019). An introduction to variational
autoencoders. \\emph{arXiv preprint} arXiv:1912.03411.

\\bibitem{liu2021}
Liu, Z. and Wang, H. (2021). A survey of efficient attention mechanisms in
deep learning. \\emph{ArXiv} 2112.00586.

\\bibitem{kumar2020}
Kumar, R. and Patel, S. (2020). Distribution shift in production machine
learning systems. \\emph{Proceedings of the 4th Conference on Machine
Learning and Systems}, 887--901.

\\bibitem{rasmussen2007}
Rasmussen, C. E. and Williams, C. K. I. (2007). Gaussian Processes for Machine
Learning. MIT Press.

\\bibitem{goodfellow2016}
Goodfellow, I., Bengio, Y., and Courville, A. (2016). Deep Learning.
MIT Press.

\\end{thebibliography}

\\end{document}
`,
      },
      {
        path: 'references.bib',
        content: `@article{jordan1998,
  title   = {An Introduction to Variational Methods for Graphical Models},
  author  = {Jordan, Michael I. and Blei, David M. and Wainwright, Marten J.},
  journal = {Journal of Machine Learning Research},
  volume  = {3},
  pages   = {1--67},
  year    = {1998}
}

@article{kingma2019,
  title  = {An Introduction to Variational Autoencoders},
  author = {Kingma, Diederik P. and Welling, Max},
  journal = {arXiv preprint arXiv:1912.03411},
  year   = {2019}
}

@inproceedings{liu2021,
  title     = {A Survey of Efficient Attention Mechanisms in Deep Learning},
  author    = {Liu, Zihang and Wang, Haoyu},
  booktitle = {arXiv},
  year      = {2021}
}

@inproceedings{kumar2020,
  title     = {Distribution Shift in Production Machine Learning Systems},
  author    = {Kumar, Rithesh and Patel, Sana},
  booktitle = {Proceedings of the 4th Conference on Machine Learning and Systems},
  pages     = {887--901},
  year      = {2020}
}

@book{rasmussen2007,
  title     = {Gaussian Processes for Machine Learning},
  author    = {Rasmussen, Carl Edward and Williams, Christopher K. I.},
  publisher = {MIT Press},
  year      = {2007}
}

@book{goodfellow2016,
  title     = {Deep Learning},
  author    = {Goodfellow, Ian and Bengio, Yoshua and Courville, Aaron},
  publisher = {MIT Press},
  year      = {2016}
}
`,
      },
    ],
  },
  {
    id: 'book',
    title: 'Book Chapter',
    description: 'A book chapter layout with a chapter number, section hierarchy and cross-references.',
    category: 'Books',
    kind: 'Community',
    author: 'Upskillyfy AI',
    license: 'MIT',
    lastUpdated: '2026-01-18',
    abstract:
      'A chapter-style layout with a chapter number and title, nested sectioning, figure and table environments with captions, and cross-references.',
    tags: ['Book', 'Chapter', 'Cross references'],
    compiler: 'pdfLaTeX',
    mainFile: 'main.tex',
    featured: false,
    demo: true,
    files: [
      {
        path: 'main.tex',
        content: `\\documentclass[11pt,a4paper]{article}

\\usepackage[margin=2.2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
{\\small CHAPTER 4}\\par
\\vspace{0.2cm}
{\\LARGE \\textbf{Adaptive Optimisation in Probabilistic Models}}\\par
\\vspace{0.3cm}
{\\large Marta Lindqvist}
\\end{center}

\\vspace{0.8cm}

\\section{Introduction}

The step size is the single most consequential hyperparameter in gradient-based
inference. This chapter develops a systematic account of adaptive schedules,
unifying the results that have previously appeared in separate literatures.

\\section{Notation}

Throughout, we write $f(z)$ for the objective, $\\nabla f$ for its gradient,
and $\\eta_t$ for the step size at iteration $t$.

\\section{Constant schedules}

A constant schedule $\\eta_t = \\eta$ converges when $\\eta$ is below the
inverse Lipschitz constant, and diverges otherwise.

\\section{Adaptive schedules}

\\subsection{Estimating curvature}

We consider the running estimate

\\begin{equation}
\\hat{\\kappa}_t = (1 - \\gamma)\\,\\hat{\\kappa}_{t-1} + \\gamma \\, \\frac{\\|\\nabla f(z_t)\\|^2}{f(z_t) - f(z_{t-1})},
\\end{equation}

and the schedule $\\eta_t = \\hat{\\kappa}_t^{-1}$.

\\subsection{Convergence}

Under log-concavity, the schedule satisfies

\\begin{equation}
f(z_T) - f(z^*) \\le \\frac{L}{2T} \\|z_0 - z^*\\|^2,
\\end{equation}

which is the usual rate, with a constant that does not depend on the
initialisation.

\\section{A worked example}

We work through the online estimator for a Gaussian mixture model.

\\section{Further reading}

The estimator is closely related to the Barzilai-Borwein family of methods,
though the derivation and the guarantee are different.

\\end{document}
`,
      },
    ],
  },
]

/** Look up a template by id. Returns undefined when there is no match. */
export const findTemplateById = (id) => LATEX_TEMPLATES.find((t) => t.id === id)
