import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './src/routes/auth.js'
import courseRoutes from './src/routes/courses.js'
import favRoutes from './src/routes/favourites.js'
import adminRoutes from './src/routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillstream_mern'
const ORIGIN = process.env.FRONTEND_ORIGIN || '*'

app.use(cors({
  origin: ORIGIN === '*' ? true : ORIGIN,
  credentials: false
}))
app.use(express.json())

app.get('/api/v1/health', (_req, res) => {
  res.json({ ok: true, message: 'Skillstream MERN backend running' })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/favourites', favRoutes)
app.use('/api/v1/admin', adminRoutes)

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`MERN backend listening on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('MongoDB connection error', err)
    process.exit(1)
  })



