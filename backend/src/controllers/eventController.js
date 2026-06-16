const pool = require('../config/db');

// ÉTAPE 2 - Créer un événement
exports.createEvent = async (req, res) => {
  try {
    const { name, type, event_date, location, expected_guests, max_budget, theme_color, image_url } = req.body;
    const user_id = req.user.id;

    if (!name || !type || !event_date) {
      return res.status(400).json({ message: "Nom, type et date sont obligatoires" });
    }

    const newEvent = await pool.query(
      `INSERT INTO events (user_id, name, type, event_date, location, expected_guests, max_budget, theme_color, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user_id, name, type, event_date, location, expected_guests || 0, max_budget || 0, theme_color, image_url]
    );

    res.status(201).json({ message: "Événement créé avec succès", event: newEvent.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la création de l'événement" });
  }
};

// Récupérer tous les événements de l'utilisateur connecté
exports.getMyEvents = async (req, res) => {
  try {
    const user_id = req.user.id;
    const events = await pool.query('SELECT * FROM events WHERE user_id = $1 ORDER BY event_date ASC', [user_id]);
    res.json(events.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un événement précis
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

    if (event.rows.length === 0) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.json(event.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, event_date, location, expected_guests, max_budget, theme_color, image_url } = req.body;

    const updated = await pool.query(
      `UPDATE events SET name=$1, type=$2, event_date=$3, location=$4, expected_guests=$5, max_budget=$6, theme_color=$7, image_url=$8
       WHERE id=$9 RETURNING *`,
      [name, type, event_date, location, expected_guests, max_budget, theme_color, image_url, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.json({ message: "Événement mis à jour", event: updated.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};