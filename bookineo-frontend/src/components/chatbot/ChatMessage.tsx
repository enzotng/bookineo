import React from "react";
import { Avatar, AvatarFallback, Card, CardContent } from "../ui";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../../types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8">
        <AvatarFallback className={cn(
          "text-xs",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <Card className={cn(
        "max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground" : "bg-card"
      )}>
        <CardContent className="p-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <span className={cn(
            "text-xs opacity-70 mt-2 block",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {message.timestamp.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};