import express from "express";
import lmStudio from "../services/lmStudio.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const messages = [
            {
                role: "system",
                content:
                    "Tu es un assistant virtuel pour Bookineo, une application de location de livres entre particuliers. Tu aides les utilisateurs avec leurs questions sur la location de livres, la recherche, les profils, etc. Réponds de manière amicale et utile en français.",
            },
            ...history,
            {
                role: "user",
                content: message,
            },
        ];

        const response = await lmStudio.sendMessage(messages);

        res.json({
            response,
            success: true,
        });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
            error: error.message,
            success: false,
        });
    }
});

router.get("/status", async (req, res) => {
    try {
        const isConnected = await lmStudio.testConnection();
        res.json({
            connected: isConnected,
            model: "openai/gpt-oss-20b",
            status: isConnected ? "ready" : "disconnected",
        });
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: error.message,
        });
    }
});

export default router;
