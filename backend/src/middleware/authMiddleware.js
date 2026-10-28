const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { User } = require('../models');

exports.verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Bearer Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.bookleaf_token) {
      // 2. Check HTTP-only cookie
      token = req.cookies.bookleaf_token;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please sign in.', 401));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return next(new AppError('Invalid or expired authentication token.', 401));
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired authentication token.', 401));
    }
    next(err);
  }
};

exports.requireRole = (...roles) => {
  const upperRoles = roles.map((r) => String(r).toUpperCase());
  return (req, res, next) => {
    if (!req.user || !upperRoles.includes(String(req.user.role).toUpperCase())) {
      return next(new AppError('Access denied: insufficient permissions.', 403));
    }
    next();
  };
};

// Aliases for compatibility
exports.requireAuth = exports.verifyToken;
exports.protect = exports.verifyToken;
exports.authorize = exports.requireRole;
