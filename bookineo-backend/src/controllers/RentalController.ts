import type { Request, Response } from "express";
import { query } from "../database/connection.ts";
import type { Rental } from "../types/Rental.ts";
import type { QueryResult } from "pg";

class RentalController {
    async rentBook(req: Request, res: Response): Promise<void> {
        try {
            const { book_id, renter_id, rental_date, expected_return_date } = req.body;

            if (!book_id || !renter_id || !rental_date || !expected_return_date) {
                res.status(400).json({ error: "Champs obligatoires manquants" });
                return;
            }

            const bookCheck: QueryResult<any> = await query(`SELECT * FROM books WHERE id = $1`, [book_id]);

            if (bookCheck.rows.length === 0) {
                res.status(404).json({ error: "Livre non trouvé" });
                return;
            }

            if (bookCheck.rows[0].status !== "available") {
                res.status(400).json({ error: "Livre non disponible" });
                return;
            }

            const rental: QueryResult<Rental> = await query(
                `INSERT INTO rentals (book_id, renter_id, rental_date, expected_return_date, status)
                 VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
                [book_id, renter_id, rental_date, expected_return_date]
            );

            await query(`UPDATE books SET status = 'rented', updated_at = NOW() WHERE id = $1`, [book_id]);

            res.status(201).json(rental.rows[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async returnBook(req: Request, res: Response): Promise<void> {
        try {
            const { rental_id, actual_return_date, comment } = req.body;

            if (!rental_id || !actual_return_date) {
                res.status(400).json({ error: "Champs obligatoires manquants" });
                return;
            }

            const rentalCheck: QueryResult<Rental> = await query(`SELECT * FROM rentals WHERE id = $1`, [rental_id]);

            if (rentalCheck.rows.length === 0) {
                res.status(404).json({ error: "Location non trouvée" });
                return;
            }

            const rental = rentalCheck.rows[0];

            await query(
                `UPDATE rentals
                 SET actual_return_date = $1, status = 'returned', comment = $2, updated_at = NOW()
                 WHERE id = $3`,
                [actual_return_date, comment || null, rental_id]
            );

            await query(`UPDATE books SET status = 'available', updated_at = NOW() WHERE id = $1`, [rental.book_id]);

            res.json({ message: "Livre restitué avec succès" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRentals(req: Request, res: Response): Promise<void> {
        try {
            const rentals: QueryResult<Rental & { book_title: string; renter_first_name: string; renter_last_name: string }> = await query(
                `SELECT r.*, b.title AS book_title, u.first_name AS renter_first_name, u.last_name AS renter_last_name
                     FROM rentals r
                     JOIN books b ON r.book_id = b.id
                     JOIN users u ON r.renter_id = u.id
                     ORDER BY r.rental_date DESC`
            );

            res.json(rentals.rows);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRentalByUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const rentals: QueryResult<Rental> = await query(
                `SELECT
                    r.id,
                    r.book_id,
                    r.renter_id,
                    r.rental_date,
                    r.expected_return_date,
                    r.actual_return_date,
                    r.status,
                    r.comment,
                    b.title AS book_title,
                    b.author AS book_author,
                    b.image_url AS book_image_url,
                    b.category_id,
                    u.first_name,
                    u.last_name
                FROM rentals r
                JOIN books b ON r.book_id = b.id
                JOIN users u ON r.renter_id = u.id
                WHERE r.renter_id = $1
                ORDER BY r.rental_date DESC`,
                [userId]
            );

            res.json(rentals.rows);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new RentalController();
