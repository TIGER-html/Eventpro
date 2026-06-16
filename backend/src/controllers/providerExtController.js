const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// ===== REVENUS =====
exports.getMyRevenues = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id, service_type FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json({ total_brut: 0, commission: 0, total_net: 0, mensuel: [], missions_payees: [] });
    const provider_id = providerResult.rows[0].id;
    const service_type = providerResult.rows[0].service_type;

    const commResult = await pool.query('SELECT taux FROM commissions WHERE categorie = $1 AND actif = TRUE LIMIT 1', [service_type]);
    const taux = commResult.rows.length > 0 ? parseFloat(commResult.rows[0].taux) : 10;

    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(ep.agreed_price), 0) as total FROM event_providers ep WHERE ep.provider_id = $1 AND ep.status = 'paid'`,
      [provider_id]
    );
    const totalBrut = parseFloat(totalResult.rows[0].total);
    const commission = totalBrut * (taux / 100);
    const totalNet = totalBrut - commission;

    const mensuelResult = await pool.query(
      `SELECT TO_CHAR(ep.created_at, 'Mon YYYY') as mois, SUM(ep.agreed_price) as total, DATE_TRUNC('month', ep.created_at) as mois_date
       FROM event_providers ep WHERE ep.provider_id = $1 AND ep.status = 'paid'
       GROUP BY TO_CHAR(ep.created_at, 'Mon YYYY'), DATE_TRUNC('month', ep.created_at)
       ORDER BY DATE_TRUNC('month', ep.created_at) DESC LIMIT 6`,
      [provider_id]
    );

    const missionsResult = await pool.query(
      `SELECT ep.id, ep.status, ep.agreed_price, ep.created_at,
              e.name as event_name, e.event_date, e.type, u.first_name, u.last_name
       FROM event_providers ep
       JOIN events e ON ep.event_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE ep.provider_id = $1 AND ep.status = 'paid'
       ORDER BY ep.created_at DESC LIMIT 10`,
      [provider_id]
    );

    res.json({ total_brut: totalBrut, commission, taux_commission: taux, total_net: totalNet, mensuel: mensuelResult.rows, missions_payees: missionsResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== STATISTIQUES =====
exports.getMyStats = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json({ total_missions: 0, total_vues: 0, taux_conversion: 0, note_moyenne: 0, total_avis: 0, demandes_en_attente: 0 });
    const provider_id = providerResult.rows[0].id;

    const [missions, vues, avis, pending] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM event_providers WHERE provider_id = $1', [provider_id]),
      pool.query('SELECT COUNT(*) FROM provider_views WHERE provider_id = $1', [provider_id]),
      pool.query('SELECT AVG(note) as avg, COUNT(*) as total FROM reviews WHERE event_id IN (SELECT event_id FROM event_providers WHERE provider_id = $1) AND approuve = TRUE', [provider_id]),
      pool.query("SELECT COUNT(*) FROM event_providers WHERE provider_id = $1 AND status = 'pending'", [provider_id]),
    ]);

    const totalMissions = parseInt(missions.rows[0].count);
    const totalVues = parseInt(vues.rows[0].count);

    res.json({
      total_missions: totalMissions,
      total_vues: totalVues,
      taux_conversion: totalVues > 0 ? ((totalMissions / totalVues) * 100).toFixed(1) : 0,
      note_moyenne: parseFloat(avis.rows[0].avg || 0).toFixed(1),
      total_avis: parseInt(avis.rows[0].total),
      demandes_en_attente: parseInt(pending.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== DISPONIBILITÉS =====
exports.getMyAvailability = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json([]);
    const result = await pool.query('SELECT * FROM provider_availability WHERE provider_id = $1 ORDER BY date_debut ASC', [providerResult.rows[0].id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addAvailability = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { date_debut, date_fin, statut, note } = req.body;
    if (!date_debut || !date_fin) return res.status(400).json({ message: 'Dates obligatoires' });
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: 'Profil prestataire non trouvé' });
    const result = await pool.query(
      'INSERT INTO provider_availability (provider_id, date_debut, date_fin, statut, note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [providerResult.rows[0].id, date_debut, date_fin, statut || 'bloque', note]
    );
    res.status(201).json({ message: 'Disponibilité ajoutée', availability: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM provider_availability WHERE id = $1', [id]);
    res.json({ message: 'Disponibilité supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== GALERIE (URL + Base64 upload) =====
exports.getMyGallery = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json([]);
    const result = await pool.query('SELECT * FROM provider_gallery WHERE provider_id = $1 ORDER BY created_at DESC', [providerResult.rows[0].id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.addToMyGallery = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { url, type, description, base64Data, fileName } = req.body;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: 'Profil prestataire non trouvé' });

    let finalUrl = url;

    if (base64Data && fileName) {
      const uploadsDir = path.join(__dirname, '../../uploads/gallery');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const ext = path.extname(fileName) || '.jpg';
      const uniqueName = `provider_${user_id}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);
      const base64WithoutPrefix = base64Data.replace(/^data:[^;]+;base64,/, '');
      fs.writeFileSync(filePath, Buffer.from(base64WithoutPrefix, 'base64'));
      finalUrl = `/uploads/gallery/${uniqueName}`;
    }

    if (!finalUrl) return res.status(400).json({ message: 'URL ou fichier obligatoire' });

    const result = await pool.query(
      'INSERT INTO provider_gallery (provider_id, url, type, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [providerResult.rows[0].id, finalUrl, type || 'photo', description]
    );
    res.status(201).json({ message: 'Média ajouté', media: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteFromMyGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT url FROM provider_gallery WHERE id = $1', [id]);
    if (result.rows.length > 0 && result.rows[0].url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../..', result.rows[0].url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('DELETE FROM provider_gallery WHERE id = $1', [id]);
    res.json({ message: 'Média supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== PACKS =====
exports.getMyPacks = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json([]);
    const result = await pool.query('SELECT * FROM provider_packs WHERE provider_id = $1 ORDER BY created_at DESC', [providerResult.rows[0].id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createPack = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { nom, description, prix, inclus } = req.body;
    if (!nom || !prix) return res.status(400).json({ message: 'Nom et prix obligatoires' });
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: 'Profil prestataire non trouvé' });
    const result = await pool.query(
      'INSERT INTO provider_packs (provider_id, nom, description, prix, inclus) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [providerResult.rows[0].id, nom, description, prix, inclus]
    );
    res.status(201).json({ message: 'Pack créé', pack: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updatePack = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, inclus, actif } = req.body;
    const result = await pool.query(
      'UPDATE provider_packs SET nom=$1, description=$2, prix=$3, inclus=$4, actif=$5 WHERE id=$6 RETURNING *',
      [nom, description, prix, inclus, actif, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pack non trouvé' });
    res.json({ message: 'Pack mis à jour', pack: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deletePack = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM provider_packs WHERE id = $1', [id]);
    res.json({ message: 'Pack supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== NÉGOCIATION =====
exports.proposePrice = async (req, res) => {
  try {
    const { event_provider_id, prix_propose, message } = req.body;
    const sender_id = req.user.id;
    if (!event_provider_id || !prix_propose) return res.status(400).json({ message: 'event_provider_id et prix_propose obligatoires' });
    const result = await pool.query(
      'INSERT INTO negotiations (event_provider_id, sender_id, prix_propose, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [event_provider_id, sender_id, prix_propose, message]
    );
    res.status(201).json({ message: 'Proposition envoyée', negotiation: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getNegotiations = async (req, res) => {
  try {
    const { event_provider_id } = req.params;
    const result = await pool.query(
      `SELECT n.*, u.first_name, u.last_name FROM negotiations n JOIN users u ON n.sender_id = u.id WHERE n.event_provider_id = $1 ORDER BY n.created_at ASC`,
      [event_provider_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.respondNegotiation = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const result = await pool.query('UPDATE negotiations SET statut = $1 WHERE id = $2 RETURNING *', [statut, id]);
    if (statut === 'accepte') {
      await pool.query(
        'UPDATE event_providers SET agreed_price = (SELECT prix_propose FROM negotiations WHERE id = $1) WHERE id = (SELECT event_provider_id FROM negotiations WHERE id = $1)',
        [id]
      );
    }
    res.json({ message: 'Réponse enregistrée', negotiation: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== KYC =====
exports.submitKyc = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { document_type, document_url } = req.body;
    if (!document_url) return res.status(400).json({ message: 'URL du document obligatoire' });
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: 'Profil prestataire non trouvé. Créez d\'abord votre profil.' });
    const existing = await pool.query('SELECT id FROM kyc_verifications WHERE provider_id = $1', [providerResult.rows[0].id]);
    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        'UPDATE kyc_verifications SET document_type=$1, document_url=$2, statut=$3, submitted_at=NOW() WHERE provider_id=$4 RETURNING *',
        [document_type, document_url, 'en_attente', providerResult.rows[0].id]
      );
    } else {
      result = await pool.query(
        'INSERT INTO kyc_verifications (provider_id, document_type, document_url) VALUES ($1, $2, $3) RETURNING *',
        [providerResult.rows[0].id, document_type, document_url]
      );
    }
    res.status(201).json({ message: 'Document soumis pour vérification', kyc: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMyKycStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const providerResult = await pool.query('SELECT id FROM providers WHERE user_id = $1', [user_id]);
    if (providerResult.rows.length === 0) return res.json(null);
    const result = await pool.query('SELECT * FROM kyc_verifications WHERE provider_id = $1', [providerResult.rows[0].id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== VUE PROFIL =====
exports.recordView = async (req, res) => {
  try {
    const { provider_id } = req.params;
    const viewer_ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    await pool.query('INSERT INTO provider_views (provider_id, viewer_ip) VALUES ($1, $2)', [provider_id, viewer_ip]);
    res.json({ message: 'Vue enregistrée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};