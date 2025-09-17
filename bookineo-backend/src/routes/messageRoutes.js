import express from "express";
import { messageControllers } from "../controllers/index.js";

const router = express.Router();

router.post("/", messageControllers.sendMessage);
router.get("/", messageControllers.getMessages);
router.get("/:id", messageControllers.getMessageById);
router.delete("/:id", messageControllers.deleteMessage);
router.get("/unread/count", messageControllers.getUnreadCount);

export default router;
