import React, { useState, type KeyboardEvent } from "react";
import { Button, Input } from "../ui";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disabled = false }) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !isLoading && !disabled) {
            onSendMessage(trimmedMessage);
            setMessage("");
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex gap-2 bg-background">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Tapez votre message..." disabled={isLoading || disabled} className="flex-1" />
            <Button onClick={handleSend} disabled={!message.trim() || isLoading || disabled}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
        </div>
    );
};
