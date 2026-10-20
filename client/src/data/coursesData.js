export const COURSES_DATA = [
  {
    id: 'cloud-computing-devops',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    title: 'Google Cloud Infrastructure & DevOps Specialization',
    subtitle: 'Master GCP compute, networking, Kubernetes, CI/CD pipelines, and infrastructure as code with Terraform.',
    category: 'Cloud & DevOps',
    badge: 'Google Cloud Aligned',
    badgeType: 'blue',
    level: 'Intermediate',
    duration: '8 Weeks · 42 Hours',
    estimatedHours: 42,
    rating: 4.9,
    reviewsCount: 2840,
    enrolledCount: '18,500+',
    instructor: {
      name: 'Priya Sharma & Google Cloud Certified Mentors',
      role: 'Principal Cloud Architect & DevOps Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      bio: 'Ex-Google Cloud Partner engineer with 10+ years architecting multi-region resilient infrastructures.'
    },
    skills: ['Google Cloud (GCP)', 'Compute Engine & GKE', 'Terraform', 'Docker', 'Kubernetes', 'Cloud Build CI/CD', 'Cloud Monitoring'],
    prerequisites: ['Basic Linux command-line understanding', 'Familiarity with any programming language'],
    overview: 'This comprehensive specialization equips engineers and students with practical, production-ready cloud engineering skills. Designed in alignment with Google Cloud Professional Cloud Architect and DevOps Engineer competencies, you will build live cloud environments, automate deployments, containerize applications, and manage resilient microservices on Kubernetes.',
    whatYouWillLearn: [
      'Architect robust, scalable infrastructure on Google Cloud Platform',
      'Containerize microservices with Docker and orchestrate them on Google Kubernetes Engine (GKE)',
      'Automate deployments using Cloud Build, Artifact Registry, and GitOps',
      'Manage Infrastructure as Code using production Terraform patterns',
      'Configure Cloud IAM, VPC firewalls, and least-privilege security controls',
      'Implement real-time alerting, logging with Cloud Operations (formerly Stackdriver)'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Foundations of Google Cloud Platform & Virtualization',
        duration: '2h 15m',
        lessons: [
          {
            id: 'gcp-101',
            title: 'Welcome & Navigating the Google Cloud Console',
            duration: '12:40',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            summary: 'Get an architectural overview of Google Cloud global infrastructure: regions, zones, network edge points of presence, and how resource hierarchy (Organizations, Folders, Projects) functions.',
            keyTakeaways: [
              'Projects are the core organizational entity for Google Cloud resources and billing.',
              'Google Cloud uses global VPC networks across all geographic regions.',
              'Cloud Shell provides a pre-authenticated Debian-based VM inside your browser.'
            ],
            codeSnippet: `# Initialize Google Cloud CLI and verify authentication
gcloud auth login
gcloud config set project upskillyfy-cloud-demo
gcloud compute zones list --filter="region:us-central1"`,
            resources: [
              { name: 'GCP Hierarchy Architecture Sheet.pdf', size: '1.8 MB', type: 'doc' },
              { name: 'Cloud SDK Command Cheat Sheet.md', size: '420 KB', type: 'code' }
            ],
            quiz: {
              question: 'Which entity in Google Cloud is the fundamental container for billing, permissions, and APIs?',
              options: ['Region', 'Project', 'Virtual Machine', 'Bucket'],
              correctIndex: 1,
              explanation: 'In Google Cloud, all resources belong to a Project, which acts as the boundary for IAM, billing, and API enablement.'
            }
          },
          {
            id: 'gcp-102',
            title: 'Compute Engine: Creating and Configuring Compute Instances',
            duration: '18:15',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            summary: 'Deep dive into Compute Engine VMs, machine families (General Purpose, Compute-Optimized, Memory-Optimized), metadata startup scripts, and custom service accounts.',
            keyTakeaways: [
              'Startup scripts allow automated configuration upon VM boot.',
              'Always attach dedicated Service Accounts with minimal IAM roles rather than default compute accounts.',
              'Preemptible / Spot VMs can reduce compute costs by up to 91% for batch workloads.'
            ],
            codeSnippet: `# Provision a custom N2 VM with startup script
gcloud compute instances create web-prod-01 \\
    --zone=us-central1-a \\
    --machine-type=e2-medium \\
    --image-family=debian-12 \\
    --image-project=debian-cloud \\
    --metadata=startup-script='#! /bin/bash
    apt-get update && apt-get install -y nginx
    echo "<h1>Upskillyfy Cloud Node Online</h1>" > /var/www/html/index.html'`,
            resources: [
              { name: 'Compute Engine Sizing Matrix.pdf', size: '2.1 MB', type: 'doc' }
            ],
            quiz: {
              question: 'What is the most cost-effective VM type for fault-tolerant batch computing in GCP?',
              options: ['Confidential VMs', 'Spot / Preemptible VMs', 'High-Memory M2 Instances', 'Shielded VMs'],
              correctIndex: 1,
              explanation: 'Spot VMs provide unused Compute Engine capacity at deep discounts (60-91%) and can be reclaimed by Google with a 30-second notice.'
            }
          },
          {
            id: 'gcp-103',
            title: 'Hands-on Lab: VPC Networks, Subnets & Firewalls',
            duration: '25:00',
            type: 'lab',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            summary: 'Build a custom VPC with isolated private subnets, Cloud NAT gateway for outbound Internet access, and stateful firewall rules restricting port 22/80/443.',
            keyTakeaways: [
              'Default VPC is insecure for production; always create custom mode VPCs.',
              'Cloud NAT grants private instances outbound internet access without exposing external public IPs.',
              'Firewall rules apply by network tags or service accounts.'
            ],
            codeSnippet: `# Create custom VPC network without default subnets
gcloud compute networks create prod-vpc --subnet-mode=custom
gcloud compute networks subnets create prod-subnet-us-east \\
    --network=prod-vpc \\
    --region=us-east1 \\
    --range=10.0.1.0/24`,
            resources: [
              { name: 'Zero-Trust VPC Security Guide.pdf', size: '3.4 MB', type: 'doc' }
            ]
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Containerization with Docker & Google Kubernetes Engine (GKE)',
        duration: '3h 10m',
        lessons: [
          {
            id: 'gcp-201',
            title: 'Modern Docker Packaging & Multi-Stage Builds',
            duration: '16:50',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            summary: 'Learn best practices for writing minimal, secure Dockerfiles using multi-stage builds, non-root users, and vulnerability scanning with Artifact Registry.',
            keyTakeaways: [
              'Multi-stage builds eliminate compiler and build tool bloat from the final production image.',
              'Always run containers with non-root security contexts.',
              'Google Artifact Registry caches and signs container artifacts securely.'
            ],
            codeSnippet: `# Production multi-stage Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
USER node
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]`,
            resources: [
              { name: 'Container Security Checklist.pdf', size: '1.2 MB', type: 'doc' }
            ],
            quiz: {
              question: 'Why should multi-stage Docker builds be used in production applications?',
              options: [
                'To make containers run with root privileges',
                'To drastically reduce image size and attack surface by leaving build tools behind',
                'To bypass Google Artifact Registry checks',
                'To disable caching during image compilation'
              ],
              correctIndex: 1,
              explanation: 'Multi-stage builds separate the compile environment from runtime, producing tiny, lean, secure images.'
            }
          },
          {
            id: 'gcp-202',
            title: 'GKE Autopilot: Deploying Production Microservices',
            duration: '22:10',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            summary: 'Deploy applications onto GKE Autopilot where node management, security hardening, and autoscaling are fully managed by Google Cloud according to SRE best practices.',
            keyTakeaways: [
              'GKE Autopilot optimizes pod density and eliminates node maintenance overhead.',
              'Deployments, Services (LoadBalancer / ClusterIP), and Horizontal Pod Autoscalers (HPA).',
              'Ingress with Google-managed SSL certificates.'
            ],
            codeSnippet: `# Deploy to GKE using kubectl
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    metadata:
      labels:
        app: api-service
    spec:
      containers:
      - name: api
        image: us-docker.pkg.dev/upskillyfy-cloud/apps/api:v1.0.0
        ports:
        - containerPort: 8080`,
            resources: [
              { name: 'GKE Production Manifests.zip', size: '840 KB', type: 'code' }
            ]
          }
        ]
      },
      {
        id: 'mod-3',
        title: 'Module 3: Infrastructure as Code (IaC) with Terraform & CI/CD',
        duration: '2h 45m',
        lessons: [
          {
            id: 'gcp-301',
            title: 'Declarative GCP Infrastructure with Terraform',
            duration: '19:30',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            summary: 'Master Terraform state management on Cloud Storage with state locking, variable files, and modular infrastructure definitions for dev/staging/prod.',
            keyTakeaways: [
              'Store tfstate in a versioned Google Cloud Storage bucket with KMS encryption.',
              'Never hardcode project IDs or credentials into .tf source files.',
              'Use terraform plan output in pull request reviews before merging.'
            ],
            codeSnippet: `# main.tf
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "upskillyfy-tfstate-prod"
    prefix = "terraform/state"
  }
}`,
            resources: [
              { name: 'Terraform Production Modules.zip', size: '1.5 MB', type: 'code' }
            ]
          },
          {
            id: 'gcp-302',
            title: 'Automated CI/CD Pipelines with Cloud Build',
            duration: '24:15',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            summary: 'Build a continuous integration and deployment pipeline triggered on GitHub push that runs automated tests, builds container images, and deploys to GKE.',
            keyTakeaways: [
              'Cloud Build executes steps in fast, parallel containerized builders.',
              'Artifacts are automatically scanned for CVEs before rollout.',
              'Canary releases prevent outages by directing 10% traffic first.'
            ],
            codeSnippet: `# cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/npm'
  args: ['test']
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'us-docker.pkg.dev/$PROJECT_ID/apps/web:$COMMIT_SHA', '.']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'us-docker.pkg.dev/$PROJECT_ID/apps/web:$COMMIT_SHA']`,
            resources: [
              { name: 'Cloud Build Production Pipeline.yaml', size: '120 KB', type: 'code' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ai-ml-gemini',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    title: 'Generative AI & LLM Solutions with Gemini & Vertex AI',
    subtitle: 'Build production-ready AI applications, multi-modal agents, RAG systems, and function calling pipelines on Google Cloud.',
    category: 'AI & Machine Learning',
    badge: 'Trending & In Demand',
    badgeType: 'green',
    level: 'Intermediate → Advanced',
    duration: '6 Weeks · 36 Hours',
    estimatedHours: 36,
    rating: 4.95,
    reviewsCount: 3120,
    enrolledCount: '24,800+',
    instructor: {
      name: 'Dr. Aris Thorne & AI Research Team',
      role: 'Staff Machine Learning Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      bio: 'Author and research mentor specializing in LLM alignment, multimodal embeddings, and agentic workflows.'
    },
    skills: ['Google Gemini 1.5 Pro/Flash', 'Vertex AI', 'LangChain', 'Vector Search & Embeddings', 'RAG Pipelines', 'Function Calling & Tools', 'Python'],
    prerequisites: ['Proficiency with Python', 'Understanding of REST APIs and JSON data handling'],
    overview: 'Generative AI is transforming software engineering. This course dives straight into Google Cloud Vertex AI and Gemini APIs. You will learn to construct context-aware AI copilots, deploy high-speed Retrieval-Augmented Generation (RAG) with vector databases, connect LLMs to real-world SQL databases and external APIs via function calling, and evaluate model performance.',
    whatYouWillLearn: [
      'Leverage Gemini 1.5 Pro with its massive 1M+ token context window for long-document analysis',
      'Implement Vector Search on Vertex AI with text-embedding-004',
      'Architect production RAG systems with hybrid keyword + semantic search',
      'Build autonomous agents with function calling and tool execution',
      'Prevent prompt injections and enforce safety filters and grounded outputs'
    ],
    modules: [
      {
        id: 'mod-ai-1',
        title: 'Module 1: The Gemini Ecosystem & Prompt Engineering Architecture',
        duration: '1h 55m',
        lessons: [
          {
            id: 'gemini-101',
            title: 'Getting Started with Google GenAI SDK & Gemini Models',
            duration: '15:20',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            summary: 'Explore Gemini 1.5 Flash vs Pro, multimodal inputs (images, audio, video, PDF), system instructions, temperature, and top-p tuning.',
            keyTakeaways: [
              'Gemini 1.5 Flash is tuned for sub-second latency and low-cost high-volume tasks.',
              'Gemini 1.5 Pro handles complex multi-step reasoning and massive multi-modal documents.',
              'System instructions anchor agent personality, formatting constraints, and safety guidelines.'
            ],
            codeSnippet: `import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are an expert Google Cloud Solutions Architect."
});

const result = await model.generateContent("Explain VPC Peering in 3 bullet points");
console.log(result.response.text());`,
            resources: [
              { name: 'Gemini Prompt Engineering Guide.pdf', size: '2.8 MB', type: 'doc' }
            ],
            quiz: {
              question: 'Which Gemini model should you select when sub-second response times and cost efficiency are the primary goals?',
              options: ['Gemini 1.5 Flash', 'Gemini 1.0 Ultra', 'BERT Base', 'Transformer-XL'],
              correctIndex: 0,
              explanation: 'Gemini 1.5 Flash is specifically designed by Google for high-speed, cost-efficient, and lightweight reasoning at scale.'
            }
          },
          {
            id: 'gemini-102',
            title: 'Multimodal Processing: Video, Audio & Document Parsing',
            duration: '21:10',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            summary: 'Pass multi-page PDF blueprints and video streams directly into Gemini without needing complex OCR preprocessing steps.',
            keyTakeaways: [
              'Native multimodality means the model understands spatial layouts and diagrams.',
              'Video timestamps can be extracted directly using natural language prompts.'
            ],
            codeSnippet: `# Upload audio or video file and prompt Gemini
from google import genai

client = genai.Client()
video_file = client.files.upload(file="product_demo.mp4")
response = client.models.generate_content(
    model="gemini-1.5-pro",
    contents=[video_file, "Summarize key product features with timestamps."]
)
print(response.text)`,
            resources: [
              { name: 'Multimodal Code Notebook.ipynb', size: '512 KB', type: 'code' }
            ]
          }
        ]
      },
      {
        id: 'mod-ai-2',
        title: 'Module 2: Production RAG & Vertex AI Vector Search',
        duration: '2h 40m',
        lessons: [
          {
            id: 'gemini-201',
            title: 'Vector Embeddings & Semantic Search Pipelines',
            duration: '18:45',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            summary: 'Generate high-dimensional semantic embeddings, chunk documents intelligently, and index knowledge bases in Vertex AI Vector Search.',
            keyTakeaways: [
              'Chunk sizes must match the retrieval granularity of your user questions.',
              'Vertex AI Vector Search handles billions of vectors with single-digit millisecond latency.'
            ],
            codeSnippet: `# Generate embeddings with Google text-embedding-004
response = client.models.embed_content(
    model="text-embedding-004",
    contents=["Google Cloud Compute Engine provides scalable VMs."]
)
vector = response.embedding.values`,
            resources: [
              { name: 'RAG Architecture Blueprint.pdf', size: '3.1 MB', type: 'doc' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fullstack-web-bootcamp',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    title: 'Full-Stack Web Development Bootcamp: Modern React & Cloud Run',
    subtitle: 'From frontend state management with React 19 to microservices backends, PostgreSQL, and serverless Google Cloud deployments.',
    category: 'Web Development',
    badge: 'Best for Careers',
    badgeType: 'amber',
    level: 'Beginner → Advanced',
    duration: '12 Weeks · 56 Hours',
    estimatedHours: 56,
    rating: 4.88,
    reviewsCount: 4200,
    enrolledCount: '32,100+',
    instructor: {
      name: 'Sameer Patel',
      role: 'Staff Full-Stack Engineer & Open Source Contributor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      bio: 'Built SaaS platforms serving millions of requests. Mentored over 8,000 engineering students into tech roles.'
    },
    skills: ['React 19', 'JavaScript (ES2024)', 'Node.js & Express', 'PostgreSQL / MongoDB', 'Google Cloud Run', 'REST APIs', 'JWT Security'],
    prerequisites: ['Basic HTML and CSS knowledge', 'Curiosity to build real software!'],
    overview: 'A zero-to-hero curriculum designed specifically to make you job-ready. You will construct end-to-end full stack web applications, connect secure database schemas, authenticate users via JWT/OAuth, and deploy real production applications using Google Cloud Run serverless containers.',
    whatYouWillLearn: [
      'Master React 19 hooks, component composition, state management, and Vite',
      'Build robust backend APIs using Express and Node.js with input validation',
      'Design relational database schemas with PostgreSQL and ORM tooling',
      'Implement secure authentication with JSON Web Tokens and HTTP-only cookies',
      'Deploy full-stack web applications to Google Cloud Run with automated continuous deployment'
    ],
    modules: [
      {
        id: 'mod-fs-1',
        title: 'Module 1: Modern React 19 Architecture & State Management',
        duration: '3h 10m',
        lessons: [
          {
            id: 'fs-101',
            title: 'Modern React Component Systems & Custom Hooks',
            duration: '22:15',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            summary: 'Learn clean component boundaries, effective state lifting, useTransition, useDeferredValue, and custom hooks for API querying.',
            keyTakeaways: [
              'Custom hooks encapsulate data fetching and business logic away from presentation components.',
              'Avoid redundant state; derive values during render whenever possible.'
            ],
            codeSnippet: `// Custom useFetch hook with abort controller
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') setLoading(false); });
    return () => controller.abort();
  }, [url]);

  return { data, loading };
}`,
            resources: [
              { name: 'React 19 Cheat Sheet.pdf', size: '1.4 MB', type: 'doc' }
            ]
          }
        ]
      },
      {
        id: 'mod-fs-2',
        title: 'Module 2: Serverless Deployment to Google Cloud Run',
        duration: '2h 20m',
        lessons: [
          {
            id: 'fs-201',
            title: 'Deploying Containerized Apps to Google Cloud Run',
            duration: '19:40',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            summary: 'Take a containerized React + Node application and deploy it to Google Cloud Run with zero-to-N autoscaling, custom domain, and SSL.',
            keyTakeaways: [
              'Cloud Run automatically scales down to zero when there is no traffic, saving costs.',
              'Environment variables and secrets can be loaded securely via Cloud Secret Manager.'
            ],
            codeSnippet: `# One-command deployment to Cloud Run
gcloud run deploy upskillyfy-web \\
  --source . \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated`,
            resources: [
              { name: 'Cloud Run Architecture Guide.pdf', size: '2.0 MB', type: 'doc' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'dsa-interview-mastery',
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc03e35a119?w=800&auto=format&fit=crop&q=80',
    title: 'Data Structures & Algorithmic Problem Solving for Tech Interviews',
    subtitle: 'Comprehensive patterns for FAANG/MNC technical rounds: Trees, Graphs, Dynamic Programming, and System Design fundamentals.',
    category: 'DSA & Problem Solving',
    badge: 'Highest Rated',
    badgeType: 'purple',
    level: 'All Levels',
    duration: '10 Weeks · 48 Hours',
    estimatedHours: 48,
    rating: 4.96,
    reviewsCount: 5120,
    enrolledCount: '41,000+',
    instructor: {
      name: 'Aditya Verma & Top Tier Competitive Programmers',
      role: 'Former Lead Interviewer & Placement Coach',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      bio: 'Candidate coach who has helped thousands of students clear interviews at Google, Amazon, Microsoft, and high-growth unicorns.'
    },
    skills: ['Binary Trees & BST', 'Dynamic Programming', 'Graph Algorithms (Dijkstra, BFS/DFS)', 'Sliding Window & Two Pointers', 'System Design Basics'],
    prerequisites: ['Basic syntax in C++, Java, or Python'],
    overview: 'Stop memorizing random LeetCode questions. This course organizes algorithms by fundamental mental patterns: Sliding Window, Monotonic Stacks, Tree Recursion, Dynamic Programming Knapsack variants, and Graph topological sorting.',
    whatYouWillLearn: [
      'Master the 14 core patterns behind 95% of software engineering interview problems',
      'Solve 200+ selected high-yield coding questions with step-by-step visualizations',
      'Analyze time and space complexity with Big-O precision',
      'Write production-clean, bug-free interview code under timed pressure',
      'Tackle low-level and high-level system design introductory rounds'
    ],
    modules: [
      {
        id: 'mod-dsa-1',
        title: 'Module 1: Array & String Patterns (Sliding Window & Two Pointers)',
        duration: '3h 30m',
        lessons: [
          {
            id: 'dsa-101',
            title: 'Mastering the Variable Sliding Window Pattern',
            duration: '24:50',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            summary: 'Understand when and how to apply expanding and contracting windows to solve subarray substring problems in O(N) linear time.',
            keyTakeaways: [
              'Window condition: Right pointer expands the candidate window; Left pointer contracts to maintain invariant.',
              'Use frequency maps or 128-length ascii arrays for O(1) character lookups.'
            ],
            codeSnippet: `// Longest Substring Without Repeating Characters O(N)
function lengthOfLongestSubstring(s) {
  let map = new Map(), maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
            resources: [
              { name: 'Sliding Window Mindmap.pdf', size: '980 KB', type: 'doc' }
            ],
            quiz: {
              question: 'What is the time complexity of the two-pointer sliding window on an array of length N when each element is visited at most twice?',
              options: ['O(N²)', 'O(N log N)', 'O(N)', 'O(2^N)'],
              correctIndex: 2,
              explanation: 'Because both left and right pointers only move forward up to N times, total operations are 2N, which is linear O(N).'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'data-engineering-bigquery',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    title: 'Google Cloud Data Engineering: BigQuery, Spark & Pub/Sub',
    subtitle: 'Build large-scale data warehouses, real-time streaming analytics pipelines, and ETL architectures on Google Cloud.',
    category: 'Data & Analytics',
    badge: 'Enterprise Track',
    badgeType: 'blue',
    level: 'Intermediate',
    duration: '8 Weeks · 38 Hours',
    estimatedHours: 38,
    rating: 4.89,
    reviewsCount: 1640,
    enrolledCount: '11,200+',
    instructor: {
      name: 'Karan Mehra',
      role: 'Data Architect & BigQuery Specialist',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      bio: 'Spearheaded petabyte-scale data modernization migrations onto Google BigQuery.'
    },
    skills: ['Google BigQuery', 'Cloud Pub/Sub', 'Cloud Dataflow (Apache Beam)', 'Cloud Dataproc (Spark)', 'Looker Studio', 'SQL Optimization'],
    prerequisites: ['Familiarity with SQL queries', 'Basic Python or Java'],
    overview: 'Learn how modern enterprises handle petabytes of structured and streaming telemetry data. You will master schema partitioning and clustering in BigQuery, build real-time stream ingestion with Pub/Sub, and execute distributed transformations with Dataflow.',
    whatYouWillLearn: [
      'Write hyper-optimized BigQuery SQL with clustering, partition pruning, and BI Engine',
      'Ingest high-throughput IoT and web streaming events via Cloud Pub/Sub',
      'Create unified batch and streaming data pipelines with Apache Beam on Cloud Dataflow',
      'Build executive dashboards with Looker and Looker Studio'
    ],
    modules: [
      {
        id: 'mod-data-1',
        title: 'Module 1: High-Performance Data Warehousing in BigQuery',
        duration: '2h 50m',
        lessons: [
          {
            id: 'data-101',
            title: 'BigQuery Architecture, Storage Formats & Slot Allocation',
            duration: '20:15',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            summary: 'Explore Capacitor columnar storage, Jupiter network fabric, and how BigQuery scales compute independently from storage.',
            keyTakeaways: [
              'BigQuery separates compute (slots) and storage (Colossus).',
              'Partitioning on date/timestamp avoids full table scans and saves 90%+ query costs.'
            ],
            codeSnippet: `-- Create partitioned and clustered table
CREATE OR REPLACE TABLE \`upskillyfy.analytics.events\`
(
  event_id STRING,
  user_id STRING,
  event_type STRING,
  event_timestamp TIMESTAMP
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY event_type, user_id;`,
            resources: [
              { name: 'BigQuery Cost & Optimization Guide.pdf', size: '2.5 MB', type: 'doc' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cybersecurity-cloud-defense',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    title: 'Google Cloud Security, IAM & Zero-Trust Defense',
    subtitle: 'Protect cloud workloads with Google Security Command Center, VPC Service Controls, Cloud KMS, and compliance governance.',
    category: 'Security & Systems',
    badge: 'Security Specialist',
    badgeType: 'red',
    level: 'Advanced',
    duration: '6 Weeks · 30 Hours',
    estimatedHours: 30,
    rating: 4.92,
    reviewsCount: 980,
    enrolledCount: '8,400+',
    instructor: {
      name: 'Elena Rostova',
      role: 'Cloud Security Architect (CISSP, Google Cloud Certified)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      bio: 'Cybersecurity consultant advising financial institutions on zero-trust cloud transitions and threat modeling.'
    },
    skills: ['Cloud IAM & Service Accounts', 'VPC Service Controls', 'Google Security Command Center', 'Cloud KMS Encryption', 'Zero-Trust BeyondCorp'],
    prerequisites: ['Basic cloud networking (CIDR, DNS, routing)', 'Linux fundamentals'],
    overview: 'Defend enterprise infrastructure against advanced persistent threats, data exfiltration, and unauthorized access. Learn how Google implements zero-trust internally with BeyondCorp and how to apply those identical principles to cloud architectures.',
    whatYouWillLearn: [
      'Enforce least-privilege IAM policies with condition-based access',
      'Mitigate data exfiltration attacks using VPC Service Controls perimeter defense',
      'Automate cryptographic key rotations with Cloud Key Management Service (KMS)',
      'Detect compromised resources using Security Command Center and Cloud Audit Logs'
    ],
    modules: [
      {
        id: 'mod-sec-1',
        title: 'Module 1: Cloud IAM, Service Accounts & Least Privilege',
        duration: '2h 10m',
        lessons: [
          {
            id: 'sec-101',
            title: 'IAM Policy Bindings, Custom Roles & Service Account Impersonation',
            duration: '18:40',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            summary: 'Eliminate static service account keys in favor of short-lived tokens and Workload Identity Federation with GitHub / AWS.',
            keyTakeaways: [
              'Static JSON service account keys are the #1 source of credential leaks; avoid downloading them.',
              'Use Workload Identity Federation for external CI/CD pipelines to impersonate Google Cloud service accounts safely.'
            ],
            codeSnippet: `# Bind IAM role to service account with time/condition constraint
gcloud projects add-iam-policy-binding upskillyfy-prod \\
    --member="serviceAccount:deployer@upskillyfy-prod.iam.gserviceaccount.com" \\
    --role="roles/run.admin"`,
            resources: [
              { name: 'IAM Security Hardening Checklist.pdf', size: '1.9 MB', type: 'doc' }
            ]
          }
        ]
      }
    ]
  }
];
