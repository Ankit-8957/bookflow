const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { User } = require('../models');
const AppError = require('../utils/AppError');

exports.login = async (email, password) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AppError('Email is required', 400);
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    throw new AppError('Password is required', 400);
  }
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    throw new AppError('Please provide a valid email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      authorId: user.authorId || null,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      authorId: user.authorId || null,
      city: user.city || '',
      phone: user.phone || '',
    },
  };
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    authorId: user.authorId || null,
    city: user.city || '',
    phone: user.phone || '',
  };
};
