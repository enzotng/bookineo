// controllers/MessageController.js
const db = require("../config/db");

class MessageController {
  // ➕ Envoyer un message
  async sendMessage(req, res) {
    try {
      const { sender_id, recipient_id, subject, content } = req.body;

      if (!sender_id || !recipient_id || !content) {
        return res.status(400).json({ error: "Champs obligatoires manquants" });
      }

      const result = await db.query(
        `INSERT INTO messages (sender_id, recipient_id, subject, content)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [sender_id, recipient_id, subject, content]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 📋 Récupérer tous les messages d'un utilisateur
  async getMessages(req, res) {
    try {
      const { userId } = req.params;

      const result = await db.query(
        `SELECT * FROM messages
         WHERE sender_id = $1 OR recipient_id = $1
         ORDER BY sent_at DESC`,
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✉️ Lire un message précis
  async getMessageById(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT * FROM messages WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Message non trouvé" });
      }

      // Marquer le message comme lu
      if (!result.rows[0].is_read) {
        await db.query(
          `UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1`,
          [id]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🗑️ Supprimer un message
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `DELETE FROM messages WHERE id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Message non trouvé" });
      }

      res.json({ message: "Message supprimé avec succès", deleted: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔢 Compter les messages non lus pour un utilisateur
  async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;

      const result = await db.query(
        `SELECT COUNT(*) AS unread_count
         FROM messages
         WHERE recipient_id = $1 AND is_read = false`,
        [userId]
      );

      res.json({ unread: parseInt(result.rows[0].unread_count, 10) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MessageController();
