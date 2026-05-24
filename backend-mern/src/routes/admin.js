import express from 'express'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { parseSubject } from '../utils/jwt.js'

const router = express.Router()

async function requireAdmin(req, res) {
  const email = parseSubject(req.headers.authorization)
  if (!email) {
    res.status(401).json({ msg: 'Unauthorized' })
    return null
  }
  const user = await User.findOne({ email })
  if (!user || (user.role || 'USER') !== 'ADMIN') {
    res.status(403).json({ msg: 'Forbidden: admin only' })
    return null
  }
  return user
}

// GET /api/v1/admin/courses
router.get('/courses', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const courses = await Course.find().lean()
    const mapped = courses.map(c => ({ ...c, id: c._id }))
    res.json(mapped)
  } catch (err) {
    console.error('Admin get courses error', err)
    res.status(500).json({ msg: 'Failed to load courses' })
  }
})

// POST /api/v1/admin/courses
router.post('/courses', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const { code, title, description, provider, image, duration, courseurl, tags } = req.body || {}
    if (!code || !title || !description) {
      return res.status(400).json({ msg: 'Code, title, and description are required' })
    }
    const existing = await Course.findOne({ code })
    if (existing) {
      return res.status(400).json({ msg: 'Course code already exists' })
    }
    const course = await Course.create({
      code,
      title,
      description,
      provider,
      image,
      imageurl: image,
      duration,
      courseurl,
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : [])
    })
    res.status(201).json({ ...course.toObject(), id: course._id })
  } catch (err) {
    console.error('Admin add course error', err)
    res.status(500).json({ msg: 'Failed to add course' })
  }
})

// PUT /api/v1/admin/courses/:id
router.put('/courses/:id', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const updates = { ...req.body }
    if (updates.tags) {
      updates.tags = Array.isArray(updates.tags)
        ? updates.tags
        : String(updates.tags).split(',').map(t => t.trim()).filter(Boolean)
    }
    if (updates.image) {
      updates.imageurl = updates.image
    }
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!course) return res.status(404).json({ msg: 'Course not found' })
    res.json({ ...course.toObject(), id: course._id })
  } catch (err) {
    console.error('Admin update course error', err)
    res.status(500).json({ msg: 'Failed to update course' })
  }
})

// DELETE /api/v1/admin/courses/:id
router.delete('/courses/:id', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const deleted = await Course.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ msg: 'Course not found' })
    res.json({ success: true, message: 'delete successful' })
  } catch (err) {
    console.error('Admin delete course error', err)
    res.status(500).json({ msg: 'Failed to delete course' })
  }
})

export default router


