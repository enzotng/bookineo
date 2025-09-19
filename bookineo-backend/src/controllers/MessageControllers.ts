import type { Request, Response } from "express";
import { query } from "../database/connection.ts";
import { emailService } from "../services/emailService.ts";
import { emitToUser } from "../services/socketService.ts";
import type { Message } from "../types/Message.ts";

class MessageController {
    async sendMessage(req: Request & { user?: any }, res: Response): Promise<void> {
        try {
            const { sender_id, recipient_id, subject, content } = req.body;

            if (!sender_id || !recipient_id || !content) {
                res.status(400).json({ error: "Champs obligatoires manquants" });
                return;
            }

            if (req.user?.id !== sender_id) {
                res.status(403).json({ error: "Accès non autorisé" });
                return;
            }

            let finalRecipientId = recipient_id;

            if (typeof recipient_id === "string" && recipient_id.includes("@")) {
                const userResult = await query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [recipient_id]);

                if (userResult.rows.length === 0) {
                    res.status(404).json({ error: "Utilisateur destinataire non trouvé" });
                    return;
                }

                finalRecipientId = userResult.rows[0].id;
            }

            const result = await query<Message>(
                `INSERT INTO messages (sender_id, recipient_id, subject, content)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [sender_id, finalRecipientId, subject, content]
            );

            const [senderResult, recipientResult] = await Promise.all([
                query<{ first_name: string; last_name: string }>(`SELECT first_name, last_name FROM users WHERE id = $1`, [sender_id]),
                query<{ email: string; first_name: string; last_name: string }>(`SELECT email, first_name, last_name FROM users WHERE id = $1`, [finalRecipientId]),
            ]);

            try {
                if (senderResult.rows.length > 0 && recipientResult.rows.length > 0) {
                    const sender = senderResult.rows[0];
                    const recipient = recipientResult.rows[0];

                    const senderName = `${sender.first_name} ${sender.last_name}`;
                    const recipientName = `${recipient.first_name} ${recipient.last_name}`;
                    const messagePreview = content.length > 100 ? content.substring(0, 100) : content;

                    await emailService.sendNewMessageNotification(recipient.email, recipientName, senderName, subject, messagePreview);
                }
            } catch (emailError) {
                console.error("Erreur envoi notification message:", emailError);
            }

            emitToUser(finalRecipientId, "newMessage", {
                ...result.rows[0],
                sender: {
                    id: sender_id,
                    first_name: senderResult.rows[0]?.first_name,
                    last_name: senderResult.rows[0]?.last_name,
                },
            });

            res.status(201).json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessages(req: Request & { user?: any }, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (req.user?.id !== userId) {
                res.status(403).json({ error: "Accès non autorisé" });
                return;
            }

            const result = await query(
                `SELECT
                    m.*,
                    sender.id as sender_id,
                    sender.first_name as sender_first_name,
                    sender.last_name as sender_last_name,
                    sender.email as sender_email,
                    recipient.id as recipient_id,
                    recipient.first_name as recipient_first_name,
                    recipient.last_name as recipient_last_name,
                    recipient.email as recipient_email
                 FROM messages m
                 JOIN users sender ON m.sender_id = sender.id
                 JOIN users recipient ON m.recipient_id = recipient.id
                 WHERE m.sender_id = $1 OR m.recipient_id = $1
                 ORDER BY m.sent_at DESC`,
                [userId]
            );

            const messagesWithUsers = result.rows.map((row) => ({
                id: row.id,
                sender_id: row.sender_id,
                recipient_id: row.recipient_id,
                subject: row.subject,
                content: row.content,
                is_read: row.is_read,
                sent_at: row.sent_at,
                created_at: row.created_at,
                updated_at: row.updated_at,
                sender: {
                    id: row.sender_id,
                    first_name: row.sender_first_name,
                    last_name: row.sender_last_name,
                    email: row.sender_email,
                },
                recipient: {
                    id: row.recipient_id,
                    first_name: row.recipient_first_name,
                    last_name: row.recipient_last_name,
                    email: row.recipient_email,
                },
            }));

            res.json(messagesWithUsers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMessageById(req: Request & { user?: any }, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const result = await query(
                `SELECT
                    m.*,
                    sender.first_name as sender_first_name,
                    sender.last_name as sender_last_name,
                    sender.email as sender_email,
                    recipient.first_name as recipient_first_name,
                    recipient.last_name as recipient_last_name,
                    recipient.email as recipient_email
                 FROM messages m
                 JOIN users sender ON m.sender_id = sender.id
                 JOIN users recipient ON m.recipient_id = recipient.id
                 WHERE m.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: "Message non trouvé" });
                return;
            }

            const row = result.rows[0];

            if (req.user?.id !== row.sender_id && req.user?.id !== row.recipient_id) {
                res.status(403).json({ error: "Accès non autorisé" });
                return;
            }

            if (!row.is_read && req.user?.id === row.recipient_id) {
                await query(`UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1`, [id]);

                emitToUser(row.sender_id, 'messageRead', {
                    messageId: id,
                    readAt: new Date().toISOString()
                });
            }

            const messageWithUser = {
                id: row.id,
                sender_id: row.sender_id,
                recipient_id: row.recipient_id,
                subject: row.subject,
                content: row.content,
                is_read: !row.is_read ? true : row.is_read,
                sent_at: row.sent_at,
                created_at: row.created_at,
                updated_at: row.updated_at,
                sender: {
                    id: row.sender_id,
                    first_name: row.sender_first_name,
                    last_name: row.sender_last_name,
                    email: row.sender_email,
                },
                recipient: {
                    id: row.recipient_id,
                    first_name: row.recipient_first_name,
                    last_name: row.recipient_last_name,
                    email: row.recipient_email,
                },
            };

            res.json(messageWithUser);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteMessage(req: Request & { user?: any }, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const checkResult = await query<{ sender_id: string }>(`SELECT sender_id FROM messages WHERE id = $1`, [id]);

            if (checkResult.rows.length === 0) {
                res.status(404).json({ error: "Message non trouvé" });
                return;
            }

            const message = checkResult.rows[0];
            if (req.user?.id !== message.sender_id) {
                res.status(403).json({ error: "Seul l'expéditeur peut supprimer ce message" });
                return;
            }

            const result = await query<Message>(`DELETE FROM messages WHERE id = $1 RETURNING *`, [id]);

            res.json({ message: "Message supprimé avec succès", deleted: result.rows[0] });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            const { id } = req.params;

            const messageResult = await query(
                `SELECT sender_id, recipient_id, is_read FROM messages WHERE id = $1`,
                [id]
            );

            if (messageResult.rows.length === 0) {
                return res.status(404).json({ error: "Message non trouvé" });
            }

            const message = messageResult.rows[0];

            if (req.user.id !== message.recipient_id) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            if (!message.is_read) {
                await query(`UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1`, [id]);

                emitToUser(message.sender_id, 'messageRead', {
                    messageId: id,
                    readAt: new Date().toISOString()
                });
            }

            res.json({ message: "Message marqué comme lu", id, is_read: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            const { id } = req.params;

            const messageResult = await query(
                `SELECT sender_id, recipient_id, is_read FROM messages WHERE id = $1`,
                [id]
            );

            if (messageResult.rows.length === 0) {
                return res.status(404).json({ error: "Message non trouvé" });
            }

            const message = messageResult.rows[0];

            if (req.user.id !== message.recipient_id) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            if (!message.is_read) {
                await query(`UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1`, [id]);

                emitToUser(message.sender_id, 'messageRead', {
                    messageId: id,
                    readAt: new Date().toISOString()
                });
            }

            res.json({ message: "Message marqué comme lu", id, is_read: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUnreadCount(req: Request & { user?: any }, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (req.user?.id !== userId) {
                res.status(403).json({ error: "Accès non autorisé" });
                return;
            }

            const result = await query<{ unread_count: string }>(
                `SELECT COUNT(*) AS unread_count
                 FROM messages
                 WHERE recipient_id = $1 AND is_read = false`,
                [userId]
            );

            res.json({ unread: parseInt(result.rows[0].unread_count, 10) });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new MessageController();
