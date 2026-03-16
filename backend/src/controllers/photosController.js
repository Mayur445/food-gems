const prisma = require('../config/prisma');

const uploadPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, isPrimary } = req.body;

    const spot = await prisma.spot.findUnique({
      where: { id: parseInt(id) }
    });

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Spot not found'
      });
    }

    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // works with both upload.single and upload.any
    const file = req.file || req.files[0];

    const photo = await prisma.photo.create({
      data: {
        url: file.path,
        caption: caption || null,
        isPrimary: isPrimary === 'true',
        spotId: parseInt(id)
      }
    });

    res.status(201).json({ success: true, data: photo });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPhotos = async (req, res) => {
  try {
    const { id } = req.params;

    const photos = await prisma.photo.findMany({
      where: { spotId: parseInt(id) },
      orderBy: { isPrimary: 'desc' }
    });

    res.json({ success: true, data: photos });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadPhoto, getPhotos };