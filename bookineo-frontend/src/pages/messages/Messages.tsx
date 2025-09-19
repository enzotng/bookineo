import React, { useState, useMemo, useEffect } from "react";
import { Button, Badge, Spinner } from "../../components/ui";
import { MessageCircle, Plus, RefreshCw } from "lucide-react";
import { ConversationList } from "./components/ConversationList";
import { MessageThread } from "./components/MessageThread";
import { MessageComposer } from "./components/MessageComposer";
import { FilterPanel } from "../../components/filters";
import type { FilterConfig } from "../../components/filters";
import { Eye, Clock } from "lucide-react";
import { useMessages } from "../../hooks/useMessages";
import { useAuth } from "../../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import type { MessageFilters } from "../../types/message";

const Messages: React.FC = () => {
    const { user } = useAuth();
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();
    const { conversations, selectedConversation, messages, unreadCount, loading, error, loadConversationMessages, sendMessage, deleteMessage, markAllAsRead, refreshMessages, setError } =
        useMessages();

    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<MessageFilters>({});
    const [uiFilters, setUiFilters] = useState<Record<string, any>>({});

    useEffect(() => {
        if (conversationId && conversationId !== selectedConversation) {
            loadConversationMessages(conversationId);
        }
    }, [conversationId, selectedConversation, loadConversationMessages]);

    const handleSelectConversation = (participantId: string) => {
        navigate(`/messages/${participantId}`);
        loadConversationMessages(participantId);
    };

    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        if (uiFilters.search || searchQuery) {
            const query = uiFilters.search || searchQuery;
            filtered = filtered.filter(
                (conv) =>
                    conv.participant.name.toLowerCase().includes(query.toLowerCase()) ||
                    conv.lastMessage.content.toLowerCase().includes(query.toLowerCase()) ||
                    conv.lastMessage.subject?.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (uiFilters.unreadOnly || filters.unreadOnly) {
            filtered = filtered.filter((conv) => conv.unreadCount > 0);
        }

        return filtered;
    }, [conversations, searchQuery, filters, uiFilters]);

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

    const handleFiltersChange = (newFilters: Record<string, any>) => {
        setUiFilters(newFilters);
        setFilters({
            unreadOnly: newFilters.unreadOnly,
            search: newFilters.search,
            dateFrom: newFilters.dateFrom
        });
    };

    const filterConfigs: FilterConfig[] = [
        {
            key: 'search',
            type: 'search',
            label: 'Recherche',
            placeholder: 'Rechercher dans les messages...'
        },
        {
            key: 'unreadOnly',
            type: 'select',
            label: 'Statut',
            icon: Eye,
            placeholder: 'Tous les messages',
            options: [
                { value: 'false', label: 'Tous les messages', icon: <div className="w-2 h-2 bg-gray-400 rounded-full"></div> },
                { value: 'true', label: 'Non lus seulement', icon: <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> }
            ]
        },
        {
            key: 'dateFrom',
            type: 'select',
            label: 'Période',
            icon: Clock,
            placeholder: 'Toute période',
            options: [
                { value: 'all', label: 'Toute période' },
                { value: new Date().toISOString().split('T')[0], label: "Aujourd'hui" },
                { value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], label: 'Cette semaine' },
                { value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], label: 'Ce mois' }
            ]
        }
    ];

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Messagerie</h1>
                        <div className="text-sm text-muted-foreground">Gérez vos conversations</div>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                            {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={refreshMessages} disabled={loading} className="bg-white border-gray-300 hover:bg-gray-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline ml-2">Actualiser</span>
                    </Button>

                    <Button onClick={() => setIsComposerOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Nouveau message</span>
                    </Button>
                </div>
            </div>

            <FilterPanel
                title="Filtres"
                subtitle="Affinez votre recherche"
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
                filterConfigs={filterConfigs}
                customActions={unreadCount > 0 ? [
                    <Button key="mark-read" onClick={markAllAsRead} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl">
                        Tout marquer lu ({unreadCount})
                    </Button>
                ] : []}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {error}
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2 text-red-600 hover:text-red-800">
                        ×
                    </Button>
                </div>
            )}

            <div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden flex-1">
                <div className="flex h-full">
                    <div className="hidden md:block">
                        <ConversationList
                            conversations={filteredConversations}
                            selectedConversation={selectedConversation}
                            onSelect={handleSelectConversation}
                            onSearch={setSearchQuery}
                            searchQuery={searchQuery}
                            loading={loading}
                        />
                    </div>

                    <div className="flex-1">
                        <MessageThread
                            messages={messages}
                            participant={selectedParticipant}
                            onSendMessage={handleSendMessage}
                            onDelete={handleDeleteMessage}
                            loading={loading}
                            conversations={filteredConversations}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>
                </div>
            </div>

            <MessageComposer isOpen={isComposerOpen} onClose={() => setIsComposerOpen(false)} onSend={handleSendMessage} recipient={selectedParticipant} senderId={user.id} />
        </div>
    );
};

export default Messages;
