import { useState, useEffect, useCallback } from "react";
import { messagesAPI } from "../api/messages";
import type { Conversation, MessageWithUser, MessageFilters, CreateMessageRequest } from "../types/message";
import { useAuth } from "./useAuth";

export const useMessages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageWithUser[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filters, setFilters] = useState<MessageFilters>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadConversations = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await messagesAPI.getConversations(user.id);
            setConversations(data);

            const totalUnread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
            setUnreadCount(totalUnread);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const loadConversationMessages = useCallback(async (participantId: string) => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const data = await messagesAPI.getConversationWith(user.id, participantId);
            setMessages(data);
            setSelectedConversation(participantId);

            const unreadMessages = data.filter(msg => msg.recipient_id === user.id && !msg.is_read);
            await Promise.all(unreadMessages.map(msg => messagesAPI.markAsRead(msg.id)));

            await loadConversations();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }, [user?.id, loadConversations]);

    const sendMessage = useCallback(async (data: CreateMessageRequest) => {
        if (!user?.id) return;

        try {
            await messagesAPI.sendMessage(data);

            if (selectedConversation === data.recipient_id) {
                await loadConversationMessages(data.recipient_id);
            } else {
                await loadConversations();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
            throw err;
        }
    }, [user?.id, selectedConversation, loadConversationMessages, loadConversations]);

    const deleteMessage = useCallback(async (messageId: string) => {
        try {
            await messagesAPI.deleteMessage(messageId);

            if (selectedConversation) {
                await loadConversationMessages(selectedConversation);
            } else {
                await loadConversations();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
            throw err;
        }
    }, [selectedConversation, loadConversationMessages, loadConversations]);

    const searchMessages = useCallback(async (searchFilters: MessageFilters) => {
        if (!user?.id) return [];

        try {
            setFilters(searchFilters);
            return await messagesAPI.searchMessages(user.id, searchFilters);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de la recherche");
            return [];
        }
    }, [user?.id]);

    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;

        try {
            await messagesAPI.markAllAsRead(user.id);
            await loadConversations();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du marquage");
        }
    }, [user?.id, loadConversations]);

    const refreshMessages = useCallback(async () => {
        await loadConversations();
        if (selectedConversation) {
            const data = await messagesAPI.getConversationWith(user?.id || "", selectedConversation);
            setMessages(data);
        }
    }, [loadConversations, selectedConversation, user?.id]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        const interval = setInterval(refreshMessages, 30000);
        return () => clearInterval(interval);
    }, [refreshMessages]);

    return {
        conversations,
        selectedConversation,
        messages,
        unreadCount,
        filters,
        loading,
        error,
        setSelectedConversation,
        loadConversationMessages,
        sendMessage,
        deleteMessage,
        searchMessages,
        markAllAsRead,
        refreshMessages,
        setError,
    };
};