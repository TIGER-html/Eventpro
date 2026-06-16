const app = require('./src/app');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Serveur EventPro démarré sur http://localhost:${PORT}`);
});