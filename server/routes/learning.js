import express from 'express'
import CourseProgress from '../models/CourseProgress.js'
import RoadmapProgress from '../models/RoadmapProgress.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const validId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(value)
const updateProgressRecord = async (Model, filter, update) => {
  try {
    return await Model.findOneAndUpdate(filter, update, { upsert: true, new: true, runValidators: true })
  } catch (error) {
    if (error.code !== 11000) throw error
    const existing = await Model.findOneAndUpdate(filter, update, { new: true, runValidators: true })
    if (!existing) throw error
    return existing
  }
}

router.use(protect)

router.post('/courses/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params
    if (!validId(courseId)) return res.status(400).json({ message: 'Invalid course identifier' })
    const now = new Date()
    const progress = await updateProgressRecord(
      CourseProgress,
      { userId: req.user._id, courseId },
      { $setOnInsert: { userId: req.user._id, courseId, startedAt: now }, $set: { lastActivityAt: now } },
    )
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: 'Unable to enroll in this course' })
  }
})

router.get('/courses/:courseId/progress', async (req, res) => {
  try {
    if (!validId(req.params.courseId)) return res.status(400).json({ message: 'Invalid course identifier' })
    const progress = await CourseProgress.findOne({ userId: req.user._id, courseId: req.params.courseId }).lean()
    res.json(progress || { courseId: req.params.courseId, completedLessons: [], lastLessonId: '' })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load course progress' })
  }
})

router.post('/courses/:courseId/last-lesson', async (req, res) => {
  try {
    const { courseId } = req.params
    const { lessonId } = req.body
    if (!validId(courseId) || !validId(lessonId)) return res.status(400).json({ message: 'Invalid course or lesson identifier' })
    const now = new Date()
    const progress = await updateProgressRecord(
      CourseProgress,
      { userId: req.user._id, courseId },
      {
        $set: { lastLessonId: lessonId, lastActivityAt: now },
        $setOnInsert: { userId: req.user._id, courseId, startedAt: now },
      },
    )
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: 'Unable to update the last visited lesson' })
  }
})

router.put('/courses/:courseId/lessons/:lessonId', async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const { completed } = req.body
    if (!validId(courseId) || !validId(lessonId) || typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'A valid course, lesson, and completion state are required' })
    }
    const now = new Date()
    const update = completed
      ? { $addToSet: { completedLessons: lessonId }, $set: { lastLessonId: lessonId, lastActivityAt: now } }
      : { $pull: { completedLessons: lessonId }, $set: { lastActivityAt: now } }
    const progress = await updateProgressRecord(
      CourseProgress,
      { userId: req.user._id, courseId },
      { ...update, $setOnInsert: { userId: req.user._id, courseId, startedAt: now } },
    )
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: 'Unable to save lesson progress' })
  }
})

router.get('/roadmaps/:roadmapId/progress', async (req, res) => {
  try {
    if (!validId(req.params.roadmapId)) return res.status(400).json({ message: 'Invalid roadmap identifier' })
    const progress = await RoadmapProgress.findOne({ userId: req.user._id, roadmapId: req.params.roadmapId }).lean()
    res.json(progress || { roadmapId: req.params.roadmapId, masteredSkills: [] })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load roadmap progress' })
  }
})

router.put('/roadmaps/:roadmapId/skills', async (req, res) => {
  try {
    const { roadmapId } = req.params
    const { skill, mastered } = req.body
    if (!validId(roadmapId) || typeof skill !== 'string' || !skill.trim() || skill.length > 120 || typeof mastered !== 'boolean') {
      return res.status(400).json({ message: 'A valid roadmap skill and completion state are required' })
    }
    const now = new Date()
    const update = mastered
      ? { $addToSet: { masteredSkills: skill.trim() }, $set: { lastActivityAt: now } }
      : { $pull: { masteredSkills: skill.trim() }, $set: { lastActivityAt: now } }
    const progress = await updateProgressRecord(
      RoadmapProgress,
      { userId: req.user._id, roadmapId },
      { ...update, $setOnInsert: { userId: req.user._id, roadmapId } },
    )
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: 'Unable to save roadmap progress' })
  }
})

router.get('/progress', async (req, res) => {
  try {
    const [courses, roadmaps] = await Promise.all([
      CourseProgress.find({ userId: req.user._id }).sort({ lastActivityAt: -1 }).lean(),
      RoadmapProgress.find({ userId: req.user._id }).sort({ lastActivityAt: -1 }).lean(),
    ])
    res.json({ courses, roadmaps })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load learning progress' })
  }
})

export default router
