import express from 'express'

const router = express.Router()

// Placeholder course routes
router.get('/', (req, res) => {
  res.json({ message: 'Courses endpoint is working', courses: [] })
})

export default router
