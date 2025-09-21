import React, { useState } from "react";
import { Button } from "../ui";
import { MessageCircle } from "lucide-react";
import { MessageComposer } from "../../pages/messages/components/MessageComposer";
import { useAuth } from "../../hooks/useAuth";
import { useMessages } from "../../hooks/useMessages";
import type { Book } from "../../types/book";

interface ContactOwnerButtonProps {
    book: Book;
    ownerName: string;
    ownerEmail: string;
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "sm" | "default" | "lg";
    showAlways?: boolean;
}

export const ContactOwnerButton: React.FC<ContactOwnerButtonProps> = ({ book, ownerName, ownerEmail, className = "", variant = "outline", size = "sm", showAlways = false }) => {
    const { user } = useAuth();
    const { sendMessage } = useMessages();
    const [isComposerOpen, setIsComposerOpen] = useState(false);

    const handleSendMessage = async (data: any) => {
        try {
            await sendMessage(data);
            setIsComposerOpen(false);
        } catch (error) {
            console.error("Erreur envoi:", error);
        }
    };

    if (!user || !book || !book.owner_id || (!showAlways && user.id === book.owner_id.toString())) {
        return null;
    }

    const recipient = {
        id: book.owner_id.toString(),
        name: ownerName,
        email: ownerEmail,
    };

    const initialSubject = `Intéressé par "${book.title}"`;
    const userName = `${user.first_name} ${user.last_name}`.trim();

    return (
        <>
            <Button variant={variant} size={size} onClick={() => setIsComposerOpen(true)} className={`flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none ${className}`}>
                <MessageCircle className="w-4 h-4" />
                <span>Contacter</span>
            </Button>

            <MessageComposer
                isOpen={isComposerOpen}
                onClose={() => setIsComposerOpen(false)}
                onSend={handleSendMessage}
                recipient={recipient}
                initialSubject={initialSubject}
                senderId={user.id}
                bookTitle={book.title}
                userName={userName}
            />
        </>
    );
};
