// routes/rentalRoutes.js
const express = require("express");
const router = express.Router();
const RentalController = require("../controllers/RentalController");

// Gestion des locations
router.post("/rent", RentalController.rentBook);
router.post("/return", RentalController.returnBook);
router.get("/", RentalController.getRentals);
router.get("/user/:id", RentalController.getRentalByUser);

module.exports = router;
