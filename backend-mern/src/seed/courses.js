import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from '../models/Course.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillstream_mern'

const demoCourses = [
  {
    code: 101,
    title: 'Modern JavaScript from Zero to Hero',
    description: 'Learn modern ES6+ JavaScript, async/await, DOM, and real-world projects.',
    provider: 'freeCodeCamp',
    imageurl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    duration: 12,
    rating: 5.0,
    level: 'Beginner',
    courseurl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    tags: ['JavaScript', 'Beginner', 'Web Dev']
  },
  {
    code: 102,
    title: 'React & Vite Crash Course',
    description: 'Build a modern single-page application using React, hooks, and Vite.',
    provider: 'Net Ninja',
    imageurl: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
    duration: 6,
    rating: 4.5,
    level: 'Intermediate',
    courseurl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    tags: ['React', 'Frontend', 'Vite']
  },
  {
    code: 103,
    title: 'Node.js & Express REST API',
    description: 'Create a production-ready REST API with Node, Express, and MongoDB.',
    provider: 'Traversy Media',
    imageurl: 'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg',
    duration: 8,
    rating: 4.5,
    level: 'Intermediate',
    courseurl: 'https://www.youtube.com/watch?v=f2EqECiTBL8',
    tags: ['Node.js', 'Backend', 'API']
  },
  {
    code: 104,
    title: 'Complete MongoDB Tutorial',
    description: 'Master MongoDB queries, indexing, aggregation, and schema design.',
    provider: 'MongoDB University',
    imageurl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    duration: 7,
    rating: 4.8,
    level: 'Beginner',
    courseurl: 'https://www.youtube.com/watch?v=-56x56UppqQ',
    tags: ['MongoDB', 'Database', 'Backend']
  },
  {
    code: 105,
    title: 'Full MERN Stack Project',
    description: 'Build and deploy a full MERN stack application from scratch.',
    provider: 'JavaScript Mastery',
    imageurl: 'https://images.pexels.com/photos/540518/pexels-photo-540518.jpeg',
    duration: 15,
    rating: 5.0,
    level: 'Advanced',
    courseurl: 'https://www.youtube.com/watch?v=ngc9gnGgUdA',
    tags: ['MERN', 'Fullstack', 'Project']
  }
]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB, seeding demo courses...')

    for (const course of demoCourses) {
      const existing = await Course.findOne({ code: course.code })
      if (existing) {
        existing.rating = course.rating ?? existing.rating
        existing.level = course.level ?? existing.level
        await existing.save()
        console.log(`Course with code ${course.code} already exists, rating/level updated to ${existing.rating}/${existing.level}`)
        continue
      }
      await Course.create(course)
      console.log(`Inserted course ${course.code} - ${course.title}`)
    }

    console.log('Seeding complete.')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed', err)
    process.exit(1)
  }
}

seed()



