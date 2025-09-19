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
            const resetUrl = `${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}/auth/reset-password?token=${resetToken}`;
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: "🔐 Réinitialisation de votre mot de passe Bookineo",
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <title>Réinitialisation de mot de passe - Bookineo</title>
                    </head>
                    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Book<span style="color: #ffd700;">ineo</span></h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Réinitialisation de votre mot de passe</p>
                        </div>

                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-top: 0;">Bonjour ${firstName} ! 👋</h2>

                            <p>Vous avez demandé la réinitialisation de votre mot de passe sur Bookineo.</p>

                            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                    🔐 Réinitialiser mon mot de passe
                                </a>
                            </div>

                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px;"><strong>⏰ Important :</strong> Ce lien expire dans <strong>1 heure</strong> pour votre sécurité.</p>
                            </div>

                            <p style="font-size: 14px; color: #666;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                            <p style="font-size: 12px; color: #888; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>

                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                            <p style="font-size: 14px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>

                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #888; font-size: 14px;">Bonne lecture ! 📚</p>
                                <p style="color: #888; font-size: 14px; font-weight: bold;">L'équipe Bookineo</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
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
