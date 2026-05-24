import express from 'express'
import FavCourse from '../models/FavCourse.js'
import User from '../models/User.js'
import { parseSubject } from '../utils/jwt.js'

const router = express.Router()

async function getUserFromAuth(req) {
  let email = (req.body?.email || req.query?.email || '').toString().trim().toLowerCase()
  if (!email) {
    email = parseSubject(req.headers.authorization)
  }
  if (!email) return null
  return User.findOne({ email })
}

// GET /api/v1/favourites/count
router.get('/count', async (req, res) => {
  try {
    const user = await getUserFromAuth(req)
    if (!user) return res.status(401).json({ msg: 'User not found' })
    const count = await FavCourse.countDocuments({ user: user._id })
    res.json({ count })
  } catch (err) {
    console.error('Get favourites count error', err)
    res.status(500).json({ msg: 'Failed to load favourites count' })
  }
})

// GET /api/v1/favourites
router.get('/', async (req, res) => {
  try {
    const user = await getUserFromAuth(req)
    if (!user) return res.status(401).json({ msg: 'User not found' })
    const favs = await FavCourse.find({ user: user._id }).lean()
    res.json(favs)
  } catch (err) {
    console.error('Get favourites error', err)
    res.status(500).json({ msg: 'Failed to load favourites' })
  }
})

// POST /api/v1/favourites
router.post('/', async (req, res) => {
  try {
    const user = await getUserFromAuth(req)
    if (!user) return res.status(401).json({ msg: 'User not found' })
    const code = req.body.code
    if (code == null) return res.status(400).json({ msg: 'Course code required' })

    const exists = await FavCourse.findOne({ user: user._id, code })
    if (exists) return res.status(400).json({ msg: 'Already favourited' })

    await FavCourse.create({ user: user._id, code })
    res.status(201).json({ success: true, message: 'created' })
  } catch (err) {
    console.error('Add favourite error', err)
    res.status(500).json({ msg: 'Failed to add favourite' })
  }
})

// DELETE /api/v1/favourites/:code
router.delete('/:code', async (req, res) => {
  try {
    const user = await getUserFromAuth(req)
    if (!user) return res.status(401).json({ msg: 'User not found' })
    const code = parseInt(req.params.code, 10)
    const fav = await FavCourse.findOne({ user: user._id, code })
    if (!fav) return res.status(404).json({ msg: 'Not found' })
    await fav.deleteOne()
    res.json({ success: true, message: 'delete successful' })
  } catch (err) {
    console.error('Remove favourite error', err)
    res.status(500).json({ msg: 'Failed to remove favourite' })
  }
})

export default router



