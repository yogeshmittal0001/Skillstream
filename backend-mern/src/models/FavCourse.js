import mongoose from 'mongoose'

const favCourseSchema = new mongoose.Schema(
  {
    code: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

favCourseSchema.index({ user: 1, code: 1 }, { unique: true })

export default mongoose.model('FavCourse', favCourseSchema)



