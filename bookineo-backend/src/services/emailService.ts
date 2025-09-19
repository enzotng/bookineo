import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "Bookineo <noreply@bookineo.app>";

export const emailService: any = {
    async sendWelcome(userEmail: any, firstName: any): Promise<any> {
        try {
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: "Bienvenue sur Bookineo ! 📚",
                html: `...`, // ton HTML reste identique
            });
            return data;
        } catch (error: any) {
            console.error("Erreur envoi email de bienvenue:", error);
            throw error;
        }
    },

    async sendNewMessageNotification(recipientEmail: any, recipientName: any, senderName: any, subject: any, messagePreview: any): Promise<any> {
        try {
            const emailPayload: any = {
                from: EMAIL_FROM,
                to: [recipientEmail],
                subject: `📬 Nouveau message de ${senderName}`,
                html: `...`, // ton HTML reste identique
            };

            const { data, error }: any = await resend.emails.send(emailPayload);

            if (error) {
                console.error("Erreur envoi notification message via Resend:", error);
                throw new Error(`Resend API error: ${JSON.stringify(error)}`);
            }
            return data;
        } catch (error: any) {
            console.error("Erreur envoi notification message:", error);
            throw error;
        }
    },

    async sendRentalRequest(ownerEmail: any, ownerName: any, bookTitle: any, requesterName: any, requesterEmail: any): Promise<any> {
        try {
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [ownerEmail],
                subject: `📖 Demande de location : ${bookTitle}`,
                html: `...`, // ton HTML reste identique
            });
            console.log("Demande de location envoyée:", data);
            return data;
        } catch (error: any) {
            console.error("Erreur envoi demande de location:", error);
            throw error;
        }
    },

    async sendRentalReminder(renterEmail: any, renterName: any, bookTitle: any, ownerName: any, expectedReturnDate: any): Promise<any> {
        try {
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [renterEmail],
                subject: `⏰ Rappel de restitution : ${bookTitle}`,
                html: `...`, // ton HTML reste identique
            });
            console.log("Rappel de restitution envoyé:", data);
            return data;
        } catch (error: any) {
            console.error("Erreur envoi rappel restitution:", error);
            throw error;
        }
    },

    async sendPasswordReset(userEmail: any, firstName: any, resetToken: any): Promise<any> {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/reset-password?token=${resetToken}`;
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: "🔐 Réinitialisation de votre mot de passe Bookineo",
                html: `...`, // ton HTML reste identique
            });
            console.log("Email de réinitialisation envoyé:", data);
            return data;
        } catch (error: any) {
            console.error("Erreur envoi reset password:", error);
            throw error;
        }
    },
};

export default emailService;
