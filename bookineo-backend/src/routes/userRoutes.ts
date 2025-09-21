import express from "express";
import type { Request, Response } from "express";
import { userControllers } from "../controllers/index.ts";
import { authenticateToken } from "../middleware/auth.ts";
import emailService from "../services/emailService.ts";

const router = express.Router();

router.post("/register", (req: Request, res: Response) => userControllers.register(req, res));
router.post("/login", (req: Request, res: Response) => userControllers.login(req, res));

router.get("/", authenticateToken, (req: Request, res: Response) => userControllers.getAllUsers(req, res));
router.get("/profile", authenticateToken, (req: any, res: Response) => userControllers.getProfile(req, res));
router.put("/profile", authenticateToken, (req: any, res: Response) => userControllers.updateProfile(req, res));
router.delete("/", authenticateToken, (req: any, res: Response) => userControllers.deleteUser(req, res));

router.post("/request-password-reset", (req: Request, res: Response) => userControllers.requestPasswordReset(req, res));
router.post("/reset-password", (req: Request, res: Response) => userControllers.resetPassword(req, res));

export default router;
