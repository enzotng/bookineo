export interface Message {
    id: number;
    sender_id: string; // UUID
    recipient_id: string; // UUID
    subject?: string | null;
    content?: string | null;
    is_read: boolean;
    sent_at: Date;
    created_at: Date;
    updated_at: Date;

    // Optional fields for including associated users
    sender?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
    };
    recipient?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
    };
}
