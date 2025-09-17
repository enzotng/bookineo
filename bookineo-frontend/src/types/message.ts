export interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    subject?: string;
    content: string;
    is_read: boolean;
    sent_at: string;
    created_at: string;
    updated_at: string;
}

export interface MessageWithUser extends Message {
    sender: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    recipient: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface Conversation {
    participant: {
        id: string;
        name: string;
        email: string;
    };
    lastMessage: MessageWithUser;
    unreadCount: number;
    messages: MessageWithUser[];
}

export interface MessageFilters {
    search?: string;
    unreadOnly?: boolean;
    dateFrom?: string;
    dateTo?: string;
}

export interface CreateMessageRequest {
    sender_id: string;
    recipient_id: string;
    subject?: string;
    content: string;
}

export interface UnreadCountResponse {
    unread: number;
}