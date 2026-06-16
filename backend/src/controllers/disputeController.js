const pool = require('../config/db');

exports.createDispute = async (req, res) => {
  try {
    const { event_provider_id, titre, description } = req.body;
    const plaignant_id = req.user.id;
    if (!event_provider_id || !titre || !description) {
      return res.status(400).json({ message: 'event_provider_id, titre et description sont obligatoires' });
    }
    const result = await pool.query(
      'INSERT INTO disputes (event_provider_id, plaignant_id, titre, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [event_provider_id, plaignant_id, titre, description]
    );
    await pool.query(
      "INSERT INTO notifications (user_id, titre, message) SELECT u.id, 'Nouveau litige signalé', $1 FROM users u WHERE u.role = 'admin' LIMIT 1",
      [`Un litige a été ouvert : ${titre}`]
    );
    res.status(201).json({ message: 'Litige signalé avec succès', dispute: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const plaignant_id = req.user.id;
    const result = await pool.query(
      `SELECT d.*, e.name as event_name, ep.agreed_price
       FROM disputes d
       JOIN event_providers ep ON d.event_provider_id = ep.id
       JOIN events e ON ep.event_id = e.id
       WHERE d.plaignant_id = $1
       ORDER BY d.created_at DESC`,
      [plaignant_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};