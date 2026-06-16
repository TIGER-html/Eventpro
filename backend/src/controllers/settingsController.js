const pool = require('../config/db');

exports.getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT cle, valeur FROM settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.cle] = row.valeur; });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { cle, valeur } = req.body;
    if (!cle) return res.status(400).json({ message: 'La clé est obligatoire' });
    const result = await pool.query(
      'INSERT INTO settings (cle, valeur) VALUES ($1, $2) ON CONFLICT (cle) DO UPDATE SET valeur = $2, updated_at = NOW() RETURNING *',
      [cle, valeur]
    );
    res.json({ message: 'Paramètre mis à jour', setting: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};