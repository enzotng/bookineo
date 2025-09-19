import express from "express";
import { messageControllers } from "../controllers/index.ts";
import { authenticateToken } from "../middleware/auth.ts";

const router = express.Router();

router.use(authenticateToken);

router.post("/", (req, res) => messageControllers.sendMessage(req, res));
router.get("/user/:userId", (req, res) => messageControllers.getMessages(req, res));
router.get("/user/:userId/unread/count", (req, res) => messageControllers.getUnreadCount(req, res));
router.get("/:id", (req, res) => messageControllers.getMessageById(req, res));
router.put("/:id/read", (req, res) => messageControllers.markAsRead(req, res));
router.delete("/:id", (req, res) => messageControllers.deleteMessage(req, res));

export default router;
