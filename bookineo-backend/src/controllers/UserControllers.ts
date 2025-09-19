import type { Request, Response } from "express";
import { query } from "../database/connection.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emailService } from "../services/emailService.ts";
import type { User } from "../types/User.ts";

class UserController {
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, first_name, last_name, birth_date } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email et mot de passe obligatoires" });
                return;
            }

            const existingUser = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
            if (existingUser.rows.length > 0) {
                res.status(400).json({ error: "Email déjà utilisé" });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await query<User>(
                `INSERT INTO users (email, password, first_name, last_name, birth_date)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, email, first_name, last_name, birth_date`,
                [email, hashedPassword, first_name, last_name, birth_date || null]
            );

            try {
                await emailService.sendWelcome(email, first_name);
            } catch (emailError) {
                console.error("Erreur envoi email de bienvenue:", emailError);
            }

            res.status(201).json({ user: result.rows[0] });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email et mot de passe obligatoires" });
                return;
            }

            const user = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
            if (user.rows.length === 0) {
                res.status(400).json({ error: "Email ou mot de passe incorrect" });
                return;
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password!);
            if (!validPassword) {
                res.status(400).json({ error: "Email ou mot de passe incorrect" });
                return;
            }

            const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET!, { expiresIn: "7d" });

            res.json({ token });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProfile(req: any, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            const user = await query<User>("SELECT id, email, first_name, last_name, birth_date FROM users WHERE id = $1", [userId]);

            res.json(user.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProfile(req: any, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { first_name, last_name, birth_date } = req.body;

            const result = await query<User>(
                `UPDATE users
                 SET first_name = $1, last_name = $2, birth_date = $3, updated_at = NOW()
                 WHERE id = $4
                 RETURNING id, email, first_name, last_name, birth_date`,
                [first_name, last_name, birth_date, userId]
            );

            res.json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteUser(req: any, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            await query("DELETE FROM users WHERE id = $1", [userId]);
            res.json({ message: "Utilisateur supprimé" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async requestPasswordReset(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({ error: "Email obligatoire" });
                return;
            }

            const userResult = await query<User>("SELECT * FROM users WHERE email = $1", [email]);
            if (userResult.rows.length === 0) {
                res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé" });
                return;
            }

            const user = userResult.rows[0];

            const resetToken = jwt.sign(
                { userId: user.id, email: user.email, type: 'password_reset' },
                process.env.JWT_SECRET!,
                { expiresIn: '1h' }
            );

            await query(
                "UPDATE users SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE id = $2",
                [resetToken, user.id]
            );

            await emailService.sendPasswordReset(user.email, user.first_name, resetToken);

            res.json({ message: "Si cet email existe, un lien de réinitialisation a été envoyé" });
        } catch (error: any) {
            console.error("Erreur requestPasswordReset:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                res.status(400).json({ error: "Token et nouveau mot de passe obligatoires" });
                return;
            }

            let decoded: any;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            } catch (error) {
                res.status(400).json({ error: "Token invalide ou expiré" });
                return;
            }

            if (decoded.type !== 'password_reset') {
                res.status(400).json({ error: "Token invalide" });
                return;
            }

            const userResult = await query<User>(
                "SELECT * FROM users WHERE id = $1 AND email = $2 AND reset_token = $3 AND reset_token_expires > NOW()",
                [decoded.userId, decoded.email, token]
            );

            if (userResult.rows.length === 0) {
                res.status(400).json({ error: "Token invalide ou expiré" });
                return;
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await query(
                "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2",
                [hashedPassword, decoded.userId]
            );

            res.json({ message: "Mot de passe réinitialisé avec succès" });
        } catch (error: any) {
            console.error("Erreur resetPassword:", error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new UserController();
