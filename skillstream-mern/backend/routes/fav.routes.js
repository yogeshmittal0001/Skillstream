import express from 'express';
import asyncHandler from 'express-async-handler';
import Favorite from '../models/Favorite.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's favorite courses
// @route   GET /api/v1/favorites
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ user: req.user._id })
        .populate('course', 'title description image provider')
        .sort('-createdAt');
    
    res.json(favorites.map(fav => fav.course));
}));

// @desc    Add course to favorites
// @route   POST /api/v1/favorites/:courseId
// @access  Private
router.post('/:courseId', protect, asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    // Check if already favorited
    const alreadyFavorited = await Favorite.findOne({
        user: req.user._id,
        course: courseId
    });
    
    if (alreadyFavorited) {
        res.status(400);
        throw new Error('Course already in favorites');
    }
    
    const favorite = new Favorite({
        user: req.user._id,
        course: courseId
    });
    
    const createdFavorite = await favorite.save();
    await createdFavorite.populate('course', 'title description image provider');
    
    res.status(201).json(createdFavorite.course);
}));

// @desc    Remove course from favorites
// @route   DELETE /api/v1/favorites/:courseId
// @access  Private
router.delete('/:courseId', protect, asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({
        user: req.user._id,
        course: courseId
    });
    
    if (favorite) {
        res.json({ message: 'Removed from favorites' });
    } else {
        res.status(404);
        throw new Error('Favorite not found');
    }
}));

export default router;
