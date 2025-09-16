// controllers/CategoryController.js

class CategoryController {
  async createCategory(req, res) {
    try {
      // TODO: ajouter une catégorie
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategories(req, res) {
    try {
      // TODO: lister catégories
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      // TODO: modifier une catégorie
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      // TODO: supprimer une catégorie
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CategoryController();
