const express = require('express');
const router = express.Router();
const { getAllSpots, getSpotById, createSpot } = require('../controllers/spotsController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes — anyone can access
router.get('/', getAllSpots);
router.get('/:id', getSpotById);

// Protected routes — must be logged in
// protect middleware runs first, then createSpot
router.post('/', protect, createSpot);

module.exports = router;