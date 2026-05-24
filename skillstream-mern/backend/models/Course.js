import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    code: {
        type: Number,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    duration: {
        type: Number,
        required: true
    },
    courseUrl: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
