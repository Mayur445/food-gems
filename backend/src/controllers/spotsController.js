const prisma = require('../config/prisma');

// GET /api/spots — fetch all spots from database
const getAllSpots = async (req, res) => {
  try {
    const { search, category, priceRange } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) where.category = category;
    if (priceRange) where.priceRange = priceRange;

    const spots = await prisma.spot.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        photos: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: spots });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/spots/:id — fetch a single spot
const getSpotById = async (req, res) => {
  try {
    const { id } = req.params;

    // Like Django's Spot.objects.get(id=id)
    const spot = await prisma.spot.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true } },
        photos: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    res.json({ success: true, data: spot });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/spots — create a new spot
const createSpot = async (req, res) => {
  try {
    const {
      name, description, address, city,
      latitude, longitude, priceRange, category, createdBy
    } = req.body;

    // Like Django's Spot.objects.create(...)
    const spot = await prisma.spot.create({
      data: {
        name,
        description,
        address,
        city,
        latitude,
        longitude,
        priceRange,
        category,
        createdBy
      }
    });

    res.status(201).json({ success: true, data: spot });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSpots, getSpotById, createSpot };