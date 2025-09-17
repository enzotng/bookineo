import React from "react";
import { Button, Avatar, Card } from "../../../components/ui";
import { Reply, Trash2, Clock } from "lucide-react";
import type { MessageWithUser } from "../../../types/message";
import { useAuth } from "../../../hooks/useAuth";

interface MessageThreadProps {
    messages: MessageWithUser[];
    participant: { id: string; name: string; email: string } | null;
    onReply: () => void;
    onDelete: (messageId: string) => void;
    loading: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ messages, participant, onReply, onDelete, loading }) => {
    const { user } = useAuth();

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

    if (!participant) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
                    <p className="text-gray-600">Choisissez une conversation dans la liste pour commencer à échanger.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            <div className="border-b p-4 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">{getInitials(participant.name)}</div>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{participant.name}</h2>
                            <p className="text-sm text-gray-600">{participant.email}</p>
                        </div>
                    </div>
                    <Button onClick={onReply} size="sm" className="flex items-center space-x-2">
                        <Reply className="w-4 h-4" />
                        <span>Répondre</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Chargement des messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Aucun message dans cette conversation</div>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isFromUser = message.sender_id === user?.id;
                        return (
                            <div key={message.id} className={`flex ${isFromUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-2xl ${isFromUser ? "order-2" : "order-1"}`}>
                                    <Card className={`p-4 ${isFromUser ? "bg-blue-500 text-white border-blue-500" : "bg-gray-100 border-gray-200"}`}>
                                        {message.subject && <div className={`font-semibold mb-2 pb-2 border-b ${isFromUser ? "border-blue-400" : "border-gray-300"}`}>{message.subject}</div>}
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    </Card>

                                    <div className={`flex items-center mt-2 space-x-2 text-xs ${isFromUser ? "justify-end" : "justify-start"}`}>
                                        <span className="text-gray-500">{formatDateTime(message.sent_at)}</span>
                                        {!message.is_read && message.recipient_id === user?.id && <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Non lu</span>}
                                        {isFromUser && (
                                            <Button variant="ghost" size="sm" onClick={() => onDelete(message.id)} className="text-gray-500 hover:text-red-500 p-1 h-auto">
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {!isFromUser && (
                                    <div className="order-1 mr-3">
                                        <Avatar className="w-8 h-8">
                                            <div className="w-full h-full bg-gray-500 text-white flex items-center justify-center text-xs">{getInitials(participant.name)}</div>
                                        </Avatar>
                                    </div>
                                )}

                                {isFromUser && (
                                    <div className="order-1 ml-3">
                                        <Avatar className="w-8 h-8">
                                            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-xs">
                                                {getInitials(user?.firstName + " " + user?.lastName || "U")}
                                            </div>
                                        </Avatar>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
