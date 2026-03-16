const prisma = require('../config/prisma');

// POST /api/spots/:id/reviews — create a review for a spot
const createReview = async (req, res) => {
  try {
    const { id } = req.params; // spot id from URL
    const { rating, title, body } = req.body;
    const userId = req.userId; // comes from auth middleware

    // 1. Check if spot exists
    const spot = await prisma.spot.findUnique({
      where: { id: parseInt(id) }
    });

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Spot not found'
      });
    }

    // 2. Check if user already reviewed this spot
    const existingReview = await prisma.review.findFirst({
      where: {
        spotId: parseInt(id),
        userId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this spot'
      });
    }

    // 3. Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        title,
        body,
        spotId: parseInt(id),
        userId
      },
      include: {
        user: { select: { id: true, name: true } }
      }
    });

    // 4. Update the spot's average rating
    // Get all reviews for this spot and calculate new average
    const allReviews = await prisma.review.findMany({
      where: { spotId: parseInt(id) }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.spot.update({
      where: { id: parseInt(id) },
      data: { avgRating }
    });

    res.status(201).json({ success: true, data: review });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/spots/:id/reviews — get all reviews for a spot
const getReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { spotId: parseInt(id) },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' } // newest first
    });

    res.json({ success: true, data: reviews });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/reviews/:id — delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // 1. Find the review
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // 2. Make sure only the owner can delete it
    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    // 3. Delete the review
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Review deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getReviews, deleteReview };