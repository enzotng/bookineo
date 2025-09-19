import type { Request, Response } from "express";
import { query } from "../database/connection.ts";
import type { QueryResult } from "pg";
import type { Book } from "../types/Book.ts";

class BookController {
    async createBook(req: Request, res: Response): Promise<void> {
        try {
            const { title, author, publication_year, category_id, price, owner_id, image_url } = req.body;

            if (!title || !author || !price || !owner_id) {
                res.status(400).json({ error: "Champs obligatoires manquants" });
                return;
            }

            const result: QueryResult<Book> = await query(
                `INSERT INTO books (title, author, publication_year, category_id, price, owner_id, image_url) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [title, author, publication_year, category_id, price, owner_id, image_url]
            );

            res.status(201).json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBooks(req: Request, res: Response): Promise<void> {
        try {
            const { status, category_id, author, title, page = "1", limit = "12" } = req.query;

            const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

            let whereClause = "WHERE 1=1";
            const params: any[] = [];
            let index = 1;

            if (status) {
                whereClause += ` AND status = $${index++}`;
                params.push(status);
            }
            if (category_id) {
                whereClause += ` AND category_id = $${index++}`;
                params.push(category_id);
            }
            if (author) {
                whereClause += ` AND author ILIKE $${index++}`;
                params.push(`%${author}%`);
            }
            if (title) {
                whereClause += ` AND title ILIKE $${index++}`;
                params.push(`%${title}%`);
            }
            if (owner_id) {
                whereClause += ` AND owner_id = $${index++}`;
                params.push(owner_id);
            }

            const countQuery = `SELECT COUNT(*) FROM books ${whereClause}`;
            const booksQuery = `SELECT * FROM books ${whereClause} ORDER BY created_at DESC LIMIT $${index++} OFFSET $${index}`;

            params.push(parseInt(limit as string), offset);

            const [countResult, booksResult] = await Promise.all([query(countQuery, params.slice(0, -2)), query(booksQuery, params)]);

            const totalBooks = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalBooks / parseInt(limit as string));

            res.json({
                books: booksResult.rows,
                pagination: {
                    currentPage: parseInt(page as string),
                    totalPages,
                    totalBooks,
                    limit: parseInt(limit as string),
                    hasNextPage: parseInt(page as string) < totalPages,
                    hasPreviousPage: parseInt(page as string) > 1,
                },
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBookById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const result: QueryResult<Book> = await query("SELECT * FROM books WHERE id = $1", [id]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: "Livre non trouvé" });
                return;
            }

            res.json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateBook(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { title, author, publication_year, category_id, price, status, image_url } = req.body;

            const result: QueryResult<Book> = await query(
                `UPDATE books 
                 SET title = COALESCE($1, title),
                     author = COALESCE($2, author),
                     publication_year = COALESCE($3, publication_year),
                     category_id = COALESCE($4, category_id),
                     price = COALESCE($5, price),
                     status = COALESCE($6, status),
                     image_url = COALESCE($7, image_url),
                     updated_at = NOW()
                 WHERE id = $8 RETURNING *`,
                [title, author, publication_year, category_id, price, status, image_url, id]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: "Livre non trouvé" });
                return;
            }

            res.json(result.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteBook(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const result: QueryResult<Book> = await query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: "Livre non trouvé" });
                return;
            }

            res.json({ message: "Livre supprimé avec succès", deleted: result.rows[0] });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new BookController();
