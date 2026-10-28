const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRole('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/tickets', adminController.getAllTickets);
router.get('/tickets/:id', adminController.getTicketById);

router.patch('/tickets/:id/status', adminController.updateStatus);
router.patch('/tickets/:id/category', adminController.updateCategory);
router.patch('/tickets/:id/priority', adminController.updatePriority);
router.patch('/tickets/:id', adminController.updateStatus); // backward compatibility

router.post('/tickets/:id/assign', adminController.assignTicket);
router.post('/tickets/:id/notes', adminController.addInternalNote);
router.post('/tickets/:id/replies', adminController.sendReply);
router.post('/tickets/:id/ai-draft', adminController.generateAiDraft);

module.exports = router;