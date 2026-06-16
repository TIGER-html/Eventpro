const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, events, payments, pendingPayments, reviews] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']),
      pool.query('SELECT COUNT(*) FROM events'),
      pool.query('SELECT COALESCE(SUM(montant), 0) as total FROM payments WHERE statut = $1', ['valide']),
      pool.query('SELECT COUNT(*) FROM payments WHERE statut = $1', ['en_attente']),
      pool.query('SELECT COUNT(*) FROM reviews WHERE approuve = FALSE'),
    ]);

    const revenueByMonth = await pool.query(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') as mois, SUM(montant) as total
       FROM payments WHERE statut = 'valide'
       GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) DESC LIMIT 6`
    );

    const eventsByType = await pool.query(
      `SELECT type, COUNT(*) as count FROM events GROUP BY type ORDER BY count DESC`
    );

    res.json({
      total_clients: parseInt(users.rows[0].count),
      total_events: parseInt(events.rows[0].count),
      total_revenus: parseFloat(payments.rows[0].total),
      paiements_en_attente: parseInt(pendingPayments.rows[0].count),
      avis_en_attente: parseInt(reviews.rows[0].count),
      revenus_par_mois: revenueByMonth.rows,
      events_par_type: eventsByType.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, role', [role, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Rôle mis à jour', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.email
       FROM events e LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, u.first_name, u.last_name FROM logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addLog = async (user_id, action, details, ip) => {
  try {
    await pool.query(
      'INSERT INTO logs (user_id, action, details, ip) VALUES ($1, $2, $3, $4)',
      [user_id, action, details, ip]
    );
  } catch (error) {
    console.error('Log error:', error);
  }
};