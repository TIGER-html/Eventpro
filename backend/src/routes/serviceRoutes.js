const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getAllServices, getServiceById, createService, updateService,
  deleteService, addServiceToEvent, getServicesByEvent,
  removeServiceFromEvent, getDevisForEvent
} = require('../controllers/serviceController');

// Public
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin seulement
router.post('/', verifyToken, requireRole('admin'), createService);
router.put('/:id', verifyToken, requireRole('admin'), updateService);
router.delete('/:id', verifyToken, requireRole('admin'), deleteService);

// Client
router.post('/event/add', verifyToken, requireRole('client', 'organisateur'), addServiceToEvent);
router.get('/event/:event_id', verifyToken, getServicesByEvent);
router.delete('/event/:id/remove', verifyToken, requireRole('client', 'organisateur'), removeServiceFromEvent);
router.get('/event/:event_id/devis', verifyToken, getDevisForEvent);

module.exports = router;