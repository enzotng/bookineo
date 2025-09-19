import React from "react";
import { Input, Badge, Avatar } from "../../../components/ui";
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
        <div className="w-80 h-full border-r bg-gradient-to-b from-white to-gray-50 flex flex-col">
            <div className="p-4 border-b bg-gradient-to-r from-white to-gray-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Rechercher des conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10 bg-white border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                        <div className="text-gray-600 font-medium">Chargement...</div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">Aucune conversation</p>
                        <p className="text-sm text-gray-500 mt-1">Vos messages apparaîtront ici</p>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.participant.id}
                            onClick={() => onSelect(conversation.participant.id)}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white/80 ${
                                selectedConversation === conversation.participant.id
                                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border-r-4 border-r-blue-500 shadow-sm"
                                    : "border-b border-gray-100"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                        {getInitials(conversation.participant.name)}
                                    </div>
                                    {conversation.unreadCount > 0 && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-xs text-white font-bold">
                                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-sm font-bold truncate ${
                                            conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                                        }`}>
                                            {conversation.participant.name}
                                        </h3>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {formatTime(conversation.lastMessage.sent_at)}
                                        </span>
                                    </div>

                                    <p className={`text-sm truncate ${
                                        conversation.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-600"
                                    }`}>
                                        {conversation.lastMessage.subject && (
                                            <span className="font-bold text-blue-600">
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