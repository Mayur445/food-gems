const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/users/me/spots — get spots created by logged in user
const getMySpots = async (req, res) => {
  try {
    const spots = await prisma.spot.findMany({
      where: { createdBy: req.userId },
      include: {
        photos: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: spots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch your spots' });
  }
};

// PUT /api/users/me — update name and bio
const updateProfile = async (req, res) => {
  const { name, bio } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { getMySpots, updateProfile };