const pool = require('../config/db');

exports.createPayment = async (req, res) => {
  try {
    const { event_id, montant, methode, transaction_id } = req.body;
    const user_id = req.user.id;
    if (!event_id || !montant || !methode) return res.status(400).json({ message: 'event_id, montant et méthode sont obligatoires' });
    const result = await pool.query(
      'INSERT INTO payments (event_id, user_id, montant, methode, transaction_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [event_id, user_id, montant, methode, transaction_id]
    );
    await pool.query(
      'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
      [user_id, 'Paiement reçu', `Votre paiement de ${montant} FCFA a bien été enregistré et est en cours de vérification.`]
    );
    res.status(201).json({ message: 'Paiement enregistré', payment: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      `SELECT p.*, e.name as event_name FROM payments p
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getPaymentsByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM payments WHERE event_id = $1 ORDER BY created_at DESC',
      [event_id]
    );
    const totalPaye = result.rows.filter(p => p.statut === 'valide').reduce((acc, p) => acc + parseFloat(p.montant), 0);
    res.json({ payments: result.rows, total_paye: totalPaye });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.uploadPreuve = async (req, res) => {
  try {
    const { id } = req.params;
    const { preuve_url } = req.body;
    const result = await pool.query(
      'UPDATE payments SET preuve_url = $1 WHERE id = $2 RETURNING *',
      [preuve_url, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Paiement non trouvé' });
    res.json({ message: 'Preuve uploadée', payment: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, e.name as event_name, u.first_name, u.last_name, u.email
       FROM payments p
       LEFT JOIN events e ON p.event_id = e.id
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const validStatuts = ['en_attente', 'valide', 'refuse'];
    if (!validStatuts.includes(statut)) return res.status(400).json({ message: 'Statut invalide' });
    const result = await pool.query(
      'UPDATE payments SET statut = $1 WHERE id = $2 RETURNING *',
      [statut, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Paiement non trouvé' });
    const payment = result.rows[0];
    const message = statut === 'valide' ? 'Votre paiement a été validé avec succès !' : 'Votre paiement a été refusé. Veuillez nous contacter.';
    await pool.query(
      'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
      [payment.user_id, `Paiement ${statut}`, message]
    );
    res.json({ message: 'Statut mis à jour', payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};