import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'Bookineo <noreply@bookineo.app>';

export const emailService = {
    async sendWelcome(userEmail, firstName) {
        try {
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: 'Bienvenue sur Bookineo ! 📚',
                html: `
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Bienvenue sur Bookineo</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a; background: #f8fafc; }
                            .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 12px; overflow: hidden; }
                            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 32px 24px; text-align: center; }
                            .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
                            .header p { font-size: 16px; opacity: 0.9; font-weight: 400; }
                            .content { padding: 32px 24px; }
                            .welcome-text { font-size: 16px; margin-bottom: 24px; color: #475569; }
                            .features-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0; }
                            .features-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
                            .features-list { list-style: none; }
                            .features-list li { display: flex; align-items: center; padding: 8px 0; font-size: 15px; color: #475569; }
                            .features-list li::before { content: '✓'; background: #22c55e; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px; font-weight: bold; }
                            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0 16px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: all 0.2s; }
                            .button:hover { transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgb(0 0 0 / 0.15); }
                            .footer { background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; }
                            .footer p { font-size: 13px; color: #64748b; }
                            .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 24px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Bienvenue ${firstName} ! 🎉</h1>
                                <p>Votre aventure littéraire commence maintenant</p>
                            </div>
                            <div class="content">
                                <p class="welcome-text">Félicitations ! Votre compte Bookineo a été créé avec succès. Vous rejoignez une communauté passionnée de lecteurs qui partagent leurs livres favoris.</p>

                                <div class="features-card">
                                    <h2 class="features-title">Découvrez tout ce que vous pouvez faire :</h2>
                                    <ul class="features-list">
                                        <li>Parcourir une bibliothèque de livres disponibles</li>
                                        <li>Échanger avec d'autres passionnés de lecture</li>
                                        <li>Proposer vos propres ouvrages à la location</li>
                                        <li>Rechercher par titre, auteur ou genre</li>
                                    </ul>
                                </div>

                                <div style="text-align: center;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/books" class="button">
                                        Explorer les livres disponibles →
                                    </a>
                                </div>

                                <div class="divider"></div>
                                <p style="text-align: center; color: #64748b; font-size: 15px;">Bonne lecture sur Bookineo ! 📚</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Bookineo • Partagez vos livres, partagez la passion</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
            return data;
        } catch (error) {
            console.error('Erreur envoi email de bienvenue:', error);
            throw error;
        }
    },

    async sendNewMessageNotification(recipientEmail, recipientName, senderName, subject, messagePreview) {
        try {
            const emailPayload = {
                from: EMAIL_FROM,
                to: [recipientEmail],
                subject: `📬 Nouveau message de ${senderName}`,
                html: `
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Nouveau message reçu</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a; background: #f8fafc; }
                            .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 12px; overflow: hidden; }
                            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 32px 24px; text-align: center; }
                            .header-icon { font-size: 48px; margin-bottom: 16px; }
                            .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
                            .header p { font-size: 15px; opacity: 0.9; }
                            .content { padding: 32px 24px; }
                            .greeting { font-size: 16px; margin-bottom: 20px; color: #475569; }
                            .message-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; position: relative; overflow: hidden; }
                            .message-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
                            .message-subject { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }
                            .message-meta { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
                            .message-meta-item { display: flex; align-items: center; font-size: 14px; color: #64748b; }
                            .message-meta-label { font-weight: 600; margin-right: 8px; min-width: 80px; }
                            .message-preview { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 15px; color: #475569; font-style: italic; }
                            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0 16px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: all 0.2s; }
                            .button:hover { transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgb(0 0 0 / 0.15); }
                            .note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #92400e; }
                            .footer { background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; }
                            .footer p { font-size: 13px; color: #64748b; }
                            .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 24px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="header-icon">📬</div>
                                <h1>Nouveau message reçu</h1>
                                <p>Quelqu'un souhaite vous contacter sur Bookineo</p>
                            </div>
                            <div class="content">
                                <p class="greeting">Bonjour ${recipientName},</p>
                                <p style="margin-bottom: 24px; color: #475569;">Vous avez reçu un nouveau message sur votre compte Bookineo :</p>

                                <div class="message-card">
                                    <h3 class="message-subject">${subject || 'Sans sujet'}</h3>
                                    <div class="message-meta">
                                        <div class="message-meta-item">
                                            <span class="message-meta-label">De :</span>
                                            <span>${senderName}</span>
                                        </div>
                                        <div class="message-meta-item">
                                            <span class="message-meta-label">Aperçu :</span>
                                        </div>
                                    </div>
                                    <div class="message-preview">"${messagePreview}..."</div>
                                </div>

                                <div style="text-align: center;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" class="button">
                                        Lire le message complet →
                                    </a>
                                </div>

                                <div class="note">
                                    💡 <strong>Astuce :</strong> Répondez rapidement pour maintenir une bonne communication avec la communauté Bookineo !
                                </div>

                                <div class="divider"></div>
                                <p style="text-align: center; color: #64748b; font-size: 14px;">Vous pouvez répondre directement depuis votre espace messagerie.</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Bookineo • Notification automatique</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const { data, error } = await resend.emails.send(emailPayload);

            if (error) {
                console.error('Erreur envoi notification message via Resend:', error);
                throw new Error(`Resend API error: ${JSON.stringify(error)}`);
            }
            return data;
        } catch (error) {
            console.error('Erreur envoi notification message:', error);
            throw error;
        }
    },

    async sendRentalRequest(ownerEmail, ownerName, bookTitle, requesterName, requesterEmail) {
        try {
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [ownerEmail],
                subject: `📖 Demande de location : ${bookTitle}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                            .content { background: #f8fafc; padding: 20px; }
                            .book-info { background: white; padding: 16px; border-radius: 8px; margin: 16px 0; border: 2px solid #f59e0b; }
                            .requester-info { background: #dbeafe; padding: 12px; border-radius: 6px; margin: 16px 0; }
                            .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
                            .footer { background: #64748b; color: white; padding: 16px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>📖 Nouvelle demande de location</h1>
                            </div>
                            <div class="content">
                                <p>Bonjour ${ownerName},</p>
                                <p>Bonne nouvelle ! Quelqu'un souhaite louer votre livre :</p>

                                <div class="book-info">
                                    <h3>📚 "${bookTitle}"</h3>
                                </div>

                                <div class="requester-info">
                                    <p><strong>👤 Demandeur :</strong> ${requesterName}</p>
                                    <p><strong>📧 Contact :</strong> ${requesterEmail}</p>
                                </div>

                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" class="button">
                                    Répondre à la demande
                                </a>

                                <p>Vous pouvez maintenant échanger avec ${requesterName} pour organiser la location (modalités, prix, lieu de remise, etc.).</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Bookineo - Partagez vos livres, partagez la lecture !</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
            console.log('Demande de location envoyée:', data);
            return data;
        } catch (error) {
            console.error('Erreur envoi demande de location:', error);
            throw error;
        }
    },

    async sendRentalReminder(renterEmail, renterName, bookTitle, ownerName, expectedReturnDate) {
        try {
            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [renterEmail],
                subject: `⏰ Rappel de restitution : ${bookTitle}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                            .content { background: #f8fafc; padding: 20px; }
                            .reminder-info { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 6px; margin: 16px 0; }
                            .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
                            .footer { background: #64748b; color: white; padding: 16px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>⏰ Rappel de restitution</h1>
                            </div>
                            <div class="content">
                                <p>Bonjour ${renterName},</p>
                                <p>Nous espérons que vous avez apprécié la lecture ! Ce petit rappel concerne :</p>

                                <div class="reminder-info">
                                    <h3>📚 "${bookTitle}"</h3>
                                    <p><strong>📅 Date de retour prévue :</strong> ${expectedReturnDate}</p>
                                    <p><strong>👤 Propriétaire :</strong> ${ownerName}</p>
                                </div>

                                <p>N'oubliez pas de contacter ${ownerName} pour organiser la restitution du livre.</p>

                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/messages" class="button">
                                    Contacter le propriétaire
                                </a>

                                <p>Merci de respecter les délais convenus. 📖</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Bookineo - Lecture responsable et partage</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
            console.log('Rappel de restitution envoyé:', data);
            return data;
        } catch (error) {
            console.error('Erreur envoi rappel restitution:', error);
            throw error;
        }
    },

    async sendPasswordReset(userEmail, firstName, resetToken) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`;

            const { data } = await resend.emails.send({
                from: EMAIL_FROM,
                to: [userEmail],
                subject: '🔐 Réinitialisation de votre mot de passe Bookineo',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                            .content { background: #f8fafc; padding: 20px; }
                            .security-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 16px 0; }
                            .button { background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
                            .footer { background: #64748b; color: white; padding: 16px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
                            .token { font-family: monospace; background: #e5e7eb; padding: 8px; border-radius: 4px; word-break: break-all; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔐 Réinitialisation mot de passe</h1>
                            </div>
                            <div class="content">
                                <p>Bonjour ${firstName},</p>
                                <p>Vous avez demandé la réinitialisation de votre mot de passe Bookineo.</p>

                                <div class="security-notice">
                                    <p><strong>⚠️ Sécurité :</strong> Ce lien est valide pendant 1 heure seulement.</p>
                                </div>

                                <a href="${resetUrl}" class="button">
                                    Réinitialiser mon mot de passe
                                </a>

                                <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
                                <p class="token">${resetUrl}</p>

                                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                            </div>
                            <div class="footer">
                                <p>© 2024 Bookineo - Sécurité de votre compte</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });
            console.log('Email de réinitialisation envoyé:', data);
            return data;
        } catch (error) {
            console.error('Erreur envoi reset password:', error);
            throw error;
        }
    }
};

export default emailService;