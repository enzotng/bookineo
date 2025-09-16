import express from "express";
import { userControllers } from "../controllers/index.js";

const router = express.Router();

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);

router.get("/profile/:id", userControllers.getProfile);
router.put("/profile/:id", userControllers.updateProfile);
router.delete("/:id", userControllers.deleteUser);

export default router;
