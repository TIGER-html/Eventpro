const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getAllProviders, getMyProviderProfile, createProvider,
  requestProvider, updateProviderStatus,
  getProvidersByEvent, getMyMissions
} = require('../controllers/providerController');

router.get('/', getAllProviders);
router.get('/my-profile', verifyToken, requireRole('prestataire', 'admin'), getMyProviderProfile);
router.get('/my-missions', verifyToken, requireRole('prestataire'), getMyMissions);
router.post('/', verifyToken, requireRole('prestataire', 'admin'), createProvider);
router.post('/request', verifyToken, requireRole('client', 'organisateur', 'admin'), requestProvider);
router.put('/:id/status', verifyToken, requireRole('prestataire', 'admin'), updateProviderStatus);
router.get('/event/:event_id', verifyToken, getProvidersByEvent);

module.exports = router;