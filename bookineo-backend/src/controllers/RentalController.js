// controllers/RentalController.js
const db = require("../config/db");

class RentalController {
  // ➕ Louer un livre
  async rentBook(req, res) {
    try {
      const { book_id, renter_id, rental_date, expected_return_date } = req.body;

      if (!book_id || !renter_id || !rental_date || !expected_return_date) {
        return res.status(400).json({ error: "Champs obligatoires manquants" });
      }

      // Vérifier si le livre est disponible
      const bookCheck = await db.query(
        `SELECT * FROM books WHERE id = $1`,
        [book_id]
      );

      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ error: "Livre non trouvé" });
      }

      if (bookCheck.rows[0].status !== "available") {
        return res.status(400).json({ error: "Livre non disponible" });
      }

      // Créer la location
      const rental = await db.query(
        `INSERT INTO rentals (book_id, renter_id, rental_date, expected_return_date, status)
         VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
        [book_id, renter_id, rental_date, expected_return_date]
      );

      // Mettre à jour le statut du livre
      await db.query(
        `UPDATE books SET status = 'rented', updated_at = NOW() WHERE id = $1`,
        [book_id]
      );

      res.status(201).json(rental.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔄 Restituer un livre
  async returnBook(req, res) {
    try {
      const { rental_id, actual_return_date, comment } = req.body;

      if (!rental_id || !actual_return_date) {
        return res.status(400).json({ error: "Champs obligatoires manquants" });
      }

      // Vérifier la location
      const rentalCheck = await db.query(
        `SELECT * FROM rentals WHERE id = $1`,
        [rental_id]
      );

      if (rentalCheck.rows.length === 0) {
        return res.status(404).json({ error: "Location non trouvée" });
      }

      const rental = rentalCheck.rows[0];

      // Mettre à jour la location
      await db.query(
        `UPDATE rentals
         SET actual_return_date = $1, status = 'returned', comment = $2, updated_at = NOW()
         WHERE id = $3`,
        [actual_return_date, comment || null, rental_id]
      );

      // Mettre à jour le statut du livre
      await db.query(
        `UPDATE books SET status = 'available', updated_at = NOW() WHERE id = $1`,
        [rental.book_id]
      );

      res.json({ message: "Livre restitué avec succès" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📋 Lister toutes les locations
  async getRentals(req, res) {
    try {
      const rentals = await db.query(
        `SELECT r.*, b.title, u.first_name, u.last_name
         FROM rentals r
         JOIN books b ON r.book_id = b.id
         JOIN users u ON r.renter_id = u.id
         ORDER BY r.rental_date DESC`
      );

      res.json(rentals.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📜 Historique des locations pour un utilisateur
  async getRentalByUser(req, res) {
    try {
      const { userId } = req.params;

      const rentals = await db.query(
        `SELECT r.*, b.title
         FROM rentals r
         JOIN books b ON r.book_id = b.id
         WHERE r.renter_id = $1
         ORDER BY r.rental_date DESC`,
        [userId]
      );

      res.json(rentals.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RentalController();
