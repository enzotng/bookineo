import { query } from "../database/connection.js";

class BookController {
    async createBook(req, res) {
        try {
            const { title, author, publication_year, category_id, price, owner_id, image_url } = req.body;

            if (!title || !author || !price || !owner_id) {
                return res.status(400).json({ error: "Champs obligatoires manquants" });
            }

            const result = await query(
                `INSERT INTO books (title, author, publication_year, category_id, price, owner_id, image_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [title, author, publication_year, category_id, price, owner_id, image_url]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBooks(req, res) {
        try {
            const { status, category_id, author, title } = req.query;

            let queryText = "SELECT * FROM books WHERE 1=1";
            const params = [];
            let index = 1;

            if (status) {
                queryText += ` AND status = $${index++}`;
                params.push(status);
            }
            if (category_id) {
                queryText += ` AND category_id = $${index++}`;
                params.push(category_id);
            }
            if (author) {
                queryText += ` AND author ILIKE $${index++}`;
                params.push(`%${author}%`);
            }
            if (title) {
                queryText += ` AND title ILIKE $${index++}`;
                params.push(`%${title}%`);
            }

            const result = await query(queryText, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getBookById(req, res) {
        try {
            const { id } = req.params;

            const result = await query("SELECT * FROM books WHERE id = $1", [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Livre non trouvé" });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateBook(req, res) {
        try {
            const { id } = req.params;
            const { title, author, publication_year, category_id, price, status, image_url } = req.body;

            const result = await query(
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
                return res.status(404).json({ error: "Livre non trouvé" });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteBook(req, res) {
        try {
            const { id } = req.params;

            const result = await query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: "Livre non trouvé" });
            }

            res.json({ message: "Livre supprimé avec succès", deleted: result.rows[0] });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new BookController();
