const express = require('express');
const router = express.Router();
const { getMySpots, updateProfile } = require('../controllers/usersController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/me/spots', protect, getMySpots);
router.put('/me', protect, updateProfile);

module.exports = router;