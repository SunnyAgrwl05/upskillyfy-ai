export const ROADMAPS_DATA = [
  {
    id: 'cloud-devops-engineer',
    title: 'Cloud Infrastructure & DevOps Engineer',
    category: 'Cloud & DevOps',
    level: 'Beginner to Pro',
    duration: '6 Months',
    months: 6,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    badge: 'High Demand',
    badgeType: 'blue',
    overview: 'Complete path to mastering Linux systems, Docker containerization, Kubernetes orchestration, CI/CD automation, and Infrastructure as Code with Terraform on Google Cloud.',
    skills: ['Linux & Bash', 'Docker', 'Kubernetes (GKE)', 'Terraform', 'Cloud Build CI/CD', 'Prometheus & Grafana'],
    targetRoles: ['Cloud Platform Engineer', 'DevOps Specialist', 'Site Reliability Engineer (SRE)'],
    relatedCourseId: 'cloud-computing-devops',
    relatedCourseTitle: 'Google Cloud Infrastructure & DevOps Specialization',
    milestones: [
      {
        step: 1,
        title: 'Linux Systems Administration & Shell Scripting',
        duration: '3 Weeks',
        summary: 'Master file systems, user permissions, process signals, systemd services, SSH tunneling, and automate routine tasks with Bash scripting.',
        skills: ['Bash Scripting', 'systemd', 'Networking (TCP/IP, DNS)', 'SSH Hardening'],
        project: 'Automated server backup and log rotation script with Discord/Slack webhook alerting.'
      },
      {
        step: 2,
        title: 'Git Version Control & Modern GitOps Workflows',
        duration: '2 Weeks',
        summary: 'Learn advanced branch strategies (trunk-based development), merge vs rebase, interactive rebasing, Git hooks, and multi-stage repo governance.',
        skills: ['Git Internals', 'Branching Strategies', 'GitHub Actions Basics', 'Signed Commits'],
        project: 'Automated GitHub Actions lint, test, and branch protection matrix.'
      },
      {
        step: 3,
        title: 'Docker Containerization & Multi-Stage Builds',
        duration: '3 Weeks',
        summary: 'Package microservices into ultra-lean Alpine images, manage container storage volumes, configure bridge networks, and compose multi-service topologies.',
        skills: ['Docker Engine', 'Dockerfile Optimization', 'Docker Compose', 'Security Scanning'],
        project: 'Containerized 3-tier microservice architecture with Redis cache and PostgreSQL.'
      },
      {
        step: 4,
        title: 'Kubernetes Orchestration & Helm Packaging',
        duration: '5 Weeks',
        summary: 'Deploy self-healing workloads with Pods, Deployments, Services, ConfigMaps, Secrets, Ingress controllers, and manage chart releases with Helm.',
        skills: ['Kubectl CLI', 'GKE Clusters', 'Ingress & TLS (Cert-Manager)', 'Helm 3'],
        project: 'Zero-downtime rolling update deployment on GKE with autoscaling HPA.'
      },
      {
        step: 5,
        title: 'Infrastructure as Code (IaC) with Terraform',
        duration: '4 Weeks',
        summary: 'Provision cloud networks, VMs, managed databases, and IAM bindings declaratively using Terraform modules and remote GCS backend state locks.',
        skills: ['Terraform HCL', 'GCS State Storage', 'Terraform Modules', 'Terragrunt'],
        project: 'Production VPC architecture with private subnets, NAT gateway, and GKE cluster using Terraform.'
      },
      {
        step: 6,
        title: 'Continuous Deployment & Observability (SRE)',
        duration: '4 Weeks',
        summary: 'Implement automated CI/CD pipelines with Cloud Build, monitor service SLIs/SLOs with Prometheus/Grafana, and configure distributed tracing.',
        skills: ['Cloud Build', 'Prometheus', 'Grafana Dashboards', 'Alertmanager'],
        project: 'Full GitOps deployment pipeline with Prometheus metrics dashboard and PagerDuty alert rules.'
      }
    ]
  },
  {
    id: 'genai-llm-engineer',
    title: 'Generative AI & LLM Systems Engineer',
    category: 'AI & Machine Learning',
    level: 'Intermediate to Pro',
    duration: '6 Months',
    months: 6,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    badge: 'Trending & High Pay',
    badgeType: 'green',
    overview: 'From Python data structures to modern LLM APIs, prompt engineering, vector search, RAG pipelines, and building autonomous agents with Gemini and Vertex AI.',
    skills: ['Python 3.12', 'Google Gemini 1.5', 'Vertex AI', 'Vector Databases (Chroma/Pinecone)', 'LangChain / LlamaIndex', 'RAG Pipelines'],
    targetRoles: ['AI Application Engineer', 'LLM Solutions Architect', 'Applied AI Researcher'],
    relatedCourseId: 'ai-ml-gemini',
    relatedCourseTitle: 'Generative AI & LLM Solutions with Gemini & Vertex AI',
    milestones: [
      {
        step: 1,
        title: 'Python for AI & Numerical Computing',
        duration: '3 Weeks',
        summary: 'Deep dive into Python typing, async concurrency, NumPy array manipulation, and pandas data wrangling for LLM datasets.',
        skills: ['Python Async/Await', 'NumPy & Pandas', 'Pydantic V2', 'REST APIs with FastAPI'],
        project: 'High-throughput async web scraper generating structured datasets validated with Pydantic.'
      },
      {
        step: 2,
        title: 'Embeddings & Vector Database Indexing',
        duration: '3 Weeks',
        summary: 'Understand vector similarity metrics (Cosine, Euclidean, Dot Product), text embedding models, and index billions of tokens in vector stores.',
        skills: ['text-embedding-004', 'Vector Math', 'HNSW Indexing', 'ChromaDB / pgvector'],
        project: 'Semantic semantic search engine indexing 5,000 engineering documentation pages.'
      },
      {
        step: 3,
        title: 'Retrieval-Augmented Generation (RAG) Systems',
        duration: '4 Weeks',
        summary: 'Construct multi-stage RAG pipelines: document parsing, chunking strategies, semantic reranking, context compression, and citation grounding.',
        skills: ['RAG Architecture', 'Hybrid Search', 'Cohere Rerank', 'Chunking Strategies'],
        project: 'Production legal/technical document Q&A assistant with page citations and zero hallucination guardrails.'
      },
      {
        step: 4,
        title: 'Agentic Workflows & Tool / Function Calling',
        duration: '4 Weeks',
        summary: 'Empower LLMs with tools: define JSON schema function bindings, execute SQL queries against live databases, and orchestrate multi-agent loops.',
        skills: ['Gemini Function Calling', 'LangGraph', 'ReAct Pattern', 'Tool Execution'],
        project: 'Autonomous SQL analysis agent that writes queries, executes against PostgreSQL, and generates chart visualizations.'
      },
      {
        step: 5,
        title: 'Fine-Tuning, LoRA & Model Alignment',
        duration: '4 Weeks',
        summary: 'Prepare instruction datasets, perform Parameter-Efficient Fine-Tuning (PEFT/LoRA) on open models, and evaluate outputs with LLM-as-a-judge.',
        skills: ['LoRA / QLoRA', 'HuggingFace Transformers', 'Vertex AI Tuning', 'G-Eval Framework'],
        project: 'Domain-adapted model fine-tuned on custom customer support tickets with automated benchmark report.'
      },
      {
        step: 6,
        title: 'Production LLMOps, Safety & Observability',
        duration: '3 Weeks',
        summary: 'Deploy scalable LLM services with streaming tokens, rate limits, caching, prompt injection defenses, and latency tracking with Langfuse/Traces.',
        skills: ['Langfuse Observability', 'Semantic Caching', 'Prompt Injection Mitigation', 'Cloud Run Deployment'],
        project: 'Enterprise AI gateway with rate-limiting, cost analytics dashboard, and automated PII redaction.'
      }
    ]
  },
  {
    id: 'fullstack-web-developer',
    title: 'Full-Stack Web & Cloud Architect',
    category: 'Web Development',
    level: 'Beginner to Advanced',
    duration: '6 Months',
    months: 6,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    badge: 'Most Popular',
    badgeType: 'amber',
    overview: 'Industry-standard progression from semantic HTML and modern React 19 to Node.js microservices, PostgreSQL relational modeling, and serverless Google Cloud deployments.',
    skills: ['React 19 & Vite', 'TypeScript', 'Node.js & Express', 'PostgreSQL & Prisma', 'Tailwind & Vanilla CSS', 'Cloud Run'],
    targetRoles: ['Full-Stack Software Engineer', 'Frontend Engineer', 'Backend Developer'],
    relatedCourseId: 'fullstack-web-bootcamp',
    relatedCourseTitle: 'Full-Stack Web Development Bootcamp: Modern React & Cloud Run',
    milestones: [
      {
        step: 1,
        title: 'Modern JavaScript (ES2024) & TypeScript Fundamentals',
        duration: '3 Weeks',
        summary: 'Master closures, event loop, Promises/async, prototype chains, and strict TypeScript types, generics, and utility helpers.',
        skills: ['TypeScript Generics', 'Async/Await', 'Event Loop', 'ES Modules'],
        project: 'Type-safe state container and validation library published as an npm package.'
      },
      {
        step: 2,
        title: 'React 19 Architecture & State Management',
        duration: '5 Weeks',
        summary: 'Build responsive single-page apps using modern hooks, context providers, optimized re-renders with useMemo/useCallback, and clean routing.',
        skills: ['React 19 Hooks', 'React Router v6', 'TanStack Query', 'Component Composition'],
        project: 'Real-time collaborative kanban board with drag-and-drop and optimistic UI updates.'
      },
      {
        step: 3,
        title: 'Backend REST API Engineering with Express & Node',
        duration: '4 Weeks',
        summary: 'Architect clean modular controllers, input validation middleware with Zod, JWT authentication, and secure password hashing with bcrypt.',
        skills: ['Express.js', 'Zod Validation', 'JWT Auth & Cookies', 'Error Handling Middleware'],
        project: 'Multi-tenant SaaS API with role-based access control (RBAC) and refresh token rotation.'
      },
      {
        step: 4,
        title: 'Relational Database Architecture & PostgreSQL',
        duration: '4 Weeks',
        summary: 'Design normalized relational schemas, write raw SQL joins/aggregations, manage migrations with Prisma ORM, and configure connection pools.',
        skills: ['PostgreSQL', 'Prisma ORM', 'Database Indexing', 'Transactions (ACID)'],
        project: 'E-commerce inventory and orders engine with ACID-compliant checkout transactions.'
      },
      {
        step: 5,
        title: 'Web Security, Real-Time WebSockets & Testing',
        duration: '3 Weeks',
        summary: 'Implement bidirectional WebSockets, secure against OWASP top 10 (CSRF, XSS, SQL injection), and write automated unit tests with Vitest.',
        skills: ['Socket.io / WS', 'OWASP Hardening', 'Vitest & Supertest', 'CORS / Helmet'],
        project: 'Real-time multi-room messaging system with live typing indicators and automated integration test suite.'
      },
      {
        step: 6,
        title: 'Docker Containerization & Cloud Deployment',
        duration: '3 Weeks',
        summary: 'Package frontend and backend into minimal Docker containers, configure environment secrets, and deploy serverless containers to Google Cloud Run.',
        skills: ['Google Cloud Run', 'Docker Container', 'Cloud SQL', 'Custom Domain & SSL'],
        project: 'Fully deployed production web app with automated GitHub Actions CI/CD on Cloud Run.'
      }
    ]
  },
  {
    id: 'dsa-competitive-programming',
    title: 'DSA, Algorithms & Coding Interview Mastery',
    category: 'DSA & Problem Solving',
    level: 'Beginner to Advanced',
    duration: '4 Months',
    months: 4,
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc03a2c5a05?w=800&auto=format&fit=crop&q=80',
    badge: 'Top for Placements',
    badgeType: 'purple',
    overview: 'Proven roadmap for mastering 400+ coding problems: arrays, two-pointers, sliding window, trees, dynamic programming, and graphs for FAANG and top product companies.',
    skills: ['C++ / Java / Python', 'Time & Space Complexity', 'Sliding Window', 'Binary Trees & BST', 'Dynamic Programming', 'Graph Traversal'],
    targetRoles: ['Software Development Engineer (SDE 1/2)', 'Competitive Programmer', 'Backend Systems Developer'],
    relatedCourseId: 'dsa-interview-mastery',
    relatedCourseTitle: 'Data Structures & Algorithms: Placement & FAANG Interview Prep',
    milestones: [
      {
        step: 1,
        title: 'Asymptotic Analysis & Linear Data Structures',
        duration: '3 Weeks',
        summary: 'Master Big-O space/time calculation, dynamic arrays, singly and doubly linked lists, stack evaluation, and circular queues.',
        skills: ['Big-O Analysis', 'Vectors / Arrays', 'Linked Lists', 'Stack & Queue'],
        project: 'Custom memory-efficient Doubly Linked List and LRU Cache simulation from scratch.'
      },
      {
        step: 2,
        title: 'Two-Pointer Technique & Sliding Window Mastery',
        duration: '2 Weeks',
        summary: 'Solve complex subarray problems in linear O(N) time using fixed and variable sliding windows and two-pointer convergence patterns.',
        skills: ['Fixed Window', 'Dynamic Window', 'Prefix Sums', 'Two Pointers'],
        project: 'Solved 25 curated LeetCode Medium/Hard sliding window interview problems.'
      },
      {
        step: 3,
        title: 'Searching, Sorting & Divide and Conquer',
        duration: '2 Weeks',
        summary: 'Implement Binary Search on values and answer spaces, QuickSelect for Kth element, Merge Sort, and analyze stability and recursion trees.',
        skills: ['Binary Search on Answer', 'QuickSort & QuickSelect', 'Merge Sort', 'Recursion Trees'],
        project: 'Search in Rotated Sorted Array & Aggressive Cows allocation problem implementations.'
      },
      {
        step: 4,
        title: 'Binary Trees, BSTs & Priority Queues (Heaps)',
        duration: '3 Weeks',
        summary: 'Traverse trees iteratively and recursively (BFS/DFS), check BST invariants, lowest common ancestors, and build min/max heaps.',
        skills: ['Level Order Traversal', 'BST Validations', 'Binary Heaps', 'Heap Sort'],
        project: 'Construct Binary Tree from Inorder/Preorder traversals and Top K Frequent Elements solver.'
      },
      {
        step: 5,
        title: 'Graph Algorithms & Shortest Path Finding',
        duration: '3 Weeks',
        summary: 'Model complex networks with adjacency lists, detect cycles with Union-Find (Disjoint Set), topological sort with Kahn’s algorithm, and Dijkstra.',
        skills: ['BFS / DFS Graph', 'Disjoint Set Union (DSU)', 'Dijkstra Algorithm', 'Topological Sort'],
        project: 'Alien Dictionary topological dependency resolver and network delay time calculator.'
      },
      {
        step: 6,
        title: 'Dynamic Programming: 1D, 2D & Memoization',
        duration: '4 Weeks',
        summary: 'Break overlapping subproblems into optimal substructures: 0/1 Knapsack, Longest Common Subsequence (LCS), DP on Grids, and Bitmask DP.',
        skills: ['Memoization vs Tabulation', '0/1 Knapsack Pattern', 'LCS & String DP', 'Space Optimization'],
        project: '30 Classic DP problems solved with both Top-Down memoization and Bottom-Up O(1) space optimizations.'
      }
    ]
  },
  {
    id: 'data-engineering-streaming',
    title: 'Modern Data Engineering & BigQuery Architect',
    category: 'Data & Analytics',
    level: 'Intermediate',
    duration: '6 Months',
    months: 6,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    badge: 'Enterprise Track',
    badgeType: 'blue',
    overview: 'Master petabyte-scale data warehousing in Google BigQuery, distributed batch processing with Apache Spark, real-time event streaming with Pub/Sub, and orchestration with Airflow.',
    skills: ['Google BigQuery', 'SQL Optimization', 'Apache Spark / PySpark', 'Cloud Pub/Sub', 'Apache Airflow', 'dbt (data build tool)'],
    targetRoles: ['Data Engineer', 'Analytics Engineer', 'Big Data Architect'],
    relatedCourseId: 'data-engineering-bigquery',
    relatedCourseTitle: 'Google Cloud Data Engineering: BigQuery, Spark & Pub/Sub',
    milestones: [
      {
        step: 1,
        title: 'Advanced SQL & Data Modeling (Kimball Methodology)',
        duration: '3 Weeks',
        summary: 'Master star and snowflake schemas, slowly changing dimensions (SCD Type 1 & 2), window analytical functions, and CTE optimizations.',
        skills: ['Window Functions', 'Star Schema', 'SCD Type 2', 'Data Normalization'],
        project: 'Designed dimensional warehouse schema with fact and dimension tables for retail telemetry.'
      },
      {
        step: 2,
        title: 'Google BigQuery Architecture & Performance Tuning',
        duration: '4 Weeks',
        summary: 'Configure partition pruning, cluster keys, nested repeated record schemas with STRUCT/ARRAY, and monitor slot compute metrics.',
        skills: ['Partitioning & Clustering', 'Capacitor Columnar Storage', 'Nested & Repeated Fields', 'BI Engine'],
        project: 'Optimized query suite reducing processed bytes by 88% and execution time from 45s to 2.1s.'
      },
      {
        step: 3,
        title: 'Distributed Compute with Apache Spark & PySpark',
        duration: '4 Weeks',
        summary: 'Process millions of rows using Spark DataFrames, broadcast joins, optimize memory partitions, and handle data skews on Dataproc.',
        skills: ['PySpark', 'Spark Execution Plan', 'Broadcast Joins', 'Google Cloud Dataproc'],
        project: 'Distributed PySpark ETL pipeline aggregating 50 million clickstream events daily.'
      },
      {
        step: 4,
        title: 'Real-Time Streaming Pipelines with Pub/Sub & Beam',
        duration: '4 Weeks',
        summary: 'Build event-driven ingestion with Cloud Pub/Sub, process unbounded streaming windows with Apache Beam on Cloud Dataflow.',
        skills: ['Pub/Sub Topics & Subscriptions', 'Apache Beam', 'Sliding & Tumbling Windows', 'Dead-Letter Queues'],
        project: 'Real-time fraud detection pipeline alerting on financial anomalies within 250 milliseconds.'
      },
      {
        step: 5,
        title: 'Data Transformation & Analytics Engineering with dbt',
        duration: '3 Weeks',
        summary: 'Build version-controlled SQL data transformation DAGs with dbt, execute automated data quality tests, and auto-generate schema documentation.',
        skills: ['dbt Core', 'Jinja Templating', 'Data Quality Testing', 'Automated Docs'],
        project: 'Production dbt project with 40 modular transformation models and automated schema assertions.'
      },
      {
        step: 6,
        title: 'Workflow Orchestration with Apache Airflow & Cloud Composer',
        duration: '4 Weeks',
        summary: 'Schedule complex multi-dependency data pipelines with Python DAGs, handle retries, Slack notifications, and SLA monitoring.',
        skills: ['Apache Airflow DAGs', 'Cloud Composer', 'Task Sensors & Operators', 'Pipeline Monitoring'],
        project: 'End-to-end automated warehouse refresh DAG with dependency sensors and automatic incident alerts.'
      }
    ]
  },
  {
    id: 'cybersecurity-cloud-defense',
    title: 'Cybersecurity & Cloud Defense Specialist',
    category: 'Security & Systems',
    level: 'Intermediate to Advanced',
    duration: '5 Months',
    months: 5,
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    badge: 'Zero-Trust Focus',
    badgeType: 'red',
    overview: 'Protect modern cloud infrastructure from advanced persistent threats. Master Google Cloud IAM, BeyondCorp Zero-Trust, VPC Service Controls, cryptographic KMS, and SIEM monitoring.',
    skills: ['Cloud IAM', 'VPC Service Controls', 'Security Command Center', 'KMS Encryption', 'Threat Modeling', 'Incident Response'],
    targetRoles: ['Cloud Security Architect', 'Information Security Analyst', 'SOC Engineer'],
    relatedCourseId: 'cybersecurity-cloud-defense',
    relatedCourseTitle: 'Google Cloud Security, IAM & Zero-Trust Defense',
    milestones: [
      {
        step: 1,
        title: 'Networking Security & Threat Modeling Fundamentals',
        duration: '3 Weeks',
        summary: 'Understand OSI model attack surfaces, packet analysis with Wireshark, STRIDE threat modeling, and firewall perimeter architectures.',
        skills: ['Wireshark', 'STRIDE Framework', 'Stateful Firewalls', 'TLS 1.3 Handshake'],
        project: 'Comprehensive STRIDE threat model and risk assessment report for a fintech cloud architecture.'
      },
      {
        step: 2,
        title: 'Identity & Access Management (IAM) Least Privilege',
        duration: '3 Weeks',
        summary: 'Eliminate permanent elevated credentials using condition-based IAM policies, service account impersonation, and Workload Identity.',
        skills: ['Custom IAM Roles', 'Workload Identity Federation', 'Privileged Access Management', 'Audit Logging'],
        project: 'Automated IAM audit script identifying unused permissions and stale service account keys.'
      },
      {
        step: 3,
        title: 'VPC Service Controls & Perimeter Defense',
        duration: '4 Weeks',
        summary: 'Mitigate data exfiltration attacks by wrapping BigQuery, Cloud Storage, and GKE in secure VPC Service Control perimeters.',
        skills: ['VPC Service Controls', 'Perimeter Bridges', 'Access Context Manager', 'Egress Rules'],
        project: 'Multi-project VPC security perimeter enforcing restricted data egress to authorized IP ranges.'
      },
      {
        step: 4,
        title: 'Cloud Cryptography & Key Management (KMS)',
        duration: '3 Weeks',
        summary: 'Implement Envelope Encryption, manage customer-managed encryption keys (CMEK) with Cloud KMS, and automate key rotation policies.',
        skills: ['Cloud KMS', 'Envelope Encryption', 'Hardware Security Modules (HSM)', 'Secrets Manager'],
        project: 'Zero-knowledge database field-level encryption service with automated quarterly key rotation.'
      },
      {
        step: 5,
        title: 'Threat Detection, SIEM & Security Command Center',
        duration: '4 Weeks',
        summary: 'Detect active intrusions, malware, and cryptocurrency mining using Google Cloud Security Command Center (SCC) and Cloud Audit Logs.',
        skills: ['Security Command Center', 'Cloud SIEM', 'YARA Rules', 'Log Querying (Chronicle)'],
        project: 'Real-time security incident response bot automatically isolating compromised VMs upon SCC alerts.'
      },
      {
        step: 6,
        title: 'Compliance Governance & Penetration Testing',
        duration: '3 Weeks',
        summary: 'Audit infrastructure against SOC 2, ISO 27001, and CIS benchmarks, and perform responsible vulnerability assessments.',
        skills: ['CIS Benchmarks', 'SOC 2 Controls', 'Burp Suite Basics', 'Vulnerability Scanning'],
        project: 'Automated compliance scan producing an executive audit scorecard for a cloud deployment.'
      }
    ]
  },
  {
    id: 'mobile-app-engineer',
    title: 'Mobile Application Engineer (React Native & Flutter)',
    category: 'Mobile Engineering',
    level: 'Beginner to Advanced',
    duration: '4 Months',
    months: 4,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    badge: 'Cross-Platform',
    badgeType: 'blue',
    overview: 'Build silky-smooth 60fps iOS and Android applications from a single codebase. Master React Native, Expo, navigation hierarchies, offline SQLite sync, and App Store submission.',
    skills: ['React Native', 'Expo EAS', 'TypeScript', 'Offline SQLite Sync', 'Mobile UX & Animations', 'App Store / Play Store'],
    targetRoles: ['React Native Developer', 'Mobile Software Engineer', 'iOS / Android App Architect'],
    relatedCourseId: 'fullstack-web-bootcamp',
    relatedCourseTitle: 'Full-Stack Web Development Bootcamp: Modern React & Cloud Run',
    milestones: [
      {
        step: 1,
        title: 'Mobile Architecture & Native Bridge Fundamentals',
        duration: '2 Weeks',
        summary: 'Understand the new React Native architecture (Fabric, TurboModules, JSI), Flexbox mobile layouts, and touch gesture systems.',
        skills: ['React Native Core', 'Flexbox Mobile Layouts', 'Touch Responders', 'SafeArea Handling'],
        project: 'Responsive mobile weather app featuring location-based dynamic backgrounds.'
      },
      {
        step: 2,
        title: 'Navigation Patterns & Screen Transitions',
        duration: '3 Weeks',
        summary: 'Construct nested navigation stacks, tab bars, drawer menus, and fluid shared element transitions with React Navigation v6.',
        skills: ['React Navigation', 'Bottom Tab Navigators', 'Deep Linking', 'Header State'],
        project: 'E-commerce mobile app with category filters and product detail transitions.'
      },
      {
        step: 3,
        title: 'Hardware Sensor APIs & Camera Integration',
        duration: '3 Weeks',
        summary: 'Interact directly with device hardware: high-resolution camera feeds, barcode scanning, GPS geolocation, and accelerometer inputs.',
        skills: ['Expo Camera', 'Location & Maps', 'Haptics & Audio', 'Local File System'],
        project: 'Receipt scanner and expense logger with auto-crop camera and OCR extraction.'
      },
      {
        step: 4,
        title: 'Offline-First Architecture & SQLite Storage',
        duration: '4 Weeks',
        summary: 'Store data locally using SQLite / WatermelonDB, manage conflict resolution, and synchronize silently with cloud servers when online.',
        skills: ['SQLite for Mobile', 'AsyncStorage / MMKV', 'Background Sync', 'Network Status'],
        project: 'Offline-first field inspection app with background sync to a remote cloud database.'
      },
      {
        step: 5,
        title: 'Fluid Animations with React Native Reanimated',
        duration: '3 Weeks',
        summary: 'Build high-performance 60fps UI gestures, pan responders, snap sheets, and spring physics using React Native Reanimated 3.',
        skills: ['Reanimated 3', 'Gesture Handler', 'Interpolations', 'Shared Element Transitions'],
        project: 'Apple Health style interactive daily goals dashboard with fluid spring gestures.'
      },
      {
        step: 6,
        title: 'Production Build Pipelines (EAS) & App Store Release',
        duration: '2 Weeks',
        summary: 'Configure app signing certificates, push notification services (APNs/FCM), OTA updates, and submit builds to Google Play and Apple App Store.',
        skills: ['Expo Application Services (EAS)', 'App Signing', 'Push Notifications', 'OTA Updates'],
        project: 'Configured end-to-end EAS build pipeline generating release APK and TestFlight builds.'
      }
    ]
  },
  {
    id: 'system-design-distributed-systems',
    title: 'System Design & Distributed Scalability',
    category: 'System Design',
    level: 'Advanced',
    duration: '4 Months',
    months: 4,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    badge: 'Senior & Staff Level',
    badgeType: 'green',
    overview: 'Design high-availability systems serving millions of concurrent users. Master distributed caching (Redis), message brokers (Kafka), database sharding, CAP theorem, and rate limiters.',
    skills: ['Distributed Systems', 'CAP Theorem & PACELC', 'Redis Caching Patterns', 'Apache Kafka / PubSub', 'Database Sharding', 'Microservices'],
    targetRoles: ['Senior Software Engineer', 'Staff Systems Architect', 'Engineering Manager'],
    relatedCourseId: 'cloud-computing-devops',
    relatedCourseTitle: 'Google Cloud Infrastructure & DevOps Specialization',
    milestones: [
      {
        step: 1,
        title: 'Foundations of Scalability: Latency, Throughput & CAP',
        duration: '2 Weeks',
        summary: 'Learn latency numbers every programmer should know, vertical vs horizontal scaling, CAP Theorem, PACELC, and ACID vs BASE trade-offs.',
        skills: ['CAP Theorem', 'Latency Calculations', 'Load Balancers (L4 vs L7)', 'Consistent Hashing'],
        project: 'Calculated system throughput and capacity blueprint for a 50M DAU URL shortener.'
      },
      {
        step: 2,
        title: 'Distributed Caching & Eviction Policies',
        duration: '2 Weeks',
        summary: 'Implement Cache-Aside, Write-Through, Write-Behind strategies with Redis. Mitigate cache stampede, penetration, and avalanche failures.',
        skills: ['Redis Cluster', 'Cache Eviction (LRU/LFU)', 'Cache Stampede Mitigation', 'Bloom Filters'],
        project: 'Distributed rate limiter using Redis sliding-window log algorithm.'
      },
      {
        step: 3,
        title: 'Database Sharding, Replication & Concurrency',
        duration: '3 Weeks',
        summary: 'Scale relational and NoSQL databases using read replicas, range-based and hash-based sharding, distributed consensus (Raft/Paxos), and MVCC.',
        skills: ['Database Sharding', 'Replication Lag', 'Distributed Locks (Redlock)', 'Raft Consensus'],
        project: 'Global multi-region database replication and failover architecture design.'
      },
      {
        step: 4,
        title: 'Event-Driven Architectures & Message Brokers',
        duration: '3 Weeks',
        summary: 'Decouple microservices using Kafka partition offsets, consumer groups, idempotency keys, and the transactional outbox pattern.',
        skills: ['Apache Kafka', 'Transactional Outbox', 'Idempotent Consumers', 'Dead Letter Queues'],
        project: 'Distributed ride-sharing dispatch system event flow handling driver-rider matchmaking.'
      },
      {
        step: 5,
        title: 'High-Scale Real-Time Systems: WebSockets & CDNs',
        duration: '3 Weeks',
        summary: 'Architect video streaming architectures (HLS/DASH), edge caching with Cloudflare/Google Cloud CDN, and connection pools for 1M WebSockets.',
        skills: ['CDN Edge Caching', 'WebSocket Gateways', 'SSE (Server-Sent Events)', 'HTTP/3 & QUIC'],
        project: 'Full architectural blueprint of a YouTube/Netflix video transcoding and streaming system.'
      },
      {
        step: 6,
        title: 'FAANG System Design Case Studies & Mock Interviews',
        duration: '3 Weeks',
        summary: 'Practice live architectural whiteboarding: Design Twitter/X timeline, Uber geospatial tracking, WhatsApp messenger, and Google Drive sync.',
        skills: ['System Design Whiteboarding', 'Bottleneck Identification', 'SLAs & Fault Tolerance', 'Cost Estimation'],
        project: 'Complete end-to-end design doc and visual diagram for an enterprise collaborative document editor.'
      }
    ]
  }
]

export const ROADMAP_CATEGORIES = [
  'All Tracks',
  'Cloud & DevOps',
  'AI & Machine Learning',
  'Web Development',
  'DSA & Problem Solving',
  'Data & Analytics',
  'Security & Systems',
  'Mobile Engineering',
  'System Design'
]

export const ROADMAP_DURATIONS = [
  'All Durations',
  'Under 5 Months',
  '5 - 6 Months',
  '6+ Months'
]
