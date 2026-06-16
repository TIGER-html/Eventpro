const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  addExpense, getBudgetSummary, getExpenses, deleteExpense
} = require('../controllers/budgetController');

router.post('/', verifyToken, requireRole('client', 'organisateur', 'admin'), addExpense);
router.get('/event/:event_id/summary', verifyToken, getBudgetSummary);
router.get('/event/:event_id', verifyToken, getExpenses);
router.delete('/:id', verifyToken, requireRole('client', 'organisateur', 'admin'), deleteExpense);

module.exports = router;