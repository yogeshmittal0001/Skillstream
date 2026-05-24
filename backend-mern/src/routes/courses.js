import express from 'express'
import Course from '../models/Course.js'

const router = express.Router()

// GET /api/v1/courses with pagination & filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    
    // Build filter object
    const filter = {}
    
    if (req.query.level) {
      filter.level = req.query.level
    }
    
    if (req.query.minDuration) {
      filter.duration = { $gte: parseInt(req.query.minDuration) }
    }
    
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) }
    }
    
    if (req.query.category) {
      filter.category = req.query.category
    }
    
    if (req.query.trending === 'true') {
      filter.isTrending = true
    }
    
    if (req.query.isNew === 'true') {
      filter.isNew = true
    }
    
    // Sorting
    let sort = { createdAt: -1 }
    if (req.query.sort === 'rating') {
      sort = { rating: -1 }
    } else if (req.query.sort === 'students') {
      sort = { students: -1 }
    } else if (req.query.sort === 'title') {
      sort = { title: 1 }
    }
    
    const total = await Course.countDocuments(filter)
    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    console.error('Get courses error', err)
    res.status(500).json({ msg: 'Failed to load courses' })
  }
})

// GET /api/v1/courses/trending
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12
    const courses = await Course.find({ isTrending: true })
      .sort({ rating: -1, students: -1 })
      .limit(limit)
      .lean()
    res.json(courses)
  } catch (err) {
    console.error('Get trending courses error', err)
    res.status(500).json({ msg: 'Failed to load trending courses' })
  }
})

// GET /api/v1/courses/new
router.get('/new', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12
    const courses = await Course.find({ isNew: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    res.json(courses)
  } catch (err) {
    console.error('Get new courses error', err)
    res.status(500).json({ msg: 'Failed to load new courses' })
  }
})

// GET /api/v1/courses/stats
router.get('/stats', async (req, res) => {
  try {
    const levels = await Course.distinct('level')
    const categories = await Course.distinct('category')
    const totalCourses = await Course.countDocuments()
    
    res.json({
      levels: levels.filter(l => l),
      categories: categories.filter(c => c),
      totalCourses
    })
  } catch (err) {
    console.error('Get course stats error', err)
    res.status(500).json({ msg: 'Failed to load stats' })
  }
})

// GET /api/v1/courses/search with advanced filters
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.query || '').toString().trim().toLowerCase()
    
    // Build filter object
    const filter = {}
    
    if (req.query.level) {
      filter.level = req.query.level
    }
    
    if (req.query.category) {
      filter.category = req.query.category
    }
    
    let all = await Course.find(filter).lean()
    
    if (!q) return res.json(all)

    const filtered = all.filter(c => {
      const title = (c.title || '').toLowerCase()
      const desc = (c.description || '').toLowerCase()
      const provider = (c.provider || '').toLowerCase()
      const instructor = (c.instructor || '').toLowerCase()
      const tags = (c.tags || []).map(t => (t || '').toLowerCase())
      
      if (q.startsWith('#')) {
        const tag = q.slice(1)
        return tags.some(t => t.includes(tag))
      }
      
      return (
        title.includes(q) ||
        desc.includes(q) ||
        provider.includes(q) ||
        instructor.includes(q)
      )
    })
    
    res.json(filtered)
  } catch (err) {
    console.error('Search courses error', err)
    res.status(500).json({ msg: 'Failed to search courses' })
  }
})

export default router



