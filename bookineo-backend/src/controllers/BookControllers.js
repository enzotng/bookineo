// controllers/BookController.js
const db = require("../config/db"); // ton fichier db.js

class BookController {
  // ➕ Ajouter un livre
  async createBook(req, res) {
    try {
      const { title, author, publication_year, category_id, price, owner_id, image_url } = req.body;

      if (!title || !author || !price || !owner_id) {
        return res.status(400).json({ error: "Champs obligatoires manquants" });
      }

      const result = await db.query(
        `INSERT INTO books (title, author, publication_year, category_id, price, owner_id, image_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, author, publication_year, category_id, price, owner_id, image_url]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📚 Lister tous les livres (avec filtres facultatifs)
  async getBooks(req, res) {
    try {
      const { status, category_id, author, title } = req.query;

      let query = "SELECT * FROM books WHERE 1=1";
      const params = [];
      let index = 1;

      if (status) {
        query += ` AND status = $${index++}`;
        params.push(status);
      }
      if (category_id) {
        query += ` AND category_id = $${index++}`;
        params.push(category_id);
      }
      if (author) {
        query += ` AND author ILIKE $${index++}`;
        params.push(`%${author}%`);
      }
      if (title) {
        query += ` AND title ILIKE $${index++}`;
        params.push(`%${title}%`);
      }

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔍 Détails d’un livre
  async getBookById(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Livre non trouvé" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✏️ Modifier un livre
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const { title, author, publication_year, category_id, price, status, image_url } = req.body;

      const result = await db.query(
        `UPDATE books 
         SET title = COALESCE($1, title),
             author = COALESCE($2, author),
             publication_year = COALESCE($3, publication_year),
             category_id = COALESCE($4, category_id),
             price = COALESCE($5, price),
             status = COALESCE($6, status),
             image_url = COALESCE($7, image_url),
             updated_at = NOW()
         WHERE id = $8 RETURNING *`,
        [title, author, publication_year, category_id, price, status, image_url, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Livre non trouvé" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🗑️ Supprimer un livre
  async deleteBook(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Livre non trouvé" });
      }

      res.json({ message: "Livre supprimé avec succès", deleted: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BookController();
