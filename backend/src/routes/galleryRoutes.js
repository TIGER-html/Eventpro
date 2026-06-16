const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getPublicGallery, getGalleryByEvent, addToGallery, deleteFromGallery
} = require('../controllers/galleryController');

router.get('/public', getPublicGallery);
router.get('/event/:event_id', verifyToken, getGalleryByEvent);
router.post('/', verifyToken, requireRole('admin'), addToGallery);
router.delete('/:id', verifyToken, requireRole('admin'), deleteFromGallery);

module.exports = router;