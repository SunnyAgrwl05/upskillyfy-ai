export const RESOURCES_DATA = [
  {
    id: 'gcp-ace-cheatsheet',
    title: 'Google Cloud Associate Cloud Engineer (ACE) Architecture & Exam Cram',
    description: 'Visual decision trees, gcloud CLI syntax tables, and IAM security matrices covering Compute Engine, GKE, VPC peering, and Cloud Storage.',
    category: 'Cloud & DevOps',
    type: 'Cheat Sheet',
    badge: 'Official Aligned',
    badgeType: 'blue',
    fileFormat: 'PDF Guide',
    fileExt: 'PDF',
    fileSize: '4.8 MB',
    pages: '42 Pages',
    downloadsCount: '28,400+',
    rating: 4.96,
    author: 'Upskillyfy Cloud Engineering Guild',
    updatedAt: 'October 2025',
    tags: ['Google Cloud', 'ACE Exam', 'GKE', 'IAM', 'VPC Networking'],
    previewSummary: 'Engineered for candidates preparing for the Google Cloud Associate Cloud Engineer credential and junior SREs. This visual handbook condenses hundreds of pages of official documentation into high-yield architecture decision trees, gcloud CLI syntax tables, and service comparison matrices.',
    sampleSnippet: `# Essential gcloud CLI syntax cheatsheet
# 1. Project & Account Context
gcloud auth login
gcloud config set project [PROJECT_ID]
gcloud config set compute/zone us-central1-a

# 2. Compute Engine - Create preemptible VM with custom service account
gcloud compute instances create prod-web-vm \\
    --zone=us-central1-a \\
    --machine-type=e2-medium \\
    --service-account=sa-web@my-project.iam.gserviceaccount.com \\
    --scopes=cloud-platform \\
    --tags=http-server,https-server

# 3. GKE - Connect kubectl to regional cluster
gcloud container clusters get-credentials prod-cluster --region us-central1`,
    keyHighlights: [
      'Visual decision flowcharts: When to choose Compute Engine vs Cloud Run vs GKE',
      'Top 100 gcloud CLI commands with copy-paste flags and real-world examples',
      'VPC Service Controls, Cloud NAT, and Least-Privilege IAM role mapping',
      'Self-assessment practice checklist containing 50 high-frequency exam scenarios'
    ],
    tableOfContents: [
      'Section 1: Google Cloud Resource Hierarchy (Org > Folder > Project)',
      'Section 2: Compute Engine, Autoscaling & Custom Machine Types',
      'Section 3: Google Kubernetes Engine (GKE) Cluster Architecture & Node Pools',
      'Section 4: Cloud Storage Classes, Lifecycle Rules & Signed URLs',
      'Section 5: Virtual Private Cloud (VPC), Subnets, Firewall Rules & Cloud VPN',
      'Section 6: Cloud IAM Roles (Primitive vs Predefined vs Custom)',
      'Section 7: Cloud Monitoring, Cloud Logging, and Alert Policies'
    ],
    downloadFileName: 'Upskillyfy_GCP_ACE_CheatSheet_v2025.pdf'
  },
  {
    id: 'dsa-450-interview-roadmap',
    title: 'Curated 450 DSA Sheet & Algorithmic Pattern Handbook',
    description: 'The definitive coding interview roadmap: 450 topic-wise problems with visual approaches, time complexity proofs, and C++/Java/Python snippets.',
    category: 'DSA & Problem Solving',
    type: 'Question Bank',
    badge: 'Placement Essential',
    badgeType: 'purple',
    fileFormat: 'Interactive Doc',
    fileExt: 'DOC',
    fileSize: '8.2 MB',
    pages: '96 Pages',
    downloadsCount: '45,200+',
    rating: 4.98,
    author: 'FAANG Interviewers & CP Leads',
    updatedAt: 'September 2025',
    tags: ['DSA', 'LeetCode', 'Dynamic Programming', 'Trees & Graphs', 'FAANG'],
    previewSummary: 'Stop memorizing arbitrary code solutions. This sheet breaks interview challenges into 14 universal patterns: Sliding Window, Fast & Slow Pointers, Monotonic Stacks, In-place Reversal, Top K Elements, and 0/1 Knapsack variants. Includes curated links and test case edge cases.',
    sampleSnippet: `// Universal Sliding Window Template (C++20)
int minSubArrayLen(int target, vector<int>& nums) {
    int left = 0, currentSum = 0;
    int minLength = INT_MAX;
    
    for (int right = 0; right < nums.size(); right++) {
        currentSum += nums[right]; // Expand window
        
        while (currentSum >= target) { // Contract window
            minLength = min(minLength, right - left + 1);
            currentSum -= nums[left++];
        }
    }
    return (minLength == INT_MAX) ? 0 : minLength;
}`,
    keyHighlights: [
      '450 curated problems ordered from foundational to tier-1 MNC difficulty',
      'Dry run visual tables for Tree DFS/BFS and Graph topological sorting',
      'Space & Time complexity cheat tables for quick interview revision',
      'Multi-language solutions in Python 3, Java 17, and C++20'
    ],
    tableOfContents: [
      'Pattern 1: Two Pointers & Two-Sum Variants',
      'Pattern 2: Sliding Window & Substring Problems',
      'Pattern 3: Fast & Slow Pointers (Cycle Detection)',
      'Pattern 4: Monotonic Stack & Next Greater Element',
      'Pattern 5: Binary Trees, Binary Search Trees & LCA',
      'Pattern 6: Graph Traversals (Dijkstra, Bellman-Ford, Prim)',
      'Pattern 7: Dynamic Programming (1D, 2D, Grid Paths, Subsequences)'
    ],
    downloadFileName: 'Upskillyfy_DSA_450_Master_Handbook.pdf'
  },
  {
    id: 'system-design-primer-faang',
    title: 'Modern System Design Blueprint & Architecture Case Studies',
    description: 'Real-world architectures of high-scale systems: URL shorteners, distributed caching, rate limiters, payment ledgers, and video streaming.',
    category: 'System Design',
    type: 'Architecture Blueprint',
    badge: 'Staff Engineer Pick',
    badgeType: 'green',
    fileFormat: 'Vector PDF',
    fileExt: 'PDF',
    fileSize: '14.5 MB',
    pages: '64 Pages',
    downloadsCount: '31,800+',
    rating: 4.94,
    author: 'Distributed Systems Architect (Ex-Netflix)',
    updatedAt: 'October 2025',
    tags: ['System Design', 'HLD', 'Redis', 'Kafka', 'Microservices'],
    previewSummary: 'A structured, end-to-end framework for acing High-Level System Design (HLD) interview rounds. Covers requirement estimation (QPS, bandwidth, storage), database selection (SQL vs NoSQL vs NewSQL), caching layers, message queues, and consensus algorithms.',
    sampleSnippet: `// Back-of-the-Envelope Latency Numbers to Memorize:
L1 cache reference:                     0.5 ns
Branch mispredict:                      5   ns
L2 cache reference:                     7   ns
Mutex lock/unlock:                     25   ns
Main memory reference:                100   ns
Compress 1K bytes with Zippy:       3,000   ns
Send 2K bytes over 1 Gbps network: 20,000   ns
Read 1 MB sequentially from memory:250,000  ns
Round trip within same datacenter: 500,000  ns
Read 1 MB sequentially from SSD: 1,000,000  ns
Disk seek:                      10,000,000  ns
Send packet CA -> Netherlands: 150,000,000  ns`,
    keyHighlights: [
      'Step-by-step 45-minute interview delivery framework',
      'Full architectural diagrams for YouTube, TinyURL, and WhatsApp chat engines',
      'CAP Theorem, PACELC, and Eventual Consistency trade-off matrices',
      'Horizontal scaling best practices: Sharding, Consistent Hashing & CDNs'
    ],
    tableOfContents: [
      'Chapter 1: The 4-Step System Design Interview Framework',
      'Chapter 2: Back-of-the-Envelope Math (Latency & Bandwidth Numbers)',
      'Chapter 3: Load Balancing (L4 vs L7, NGINX, HAProxy, Envoy)',
      'Chapter 4: Caching Strategies (Cache-Aside, Write-Through, Write-Back)',
      'Chapter 5: Message Queues & Event Streaming (Kafka vs RabbitMQ)',
      'Chapter 6: Case Study: Global Distributed Rate Limiter',
      'Chapter 7: Case Study: Real-Time Collaborative Document Editor'
    ],
    downloadFileName: 'Upskillyfy_System_Design_Blueprint_2025.pdf'
  },
  {
    id: 'fullstack-react-node-handbook',
    title: 'Production Full-Stack Web Architecture Handbook (React 19 & Node.js)',
    description: 'Clean architecture guidelines for enterprise web apps: JWT security, TanStack Query, Zustand, PostgreSQL schemas, and Dockerized deployments.',
    category: 'CSE & IT',
    type: 'Lab Workbook',
    badge: 'Hands-on',
    badgeType: 'amber',
    fileFormat: 'Code Guide',
    fileExt: 'CODE',
    fileSize: '6.5 MB',
    pages: '58 Pages',
    downloadsCount: '22,700+',
    rating: 4.89,
    author: 'Upskillyfy Full-Stack Mentorship Guild',
    updatedAt: 'August 2025',
    tags: ['React 19', 'Node.js', 'PostgreSQL', 'REST & GraphQL', 'Docker'],
    previewSummary: 'Build web applications that stand up to real production workloads. Covers server-side and client-side best practices, database indexing, connection pooling, automated API documentation with Swagger/OpenAPI, and automated CI/CD pipeline configs.',
    sampleSnippet: `// Secure Production Cookie Configuration (Express.js)
res.cookie('refreshToken', token, {
  httpOnly: true,                         // Prevent XSS read access
  secure: process.env.NODE_ENV === 'production', // Send over HTTPS only
  sameSite: 'strict',                     // Mitigate CSRF attacks
  maxAge: 7 * 24 * 60 * 60 * 1000,       // 7 days expiration
  path: '/api/auth/refresh'               // Restrict cookie to refresh endpoint
});`,
    keyHighlights: [
      'Production folder structures for enterprise React + Node.js monoliths & monorepos',
      'Secure authentication patterns: HttpOnly cookies, refresh token rotation & CSRF protection',
      'Database migration strategies with Prisma and raw SQL Knex/Drizzle',
      'Zero-downtime deployment script with Docker Compose and NGINX SSL reverse proxy'
    ],
    tableOfContents: [
      'Module 1: React 19 Architecture, Hooks & Server Actions',
      'Module 2: State Management: When to choose Zustand over Context/Redux',
      'Module 3: Secure Express/Fastify API Gateway & Input Validation (Zod)',
      'Module 4: Relational Database Design, Normalization & Indexing in PostgreSQL',
      'Module 5: Real-Time Communication with WebSockets (Socket.io & ws)',
      'Module 6: Containerization with Multi-Stage Dockerfiles'
    ],
    downloadFileName: 'Upskillyfy_FullStack_React_Node_Handbook.pdf'
  },
  {
    id: 'genai-prompt-engineering-guide',
    title: 'Generative AI & Gemini API Architecture Reference Manual',
    description: 'Enterprise guide to building LLM applications: Prompt engineering, Function Calling with Gemini 1.5 Pro, Vector databases, and RAG pipelines.',
    category: 'AI & Data Science',
    type: 'Lab Workbook',
    badge: 'Trending 2025',
    badgeType: 'blue',
    fileFormat: 'PDF Guide',
    fileExt: 'PDF',
    fileSize: '7.1 MB',
    pages: '52 Pages',
    downloadsCount: '34,900+',
    rating: 4.97,
    author: 'Google Cloud Certified ML Guild',
    updatedAt: 'October 2025',
    tags: ['Generative AI', 'Gemini API', 'LangChain', 'RAG', 'Vector DB'],
    previewSummary: 'A hands-on manual for software engineers integrating Generative AI into web services. Master chain-of-thought prompting, few-shot conditioning, structured JSON outputs, semantic chunking for RAG, and Vertex AI embedding models.',
    sampleSnippet: `// Gemini 1.5 Pro Structured Tool Calling in Python
import google.generativeai as genai

db_tool = {
    "function_declarations": [{
        "name": "lookup_user_orders",
        "description": "Fetch orders by user ID and date range",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {"type": "STRING", "description": "Customer UUID"},
                "limit": {"type": "INTEGER", "description": "Max orders (1-50)"}
            },
            "required": ["user_id"]
        }
    }]
}
model = genai.GenerativeModel('gemini-1.5-pro', tools=[db_tool])`,
    keyHighlights: [
      'Proven prompt templates for code generation, summarization, and data extraction',
      'Production Retrieval-Augmented Generation (RAG) architecture diagram & code',
      'Function calling and Tool Use with the Google Gen AI SDK',
      'Cost optimization: Context caching, token budget management, and latency reduction'
    ],
    tableOfContents: [
      'Chapter 1: LLM Foundations, Attention Mechanics & Context Windows',
      'Chapter 2: Advanced Prompt Engineering (CoT, ReAct, System Instructions)',
      'Chapter 3: Connecting Gemini to APIs with Tool & Function Calling',
      'Chapter 4: Vector Embeddings, Chunking Strategies & Vector DBs (Chroma, Pinecone)',
      'Chapter 5: Guardrails, Toxicity Filtering & Output Validation with Pydantic',
      'Chapter 6: Evaluating LLM Outputs with RAGAS metrics'
    ],
    downloadFileName: 'Upskillyfy_GenAI_Gemini_Reference_Manual.pdf'
  },
  {
    id: 'core-engg-iot-embedded-guide',
    title: 'Embedded Systems & IoT Cloud Architecture Reference (ECE & EE)',
    description: 'Hardware-to-cloud blueprint: ESP32, MQTT protocols, FreeRTOS basics, and Google Cloud IoT Core / PubSub edge data telemetry.',
    category: 'Core Engineering (ECE / ME / Civil)',
    type: 'Architecture Blueprint',
    badge: 'Core Specialist',
    badgeType: 'amber',
    fileFormat: 'Schematic PDF',
    fileExt: 'SCH',
    fileSize: '9.4 MB',
    pages: '48 Pages',
    downloadsCount: '14,100+',
    rating: 4.88,
    author: 'Hardware & IoT Faculty',
    updatedAt: 'August 2025',
    tags: ['Embedded Systems', 'ESP32', 'FreeRTOS', 'MQTT', 'IoT Telemetry'],
    previewSummary: 'Bridges the gap between hardware engineering and cloud computing for ECE, EE, and Mechatronics students. Covers circuit schematics, microcontroller programming in Embedded C++, sensor interfacing, and sending telemetry over MQTT to cloud dashboards.',
    sampleSnippet: `// FreeRTOS Telemetry Queue Producer Task (C++)
void vSensorTask(void *pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  const TickType_t xFrequency = pdMS_TO_TICKS(1000); // 1 Hz sample rate

  for(;;) {
    SensorData_t sample;
    sample.temperature = readBME280Temperature();
    sample.timestamp = getEpochMillis();

    // Push into thread-safe FreeRTOS queue without blocking
    xQueueSend(xTelemetryQueue, &sample, (TickType_t) 0);
    vTaskDelayUntil(&xLastWakeTime, xFrequency);
  }
}`,
    keyHighlights: [
      'Complete pinout diagrams and communication bus comparisons (I2C, SPI, UART, CAN)',
      'RTOS task scheduling, semaphores, and memory optimization on microcontrollers',
      'Secure TLS communication from edge devices to Google Cloud Pub/Sub',
      'Live industrial automation case study: Predictive motor temperature monitoring'
    ],
    tableOfContents: [
      'Section 1: Microcontroller Architectures: ARM Cortex-M vs Xtensa ESP32',
      'Section 2: Embedded C/C++ Best Practices and Interrupt Service Routines (ISRs)',
      'Section 3: FreeRTOS Fundamentals: Queues, Mutexes, and Preemptive Tasks',
      'Section 4: Sensor Interfacing: ADC resolution, noise filtering, calibration',
      'Section 5: Wireless Connectivity: Wi-Fi, BLE 5.0, LoRaWAN, and Zigbee',
      'Section 6: Cloud Ingestion with MQTT, TLS 1.3, and Cloud Functions'
    ],
    downloadFileName: 'Upskillyfy_IoT_Embedded_Systems_Blueprint.pdf'
  },
  {
    id: 'faang-placement-interview-kit',
    title: 'Top 100 Technical & Behavioral Placement Interview Kit',
    description: 'The complete placement toolkit: Resume screening checklist, STAR method behavioral answers, and OS/DBMS/Networking quick-revision notes.',
    category: 'Placements & Career',
    type: 'Question Bank',
    badge: 'Campus Favorite',
    badgeType: 'green',
    fileFormat: 'Interview Kit',
    fileExt: 'KIT',
    fileSize: '5.2 MB',
    pages: '72 Pages',
    downloadsCount: '58,600+',
    rating: 4.99,
    author: 'Placement & Career Mentors',
    updatedAt: 'October 2025',
    tags: ['Placements', 'HR Interview', 'STAR Method', 'OS & DBMS', 'Resume Guide'],
    previewSummary: 'Crafted for final-year college students and early-career software developers targeting on-campus and off-campus placements. Includes high-yield revision summaries of Operating Systems (Deadlocks, Paging, Virtual Memory), DBMS (ACID, Normalization), Computer Networks (TCP 3-way handshake, DNS), and HR behavioral question scripts.',
    sampleSnippet: `// STAR Behavioral Response Blueprint: "Describe a Technical Disagreement"
S (Situation): In our final year microservices project, the team was split between MongoDB vs PostgreSQL for financial ledger entries.
T (Task): As backend lead, I had to evaluate data integrity guarantees against delivery timelines.
A (Action): I benchmarked write-heavy workloads, presented ACID compliance failure risks of eventual consistency, and set up Prisma ORM to simplify migrations.
R (Result): We delivered on time with 0 double-entry billing inconsistencies during campus evaluations.`,
    keyHighlights: [
      'Top 50 Operating System & Database questions frequently asked in tier-1 MNC technical rounds',
      '20 STAR-method behavioral response scripts for leadership, failure, and conflict questions',
      'ATS-proof resume template layout with power action verbs and metric guidelines',
      'Mock interview scoring rubric used by hiring managers at top tech firms'
    ],
    tableOfContents: [
      'Part 1: Core CS Revision: Operating Systems Essentials',
      'Part 2: Core CS Revision: Database Management Systems & SQL Queries',
      'Part 3: Core CS Revision: Computer Networks & HTTP/HTTPS Protocols',
      'Part 4: Object-Oriented Programming (OOP) Principles & Design Patterns',
      'Part 5: Behavioral & HR Rounds: Mastering the STAR Framework',
      'Part 6: Cold Outreach & LinkedIn Networking Scripts that Get Referrals'
    ],
    downloadFileName: 'Upskillyfy_Placement_Interview_Master_Kit.pdf'
  },
  {
    id: 'kubernetes-production-poster',
    title: 'Kubernetes Architecture Poster & Pod Lifecycle Cheat Sheet',
    description: 'High-resolution printable architecture poster detailing Kubelet, API Server, etcd, Ingress controllers, and Pod termination lifecycles.',
    category: 'Cloud & DevOps',
    type: 'Architecture Blueprint',
    badge: 'High-Res Poster',
    badgeType: 'blue',
    fileFormat: 'Printable Vector',
    fileExt: 'SVG',
    fileSize: '11.8 MB',
    pages: 'Infographic',
    downloadsCount: '19,300+',
    rating: 4.93,
    author: 'CNCF Ambassadors & SREs',
    updatedAt: 'July 2025',
    tags: ['Kubernetes', 'GKE', 'DevOps', 'Microservices', 'Containers'],
    previewSummary: 'A visual masterpiece for DevOps engineers and SREs. Hang it in your workstation or keep it open on your monitor during system debugging. Clarifies control plane vs worker node interactions, probe checks (Liveness, Readiness, Startup), and Helm chart packaging structure.',
    sampleSnippet: `# Kubernetes Graceful Pod Termination Flow
# 1. User executes 'kubectl delete pod'
# 2. Pod marked 'Terminating', removed from Service endpoints
# 3. preStop hook executes (if configured in deployment spec)
# 4. SIGTERM signal sent to container process (PID 1)
# 5. Kubelet waits up to terminationGracePeriodSeconds (default: 30s)
# 6. If process still running after timeout: SIGKILL sent forcefully`,
    keyHighlights: [
      'Complete end-to-end Pod state transition flow: Pending, ContainerCreating, Running, CrashLoopBackOff',
      'Network policy ingress and egress rule visual guide',
      'Storage volumes: PersistentVolume (PV), PersistentVolumeClaim (PVC), and CSI drivers',
      'Print-ready 300 DPI high resolution vector artwork'
    ],
    tableOfContents: [
      'Component 1: Control Plane Components (kube-apiserver, etcd, kube-scheduler, kube-controller-manager)',
      'Component 2: Worker Node Components (kubelet, kube-proxy, container runtime)',
      'Component 3: Networking Model (ClusterIP, NodePort, LoadBalancer, Ingress)',
      'Component 4: Pod Lifecycle & Hook Execution Order',
      'Component 5: ConfigMaps, Secrets & RBAC ServiceAccounts'
    ],
    downloadFileName: 'Upskillyfy_Kubernetes_Architecture_Infographic.pdf'
  }
]
