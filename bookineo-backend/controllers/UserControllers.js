// controllers/UserController.js

class UserController {
  // Créer un compte utilisateur
  async register(req, res) {
    try {
      // TODO: logique d'inscription
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Connexion utilisateur
  async login(req, res) {
    try {
      // TODO: logique de login
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Récupérer profil utilisateur
  async getProfile(req, res) {
    try {
      // TODO: récupérer infos utilisateur
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Modifier profil utilisateur
  async updateProfile(req, res) {
    try {
      // TODO: mise à jour du profil
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Supprimer un utilisateur
  async deleteUser(req, res) {
    try {
      // TODO: suppression user
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
