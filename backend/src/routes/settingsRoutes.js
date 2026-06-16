const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { getSettings, updateSetting } = require('../controllers/settingsController');

router.get('/', getSettings);
router.put('/', verifyToken, requireRole('admin'), updateSetting);

module.exports = router;