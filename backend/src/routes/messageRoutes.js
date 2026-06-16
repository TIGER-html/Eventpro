const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { sendMessage, getMessages } = require('../controllers/messageController');

router.post('/', verifyToken, sendMessage);
router.get('/:event_provider_id', verifyToken, getMessages);

module.exports = router;