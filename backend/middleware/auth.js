const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eprescription_super_secret_jwt_key_2026_health');
      
      if (isDbConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const found = memoryStore.users.find(u => u._id.toString() === decoded.id.toString());
        if (found) {
          const { password, ...userWithoutPass } = found;
          req.user = userWithoutPass;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user profile not found' });
      }
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
