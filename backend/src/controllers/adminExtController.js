const pool = require('../config/db');

// ===== ANALYTICS AVANCÉ =====
exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const [
      topServices, revenueByCity, revenueByCategory,
      activeProviders, kycPending, disputes,
      monthlyGrowth, topProviders
    ] = await Promise.all([
      pool.query(`SELECT s.nom, s.categorie, COUNT(es.id) as count
                  FROM event_services es JOIN services s ON es.service_id = s.id
                  GROUP BY s.nom, s.categorie ORDER BY count DESC LIMIT 5`),
      pool.query(`SELECT location as ville, COUNT(*) as events, SUM(max_budget) as budget_total
                  FROM events WHERE location IS NOT NULL
                  GROUP BY location ORDER BY events DESC LIMIT 10`),
      pool.query(`SELECT p.service_type as categorie, COUNT(ep.id) as missions, COALESCE(SUM(ep.agreed_price), 0) as revenus
                  FROM event_providers ep JOIN providers p ON ep.provider_id = p.id
                  WHERE ep.status = 'paid' GROUP BY p.service_type ORDER BY revenus DESC`),
      pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM providers`),
      pool.query(`SELECT COUNT(*) FROM kyc_verifications WHERE statut = 'en_attente'`),
      pool.query(`SELECT COUNT(*) FROM disputes WHERE statut = 'ouvert'`),
      pool.query(`SELECT TO_CHAR(created_at, 'Mon YYYY') as mois, COUNT(*) as nouveaux_clients
                  FROM users WHERE role = 'client'
                  GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
                  ORDER BY DATE_TRUNC('month', created_at) DESC LIMIT 6`),
      pool.query(`SELECT p.service_type, u.first_name, u.last_name, p.rating,
                  COUNT(ep.id) as missions, COALESCE(SUM(ep.agreed_price), 0) as revenus
                  FROM providers p
                  JOIN users u ON p.user_id = u.id
                  LEFT JOIN event_providers ep ON ep.provider_id = p.id AND ep.status = 'paid'
                  GROUP BY p.id, p.service_type, u.first_name, u.last_name, p.rating
                  ORDER BY revenus DESC LIMIT 5`),
    ]);

    res.json({
      top_services: topServices.rows,
      revenus_par_ville: revenueByCity.rows,
      revenus_par_categorie: revenueByCategory.rows,
      prestataires_actifs: parseInt(activeProviders.rows[0].count),
      kyc_en_attente: parseInt(kycPending.rows[0].count),
      litiges_ouverts: parseInt(disputes.rows[0].count),
      croissance_mensuelle: monthlyGrowth.rows,
      top_prestataires: topProviders.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== KYC ADMIN =====
exports.getAllKyc = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.*, p.service_type, u.first_name, u.last_name, u.email
       FROM kyc_verifications k
       JOIN providers p ON k.provider_id = p.id
       JOIN users u ON p.user_id = u.id
       ORDER BY k.submitted_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.reviewKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, note_admin } = req.body;
    const result = await pool.query(
      'UPDATE kyc_verifications SET statut=$1, note_admin=$2, reviewed_at=NOW() WHERE id=$3 RETURNING *',
      [statut, note_admin, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'KYC non trouvé' });

    const kyc = result.rows[0];
    const providerUser = await pool.query(
      'SELECT u.id FROM users u JOIN providers p ON p.user_id = u.id WHERE p.id = $1',
      [kyc.provider_id]
    );
    if (providerUser.rows.length > 0) {
      const msg = statut === 'verifie'
        ? 'Félicitations ! Votre identité a été vérifiée. Vous avez maintenant le badge vérifié ✅'
        : `Votre vérification KYC a été refusée. ${note_admin ? 'Raison : ' + note_admin : ''}`;
      await pool.query(
        'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
        [providerUser.rows[0].id, `Vérification KYC : ${statut}`, msg]
      );
    }
    res.json({ message: 'KYC mis à jour', kyc: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== COMMISSIONS =====
exports.getCommissions = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM commissions ORDER BY categorie ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { taux, description, actif } = req.body;
    const result = await pool.query(
      'UPDATE commissions SET taux=$1, description=$2, actif=$3 WHERE id=$4 RETURNING *',
      [taux, description, actif, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Commission non trouvée' });
    res.json({ message: 'Commission mise à jour', commission: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== LITIGES =====
exports.getAllDisputes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.first_name, u.last_name, u.email,
              e.name as event_name, ep.agreed_price
       FROM disputes d
       JOIN users u ON d.plaignant_id = u.id
       JOIN event_providers ep ON d.event_provider_id = ep.id
       JOIN events e ON ep.event_id = e.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, resolution } = req.body;
    const result = await pool.query(
      'UPDATE disputes SET statut=$1, resolution=$2, resolved_at=NOW() WHERE id=$3 RETURNING *',
      [statut, resolution, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Litige non trouvé' });
    const dispute = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
      [dispute.plaignant_id, 'Litige résolu', `Votre litige a été ${statut}. ${resolution ? 'Résolution : ' + resolution : ''}`]
    );
    res.json({ message: 'Litige résolu', dispute: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== REMBOURSEMENTS =====
exports.getAllRefunds = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.email, p.montant as montant_paiement, p.methode
       FROM refunds r
       JOIN users u ON r.user_id = u.id
       JOIN payments p ON r.payment_id = p.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const result = await pool.query(
      'UPDATE refunds SET statut=$1, processed_at=NOW() WHERE id=$2 RETURNING *',
      [statut, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Remboursement non trouvé' });
    const refund = result.rows[0];
    const msg = statut === 'approuve'
      ? `Votre demande de remboursement de ${refund.montant} FCFA a été approuvée.`
      : 'Votre demande de remboursement a été refusée.';
    await pool.query(
      'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
      [refund.user_id, `Remboursement ${statut}`, msg]
    );
    res.json({ message: 'Remboursement traité', refund: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== NOTIFICATION GLOBALE =====
exports.sendGlobalNotification = async (req, res) => {
  try {
    const { titre, message, cible } = req.body;
    const envoye_par = req.user.id;
    if (!titre || !message) return res.status(400).json({ message: 'Titre et message obligatoires' });

    await pool.query(
      'INSERT INTO global_notifications (titre, message, cible, envoye_par) VALUES ($1, $2, $3, $4)',
      [titre, message, cible || 'tous', envoye_par]
    );

    let usersResult;
    if (cible === 'clients') {
      usersResult = await pool.query("SELECT id FROM users WHERE role = 'client'");
    } else if (cible === 'prestataires') {
      usersResult = await pool.query("SELECT id FROM users WHERE role = 'prestataire'");
    } else {
      usersResult = await pool.query("SELECT id FROM users WHERE role != 'admin'");
    }

    const insertPromises = usersResult.rows.map(u =>
      pool.query('INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)', [u.id, titre, message])
    );
    await Promise.all(insertPromises);

    res.json({ message: `Notification envoyée à ${usersResult.rows.length} utilisateur(s)`, count: usersResult.rows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getGlobalNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gn.*, u.first_name, u.last_name FROM global_notifications gn
       LEFT JOIN users u ON gn.envoye_par = u.id
       ORDER BY gn.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== SUSPENSION UTILISATEUR =====
exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspendre } = req.body;
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, role',
      [suspendre ? 'suspendu' : 'client', id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    if (suspendre) {
      await pool.query(
        'INSERT INTO notifications (user_id, titre, message) VALUES ($1, $2, $3)',
        [id, 'Compte suspendu', 'Votre compte a été suspendu par l\'administrateur. Contactez le support pour plus d\'informations.']
      );
    }
    res.json({ message: suspendre ? 'Compte suspendu' : 'Compte réactivé', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};