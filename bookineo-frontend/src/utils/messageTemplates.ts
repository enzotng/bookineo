export const messageTemplates = {
    rental: {
        interest: (bookTitle: string, userName?: string) => ({
            subject: `Intéressé par "${bookTitle}"`,
            content: `Bonjour,

Je suis intéressé(e) par la location de votre livre "${bookTitle}".

Pourriez-vous me confirmer sa disponibilité et les modalités de location ?

${userName ? `Cordialement,\n${userName}` : "Cordialement"}`,
        }),

        confirmation: (bookTitle: string, rentalDate: string, returnDate: string) => ({
            subject: `Confirmation de location - "${bookTitle}"`,
            content: `Bonjour,

Je confirme la location du livre "${bookTitle}" :
- Date de début : ${rentalDate}
- Date de retour prévue : ${returnDate}

Merci de me faire savoir où et quand nous pouvons organiser l'échange.

Cordialement`,
        }),

        reminder: (bookTitle: string, returnDate: string) => ({
            subject: `Rappel retour - "${bookTitle}"`,
            content: `Bonjour,

Je me permets de vous rappeler que la date de retour du livre "${bookTitle}" était prévue le ${returnDate}.

Pourriez-vous me faire savoir quand vous pourrez le restituer ?

Merci,
Cordialement`,
        }),

        returned: (bookTitle: string) => ({
            subject: `Livre restitué - "${bookTitle}"`,
            content: `Bonjour,

Je vous confirme que le livre "${bookTitle}" a bien été restitué.

Merci pour cette location et à bientôt !

Cordialement`,
        }),

        damage: (bookTitle: string, description: string) => ({
            subject: `Problème avec "${bookTitle}"`,
            content: `Bonjour,

Je vous signale un problème avec le livre "${bookTitle}" :

${description}

Pouvons-nous en discuter pour trouver une solution ?

Cordialement`,
        }),
    },

    general: {
        question: () => ({
            subject: "Question sur Bookineo",
            content: `Bonjour,

J'ai une question concernant...

Merci d'avance pour votre réponse.

Cordialement`,
        }),

        thanks: () => ({
            subject: "Merci",
            content: `Bonjour,

Je tenais à vous remercier pour...

Cordialement`,
        }),
    },
};

export type MessageTemplate = {
    subject: string;
    content: string;
};