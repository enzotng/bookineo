// controllers/BookController.js

class BookController {
  async createBook(req, res) {
    try {
      // TODO: ajouter un livre
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBooks(req, res) {
    try {
      // TODO: lister tous les livres (avec filtres)
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBookById(req, res) {
    try {
      // TODO: détails d’un livre
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateBook(req, res) {
    try {
      // TODO: modifier un livre
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteBook(req, res) {
    try {
      // TODO: supprimer un livre
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new BookController();
