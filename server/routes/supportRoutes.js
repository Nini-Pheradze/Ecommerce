const express = require('express');
const supportController = require('../controllers/supportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', supportController.getTickets);
router.post('/', supportController.createTicket);
router.get('/:id', supportController.getTicket);
router.post('/:id/messages', supportController.addMessage);
router.patch('/:id/status', restrictTo('admin', 'moderator'), supportController.updateStatus);

module.exports = router;
