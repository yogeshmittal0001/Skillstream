import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'

const router = express.Router()

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body || {}
    name = (name || '').trim()
    email = (email || '').trim().toLowerCase()
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Invalid payload' })
    }
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ msg: 'Email already exists' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const role = email === (process.env.ADMIN_EMAIL || '').toLowerCase() ? 'ADMIN' : 'USER'
    const user = await User.create({ name, email, password: hashed, role })
    const token = generateToken(user.email, user.role)
    return res.status(201).json({ user: { name: user.name }, token })
  } catch (err) {
    console.error('Register error', err)
    return res.status(500).json({ msg: 'Register failed' })
  }
})

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body || {}
    email = (email || '').trim().toLowerCase()
    if (!email || !password) {
      return res.status(400).json({ msg: 'Invalid payload' })
    }
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' })

    let ok = false
    try {
      ok = await bcrypt.compare(password, user.password || '')
    } catch {
      ok = false
    }
    if (!ok && user.password && password === user.password) {
      // legacy plaintext: upgrade
      user.password = await bcrypt.hash(password, 10)
      await user.save()
      ok = true
    }
    if (!ok) return res.status(401).json({ msg: 'Invalid credentials' })

    const token = generateToken(user.email, user.role || 'USER')
    return res.json({ user: { name: user.name, role: user.role || 'USER' }, token })
  } catch (err) {
    console.error('Login error', err)
    return res.status(500).json({ msg: 'Login failed' })
  }
})

export default router


