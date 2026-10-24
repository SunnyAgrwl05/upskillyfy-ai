/**
 * Course Licensing & Playback API Integration Service
 * Communicates with the external Course Licensing API running at http://localhost:3000 (or Render)
 * Transforms curriculum & playback data to the exact schema expected by Upskillyfy Frontend.
 */

const getApiBaseUrl = () => process.env.COURSE_API_BASE_URL || 'https://course-api-1eqv.onrender.com'
const getApiKey = () => process.env.COURSE_API_KEY || 'cap_live_69b5446095cf8a01a5ba4f5be5b2c9c7a84e6aa077d67110'
const getServerUrl = () => process.env.SERVER_URL || 'http://localhost:5000'

// In-memory cache to stay well within API rate limits (catalog: 60/min, playback: 15/min)
const cache = {
  catalog: { data: null, expiresAt: 0 },
  sections: new Map(), // slug -> { data, expiresAt }
  playback: new Map()  // `${slug}:${lectureId}` -> { data, expiresAt }
}

const CATALOG_TTL = 15 * 60 * 1000 // 15 minutes
const SECTIONS_TTL = 30 * 60 * 1000 // 30 minutes
const PLAYBACK_TTL = 60 * 60 * 1000 // 60 minutes

/**
 * Format total seconds into human-readable duration strings
 */
function formatHours(seconds) {
  if (!seconds || isNaN(seconds)) return '12 Hours'
  const hours = Math.round(seconds / 3600)
  return `${Math.max(1, hours)} Hours`
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '10:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remainMins = mins % 60
    return `${hrs}h ${remainMins}m`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Categorize courses into Upskillyfy's primary track tabs
 */
function mapCategory(slug, courseName = '') {
  const s = (slug + ' ' + courseName).toLowerCase()

  if (s.includes('cloud') || s.includes('devops') || s.includes('docker') || s.includes('kubernetes')) {
    return 'Cloud & DevOps'
  }
  if (s.includes('deeplearning') || s.includes('machinelearning') || s.includes('nlp') || s.includes('llm') || s.includes('aitools') || s.includes('ai')) {
    return 'AI & Machine Learning'
  }
  if (s.includes('datastructure') || s.includes('competitiveprogramming') || s.includes('dsawithpython') || s.includes('cpp') || s.includes('java') || s.includes('python')) {
    return 'DSA & Problem Solving'
  }
  if (s.includes('dataanalytics') || s.includes('dataengineering') || s.includes('datascience') || s.includes('powerbi') || s.includes('tableau') || s.includes('sql') || s.includes('excel')) {
    return 'Data & Analytics'
  }
  if (s.includes('cybersecurity') || s.includes('ethicalhacking') || s.includes('security') || s.includes('systemdesign') || s.includes('blockchain') || s.includes('web3')) {
    return 'Security & Systems'
  }
  if (s.includes('react') || s.includes('mern') || s.includes('nextjs') || s.includes('nestjs') || s.includes('webdevelopment') || s.includes('flutter') || s.includes('appdevelopment') || s.includes('3dgame')) {
    return 'Web Development'
  }
  return 'Web Development'
}

/**
 * Derive relevant skills tags based on course slug
 */
function deriveSkills(slug, courseName) {
  const name = courseName || slug
  const baseSkills = [name]
  const s = slug.toLowerCase()

  if (s.includes('3dgame')) baseSkills.push('Unity 3D', 'C# Scripting', 'Physics Engine', 'Game Loop')
  else if (s.includes('cpp')) baseSkills.push('C++', 'STL', 'OOP', 'Memory Management')
  else if (s.includes('python')) baseSkills.push('Python 3', 'Data Structures', 'OOP', 'Scripts')
  else if (s.includes('react')) baseSkills.push('React 19', 'Hooks', 'State Management', 'Component Architecture')
  else if (s.includes('devops')) baseSkills.push('CI/CD', 'Docker', 'Kubernetes', 'Linux')
  else if (s.includes('cloud')) baseSkills.push('GCP / AWS', 'Virtualization', 'IAM', 'VPC')
  else if (s.includes('machinelearning')) baseSkills.push('Scikit-Learn', 'Regression', 'Neural Networks', 'Feature Engineering')
  else if (s.includes('uiux')) baseSkills.push('Figma', 'User Research', 'Wireframing', 'Prototyping')
  else baseSkills.push('Problem Solving', 'Production Best Practices', 'Architecture')

  return baseSkills
}

/**
 * Make an authorized HTTP request to the Licensing API
 */
async function callLicensingApi(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  const apiKey = getApiKey()

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'application/json',
    ...(options.headers || {})
  }

  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    const error = new Error(`Licensing API error [${response.status}]: ${errorText || response.statusText}`)
    error.status = response.status
    throw error
  }

  return response.json()
}

/**
 * Fetch all licensed courses from catalog with pagination handling
 */
export async function getLicensedCourses() {
  const now = Date.now()
  if (cache.catalog.data && cache.catalog.expiresAt > now) {
    return cache.catalog.data
  }

  try {
    let allCourses = []
    let page = 1
    let totalPages = 1

    do {
      const data = await callLicensingApi(`/v1/courses?page=${page}&limit=50`)
      if (Array.isArray(data.courses)) {
        allCourses.push(...data.courses)
      }
      totalPages = data.totalPages || 1
      page++
    } while (page <= totalPages)

    cache.catalog = {
      data: allCourses,
      expiresAt: now + CATALOG_TTL
    }
    return allCourses
  } catch (err) {
    console.error('Failed to fetch licensed courses catalog:', err.message)
    if (cache.catalog.data) return cache.catalog.data
    throw err
  }
}

/**
 * Fetch sections/curriculum for a specific course slug
 */
export async function getCourseSections(slug) {
  const now = Date.now()
  const cached = cache.sections.get(slug)
  if (cached && cached.expiresAt > now) {
    return cached.data
  }

  try {
    const data = await callLicensingApi(`/v1/courses/${encodeURIComponent(slug)}/sections`)
    cache.sections.set(slug, {
      data,
      expiresAt: now + SECTIONS_TTL
    })
    return data
  } catch (err) {
    console.error(`Failed to fetch sections for course '${slug}':`, err.message)
    if (cached) return cached.data
    throw err
  }
}

/**
 * Authorize playback for a lecture
 */
export async function getLecturePlayback(slug, lectureId) {
  const cacheKey = `${slug}:${lectureId}`
  const now = Date.now()
  const cached = cache.playback.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.data
  }

  try {
    const data = await callLicensingApi(
      `/v1/courses/${encodeURIComponent(slug)}/lectures/${encodeURIComponent(lectureId)}/playback`,
      { method: 'POST' }
    )
    cache.playback.set(cacheKey, {
      data,
      expiresAt: now + PLAYBACK_TTL
    })
    return data
  } catch (err) {
    console.error(`Failed to authorize playback for ${slug} / ${lectureId}:`, err.message)
    if (cached) return cached.data
    throw err
  }
}

/**
 * Map an external course object + optional sections into the exact frontend schema
 */
export function transformCourse(rawCourse, sectionsData = null) {
  const slug = rawCourse.slug
  const courseName = rawCourse.courseName || slug
  const courseLength = rawCourse.courseLength || 0
  const totalLectures = rawCourse.numberOfLectures || (sectionsData?.numberOfLectures) || 0
  const category = mapCategory(slug, courseName)
  const serverUrl = getServerUrl()

  // Generate modules & lessons from sectionsData if available
  let modules = []
  if (sectionsData && Array.isArray(sectionsData.sections) && sectionsData.sections.length > 0) {
    modules = sectionsData.sections.map((sec, secIdx) => {
      const sectionLectures = sec.lectures || []
      const sectionSeconds = sectionLectures.reduce((acc, l) => acc + (l.lectureLength || 0), 0)

      return {
        id: sec._id || `sec-${secIdx + 1}`,
        title: sec.sectionName || `Section ${secIdx + 1}`,
        duration: formatDuration(sectionSeconds),
        lessons: sectionLectures.map((lec, lecIdx) => {
          const lecId = lec._id || `lec-${secIdx + 1}-${lecIdx + 1}`
          return {
            id: lecId,
            title: lec.lectureName || `Lecture ${lecIdx + 1}`,
            duration: formatDuration(lec.lectureLength || 600),
            type: 'video',
            preview: !!lec.preview,
            // Stream proxy endpoint that resolves signed playback URL on-demand:
            videoUrl: `${serverUrl}/api/courses/${slug}/lectures/${lecId}/video`,
            summary: `Lecture ${lec.order || lecIdx + 1}: ${lec.lectureName}. Master the practical concepts, hands-on techniques, and production standards for ${courseName}.`,
            keyTakeaways: [
              `Understand the core architectural patterns demonstrated in ${lec.lectureName}.`,
              'Write clean, modular code with industry-standard syntax and conventions.',
              'Implement optimizations to enhance performance and maintainability.'
            ],
            codeSnippet: `// Example Implementation for: ${lec.lectureName}\n// Language: ${rawCourse.language || 'Modern Stack'}\nfunction executeWorkflow() {\n  console.log("Running ${lec.lectureName} in ${courseName}...");\n}`,
            resources: [
              { name: `${lec.lectureName.replace(/\s+/g, '_')}_Cheatsheet.md`, size: '240 KB', type: 'code' },
              { name: `${courseName.replace(/\s+/g, '_')}_Reference_Guide.pdf`, size: '1.4 MB', type: 'doc' }
            ],
            quiz: {
              question: `What is the primary objective covered in "${lec.lectureName}"?`,
              options: [
                'Implementing scalable, fault-tolerant logic following best practices',
                'Hardcoding static variables without modular structures',
                'Bypassing version control and automated testing',
                'Disabling security constraints for convenience'
              ],
              correctIndex: 0,
              explanation: `In ${courseName}, following production design patterns ensures long-term reliability and high performance.`
            }
          }
        })
      }
    })
  } else {
    // Generate lightweight placeholder module so Courses.jsx gets accurate lesson counts
    modules = [
      {
        id: `mod-${slug}-overview`,
        title: `${courseName} Curriculum`,
        duration: formatHours(courseLength),
        lessons: Array.from({ length: totalLectures || 1 }, (_, i) => ({
          id: `lec-${slug}-${i + 1}`,
          title: `Lesson ${i + 1}`,
          duration: '12:00',
          type: 'video',
          videoUrl: ''
        }))
      }
    ]
  }

  const estimatedHours = Math.max(1, Math.round(courseLength / 3600)) || 10

  return {
    id: slug,
    slug: slug,
    title: courseName,
    subtitle: rawCourse.description || `Master ${courseName} from foundational concepts to advanced production deployments.`,
    category,
    badge: 'Licensed Course',
    badgeType: 'blue',
    level: rawCourse.level || 'Intermediate',
    duration: formatHours(courseLength),
    estimatedHours,
    rating: 4.9,
    reviewsCount: 850 + ((courseLength % 700) * 2),
    enrolledCount: `${(10 + (courseLength % 25)).toFixed(1)}k+`,
    thumbnail: rawCourse.thumbnailUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    instructor: {
      name: 'Upskillyfy AI Mentors & Industry Leaders',
      role: 'Principal Engineer & Enterprise Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      bio: 'Seasoned technical mentors with real-world industry experience delivering production software at scale.'
    },
    skills: deriveSkills(slug, courseName),
    overview: rawCourse.description || `This comprehensive track in ${courseName} is engineered to build practical, production-ready competencies. Designed with real-world scenarios and structured curriculum.`,
    whatYouWillLearn: rawCourse.whatYouWillLearn || [
      `Architect and build production systems using ${courseName}`,
      'Implement industry-standard design patterns, testing, and debugging',
      'Optimize performance, security, and maintainability',
      'Earn verified Upskillyfy Course Certificate upon completion'
    ],
    modules
  }
}

export default {
  getLicensedCourses,
  getCourseSections,
  getLecturePlayback,
  transformCourse
}
