const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams: true is important — it lets us access :id from the parent route (spots)

const { createReview, getReviews, deleteReview } = require('../controllers/reviewsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getReviews);                  // public
router.post('/', protect, createReview);      // protected
router.delete('/:reviewId', protect, deleteReview); // protected

module.exports = router;