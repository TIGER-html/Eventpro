const pool = require('../config/db');

// ÉTAPE 5 - Ajouter une dépense
exports.addExpense = async (req, res) => {
  try {
    const { event_id, category, label, amount } = req.body;

    if (!event_id || !category || !amount) {
      return res.status(400).json({ message: "event_id, catégorie et montant sont obligatoires" });
    }

    const newExpense = await pool.query(
      `INSERT INTO expenses (event_id, category, label, amount) VALUES ($1, $2, $3, $4) RETURNING *`,
      [event_id, category, label, amount]
    );

    res.status(201).json({ message: "Dépense ajoutée", expense: newExpense.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer le résumé budgétaire d'un événement
exports.getBudgetSummary = async (req, res) => {
  try {
    const { event_id } = req.params;

    const eventResult = await pool.query('SELECT max_budget FROM events WHERE id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }
    const maxBudget = parseFloat(eventResult.rows[0].max_budget);

    const expensesResult = await pool.query(
      'SELECT category, SUM(amount) as total FROM expenses WHERE event_id = $1 GROUP BY category',
      [event_id]
    );

    const totalSpentResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE event_id = $1',
      [event_id]
    );
    const totalSpent = parseFloat(totalSpentResult.rows[0].total);

    const remaining = maxBudget - totalSpent;
    const isOverBudget = totalSpent > maxBudget;

    res.json({
      max_budget: maxBudget,
      total_spent: totalSpent,
      remaining: remaining,
      is_over_budget: isOverBudget,
      alert: isOverBudget ? "⚠️ Attention, vous avez dépassé votre budget !" : null,
      by_category: expensesResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Liste détaillée des dépenses (pour export PDF/Excel côté frontend)
exports.getExpenses = async (req, res) => {
  try {
    const { event_id } = req.params;
    const result = await pool.query('SELECT * FROM expenses WHERE event_id = $1 ORDER BY created_at DESC', [event_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une dépense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    res.json({ message: "Dépense supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};