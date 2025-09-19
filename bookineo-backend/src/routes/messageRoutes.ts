import express from "express";
import type { Request, Response, NextFunction } from "express"; // pour TypeScript uniquement
import { messageControllers } from "../controllers/index.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = express.Router();

router.use(authenticateToken);

// Routes
router.post("/", (req: any, res: Response) => messageControllers.sendMessage(req, res));
router.get("/user/:userId", (req: any, res: Response) => messageControllers.getMessages(req, res));
router.get("/user/:userId/unread/count", (req: any, res: Response) => messageControllers.getUnreadCount(req, res));
router.get("/:id", (req: any, res: Response) => messageControllers.getMessageById(req, res));
router.delete("/:id", (req: any, res: Response) => messageControllers.deleteMessage(req, res));

export default router;
