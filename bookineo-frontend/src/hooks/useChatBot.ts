import { useState, useCallback, useEffect } from "react";
import { chatAPI } from "../api/chat";
import type { ChatMessage, ChatStatus } from "../types/chat";

export const useChatBot = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<ChatStatus>({
        connected: false,
        status: "loading",
    });

    const checkStatus = useCallback(async () => {
        const statusResponse = await chatAPI.getStatus();
        setStatus(statusResponse);
    }, []);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: content.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);

            try {
                const history = messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

                const response = await chatAPI.sendMessage({
                    message: content.trim(),
                    history,
                });

                if (response.success) {
                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: response.response,
                        timestamp: new Date(),
                    };

                    setMessages((prev) => [...prev, assistantMessage]);
                } else {
                    const errorMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Erreur: ${response.error || "Impossible de traiter votre demande"}`,
                        timestamp: new Date(),
                    };

                    setMessages((prev) => [...prev, errorMessage]);
                }
            } catch (error) {
                const errorMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "Erreur de connexion au chatbot",
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        },
        [messages]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    return {
        messages,
        isLoading,
        status,
        sendMessage,
        clearMessages,
        checkStatus,
    };
};
