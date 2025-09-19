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
}

export default new UserController();
