import React, { useState, useMemo } from "react";
import { Button, Badge, Spinner } from "../../components/ui";
import { MessageCircle, Plus, RefreshCw } from "lucide-react";
import { ConversationList } from "./components/ConversationList";
import { MessageThread } from "./components/MessageThread";
import { MessageComposer } from "./components/MessageComposer";
import { MessageFiltersComponent } from "./components/MessageFilters";
import { useMessages } from "../../hooks/useMessages";
import { useAuth } from "../../hooks/useAuth";
import type { MessageFilters } from "../../types/message";

const Messages: React.FC = () => {
    const { user } = useAuth();
    const { conversations, selectedConversation, messages, unreadCount, loading, error, loadConversationMessages, sendMessage, deleteMessage, markAllAsRead, refreshMessages, setError } =
        useMessages();

    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<MessageFilters>({});

    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        if (searchQuery) {
            filtered = filtered.filter(
                (conv) =>
                    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.lastMessage.subject?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filters.unreadOnly) {
            filtered = filtered.filter((conv) => conv.unreadCount > 0);
        }

        return filtered;
    }, [conversations, searchQuery, filters]);

    const selectedParticipant = useMemo(() => {
        if (!selectedConversation) return null;
        const conversation = conversations.find((c) => c.participant.id === selectedConversation);
        return conversation?.participant || null;
    }, [selectedConversation, conversations]);

    const handleSendMessage = async (data: any) => {
        try {
            await sendMessage(data);
        } catch (error) {
            console.error("Erreur envoi:", error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
            try {
                await deleteMessage(messageId);
            } catch (error) {
                console.error("Erreur suppression:", error);
            }
        }
    };

    const handleReply = () => {
        if (selectedParticipant) {
            setIsComposerOpen(true);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white px-6 py-4 rounded-lg border">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <MessageCircle className="w-6 h-6 text-blue-500" />
                        <h1 className="text-2xl font-bold">Messagerie</h1>
                        {unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={refreshMessages} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>

                    <Button onClick={() => setIsComposerOpen(true)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau message
                    </Button>
                </div>
            </div>

            <MessageFiltersComponent filters={filters} onFiltersChange={setFilters} onMarkAllAsRead={markAllAsRead} unreadCount={unreadCount} />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                    {error}
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2 text-red-600 hover:text-red-800">
                        ×
                    </Button>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden h-full">
                <ConversationList
                    conversations={filteredConversations}
                    selectedConversation={selectedConversation}
                    onSelect={loadConversationMessages}
                    onSearch={setSearchQuery}
                    searchQuery={searchQuery}
                    loading={loading}
                />

                <MessageThread messages={messages} participant={selectedParticipant} onReply={handleReply} onDelete={handleDeleteMessage} loading={loading} />
            </div>

            <MessageComposer isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} onSend={handleSendMessage} recipient={selectedParticipant} senderId={user.id} />
        </div>
    );
};

export default Messages;
