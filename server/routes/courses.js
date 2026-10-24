import express from 'express'
import courseApiService from '../services/courseApiService.js'

const router = express.Router()

/**
 * GET /api/courses
 * Returns the catalog of courses formatted for client/src/pages/Learning/Courses.jsx
 */
router.get('/', async (req, res) => {
  try {
    const rawCourses = await courseApiService.getLicensedCourses()
    const transformed = rawCourses.map(c => courseApiService.transformCourse(c))
    res.json(transformed)
  } catch (err) {
    console.error('Error in GET /api/courses:', err)
    res.status(500).json({ error: 'Failed to retrieve course catalog', message: err.message })
  }
})

/**
 * GET /api/courses/:id
 * Returns the full course details including sections/lectures formatted for CoursePlayer.jsx
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 1. Fetch catalog to find the course
    const rawCourses = await courseApiService.getLicensedCourses()
    const rawCourse = rawCourses.find(c => c.slug === id || c.slug === id.toLowerCase())

    if (!rawCourse) {
      // Course not in licensing catalog, return 404 (frontend will fall back to local COURSES_DATA)
      return res.status(404).json({ error: 'Course not found in licensed catalog' })
    }

    // 2. Fetch full sections & lectures from Course Licensing API
    let sectionsData = null
    try {
      sectionsData = await courseApiService.getCourseSections(rawCourse.slug)
    } catch (secErr) {
      console.warn(`Could not load sections for course '${rawCourse.slug}':`, secErr.message)
    }

    // 3. Transform with complete modules & lessons
    const course = courseApiService.transformCourse(rawCourse, sectionsData)
    res.json(course)
  } catch (err) {
    console.error(`Error in GET /api/courses/${req.params.id}:`, err)
    res.status(500).json({ error: 'Failed to retrieve course details', message: err.message })
  }
})

/**
 * GET /api/courses/:slug/lectures/:lectureId/video
 * Direct video streaming endpoint:
 * Authorizes playback with Course Licensing API and 302 redirects to signed video stream
 */
router.get('/:slug/lectures/:lectureId/video', async (req, res) => {
  try {
    const { slug, lectureId } = req.params

    const playbackData = await courseApiService.getLecturePlayback(slug, lectureId)
    const playback = playbackData?.playback

    const streamUrl = 
      playback?.videoFallbackUrl ||
      playback?.qualities?.['720p'] ||
      playback?.qualities?.['1080p'] ||
      playback?.qualities?.['480p']

    if (!streamUrl) {
      return res.status(404).json({ error: 'Video stream URL not available for this lecture' })
    }

    // Issue 302 redirect so browser <video> player streams directly from CDN
    res.redirect(302, streamUrl)
  } catch (err) {
    console.error(`Error streaming lecture video for ${req.params.slug}/${req.params.lectureId}:`, err)
    res.status(err.status || 500).json({ error: 'Failed to authorize lecture playback', message: err.message })
  }
})

/**
 * GET /api/courses/:slug/lectures/:lectureId/playback
 * POST /api/courses/:slug/lectures/:lectureId/play
 * Returns full playback metadata (manifestUrl, qualities, fallback streams)
 */
const handlePlaybackRequest = async (req, res) => {
  try {
    const { slug, lectureId } = req.params
    const playbackData = await courseApiService.getLecturePlayback(slug, lectureId)
    res.json(playbackData)
  } catch (err) {
    console.error(`Error fetching playback metadata for ${req.params.slug}/${req.params.lectureId}:`, err)
    res.status(err.status || 500).json({ error: 'Failed to authorize lecture playback', message: err.message })
  }
}

router.get('/:slug/lectures/:lectureId/playback', handlePlaybackRequest)
router.post('/:slug/lectures/:lectureId/play', handlePlaybackRequest)

/**
 * POST /api/courses/:id/enroll
 * Handle course enrollment
 */
router.post('/:id/enroll', (req, res) => {
  res.json({ success: true, message: `Successfully enrolled in course ${req.params.id}` })
})

/**
 * POST /api/courses/:id/progress
 * Handle progress updates from CoursePlayer.jsx
 */
router.post('/:id/progress', (req, res) => {
  res.json({ success: true, progress: req.body, updatedAt: new Date() })
})

export default router
