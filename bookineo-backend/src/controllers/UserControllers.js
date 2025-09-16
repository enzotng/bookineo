// controllers/UserController.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
  // ➕ Inscription utilisateur
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, birth_date } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe obligatoires" });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email déjà utilisé" });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const result = await db.query(
        `INSERT INTO users (email, password, first_name, last_name, birth_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, birth_date`,
        [email, hashedPassword, first_name, last_name, birth_date || null]
      );

      res.status(201).json({ user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔑 Connexion utilisateur
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe obligatoires" });
      }

      // Vérifier si l'utilisateur existe
      const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ error: "Email ou mot de passe incorrect" });
      }

      // Comparer le mot de passe
      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({ error: "Email ou mot de passe incorrect" });
      }

      // Créer un token JWT
      const token = jwt.sign(
        { id: user.rows[0].id, email: user.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 👤 Récupérer le profil utilisateur
  async getProfile(req, res) {
    try {
      const userId = req.user.id; // req.user défini par le middleware JWT
      const user = await db.query("SELECT id, email, first_name, last_name, birth_date FROM users WHERE id = $1", [userId]);
      res.json(user.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✏️ Modifier profil utilisateur
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { first_name, last_name, birth_date } = req.body;

      const result = await db.query(
        `UPDATE users SET first_name = $1, last_name = $2, birth_date = $3, updated_at = NOW()
         WHERE id = $4 RETURNING id, email, first_name, last_name, birth_date`,
        [first_name, last_name, birth_date, userId]
      );

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ❌ Supprimer un utilisateur
  async deleteUser(req, res) {
    try {
      const userId = req.user.id;

      await db.query("DELETE FROM users WHERE id = $1", [userId]);
      res.json({ message: "Utilisateur supprimé" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
