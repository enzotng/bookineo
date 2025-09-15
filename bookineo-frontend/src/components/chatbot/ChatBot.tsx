import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button, Separator } from "../ui";
import { MessageCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatStatus } from "./ChatStatus";
import { useChatBot } from "../../hooks/useChatBot";

interface ChatBotProps {
    className?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ className }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { messages, isLoading, status, sendMessage, clearMessages, checkStatus } = useChatBot();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                    <MessageCircle className="w-6 h-6" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] flex flex-col p-0 rounded-lg overflow-hidden">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="text-lg">Assistant Bookineo</DialogTitle>
                    <ChatStatus status={status} />
                    <Separator className="mt-3" />
                </DialogHeader>

                <div ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-muted-foreground">
                                <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-sm">
                                    Bonjour ! Je suis votre assistant Bookineo.
                                    <br />
                                    Comment puis-je vous aider aujourd'hui ?
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => <ChatMessage key={message.id} message={message} />)
                        )}

                        {isLoading && (
                            <div className="flex justify-center py-2">
                                <div className="bg-secondary rounded-lg px-4 py-2 text-sm text-muted-foreground">L'assistant réfléchit...</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 pt-0 border-t">
                    <ChatInput onSendMessage={sendMessage} isLoading={isLoading} disabled={status.status !== "ready"} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
