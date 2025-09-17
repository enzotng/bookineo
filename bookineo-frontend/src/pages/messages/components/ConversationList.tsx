import React from "react";
import { Card, Input, Button, Badge, Avatar } from "../../../components/ui";
import { Search, MessageCircle } from "lucide-react";
import type { Conversation } from "../../../types/message";

interface ConversationListProps {
    conversations: Conversation[];
    selectedConversation: string | null;
    onSelect: (participantId: string) => void;
    onSearch: (query: string) => void;
    searchQuery: string;
    loading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedConversation,
    onSelect,
    onSearch,
    searchQuery,
    loading,
}) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        }
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="w-80 h-full border-r bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher des conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Chargement...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Aucune conversation</p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.participant.id}
                            onClick={() => onSelect(conversation.participant.id)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                                selectedConversation === conversation.participant.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                    <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                                        {getInitials(conversation.participant.name)}
                                    </div>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className={`text-sm font-medium truncate ${
                                                conversation.unreadCount > 0 ? "font-bold text-black" : "text-gray-900"
                                            }`}
                                        >
                                            {conversation.participant.name}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            {conversation.unreadCount > 0 && (
                                                <Badge variant="default" className="text-xs px-1.5 py-0.5">
                                                    {conversation.unreadCount}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {formatTime(conversation.lastMessage.sent_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <p
                                        className={`text-sm truncate mt-1 ${
                                            conversation.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-600"
                                        }`}
                                    >
                                        {conversation.lastMessage.subject && (
                                            <span className="font-medium">
                                                {conversation.lastMessage.subject}:{" "}
                                            </span>
                                        )}
                                        {conversation.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};