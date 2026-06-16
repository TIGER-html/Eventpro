const pool = require('../config/db');

exports.getApprovedReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, e.name as event_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN events e ON r.event_id = e.id
       WHERE r.approuve = TRUE ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { event_id, note, commentaire } = req.body;
    const user_id = req.user.id;
    if (!note) return res.status(400).json({ message: 'La note est obligatoire' });
    const result = await pool.query(
      'INSERT INTO reviews (user_id, event_id, note, commentaire) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, event_id, note, commentaire]
    );
    res.status(201).json({ message: 'Avis soumis, en attente de validation', review: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, e.name as event_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN events e ON r.event_id = e.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE reviews SET approuve = TRUE WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Avis non trouvé' });
    res.json({ message: 'Avis approuvé', review: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Avis supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};