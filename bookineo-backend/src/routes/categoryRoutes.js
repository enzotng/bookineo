// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");

// CRUD catégories
router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.getCategories);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
