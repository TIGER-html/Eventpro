const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getMySettings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      const created = await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *', [user_id]
      );
      return res.json(created.rows[0]);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateMySettings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { langue, theme, notif_email, notif_sms, disponible, ville, pays, indicatif } = req.body;
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, langue, theme, notif_email, notif_sms, disponible, ville, pays, indicatif)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id) DO UPDATE SET
         langue = COALESCE($2, user_settings.langue),
         theme = COALESCE($3, user_settings.theme),
         notif_email = COALESCE($4, user_settings.notif_email),
         notif_sms = COALESCE($5, user_settings.notif_sms),
         disponible = COALESCE($6, user_settings.disponible),
         ville = COALESCE($7, user_settings.ville),
         pays = COALESCE($8, user_settings.pays),
         indicatif = COALESCE($9, user_settings.indicatif),
         updated_at = NOW()
       RETURNING *`,
      [user_id, langue, theme, notif_email, notif_sms, disponible, ville, pays, indicatif]
    );
    res.json({ message: 'Paramètres mis à jour', settings: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { first_name, last_name, phone } = req.body;
    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone)
       WHERE id = $4
       RETURNING id, first_name, last_name, email, phone, role`,
      [first_name, last_name, phone, user_id]
    );
    res.json({ message: 'Profil mis à jour', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Mot de passe actuel et nouveau requis' });
    }
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const valid = await bcrypt.compare(current_password, userResult.rows[0].password);
    if (!valid) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user_id]);
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteMyAccount = async (req, res) => {
  try {
    const user_id = req.user.id;
    await pool.query('DELETE FROM users WHERE id = $1', [user_id]);
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};