const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  addGuest, importGuests, getGuestsByEvent,
  updateRsvp, assignTable, deleteGuest
} = require('../controllers/guestController');

router.post('/', verifyToken, requireRole('client', 'organisateur', 'admin'), addGuest);
router.post('/import', verifyToken, requireRole('client', 'organisateur', 'admin'), importGuests);
router.get('/event/:event_id', verifyToken, getGuestsByEvent);
router.put('/:id/rsvp', updateRsvp);
router.put('/:id/table', verifyToken, assignTable);
router.delete('/:id', verifyToken, requireRole('client', 'organisateur', 'admin'), deleteGuest);

module.exports = router;