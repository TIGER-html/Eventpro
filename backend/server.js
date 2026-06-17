const app = require('./src/app');
const pool = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test de connexion PostgreSQL au démarrage
pool.query('SELECT NOW()')
  .then((result) => {
    console.log('✅ Connexion PostgreSQL OK');
    console.log('Heure DB :', result.rows[0].now);
  })
  .catch((err) => {
    console.error('❌ Erreur PostgreSQL :');
    console.error(err);
  });

app.listen(PORT, () => {
  console.log(`✅ Serveur EventPro démarré sur http://localhost:${PORT}`);
});