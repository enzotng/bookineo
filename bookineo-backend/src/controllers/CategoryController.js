// controllers/CategoryController.js
const db = require("../config/db");

class CategoryController {
  // ➕ Ajouter une catégorie
  async createCategory(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Le nom de la catégorie est obligatoire" });
      }

      const result = await db.query(
        `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
        [name]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📋 Lister toutes les catégories
  async getCategories(req, res) {
    try {
      const result = await db.query(`SELECT * FROM categories ORDER BY name`);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✏️ Modifier une catégorie
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Le nom de la catégorie est obligatoire" });
      }

      const result = await db.query(
        `UPDATE categories 
         SET name = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [name, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🗑️ Supprimer une catégorie
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `DELETE FROM categories WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }

      res.json({ message: "Catégorie supprimée avec succès", deleted: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CategoryController();
