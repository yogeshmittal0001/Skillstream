import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema(
  {
    code: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    instructor: { type: String },
    provider: { type: String },
    image: { type: String },
    imageurl: { type: String },
    duration: { type: Number, default: 0 }, // in hours
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    students: { type: Number, default: 0 },
    tags: [{ type: String }],
    courseurl: { type: String },
    isNew: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    category: { type: String, default: 'General' },
    certificateAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export default mongoose.model('Course', courseSchema)



