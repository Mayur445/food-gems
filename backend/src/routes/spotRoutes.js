const express = require('express');
const router = express.Router();
const { getAllSpots, getSpotById, createSpot, updateSpot, deleteSpot } = require('../controllers/spotsController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes — anyone can access
router.get('/', getAllSpots);
router.get('/:id', getSpotById);

// Protected routes — must be logged in
router.post('/', protect, createSpot);
router.put('/:id', protect, updateSpot);
router.delete('/:id', protect, deleteSpot);

module.exports = router;