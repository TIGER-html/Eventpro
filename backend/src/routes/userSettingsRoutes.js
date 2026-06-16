const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getMySettings,
  updateMySettings,
  updateMyProfile,
  changePassword,
  deleteMyAccount
} = require('../controllers/userSettingsController');

router.get('/', verifyToken, getMySettings);
router.put('/', verifyToken, updateMySettings);
router.put('/profile', verifyToken, updateMyProfile);
router.put('/password', verifyToken, changePassword);
router.delete('/account', verifyToken, deleteMyAccount);

module.exports = router;