// controllers/MessageController.js

class MessageController {
  async sendMessage(req, res) {
    try {
      // TODO: envoyer un message
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      // TODO: récupérer messages utilisateur
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMessageById(req, res) {
    try {
      // TODO: lire un message précis
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      // TODO: supprimer un message
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      // TODO: compter messages non lus
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MessageController();
