// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// Auth
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// Profil
router.get("/profile/:id", UserController.getProfile);
router.put("/profile/:id", UserController.updateProfile);
router.delete("/:id", UserController.deleteUser);

module.exports = router;
