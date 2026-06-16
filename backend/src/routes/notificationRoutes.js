const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getMyNotifications, markAsRead, markAllAsRead,
  getUnreadCount, sendNotification
} = require('../controllers/notificationController');

router.get('/', verifyToken, getMyNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/read-all', verifyToken, markAllAsRead);
router.post('/send', verifyToken, sendNotification);

module.exports = router;