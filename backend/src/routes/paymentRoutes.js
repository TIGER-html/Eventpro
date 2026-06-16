const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  createPayment, getMyPayments, getPaymentsByEvent,
  uploadPreuve, getAllPayments, updatePaymentStatus
} = require('../controllers/paymentController');

// Client et prestataire peuvent payer, PAS l'admin
router.post('/', verifyToken, requireRole('client', 'prestataire', 'organisateur'), createPayment);
router.get('/my', verifyToken, getMyPayments);
router.get('/event/:event_id', verifyToken, getPaymentsByEvent);
router.put('/:id/preuve', verifyToken, requireRole('client', 'prestataire', 'organisateur'), uploadPreuve);

// Admin seulement
router.get('/admin/all', verifyToken, requireRole('admin'), getAllPayments);
router.put('/:id/status', verifyToken, requireRole('admin'), updatePaymentStatus);

module.exports = router;