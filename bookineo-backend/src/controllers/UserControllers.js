import { query as db } from "../database/connection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserController {
    async register(req, res) {
        try {
            const { email, password, first_name, last_name, birth_date } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email et mot de passe obligatoires" });
            }

            const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: "Email déjà utilisé" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await db.query(
                `INSERT INTO users (email, password, first_name, last_name, birth_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, birth_date`,
                [email, hashedPassword, first_name, last_name, birth_date || null]
            );

            res.status(201).json({ user: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: "Email et mot de passe obligatoires" });
            }

            const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ error: "Email ou mot de passe incorrect" });
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (!validPassword) {
                return res.status(400).json({ error: "Email ou mot de passe incorrect" });
            }

            const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET, { expiresIn: "7d" });

            res.json({ token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await db.query("SELECT id, email, first_name, last_name, birth_date FROM users WHERE id = $1", [userId]);
            res.json(user.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { first_name, last_name, birth_date } = req.body;

            const result = await db.query(
                `UPDATE users SET first_name = $1, last_name = $2, birth_date = $3, updated_at = NOW()
         WHERE id = $4 RETURNING id, email, first_name, last_name, birth_date`,
                [first_name, last_name, birth_date, userId]
            );

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.user.id;

            await db.query("DELETE FROM users WHERE id = $1", [userId]);
            res.json({ message: "Utilisateur supprimé" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new UserController();
