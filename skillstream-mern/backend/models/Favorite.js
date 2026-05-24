import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, {
    timestamps: true,
    // Ensure a user can't favorite the same course multiple times
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to ensure a user can't favorite the same course multiple times
favoriteSchema.index({ user: 1, course: 1 }, { unique: true });

// Virtual populate
favoriteSchema.virtual('courseDetails', {
    ref: 'Course',
    localField: 'course',
    foreignField: '_id',
    justOne: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
