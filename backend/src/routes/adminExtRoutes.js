const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getAdvancedAnalytics,
  getAllKyc, reviewKyc,
  getCommissions, updateCommission,
  getAllDisputes, resolveDispute,
  getAllRefunds, processRefund,
  sendGlobalNotification, getGlobalNotifications,
  suspendUser
} = require('../controllers/adminExtController');

router.get('/analytics', verifyToken, requireRole('admin'), getAdvancedAnalytics);

router.get('/kyc', verifyToken, requireRole('admin'), getAllKyc);
router.put('/kyc/:id', verifyToken, requireRole('admin'), reviewKyc);

router.get('/commissions', verifyToken, requireRole('admin'), getCommissions);
router.put('/commissions/:id', verifyToken, requireRole('admin'), updateCommission);

router.get('/disputes', verifyToken, requireRole('admin'), getAllDisputes);
router.put('/disputes/:id/resolve', verifyToken, requireRole('admin'), resolveDispute);

router.get('/refunds', verifyToken, requireRole('admin'), getAllRefunds);
router.put('/refunds/:id/process', verifyToken, requireRole('admin'), processRefund);

router.post('/notify-all', verifyToken, requireRole('admin'), sendGlobalNotification);
router.get('/global-notifications', verifyToken, requireRole('admin'), getGlobalNotifications);

router.put('/users/:id/suspend', verifyToken, requireRole('admin'), suspendUser);

module.exports = router;