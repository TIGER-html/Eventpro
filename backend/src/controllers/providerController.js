const pool = require('../config/db');

exports.getAllProviders = async (req, res) => {
  try {
    const { service_type } = req.query;
    let result;
    if (service_type) {
      result = await pool.query(
        `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
         FROM providers p JOIN users u ON p.user_id = u.id
         WHERE p.service_type = $1 ORDER BY p.rating DESC`, [service_type]);
    } else {
      result = await pool.query(
        `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
         FROM providers p JOIN users u ON p.user_id = u.id
         ORDER BY p.rating DESC`);
    }
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMyProviderProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query('SELECT * FROM providers WHERE user_id = $1', [user_id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createProvider = async (req, res) => {
  try {
    const { service_type, description, price } = req.body;
    const user_id = req.user.id;
    if (!service_type) return res.status(400).json({ message: 'Le type de service est obligatoire' });
    const existing = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (existing.rows.length > 0) {
      const updated = await pool.query(
        'UPDATE providers SET service_type=$1, description=$2, price=$3 WHERE user_id=$4 RETURNING *',
        [service_type, description, price || 0, user_id]
      );
      return res.json({ message: 'Profil mis à jour', provider: updated.rows[0] });
    }
    const newProvider = await pool.query(
      'INSERT INTO providers (user_id, service_type, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, service_type, description, price || 0]
    );
    res.status(201).json({ message: 'Profil prestataire créé', provider: newProvider.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.requestProvider = async (req, res) => {
  try {
    const { event_id, provider_id, agreed_price } = req.body;
    if (!event_id || !provider_id) return res.status(400).json({ message: 'event_id et provider_id sont obligatoires' });
    const newRequest = await pool.query(
      `INSERT INTO event_providers (event_id, provider_id, agreed_price, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [event_id, provider_id, agreed_price || null]
    );
    const provider = await pool.query('SELECT user_id FROM providers WHERE id = $1', [provider_id]);
    if (provider.rows.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
        [provider.rows[0].user_id, 'Nouvelle demande de devis', 'Un client vous a envoyé une demande de devis pour son événement.']
      );
    }
    res.status(201).json({ message: 'Demande envoyée', request: newRequest.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agreed_price } = req.body;
    const updated = await pool.query(
      'UPDATE event_providers SET status=$1, agreed_price=COALESCE($2, agreed_price) WHERE id=$3 RETURNING *',
      [status, agreed_price, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Demande non trouvée' });
    res.json({ message: 'Statut mis à jour', request: updated.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getProvidersByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const result = await pool.query(
      `SELECT ep.id, ep.status, ep.agreed_price, ep.created_at,
              p.service_type, p.description, p.price, p.rating,
              u.first_name, u.last_name, u.phone
       FROM event_providers ep
       JOIN providers p ON ep.provider_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE ep.event_id = $1`, [event_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMyMissions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json([]);
    const provider_id = providerResult.rows[0].id;
    const result = await pool.query(
      `SELECT ep.id, ep.status, ep.agreed_price, ep.created_at,
              e.name as event_name, e.event_date, e.location, e.type,
              u.first_name as client_first_name, u.last_name as client_last_name,
              u.email as client_email, u.phone as client_phone
       FROM event_providers ep
       JOIN events e ON ep.event_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE ep.provider_id = $1
       ORDER BY ep.created_at DESC`, [provider_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};