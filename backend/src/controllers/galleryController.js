const pool = require('../config/db');

exports.getPublicGallery = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT g.*, e.name as event_name FROM gallery g LEFT JOIN events e ON g.event_id = e.id ORDER BY g.created_at DESC LIMIT 20'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getGalleryByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const result = await pool.query('SELECT * FROM gallery WHERE event_id = $1 ORDER BY created_at DESC', [event_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addToGallery = async (req, res) => {
  try {
    const { event_id, url, type, description } = req.body;
    if (!url) return res.status(400).json({ message: 'URL est obligatoire' });
    const result = await pool.query(
      'INSERT INTO gallery (event_id, url, type, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [event_id, url, type || 'photo', description]
    );
    res.status(201).json({ message: 'Média ajouté', media: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteFromGallery = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery WHERE id = $1', [id]);
    res.json({ message: 'Média supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};