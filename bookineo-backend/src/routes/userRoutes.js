import express from "express";
import { userControllers } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);

router.get("/profile", authenticateToken, userControllers.getProfile);
router.put("/profile", authenticateToken, userControllers.updateProfile);
router.delete("/", authenticateToken, userControllers.deleteUser);

export default router;
