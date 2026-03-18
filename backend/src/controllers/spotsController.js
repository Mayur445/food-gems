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

// PUT /api/spots/:id — update a spot (owner only)
const updateSpot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check spot exists
    const spot = await prisma.spot.findUnique({
      where: { id: parseInt(id) }
    });

    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // Check ownership — like Django's spot.created_by == request.user
    if (spot.createdBy !== req.userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own spots' });
    }

    const {
      name, description, address, city,
      latitude, longitude, priceRange, category
    } = req.body;

    const updated = await prisma.spot.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(address !== undefined && { address }),
        ...(city && { city }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        ...(priceRange && { priceRange }),
        ...(category && { category }),
      }
    });

    res.json({ success: true, data: updated });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/spots/:id — delete a spot (owner only)
const deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check spot exists
    const spot = await prisma.spot.findUnique({
      where: { id: parseInt(id) }
    });

    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    // Check ownership
    if (spot.createdBy !== req.userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own spots' });
    }

    // Delete related photos and reviews first (Prisma won't cascade automatically
    // unless you set onDelete: Cascade in schema — this is the safe manual way)
    await prisma.photo.deleteMany({ where: { spotId: parseInt(id) } });
    await prisma.review.deleteMany({ where: { spotId: parseInt(id) } });
    await prisma.spot.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'Spot deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSpots, getSpotById, createSpot, updateSpot, deleteSpot };