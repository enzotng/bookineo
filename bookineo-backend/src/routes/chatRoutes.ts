import express from "express";
import type { Request, Response } from "express"; // pour TypeScript uniquement
import lmStudio from "../services/lmStudio.ts";
const router = express.Router();

interface ChatMessage {
    role: "user" | "assistant" | string;
    content: string;
}

router.post("/", async (req: Request, res: Response) => {
    try {
        const { message, history = [] } = req.body as { message?: string; history?: ChatMessage[] };

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const messages: ChatMessage[] = [...history, { role: "user", content: message }];

        const response = await lmStudio.sendMessage(messages);

        res.json({ response, success: true });
    } catch (error: any) {
        console.error("Chat error:", error);
        res.status(500).json({ error: error.message, success: false });
    }
});

router.get("/status", async (_req: Request, res: Response) => {
    try {
        const isConnected = await lmStudio.testConnection();
        res.json({
            connected: isConnected,
            model: "qwen2-1_5b-instruct",
            status: isConnected ? "ready" : "disconnected",
        });
    } catch (error: any) {
        res.status(500).json({ connected: false, error: error.message });
    }
});

export default router;
