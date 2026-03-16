const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Helper function to generate a JWT token
// Like Django's token generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },                          // payload — data stored inside the token
    process.env.JWT_SECRET,              // secret key to sign the token
    { expiresIn: process.env.JWT_EXPIRES_IN } // token expiry
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    // Like Django's User.objects.filter(email=email).exists()
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 2. Hash the password before saving
    // Like Django's make_password()
    // The number 12 is the "salt rounds" — higher = more secure but slower
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // 4. Generate a JWT token
    const token = generateToken(user.id);

    // 5. Send back the user (without password) and token
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 2. Compare password with hashed password in database
    // Like Django's check_password()
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Generate token
    const token = generateToken(user.id);

    // 4. Send back user and token
    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me — get currently logged in user
const getMe = async (req, res) => {
  try {
    // req.userId is set by the auth middleware (we'll build that next)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, avatar: true, bio: true, createdAt: true }
    });

    res.json({ success: true, data: user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };