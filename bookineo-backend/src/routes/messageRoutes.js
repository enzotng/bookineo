import express from "express";
import { messageControllers } from "../controllers/index.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", messageControllers.sendMessage);
router.get("/user/:userId", messageControllers.getMessages);
router.get("/user/:userId/unread/count", messageControllers.getUnreadCount);
router.get("/:id", messageControllers.getMessageById);
router.delete("/:id", messageControllers.deleteMessage);

export default router;
