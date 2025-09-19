import type { Request, Response } from "express";
import { query } from "../database/connection.ts";
import type { QueryResult } from "pg";
import type { Category } from "../types/Category.ts";

class CategoryController {
    async createCategory(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.body;

            if (!name) {
                res.status(400).json({ error: "Le nom de la catégorie est obligatoire" });
                return;
            }

            const result: QueryResult<Category> = await query(`INSERT INTO categories (name) VALUES ($1) RETURNING *`, [name]);

            res.status(201).json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCategories(req: Request, res: Response): Promise<void> {
        try {
            const result: QueryResult<Category> = await query(`SELECT * FROM categories ORDER BY name`);
            res.json(result.rows);
        } catch (error: any) {
            console.error("CategoryController error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                res.status(400).json({ error: "Le nom de la catégorie est obligatoire" });
                return;
            }

            const result: QueryResult<Category> = await query(
                `UPDATE categories 
         SET name = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
                [name, id]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: "Catégorie non trouvée" });
                return;
            }

            res.json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const result: QueryResult<Category> = await query(`DELETE FROM categories WHERE id = $1 RETURNING *`, [id]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: "Catégorie non trouvée" });
                return;
            }

            res.json({ message: "Catégorie supprimée avec succès", deleted: result.rows[0] });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new CategoryController();
