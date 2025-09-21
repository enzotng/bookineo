import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "Bookineo <noreply@bookineo.app>";

const getEmailTemplate = (title: string, subtitle: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} - Bookineo</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">
            Book<span style="color: #fbbf24; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ineo</span>
        </h1>
        <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 18px; font-weight: 500;">${subtitle}</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; border-top: none;">
        ${content}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">

        <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 16px; margin: 0;">Bonne lecture ! 📚</p>
            <p style="color: #1e293b; font-size: 16px; font-weight: 700; margin: 8px 0 0 0; background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">L'équipe Bookineo</p>
        </div>
    </div>
</body>
</html>
`;

export const emailService: any = {
    async sendWelcome(userEmail: any, firstName: any): Promise<any> {
        try {
            const content = `
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700;">Bonjour ${firstName} ! 👋</h2>

                <p style="font-size: 16px; color: #334155; margin: 20px 0;">Bienvenue dans notre communauté de passionnés de lecture !</p>

                <p style="font-size: 16px; color: #334155;">Avec Bookineo, vous pouvez :</p>

                <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                    <ul style="margin: 0; padding-left: 20px; color: #475569;">
                        <li style="margin: 8px 0; font-size: 16px;">📖 <strong>Louer</strong> des livres entre particuliers</li>
                        <li style="margin: 8px 0; font-size: 16px;">💬 <strong>Échanger</strong> avec d'autres lecteurs</li>
                        <li style="margin: 8px 0; font-size: 16px;">🤖 <strong>Découvrir</strong> de nouveaux livres avec notre IA</li>
                        <li style="margin: 8px 0; font-size: 16px;">⭐ <strong>Partager</strong> vos coups de cœur littéraires</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}"
                       style="background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
                              color: white;
                              padding: 16px 32px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                              transition: transform 0.2s;">
                        🚀 Commencer l'aventure
                    </a>
                </div>
            `;

            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: "Bienvenue sur Bookineo ! 📚",
                html: getEmailTemplate("Bienvenue", "Votre compte a été créé avec succès", content),
            });
            return data;
        } catch (error: any) {
            console.error("Erreur envoi email de bienvenue:", error);
            throw error;
        }
    },

    async sendNewMessageNotification(recipientEmail: any, recipientName: any, senderName: any, subject: any, messagePreview: any): Promise<any> {
        try {
            const content = `
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700;">Bonjour ${recipientName} ! 💬</h2>

                <p style="font-size: 16px; color: #334155; margin: 20px 0;">Vous avez reçu un nouveau message de <strong>${senderName}</strong> :</p>

                <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 18px; font-weight: 600;">📧 ${subject}</h3>
                    <p style="margin: 0; color: #475569; font-size: 16px; font-style: italic;">"${messagePreview}..."</p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}/messages"
                       style="background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
                              color: white;
                              padding: 16px 32px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);">
                        💬 Lire le message
                    </a>
                </div>

                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">Vous pouvez répondre directement depuis votre messagerie Bookineo.</p>
            `;

            const emailPayload: any = {
                from: EMAIL_FROM,
                to: [recipientEmail],
                subject: `📬 Nouveau message de ${senderName}`,
                html: getEmailTemplate("Nouveau message", `Message de ${senderName}`, content),
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
            const content = `
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700;">Bonjour ${ownerName} ! 📖</h2>

                <p style="font-size: 16px; color: #334155; margin: 20px 0;"><strong>${requesterName}</strong> souhaite louer votre livre :</p>

                <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📚</div>
                    <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px; font-weight: 700;">${bookTitle}</h3>
                    <p style="margin: 0; color: #475569; font-size: 14px;">Demande de location</p>
                </div>

                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">👤 Demandeur :</p>
                    <p style="margin: 0 0 12px 0; color: #475569;">${requesterName}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">✉️ Contact :</p>
                    <p style="margin: 0; color: #475569;">${requesterEmail}</p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}/messages"
                       style="background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
                              color: white;
                              padding: 16px 32px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                              margin-right: 16px;">
                        💬 Répondre
                    </a>
                    <a href="${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}/my-books"
                       style="background: transparent;
                              color: #3b82f6;
                              border: 2px solid #3b82f6;
                              padding: 14px 30px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;">
                        📚 Mes livres
                    </a>
                </div>
            `;

            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [ownerEmail],
                subject: `📖 Demande de location : ${bookTitle}`,
                html: getEmailTemplate("Demande de location", `Nouvelle demande pour "${bookTitle}"`, content),
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
            const formattedDate = new Date(expectedReturnDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const content = `
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700;">Bonjour ${renterName} ! ⏰</h2>

                <p style="font-size: 16px; color: #334155; margin: 20px 0;">N'oubliez pas de rendre le livre que vous avez loué :</p>

                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #f59e0b; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📖</div>
                    <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px; font-weight: 700;">${bookTitle}</h3>
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">Date de retour prévue</p>
                </div>

                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">📅 À rendre le :</p>
                    <p style="margin: 0 0 12px 0; color: #f59e0b; font-size: 18px; font-weight: 700;">${formattedDate}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600;">👤 Propriétaire :</p>
                    <p style="margin: 0; color: #475569;">${ownerName}</p>
                </div>

                <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #475569; font-size: 14px;">💡 <strong>Astuce :</strong> Vous pouvez contacter le propriétaire via votre messagerie pour organiser la restitution.</p>
                </div>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}/return-book"
                       style="background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
                              color: white;
                              padding: 16px 32px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                              margin-right: 16px;">
                        ↩️ Rendre le livre
                    </a>
                    <a href="${process.env.FRONTEND_URL || "https://bookineo.altelis.com"}/messages"
                       style="background: transparent;
                              color: #3b82f6;
                              border: 2px solid #3b82f6;
                              padding: 14px 30px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;">
                        💬 Contacter
                    </a>
                </div>
            `;

            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [renterEmail],
                subject: `⏰ Rappel de restitution : ${bookTitle}`,
                html: getEmailTemplate("Rappel de restitution", `N'oubliez pas de rendre "${bookTitle}"`, content),
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

            const content = `
                <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700;">Bonjour ${firstName} ! 🔐</h2>

                <p style="font-size: 16px; color: #334155; margin: 20px 0;">Vous avez demandé la réinitialisation de votre mot de passe sur Bookineo.</p>

                <p style="font-size: 16px; color: #334155;">Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

                <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetUrl}"
                       style="background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%);
                              color: white;
                              padding: 16px 32px;
                              text-decoration: none;
                              border-radius: 25px;
                              font-weight: 700;
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);">
                        🔐 Réinitialiser mon mot de passe
                    </a>
                </div>

                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⏰ Important :</strong> Ce lien expire dans <strong>1 heure</strong> pour votre sécurité.</p>
                </div>

                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">🔗 Lien alternatif :</p>
                    <p style="margin: 0; color: #64748b; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace; background: #f1f5f9; padding: 8px; border-radius: 4px;">${resetUrl}</p>
                </div>

                <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #475569; font-size: 14px;">🛡️ <strong>Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                </div>
            `;

            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: "🔐 Réinitialisation de votre mot de passe Bookineo",
                html: getEmailTemplate("Réinitialisation de mot de passe", "Créez un nouveau mot de passe sécurisé", content),
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
