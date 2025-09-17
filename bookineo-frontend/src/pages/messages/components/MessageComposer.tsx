import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Label, Avatar } from "../../../components/ui";
import { Send, X } from "lucide-react";
import type { CreateMessageRequest } from "../../../types/message";
import { MessageTemplatesComponent } from "./MessageTemplates";

type MessageTemplate = {
    subject: string;
    content: string;
};

interface MessageComposerProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (data: CreateMessageRequest) => Promise<void>;
    recipient: { id: string; name: string; email: string } | null;
    initialSubject?: string;
    senderId: string;
    bookTitle?: string;
    userName?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
    isOpen,
    onClose,
    onSend,
    recipient,
    initialSubject = "",
    senderId,
    bookTitle,
    userName,
}) => {
    const [subject, setSubject] = useState(initialSubject);
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentRecipient = recipient || (recipientEmail.trim() ? {
            id: recipientEmail.trim(),
            name: recipientEmail.trim(),
            email: recipientEmail.trim()
        } : null);

        if (!currentRecipient || !content.trim()) return;

        try {
            setSending(true);
            await onSend({
                sender_id: senderId,
                recipient_id: currentRecipient.id,
                subject: subject.trim() || undefined,
                content: content.trim(),
            });

            setSubject("");
            setContent("");
            setRecipientEmail("");
            onClose();
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
        } finally {
            setSending(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const handleTemplateSelect = (template: MessageTemplate) => {
        setSubject(template.subject);
        setContent(template.content);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Nouveau message</DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {recipient ? (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-8 h-8">
                            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                {getInitials(recipient.name)}
                            </div>
                        </Avatar>
                        <div>
                            <div className="font-medium text-sm">{recipient.name}</div>
                            <div className="text-xs text-gray-600">{recipient.email}</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <Label htmlFor="recipient-email">Destinataire</Label>
                        <Input
                            id="recipient-email"
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="Email du destinataire..."
                            required
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <MessageTemplatesComponent
                        onSelectTemplate={handleTemplateSelect}
                        bookTitle={bookTitle}
                        userName={userName}
                    />

                    <div>
                        <Label htmlFor="subject">Sujet (optionnel)</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Sujet du message..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="content">Message</Label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={sending || !content.trim() || (!recipient && !recipientEmail.trim())}>
                            {sending ? (
                                "Envoi..."
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Envoyer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};