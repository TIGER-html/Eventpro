const pool = require('../config/db');

exports.getAllServices = async (req, res) => {
  try {
    const { categorie } = req.query;
    let result;
    if (categorie) {
      result = await pool.query('SELECT * FROM services WHERE categorie = $1 AND actif = TRUE ORDER BY prix ASC', [categorie]);
    } else {
      result = await pool.query('SELECT * FROM services WHERE actif = TRUE ORDER BY categorie, prix ASC');
    }
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Service non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createService = async (req, res) => {
  try {
    const { nom, categorie, prix, image_url, description } = req.body;
    if (!nom || !categorie || !prix) return res.status(400).json({ message: 'Nom, catégorie et prix sont obligatoires' });
    const result = await pool.query(
      'INSERT INTO services (nom, categorie, prix, image_url, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nom, categorie, prix, image_url, description]
    );
    res.status(201).json({ message: 'Service créé', service: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, categorie, prix, image_url, description, actif } = req.body;
    const result = await pool.query(
      'UPDATE services SET nom=$1, categorie=$2, prix=$3, image_url=$4, description=$5, actif=$6 WHERE id=$7 RETURNING *',
      [nom, categorie, prix, image_url, description, actif, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Service non trouvé' });
    res.json({ message: 'Service mis à jour', service: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE services SET actif = FALSE WHERE id = $1', [id]);
    res.json({ message: 'Service désactivé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addServiceToEvent = async (req, res) => {
  try {
    const { event_id, service_id, quantite } = req.body;
    if (!event_id || !service_id) return res.status(400).json({ message: 'event_id et service_id sont obligatoires' });
    const service = await pool.query('SELECT prix FROM services WHERE id = $1', [service_id]);
    if (service.rows.length === 0) return res.status(404).json({ message: 'Service non trouvé' });
    const prix_total = service.rows[0].prix * (quantite || 1);
    const result = await pool.query(
      'INSERT INTO event_services (event_id, service_id, quantite, prix_total) VALUES ($1, $2, $3, $4) RETURNING *',
      [event_id, service_id, quantite || 1, prix_total]
    );
    res.status(201).json({ message: 'Service ajouté à l\'événement', event_service: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getServicesByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const result = await pool.query(
      `SELECT es.id, es.quantite, es.prix_total, s.nom, s.categorie, s.prix, s.description, s.image_url
       FROM event_services es JOIN services s ON es.service_id = s.id
       WHERE es.event_id = $1`,
      [event_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.removeServiceFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM event_services WHERE id = $1', [id]);
    res.json({ message: 'Service retiré de l\'événement' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getDevisForEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const servicesResult = await pool.query(
      `SELECT es.id, es.quantite, es.prix_total, s.nom, s.categorie, s.prix
       FROM event_services es JOIN services s ON es.service_id = s.id
       WHERE es.event_id = $1`,
      [event_id]
    );
    const services = servicesResult.rows;
    const sousTotal = services.reduce((acc, s) => acc + parseFloat(s.prix_total), 0);
    const taxes = sousTotal * 0.1925;
    const total = sousTotal + taxes;
    const eventResult = await pool.query('SELECT max_budget FROM events WHERE id = $1', [event_id]);
    const maxBudget = eventResult.rows.length > 0 ? parseFloat(eventResult.rows[0].max_budget) : 0;
    res.json({
      services,
      sous_total: sousTotal,
      taxes: taxes,
      total: total,
      budget_disponible: maxBudget,
      dans_budget: total <= maxBudget
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};