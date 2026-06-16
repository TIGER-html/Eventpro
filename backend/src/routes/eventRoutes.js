const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  createEvent, getMyEvents, getEventById,
  updateEvent, deleteEvent
} = require('../controllers/eventController');

router.post('/', verifyToken, requireRole('client', 'organisateur', 'admin'), createEvent);
router.get('/', verifyToken, getMyEvents);
router.get('/:id', verifyToken, getEventById);
router.put('/:id', verifyToken, requireRole('client', 'organisateur', 'admin'), updateEvent);
router.delete('/:id', verifyToken, requireRole('client', 'organisateur', 'admin'), deleteEvent);

module.exports = router;