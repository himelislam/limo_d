const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).populate('business');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }

    // Grant access
    req.user = currentUser;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Map frontend roles to backend roles
    const roleMap = {
      'admin': 'super_admin',
      'owner': 'business_owner',
      'driver': 'driver',
      'passenger': 'passenger'
    };

    const allowedRoles = roles.map(role => roleMap[role] || role);
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
