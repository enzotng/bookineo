import React from "react";
import { Avatar, AvatarFallback, Card, CardContent } from "../ui";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "../../types/chat";

interface ChatMessageProps {
    message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === "user";

    return (
        <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="w-8 h-8">
                <AvatarFallback className={cn("text-xs", isUser ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700")}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
            </Avatar>

            <Card className={cn("max-w-[80%]", isUser ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200")}>
                <CardContent className="flex flex-col gap-2">
                    <div className="text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <span className={cn("text-xs opacity-70 block", isUser ? "text-white/70" : "text-muted-foreground")}>
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </CardContent>
            </Card>
        </div>
    );
};
