import type { Message, MessageWithUser, Conversation, MessageFilters, CreateMessageRequest, UnreadCountResponse } from "../types/message";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const messagesAPI = {
    async getMessages(userId: string): Promise<MessageWithUser[]> {
        const response = await fetch(`${API_BASE}/messages/user/${userId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Erreur lors du chargement des messages");
        return response.json();
    },

    async sendMessage(data: CreateMessageRequest): Promise<Message> {
        const response = await fetch(`${API_BASE}/messages`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Erreur lors de l'envoi du message");
        return response.json();
    },

    async getMessageById(messageId: string): Promise<MessageWithUser> {
        const response = await fetch(`${API_BASE}/messages/${messageId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Message non trouvé");
        return response.json();
    },

    async markAsRead(messageId: string): Promise<void> {
        await fetch(`${API_BASE}/messages/${messageId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
    },

    async deleteMessage(messageId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/messages/${messageId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Erreur lors de la suppression");
    },

    async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
        const response = await fetch(`${API_BASE}/messages/user/${userId}/unread/count`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Erreur lors du comptage");
        return response.json();
    },

    async getConversations(userId: string): Promise<Conversation[]> {
        const messages = await this.getMessages(userId);
        const conversationsMap = new Map<string, Conversation>();

        messages.forEach((message) => {
            const isReceived = message.recipient_id === userId;
            const participant = isReceived ? message.sender : message.recipient;
            const participantId = participant.id;

            if (!conversationsMap.has(participantId)) {
                conversationsMap.set(participantId, {
                    participant: {
                        id: participant.id,
                        name: `${participant.first_name} ${participant.last_name}`,
                        email: participant.email,
                    },
                    lastMessage: message,
                    unreadCount: 0,
                    messages: [],
                });
            }

            const conversation = conversationsMap.get(participantId)!;
            conversation.messages.push(message);

            if (new Date(message.sent_at) > new Date(conversation.lastMessage.sent_at)) {
                conversation.lastMessage = message;
            }

            if (isReceived && !message.is_read) {
                conversation.unreadCount++;
            }
        });

        return Array.from(conversationsMap.values()).sort((a, b) => new Date(b.lastMessage.sent_at).getTime() - new Date(a.lastMessage.sent_at).getTime());
    },

    async getConversationWith(userId: string, participantId: string): Promise<MessageWithUser[]> {
        const messages = await this.getMessages(userId);
        return messages
            .filter((message) => (message.sender_id === userId && message.recipient_id === participantId) || (message.sender_id === participantId && message.recipient_id === userId))
            .sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
    },

    async searchMessages(userId: string, filters: MessageFilters): Promise<MessageWithUser[]> {
        const messages = await this.getMessages(userId);

        return messages.filter((message) => {
            if (filters.search && !message.content.toLowerCase().includes(filters.search.toLowerCase()) && !message.subject?.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            if (filters.unreadOnly && (message.recipient_id !== userId || message.is_read)) {
                return false;
            }

            if (filters.dateFrom && new Date(message.sent_at) < new Date(filters.dateFrom)) {
                return false;
            }

            if (filters.dateTo && new Date(message.sent_at) > new Date(filters.dateTo)) {
                return false;
            }

            return true;
        });
    },

    async markAllAsRead(userId: string): Promise<void> {
        const messages = await this.getMessages(userId);
        const unreadMessages = messages.filter((msg) => msg.recipient_id === userId && !msg.is_read);

        await Promise.all(unreadMessages.map((msg) => this.markAsRead(msg.id)));
    },

    async sendRentalMessage(rentalId: string, senderId: string, recipientId: string, content: string, subject?: string): Promise<Message> {
        return this.sendMessage({
            sender_id: senderId,
            recipient_id: recipientId,
            subject: subject || `À propos de votre location`,
            content: `${content}\n\n(Concernant la location #${rentalId})`,
        });
    },
};
