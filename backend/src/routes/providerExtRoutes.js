const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getMyRevenues, getMyStats,
  getMyAvailability, addAvailability, deleteAvailability,
  getMyGallery, addToMyGallery, deleteFromMyGallery,
  getMyPacks, createPack, updatePack, deletePack,
  proposePrice, getNegotiations, respondNegotiation,
  submitKyc, getMyKycStatus, recordView
} = require('../controllers/providerExtController');

router.get('/revenues', verifyToken, requireRole('prestataire'), getMyRevenues);
router.get('/stats', verifyToken, requireRole('prestataire'), getMyStats);

router.get('/availability', verifyToken, requireRole('prestataire'), getMyAvailability);
router.post('/availability', verifyToken, requireRole('prestataire'), addAvailability);
router.delete('/availability/:id', verifyToken, requireRole('prestataire'), deleteAvailability);

router.get('/gallery', verifyToken, requireRole('prestataire'), getMyGallery);
router.post('/gallery', verifyToken, requireRole('prestataire'), addToMyGallery);
router.delete('/gallery/:id', verifyToken, requireRole('prestataire'), deleteFromMyGallery);

router.get('/packs', verifyToken, requireRole('prestataire'), getMyPacks);
router.post('/packs', verifyToken, requireRole('prestataire'), createPack);
router.put('/packs/:id', verifyToken, requireRole('prestataire'), updatePack);
router.delete('/packs/:id', verifyToken, requireRole('prestataire'), deletePack);

router.post('/negotiate', verifyToken, proposePrice);
router.get('/negotiate/:event_provider_id', verifyToken, getNegotiations);
router.put('/negotiate/:id/respond', verifyToken, respondNegotiation);

router.post('/kyc', verifyToken, requireRole('prestataire'), submitKyc);
router.get('/kyc/status', verifyToken, requireRole('prestataire'), getMyKycStatus);

router.post('/view/:provider_id', recordView);

module.exports = router;