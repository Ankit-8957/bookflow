const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRole('AUTHOR', 'ADMIN'));

router.get('/dashboard', authorController.getDashboard);
router.get('/profile', authorController.getProfile);
router.get('/me', authorController.getProfile);

module.exports = router;