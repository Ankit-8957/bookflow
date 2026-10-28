const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    const isProduction = process.env.NODE_ENV === 'production';

    // Set secure HTTP-only cookie (supports cross-origin in production)
    res.cookie('bookleaf_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('bookleaf_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
};
