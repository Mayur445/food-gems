const express = require('express');
const router = express.Router({ mergeParams: true });
const { uploadPhoto, getPhotos } = require('../controllers/photosController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getPhotos);
router.post('/', protect, upload.any(), uploadPhoto);

module.exports = router;