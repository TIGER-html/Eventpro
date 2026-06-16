const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getDashboardStats, getAllUsers, updateUserRole,
  getAllEvents, getLogs
} = require('../controllers/adminController');

router.get('/stats', verifyToken, requireRole('admin'), getDashboardStats);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.put('/users/:id/role', verifyToken, requireRole('admin'), updateUserRole);
router.get('/events', verifyToken, requireRole('admin'), getAllEvents);
router.get('/logs', verifyToken, requireRole('admin'), getLogs);

module.exports = router;