// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

// Messagerie
router.post("/", MessageController.sendMessage);
router.get("/", MessageController.getMessages);
router.get("/:id", MessageController.getMessageById);
router.delete("/:id", MessageController.deleteMessage);
router.get("/unread/count", MessageController.getUnreadCount);

module.exports = router;
