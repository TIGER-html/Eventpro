const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// INSCRIPTION
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, role, ville } = req.body;

    if (!first_name || !email || !password) {
      return res.status(400).json({ message: "Prénom, email et mot de passe sont obligatoires" });
    }

    // Validation du rôle
    const rolesAutorises = ['client', 'prestataire', 'admin', 'organisateur'];
    const roleChoisi = rolesAutorises.includes(role) ? role : 'client';

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, ville)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, hashedPassword, phone, roleChoisi, ville || null]
    );

    const user = newUser.rows[0];

    // Générer le token directement à l'inscription
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Compte créé avec succès",
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
};

// CONNEXION
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};