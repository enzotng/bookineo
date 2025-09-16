// controllers/RentalController.js

class RentalController {
  async rentBook(req, res) {
    try {
      // TODO: louer un livre (changer statut)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async returnBook(req, res) {
    try {
      // TODO: restituer un livre (statut disponible)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRentals(req, res) {
    try {
      // TODO: lister toutes les locations
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRentalByUser(req, res) {
    try {
      // TODO: historique par utilisateur
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new RentalController();
