const authorService = require('../services/authorService');
const { successResponse } = require('../utils/apiResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await authorService.getAuthorDashboard(req.user);
    return successResponse(res, stats);
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await authorService.getAuthorProfile(req.user);
    return successResponse(res, profile);
  } catch (err) {
    next(err);
  }
};

exports.getMyProfile = exports.getProfile;
