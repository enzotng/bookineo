import React, { useState, useRef, useEffect } from "react";
import { Button, Avatar, Card, Input } from "../../../components/ui";
import { Reply, Trash2, Clock, MessageCircle, Send, Paperclip, Smile, Check, CheckCheck } from "lucide-react";
import type { MessageWithUser } from "../../../types/message";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import { messagesAPI } from "../../../api/messages";

interface MessageThreadProps {
    messages: MessageWithUser[];
    participant: { id: string; name: string; email: string } | null;
    onSendMessage: (data: { sender_id: string; recipient_id: string; content: string; subject?: string }) => void;
    onDelete: (messageId: string) => void;
    loading: boolean;
    conversations?: any[];
    onSelectConversation?: (participantId: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages, participant, onSendMessage, onDelete, loading, conversations, onSelectConversation }) => {
    const { user } = useAuth();
    const [showMobileList, setShowMobileList] = React.useState(false);
    const [messageContent, setMessageContent] = React.useState("");
    const [isSending, setIsSending] = React.useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const checkIfNearBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isNear = scrollHeight - scrollTop - clientHeight < 100;
            setIsNearBottom(isNear);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            if (isNearBottom) {
                setTimeout(() => scrollToBottom(), 10);
            }
        }
    }, [messages]);

    useEffect(() => {
        if (participant) {
            scrollToBottom();
        }
    }, [participant]);

    useEffect(() => {
        if (!messagesContainerRef.current || !user?.id) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const messageId = entry.target.getAttribute('data-message-id');
                        const isUnread = entry.target.getAttribute('data-is-unread') === 'true';
                        const isForCurrentUser = entry.target.getAttribute('data-for-user') === 'true';

                        console.log('Message visible:', { messageId, isUnread, isForCurrentUser });

                        if (messageId && isUnread && isForCurrentUser) {
                            console.log('Marquage comme lu:', messageId);
                            onMarkAsRead(messageId);
                        }
                    }
                });
            },
            {
                root: messagesContainerRef.current,
                rootMargin: '0px',
                threshold: 0.1
            }
        );

        setTimeout(() => {
            if (messagesContainerRef.current) {
                const messageElements = messagesContainerRef.current.querySelectorAll('[data-message-id]');
                console.log('Messages observés:', messageElements.length);
                messageElements.forEach((el) => {
                    console.log('Element:', el.getAttribute('data-message-id'), el.getAttribute('data-is-unread'), el.getAttribute('data-for-user'));
                    observer.observe(el);
                });
            }
        }, 100);

        return () => observer.disconnect();
    }, [messages, user?.id]);

    const onMarkAsRead = async (messageId: string) => {
        try {
            console.log('Appel API pour marquer comme lu:', messageId);
            await messagesAPI.markAsRead(messageId);
            console.log('Message marqué comme lu avec succès:', messageId);

            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                messageElement.setAttribute('data-is-unread', 'false');
            }
        } catch (error) {
            console.error('Erreur marquage message lu:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageContent.trim() || !participant || isSending || !user?.id) return;

        setIsSending(true);
        try {
            await onSendMessage({
                sender_id: user.id,
                recipient_id: participant.id,
                content: messageContent.trim()
            });
            setMessageContent("");
            setTimeout(() => scrollToBottom(), 100);
            toast.success(`Message envoyé à ${participant.name}`);
        } catch (error) {
            console.error("Erreur envoi message:", error);
            toast.error(`Erreur lors de l'envoi du message`);
        } finally {
            setIsSending(false);
        }
    };

    if (!participant) {
        return (
            <div className="flex-1 flex flex-col h-full">
                <div className="md:hidden border-b p-4 bg-white">
                    <Button
                        variant="outline"
                        onClick={() => setShowMobileList(!showMobileList)}
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100"
                    >
                        {showMobileList ? "Masquer" : "Voir les conversations"}
                    </Button>
                </div>

                {showMobileList && conversations && (
                    <div className="md:hidden bg-white border-b max-h-60 overflow-y-auto">
                        {conversations.map((conv) => (
                            <div
                                key={conv.participant.id}
                                onClick={() => {
                                    onSelectConversation?.(conv.participant.id);
                                    setShowMobileList(false);
                                }}
                                className="p-3 border-b cursor-pointer hover:bg-gray-50 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {getInitials(conv.participant.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{conv.participant.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</div>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-white font-bold">{conv.unreadCount}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Clock className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Sélectionnez une conversation</h3>
                        <p className="text-gray-600 max-w-sm">Choisissez une conversation dans la liste pour commencer à échanger des messages.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
            <div className="border-b p-4 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        {getInitials(participant.name)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">{participant.name}</h2>
                        <p className="text-sm text-gray-500">{participant.email}</p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                        <div>Conversation</div>
                        <div className="font-medium">{messages.length} message{messages.length > 1 ? 's' : ''}</div>
                    </div>
                </div>
            </div>

            <div
                ref={messagesContainerRef}
                onScroll={checkIfNearBottom}
                className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-0"
            >
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                        <div className="text-gray-600 font-medium">Chargement des messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-600 font-medium">Aucun message dans cette conversation</div>
                        <p className="text-sm text-gray-500 mt-2">Commencez la conversation en envoyant le premier message !</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isFromUser = message.sender_id === user?.id;
                        return (
                            <div
                                key={message.id}
                                data-message-id={message.id}
                                data-is-unread={!message.is_read}
                                data-for-user={!isFromUser}
                                className={`flex gap-3 ${isFromUser ? "justify-end" : "justify-start"}`}
                            >
                                {!isFromUser && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        {getInitials(participant.name)}
                                    </div>
                                )}

                                <div className={`max-w-md lg:max-w-lg ${isFromUser ? "order-1" : "order-2"}`}>
                                    <div className={`rounded-2xl p-4 shadow-lg transition-all hover:shadow-xl ${
                                        isFromUser
                                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                                            : "bg-white border border-gray-200"
                                    }`}>
                                        {message.subject && (
                                            <div className={`font-bold mb-3 pb-2 border-b ${
                                                isFromUser ? "border-blue-300/50" : "border-gray-200"
                                            }`}>
                                                {message.subject}
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                                    </div>

                                    <div className={`flex items-center mt-2 gap-3 text-xs ${isFromUser ? "justify-end" : "justify-start"}`}>
                                        <span className="text-gray-500 font-medium">{formatDateTime(message.sent_at)}</span>

                                        {isFromUser && (
                                            <div className="flex items-center gap-1">
                                                {message.is_read ? (
                                                    <CheckCheck className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Check className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        )}

                                        {!message.is_read && message.recipient_id === user?.id && (
                                            <span className="bg-emerald-500 text-white px-2 py-1 rounded-full font-bold">Non lu</span>
                                        )}

                                        {isFromUser && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(message.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 h-auto rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {isFromUser && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                        {getInitials(user?.first_name + " " + user?.last_name || "U")}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t bg-white p-4 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <div className="flex-1">
                        <div className="relative">
                            <Input
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                placeholder={`Répondre à ${participant.name}...`}
                                className="pr-12 py-3 rounded-xl border-gray-200 focus:border-blue-500 resize-none"
                                disabled={isSending}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                >
                                    <Smile className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={!messageContent.trim() || isSending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-6 py-3"
                    >
                        {isSending ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline ml-2">Envoyer</span>
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};
