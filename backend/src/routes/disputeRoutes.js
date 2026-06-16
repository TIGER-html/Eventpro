const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { createDispute, getMyDisputes } = require('../controllers/disputeController');

router.post('/', verifyToken, createDispute);
router.get('/my', verifyToken, getMyDisputes);

module.exports = router;