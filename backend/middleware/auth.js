// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { isDbConnected } = require('../config/db');
// const memoryStore = require('../config/memoryStore');

// const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eprescription_super_secret_jwt_key_2026_health');
      
//       if (isDbConnected()) {
//         req.user = await User.findById(decoded.id).select('-password');
//       } else {
//         const found = memoryStore.users.find(u => u._id.toString() === decoded.id.toString());
//         if (found) {
//           const { password, ...userWithoutPass } = found;
//           req.user = userWithoutPass;
//         }
//       }

//       if (!req.user) {
//         return res.status(401).json({ message: 'Not authorized, user profile not found' });
//       }
//       return next();
//     } catch (error) {
//       console.error('Auth middleware error:', error);
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token provided' });
//   }
// };

// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: `User role '${req.user.role}' is not authorized to access this route` 
//       });
//     }
//     next();
//   };
// };

// module.exports = { protect, authorize };


//   new code purane wale ma string error aa rhi thi  line 15 ma 


const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');  // ✅ Add this
const User = require('../models/User');
const { isDbConnected } = require('../config/db');
const memoryStore = require('../config/memoryStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'eprescription_super_secret_jwt_key_2026_health');
      
      const id = decoded.id;
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);  // ✅ Check karo

      if (isDbConnected() && isValidObjectId) {
        // ✅ Sirf tab MongoDB query karo jab ID valid ObjectId ho
        req.user = await User.findById(id).select('-password');
      } else {
        // ✅ Memory store mein search (string IDs ke liye bhi)
        const found = memoryStore.users.find(u => {
          const uid = u._id?.toString ? u._id.toString() : u._id;
          return uid === id.toString();
        });
        
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
      console.error('Auth middleware error:', error.message);
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