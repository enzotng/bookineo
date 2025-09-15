export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface ChatResponse {
    response: string;
    success: boolean;
    error?: string;
}

export interface ChatStatus {
    connected: boolean;
    model?: string;
    status: "ready" | "disconnected" | "loading";
    error?: string;
}

export interface SendMessageRequest {
    message: string;
    history?: Array<{
        role: "user" | "assistant";
        content: string;
    }>;
}
