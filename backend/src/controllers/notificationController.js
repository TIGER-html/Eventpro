const pool = require('../config/db');

exports.getMyNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET lu = TRUE WHERE id = $1', [id]);
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    await pool.query('UPDATE notifications SET lu = TRUE WHERE user_id = $1', [user_id]);
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND lu = FALSE',
      [user_id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { user_id, titre, message } = req.body;
    if (!user_id || !titre || !message) return res.status(400).json({ message: 'user_id, titre et message sont obligatoires' });
    const result = await pool.query(
      'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3) RETURNING *',
      [user_id, titre, message]
    );
    res.status(201).json({ message: 'Notification envoyée', notification: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};