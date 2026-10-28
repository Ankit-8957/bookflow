const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/my', ticketController.getTickets);
router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicketById);
router.post('/:id/messages', ticketController.addMessage);

module.exports = router;
