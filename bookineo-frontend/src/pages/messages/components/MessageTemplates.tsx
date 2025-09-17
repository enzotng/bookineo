import React from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui";
import { FileText, Copy } from "lucide-react";
import { messageTemplates } from "../../../utils/messageTemplates";

type MessageTemplate = {
    subject: string;
    content: string;
};

interface MessageTemplatesProps {
    onSelectTemplate: (template: MessageTemplate) => void;
    bookTitle?: string;
    userName?: string;
}

export const MessageTemplatesComponent: React.FC<MessageTemplatesProps> = ({
    onSelectTemplate,
    bookTitle,
    userName,
}) => {
    const handleTemplateSelect = (templateKey: string) => {
        let template: MessageTemplate | null = null;

        switch (templateKey) {
            case "rental-interest":
                template = messageTemplates.rental.interest(bookTitle || "ce livre", userName);
                break;
            case "rental-confirmation":
                template = messageTemplates.rental.confirmation(
                    bookTitle || "ce livre",
                    new Date().toLocaleDateString("fr-FR"),
                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR")
                );
                break;
            case "rental-reminder":
                template = messageTemplates.rental.reminder(
                    bookTitle || "ce livre",
                    new Date().toLocaleDateString("fr-FR")
                );
                break;
            case "rental-returned":
                template = messageTemplates.rental.returned(bookTitle || "ce livre");
                break;
            case "rental-damage":
                template = messageTemplates.rental.damage(bookTitle || "ce livre", "Décrivez le problème ici...");
                break;
            case "general-question":
                template = messageTemplates.general.question();
                break;
            case "general-thanks":
                template = messageTemplates.general.thanks();
                break;
        }

        if (template) {
            onSelectTemplate(template);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>Modèles de messages</span>
            </div>

            <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un modèle..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="rental-interest">Intérêt pour un livre</SelectItem>
                    <SelectItem value="rental-confirmation">Confirmation de location</SelectItem>
                    <SelectItem value="rental-reminder">Rappel de retour</SelectItem>
                    <SelectItem value="rental-returned">Livre restitué</SelectItem>
                    <SelectItem value="rental-damage">Signaler un problème</SelectItem>
                    <SelectItem value="general-question">Question générale</SelectItem>
                    <SelectItem value="general-thanks">Remerciements</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};