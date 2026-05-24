import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Post a new review
router.post('/', async (req, res) => {
  try {
    const { username, rating, comment, userId } = req.body;
    const newReview = new Review({
      user: userId,
      username,
      rating,
      comment,
      isApproved: false // Requires moderation
    });
    const review = await newReview.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error saving review' });
  }
});

// @route   GET /api/reviews/admin
// @desc    Get all reviews for moderation
router.get('/admin', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// @route   PUT /api/reviews/approve/:id
// @desc    Approve a review
router.put('/approve/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error approving review' });
  }
});

export default router;
