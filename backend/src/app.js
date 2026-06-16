const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const guestRoutes = require('./routes/guestRoutes');
const providerRoutes = require('./routes/providerRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const messageRoutes = require('./routes/messageRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userSettingsRoutes = require('./routes/userSettingsRoutes');
const providerExtRoutes = require('./routes/providerExtRoutes');
const adminExtRoutes = require('./routes/adminExtRoutes');
const disputeRoutes = require('./routes/disputeRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/provider-ext', providerExtRoutes);
app.use('/api/admin-ext', adminExtRoutes);
app.use('/api/disputes', disputeRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API EventPro Cameroun 🎉" });
});

module.exports = app;