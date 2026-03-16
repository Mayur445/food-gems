const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// This middleware runs before the controller
// Like Django's @login_required decorator
const protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in the request headers
    // The frontend sends: Authorization: Bearer <token>
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // extract token after "Bearer "
    }
    

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to continue.'
      });
    }

    // 2. Verify the token is valid and not expired
    // Like Django checking if the session is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // 4. Attach user id to request object
    // Like Django's request.user
    req.userId = user.id;
    req.user = user;

    // 5. Move on to the next function (the controller)
    // Like Django's next middleware in the chain
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { protect };

