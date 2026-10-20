export const INTERNSHIPS_DATA = [
  {
    id: 'sde-backend-finscale',
    title: 'SDE Backend Intern — Distributed Systems',
    company: 'FinScale Technologies',
    companyTagline: 'Modern High-Throughput Payment Orchestration',
    logoBg: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
    logoInitial: 'FS',
    category: 'fullstack',
    categoryLabel: 'Full-Stack & Backend',
    location: 'Remote (Pan-India)',
    mode: 'Remote',
    stipend: '₹25,000 /month',
    duration: '3 Months',
    startDate: 'Immediate',
    deadline: 'Nov 20, 2026',
    openings: 4,
    applicants: 194,
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'Redis', 'TypeScript', 'REST APIs'],
    experienceLevel: 'Fresher / Student (B.Tech / MCA)',
    batch: ['2025', '2026', '2027'],
    ppoOffered: true,
    ppoPackage: '₹10 - 15 LPA',
    overview: 'FinScale is building next-generation financial transaction gateways handling 10M+ daily events. As a Backend Engineering Intern, you will work directly with our core engineering team to build scalable microservices, optimize SQL queries, and implement Redis caching layers.',
    responsibilities: [
      'Architect, develop, and test high-concurrency RESTful and GraphQL APIs using Node.js and TypeScript.',
      'Optimize database schemas, write complex PostgreSQL queries, and implement connection pooling.',
      'Containerize microservices using Docker and assist in deploying onto cloud test environments.',
      'Write comprehensive unit and integration test suites achieving >80% code coverage.',
      'Participate in daily engineering standups, architectural design reviews, and sprint planning.'
    ],
    requirements: [
      'Strong proficiency in JavaScript/TypeScript and asynchronous backend programming (Node.js/Express or Fastify).',
      'Solid grasp of relational databases (PostgreSQL or MySQL) and basic understanding of caching with Redis.',
      'Familiarity with Git version control, branching workflows, and container basics (Docker).',
      'Good understanding of fundamental Data Structures & Algorithms (Trees, Graphs, HashMaps, Two Pointers).',
      'Available for a full-time 3-month remote commitment (40 hours/week).'
    ],
    perks: [
      'Fixed monthly stipend of ₹25,000 with zero delay.',
      'Full-time Pre-Placement Offer (PPO) opportunity (₹10 - 15 LPA) based on internship performance.',
      'Official Certificate of Internship and Letter of Recommendation from VP of Engineering.',
      'Flexible working hours and 1-on-1 weekly mentorship with senior staff engineers.',
      'Access to cloud sandboxes (AWS/GCP credits) and company learning resources.'
    ],
    selectionProcess: [
      { step: 1, title: 'Profile & Resume Screening', desc: 'Review of GitHub projects, coding profiles (LeetCode/CodeForces), and core skill alignment.' },
      { step: 2, title: 'Online Coding Assessment', desc: '90-minute assessment covering 2 algorithmic coding problems (Medium DSA) and 1 SQL query.' },
      { step: 3, title: 'Technical Interview Round', desc: '45-minute Google Meet deep dive into backend concepts, project architecture, and live coding.' },
      { step: 4, title: 'HR Discussion & Offer Rollout', desc: 'Culture fit alignment, role onboarding briefing, and formal offer letter issuance.' }
    ],
    aboutCompany: {
      bio: 'FinScale Technologies is a Series-A backed enterprise fintech platform modernizing cross-border payment settlements. Headquartered in Bangalore with a distributed remote-first engineering culture.',
      website: 'https://finscale.tech',
      size: '80 - 150 Employees',
      headquarters: 'Bangalore, Karnataka (Remote-First)',
      industry: 'FinTech & Cloud Infrastructure'
    }
  },
  {
    id: 'ai-ml-agent-neuralflow',
    title: 'Generative AI & LLM Engineer Intern',
    company: 'NeuralFlow AI',
    companyTagline: 'Autonomous Enterprise AI Agents & Workflow RAG',
    logoBg: 'linear-gradient(135deg, #34a853 0%, #0b8043 100%)',
    logoInitial: 'NF',
    category: 'aiml',
    categoryLabel: 'AI & Machine Learning',
    location: 'Bangalore, Karnataka (Hybrid)',
    mode: 'Hybrid',
    stipend: '₹30,000 /month',
    duration: '3 - 6 Months',
    startDate: 'Immediate',
    deadline: 'Nov 24, 2026',
    openings: 3,
    applicants: 285,
    skills: ['Python', 'LangChain', 'FastAPI', 'Gemini AI', 'Vector DBs', 'PyTorch'],
    experienceLevel: 'Fresher / Student (All Branches)',
    batch: ['2025', '2026', '2027'],
    ppoOffered: true,
    ppoPackage: '₹12 - 18 LPA',
    overview: 'NeuralFlow develops multi-modal generative AI pipelines that automate enterprise customer workflows. In this role, you will implement retrieval-augmented generation (RAG) architectures, fine-tune small language models, and evaluate prompt performance.',
    responsibilities: [
      'Design and deploy RAG pipelines connecting structured documents to vector databases (Qdrant, Pinecone, or ChromaDB).',
      'Build asynchronous API wrappers using FastAPI to serve inference requests with sub-500ms latencies.',
      'Implement prompt evaluation frameworks and benchmark model accuracy across Gemini and open weights models.',
      'Collaborate with frontend engineers to integrate conversational streaming UI components.',
      'Contribute to internal agentic reasoning benchmarks and tool-calling validation tests.'
    ],
    requirements: [
      'Strong programming proficiency in Python with clean object-oriented and functional principles.',
      'Hands-on experience with LangChain, LlamaIndex, or native LLM APIs (OpenAI, Gemini, Anthropic).',
      'Understanding of embeddings, cosine similarity, vector indexing, and chunking strategies.',
      'Familiarity with Git and basic Linux command-line environments.',
      'Curiosity about cutting-edge agentic architectures (ReAct, Planning, Tool Calling).'
    ],
    perks: [
      'Competitive monthly stipend of ₹30,000.',
      'Direct PPO fast-track upon successful completion of core deliverables.',
      'Access to high-compute GPU clusters and enterprise API quotas for research.',
      'Hybrid allowance + daily catered lunch at Bangalore tech hub office.',
      'Co-authoring opportunities on technical engineering whitepapers.'
    ],
    selectionProcess: [
      { step: 1, title: 'Portfolio & GitHub Review', desc: 'Evaluation of past AI/ML projects, HuggingFace repos, or Kaggle notebooks.' },
      { step: 2, title: 'Take-Home RAG Challenge', desc: 'Build a mini semantic document parser using LangChain/FastAPI within 48 hours.' },
      { step: 3, title: 'System & Code Walkthrough', desc: 'Walk through your take-home implementation and discuss latency & edge cases.' },
      { step: 4, title: 'Final Offer Discussion', desc: 'Discuss start date, hardware setup, and official onboarding.' }
    ],
    aboutCompany: {
      bio: 'NeuralFlow AI builds enterprise automation suites for Fortune 500 supply chains. Funded by leading Silicon Valley and Indian venture funds.',
      website: 'https://neuralflow.ai',
      size: '50 - 100 Employees',
      headquarters: 'Indiranagar, Bangalore',
      industry: 'Artificial Intelligence & SaaS'
    }
  },
  {
    id: 'cloud-devops-cloudnative',
    title: 'Cloud Platform & DevOps Intern',
    company: 'CloudNative Systems',
    companyTagline: 'Automated Kubernetes & Multi-Cloud Reliability',
    logoBg: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
    logoInitial: 'CN',
    category: 'cloud',
    categoryLabel: 'Cloud & DevOps',
    location: 'Remote (Pan-India)',
    mode: 'Remote',
    stipend: '₹22,000 /month',
    duration: '3 Months',
    startDate: '1st Dec 2026',
    deadline: 'Nov 28, 2026',
    openings: 3,
    applicants: 142,
    skills: ['Kubernetes', 'Docker', 'Google Cloud', 'Terraform', 'CI/CD', 'Linux'],
    experienceLevel: 'Fresher / Student',
    batch: ['2025', '2026', '2027'],
    ppoOffered: true,
    ppoPackage: '₹9 - 14 LPA',
    overview: 'Join the infrastructure engineering team responsible for maintaining 99.99% uptime across multi-cloud clusters. You will learn and implement Infrastructure as Code (Terraform), automate container release pipelines, and configure monitoring alarms.',
    responsibilities: [
      'Write modular Terraform configurations for automated provisioning of Google Cloud and AWS resources.',
      'Manage Helm charts and deployment manifests for containerized microservices on Kubernetes.',
      'Build and optimize GitHub Actions CI/CD workflows for automated linting, security scanning, and deployment.',
      'Configure Prometheus metric scrapers and Grafana telemetry dashboards for microservice observability.',
      'Participate in disaster recovery drills and incident response post-mortems.'
    ],
    requirements: [
      'Strong grasp of Linux operating system fundamentals, shell scripting (Bash), and networking (DNS, HTTP/S, TCP).',
      'Hands-on experience creating Dockerfiles and running multi-container applications with Docker Compose.',
      'Basic familiarity with at least one major cloud provider (Google Cloud or AWS).',
      'Knowledge of Git version control and modern continuous integration concepts.',
      'Eager to learn enterprise cloud security and infrastructure automation.'
    ],
    perks: [
      'Monthly stipend of ₹22,000 with performance bonuses.',
      'Company sponsorship for official cloud certifications (CKA, GCP Associate Cloud Engineer).',
      'High conversion rate to full-time Cloud DevOps Engineer roles.',
      'Full equipment and home-office allowance for remote setup.',
      'Mentorship from certified Kubernetes administrators and Google Cloud experts.'
    ],
    selectionProcess: [
      { step: 1, title: 'Resume & Skill Assessment', desc: 'Verification of Linux, Docker, and networking foundations.' },
      { step: 2, title: 'Practical Linux & Docker Lab', desc: '60-minute practical troubleshooting session (debugging a container and writing a Dockerfile).' },
      { step: 3, title: 'Technical Architecture Interview', desc: 'Discussion on CI/CD pipelines, cloud patterns, and candidate projects.' },
      { step: 4, title: 'Offer Letter Rollout', desc: 'Confirmation of stipend, certification sponsorship terms, and start date.' }
    ],
    aboutCompany: {
      bio: 'CloudNative Systems provides automated reliability and DevOps tooling for high-scale digital platforms. Partnered with Google Cloud and CNCF.',
      website: 'https://cloudnativesys.io',
      size: '100 - 250 Employees',
      headquarters: 'Hyderabad, Telangana (Remote-First)',
      industry: 'Cloud Infrastructure & DevOps'
    }
  },
  {
    id: 'frontend-react-streamline',
    title: 'Frontend React & UI Engineer Intern',
    company: 'Streamline Digital',
    companyTagline: 'Design Systems & High-Performance Web Applications',
    logoBg: 'linear-gradient(135deg, #fbbc04 0%, #ea580c 100%)',
    logoInitial: 'SD',
    category: 'fullstack',
    categoryLabel: 'Full-Stack & Frontend',
    location: 'Pune, Maharashtra (Hybrid)',
    mode: 'Hybrid',
    stipend: '₹20,000 /month',
    duration: '3 Months',
    startDate: 'Immediate',
    deadline: 'Nov 22, 2026',
    openings: 5,
    applicants: 312,
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma', 'Redux'],
    experienceLevel: 'Fresher / Student (All Branches)',
    batch: ['2025', '2026', '2027'],
    ppoOffered: true,
    ppoPackage: '₹8 - 12 LPA',
    overview: 'Streamline builds consumer-facing web applications with world-class user experiences. You will convert Figma designs into pixel-perfect React components, optimize Core Web Vitals, and build interactive stateful web interfaces.',
    responsibilities: [
      'Develop modular, accessible, and responsive UI components using React, Next.js, and TypeScript.',
      'Translate design tokens and component specs from Figma into scalable Tailwind CSS utility architectures.',
      'Implement global state management, client caching, and optimistic UI updates.',
      'Optimize page performance, minimize bundle sizes, and achieve high Google Lighthouse scores (>90).',
      'Collaborate closely with UI/UX designers and backend engineers for API contract integration.'
    ],
    requirements: [
      'Strong command of HTML5, modern CSS3 (Flexbox, Grid), and ES6+ JavaScript/TypeScript.',
      'Hands-on portfolio of interactive React projects deployed on Vercel, Netlify, or GitHub Pages.',
      'Understanding of component lifecycles, hooks, and clean prop drilling patterns.',
      'Eye for design details: smooth micro-interactions, responsive breakpoints, and typography.',
      'Familiarity with REST APIs and asynchronous data fetching (Axios, Fetch, or React Query).'
    ],
    perks: [
      'Monthly stipend of ₹20,000.',
      'PPO opportunity with attractive compensation packages upon graduation.',
      'Work on client projects deployed to millions of active end users.',
      'Letter of Recommendation and LinkedIn public endorsement.',
      'Hybrid office setup with flexible attendance policy.'
    ],
    selectionProcess: [
      { step: 1, title: 'Portfolio & Live Links Review', desc: 'Inspection of live web demos, GitHub code quality, and responsive layout fidelity.' },
      { step: 2, title: 'Component Build Challenge', desc: 'Replicate a provided Figma design into a responsive React component within 24 hours.' },
      { step: 3, title: 'Frontend Technical Round', desc: '45-minute discussion on DOM mechanics, CSS layout gotchas, and React state models.' },
      { step: 4, title: 'Offer Letter', desc: 'Formal offer rollout and welcome kit dispatch.' }
    ],
    aboutCompany: {
      bio: 'Streamline Digital is a premier digital product studio building web and mobile applications for global startups and high-growth brands.',
      website: 'https://streamline.design',
      size: '40 - 80 Employees',
      headquarters: 'Kalyani Nagar, Pune',
      industry: 'Software Design & Product Engineering'
    }
  },
  {
    id: 'mobile-app-dev-appforge',
    title: 'Mobile App Developer Intern (React Native / Flutter)',
    company: 'AppForge Studios',
    companyTagline: 'Cross-Platform Mobile Experiences',
    logoBg: 'linear-gradient(135deg, #7b61ff 0%, #4f46e5 100%)',
    logoInitial: 'AF',
    category: 'mobile',
    categoryLabel: 'Mobile Apps',
    location: 'Remote (Pan-India)',
    mode: 'Remote',
    stipend: '₹22,000 /month',
    duration: '3 Months',
    startDate: 'Immediate',
    deadline: 'Nov 26, 2026',
    openings: 2,
    applicants: 168,
    skills: ['React Native', 'Flutter', 'Firebase', 'REST APIs', 'Redux', 'Mobile UI'],
    experienceLevel: 'Fresher / Student',
    batch: ['2025', '2026', '2027'],
    ppoOffered: true,
    ppoPackage: '₹9 - 13 LPA',
    overview: 'Work on live mobile apps with thousands of daily active users across Android and iOS. You will build smooth navigation flows, integrate native device capabilities (Camera, Geolocation, Push Notifications), and write reusable mobile widgets.',
    responsibilities: [
      'Develop cross-platform mobile features using React Native or Flutter.',
      'Integrate device APIs, biometric authentication, and offline data persistence.',
      'Connect mobile clients to cloud backend services and Firebase real-time databases.',
      'Test apps across multiple screen sizes, Android versions, and iOS device targets.',
      'Assist in preparing builds for Google Play Store and Apple TestFlight submissions.'
    ],
    requirements: [
      'Experience building mobile applications in React Native (Expo/CLI) or Flutter (Dart).',
      'Knowledge of mobile state management (Redux, Zustand, or Provider/Bloc).',
      'Understanding of mobile navigation stacks and native UI styling.',
      'At least one published APK or GitHub repository with a demonstrable mobile app.',
      'Good communication skills and eagerness to learn production mobile deployment.'
    ],
    perks: [
      'Fixed monthly stipend of ₹22,000.',
      'Pre-Placement Offer (PPO) opportunities for graduating batches.',
      'Full mentorship from mobile architects with apps having 1M+ downloads.',
      'Flexible hours and complete remote setup support.',
      'Official internship certificate and recommendation letter.'
    ],
    selectionProcess: [
      { step: 1, title: 'APK / Repo Review', desc: 'Testing applicant demo apps and reviewing architecture.' },
      { step: 2, title: 'Live Coding / Bug Fix', desc: '45-minute live pair programming session implementing a mobile screen flow.' },
      { step: 3, title: 'Technical Conversation', desc: 'Discussion on mobile lifecycles, memory optimization, and background sync.' },
      { step: 4, title: 'Offer Rollout', desc: 'Finalizing agreement terms and orientation.' }
    ],
    aboutCompany: {
      bio: 'AppForge Studios specializes in high-retention consumer mobile products and enterprise mobility solutions.',
      website: 'https://appforge.io',
      size: '30 - 60 Employees',
      headquarters: 'Gurugram, Delhi NCR (Remote-First)',
      industry: 'Mobile Software Development'
    }
  },
  {
    id: 'data-analytics-datametrics',
    title: 'Data Analytics & Business Intelligence Intern',
    company: 'DataMetrics Insights',
    companyTagline: 'Empowering Decisions Through Real-Time Analytics',
    logoBg: 'linear-gradient(135deg, #ea4335 0%, #b91c1c 100%)',
    logoInitial: 'DM',
    category: 'aiml',
    categoryLabel: 'Data & Analytics',
    location: 'Gurugram, Delhi NCR (Hybrid)',
    mode: 'Hybrid',
    stipend: '₹18,000 /month',
    duration: '3 Months',
    startDate: '1st Dec 2026',
    deadline: 'Nov 30, 2026',
    openings: 3,
    applicants: 220,
    skills: ['SQL', 'Python', 'PowerBI', 'Tableau', 'Pandas', 'Data Modeling'],
    experienceLevel: 'Fresher / Student (All Branches)',
    batch: ['2025', '2026', '2027'],
    ppoOffered: true,
    ppoPackage: '₹7 - 11 LPA',
    overview: 'Analyze large-scale enterprise datasets, construct automated ETL pipelines, and design executive KPI dashboards. Work with real product usage data to uncover trends and drive decision-making.',
    responsibilities: [
      'Write advanced SQL queries (window functions, subqueries, CTEs) to extract and transform data.',
      'Perform exploratory data analysis (EDA) using Python (Pandas, NumPy, Matplotlib/Seaborn).',
      'Design interactive dashboards in PowerBI/Tableau for business and operations teams.',
      'Collaborate on metric definitions, data dictionary documentation, and data quality checks.'
    ],
    requirements: [
      'Proficiency in writing SQL queries and understanding relational database models.',
      'Hands-on experience with Python for data manipulation and visualization.',
      'Familiarity with at least one BI tool (PowerBI, Tableau, or Google Looker Studio).',
      'Analytical problem-solving mindset and clear data presentation ability.'
    ],
    perks: [
      'Monthly stipend of ₹18,000.',
      'High conversion rate to full-time Data Analyst and Business Analyst roles.',
      'Access to real enterprise data lakes and modern data warehousing tools.',
      'Certificate of Internship and LinkedIn recommendation.'
    ],
    selectionProcess: [
      { step: 1, title: 'Resume & SQL Screening', desc: 'Shortlisting based on SQL proficiency and data analysis coursework/projects.' },
      { step: 2, title: 'SQL & Data Case Study', desc: 'Solve a business case study with provided sample dataset within 24 hours.' },
      { step: 3, title: 'Case Presentation Interview', desc: 'Present your dashboard insights to our analytics lead.' },
      { step: 4, title: 'Offer Letter', desc: 'Formal offer rollout and onboarding date confirmation.' }
    ],
    aboutCompany: {
      bio: 'DataMetrics Insights delivers predictive analytics and business intelligence solutions for high-growth enterprise clients across healthcare and retail.',
      website: 'https://datametrics.co',
      size: '60 - 120 Employees',
      headquarters: 'Cyber City, Gurugram',
      industry: 'Data Analytics & Consulting'
    }
  }
]
