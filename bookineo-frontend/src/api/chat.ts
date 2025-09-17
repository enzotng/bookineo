import type { ChatResponse, ChatStatus, SendMessageRequest } from "../types/chat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ChatAPI {
    async sendMessage(request: SendMessageRequest): Promise<ChatResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Chat API error:", error);
            return {
                response: "Erreur de connexion au chatbot",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async getStatus(): Promise<ChatStatus> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/status`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            return {
                connected: false,
                status: "disconnected",
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}

export const chatAPI = new ChatAPI();
