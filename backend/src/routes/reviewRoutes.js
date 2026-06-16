const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getApprovedReviews, createReview, getAllReviews,
  approveReview, deleteReview
} = require('../controllers/reviewController');

router.get('/public', getApprovedReviews);
router.post('/', verifyToken, requireRole('client', 'organisateur'), createReview);
router.get('/admin/all', verifyToken, requireRole('admin'), getAllReviews);
router.put('/:id/approve', verifyToken, requireRole('admin'), approveReview);
router.delete('/:id', verifyToken, requireRole('admin'), deleteReview);

module.exports = router;