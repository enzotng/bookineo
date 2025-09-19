import React from "react";
import { Badge } from "../ui";
import { Circle, AlertTriangle } from "lucide-react";
import type { ChatStatus as ChatStatusType } from "../../types/chat";

interface ChatStatusProps {
    status: ChatStatusType;
}

export const ChatStatus: React.FC<ChatStatusProps> = ({ status }) => {
    const getStatusConfig = () => {
        switch (status.status) {
            case "ready":
                return {
                    variant: "default" as const,
                    color: "text-emerald-500",
                    icon: <Circle className="w-2 h-2 fill-current" />,
                    text: "En ligne",
                };
            case "disconnected":
                return {
                    variant: "secondary" as const,
                    color: "text-red-500",
                    icon: <Circle className="w-2 h-2 fill-current" />,
                    text: "Hors ligne",
                };
            default:
                return {
                    variant: "secondary" as const,
                    color: "text-yellow-500",
                    icon: <AlertTriangle className="w-3 h-3" />,
                    text: "Chargement...",
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Badge variant={config.variant} className={`gap-1 ${status.status === 'ready' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : ''}`}>
            <span className={config.color}>{config.icon}</span>
            {config.text}
            {status.model && status.status === "ready" && <span className="text-xs opacity-70 ml-1">({status.model})</span>}
        </Badge>
    );
};
