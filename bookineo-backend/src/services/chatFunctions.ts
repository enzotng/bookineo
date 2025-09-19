import { query } from "../database/connection.ts";

class ChatFunctions {
    async getAllData(): Promise<any> {
        const [books, categories, stats]: any = await Promise.all([this.getAvailableBooks(), this.getCategories(), this.getStats()]);

        return { books, categories, stats, recentRentals: [] };
    }

    async getAvailableBooks(): Promise<any> {
        const result: any = await query(`
            SELECT b.id, b.title, b.author, b.publication_year, b.price, b.status,
                   c.name as category, CONCAT(u.first_name, ' ', u.last_name) as owner
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN users u ON b.owner_id = u.id
            WHERE b.status = 'available'
            ORDER BY b.created_at DESC
            LIMIT 20
        `);
        return result.rows;
    }

    async getCategories(): Promise<any> {
        const result: any = await query("SELECT id, name FROM categories ORDER BY name");
        return result.rows;
    }

    async getStats(): Promise<any> {
        const result: any = await query(`
            SELECT
                COUNT(*) as total_books,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_books,
                COUNT(CASE WHEN status = 'rented' THEN 1 END) as rented_books,
                AVG(price)::DECIMAL(10,2) as avg_price,
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM books
        `);
        return result.rows[0];
    }

    async getRecentRentals(): Promise<any> {
        const result: any = await query(`
            SELECT b.title, b.author,
                   CONCAT(u1.first_name, ' ', u1.last_name) as owner,
                   CONCAT(u2.first_name, ' ', u2.last_name) as renter,
                   r.start_date as rental_date, r.end_date as return_date
            FROM rentals r
            JOIN books b ON r.book_id = b.id
            JOIN users u1 ON b.owner_id = u1.id
            JOIN users u2 ON r.renter_id = u2.id
            ORDER BY r.start_date DESC
            LIMIT 5
        `);
        return result.rows;
    }

    async searchBooks(searchQuery: any, filters: any = {}): Promise<any> {
        const { status = "available", category_id, limit = 10 } = filters;

        let queryText: any = `
            SELECT b.id, b.title, b.author, b.publication_year, b.price, b.status,
                   c.name as category, CONCAT(u.first_name, ' ', u.last_name) as owner
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN users u ON b.owner_id = u.id
            WHERE 1=1
        `;

        const params: any = [];
        let paramIndex: any = 1;

        if (searchQuery) {
            queryText += ` AND (b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex})`;
            params.push(`%${searchQuery}%`);
            paramIndex++;
        }

        if (status) {
            queryText += ` AND b.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (category_id) {
            queryText += ` AND b.category_id = $${paramIndex}`;
            params.push(category_id);
            paramIndex++;
        }

        queryText += ` ORDER BY b.created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);

        const result: any = await query(queryText, params);
        return result.rows;
    }

    formatDataForLLM(data: any): any {
        const { books, categories, stats, recentRentals } = data;

        return `
STATISTIQUES BOOKINEO:
- ${stats.total_books} livres au total
- ${stats.available_books} livres disponibles
- ${stats.rented_books} livres loués
- Prix moyen: ${stats.avg_price}€
- Prix min: ${stats.min_price}€, max: ${stats.max_price}€

CATÉGORIES DISPONIBLES:
${categories.map((c: any) => `- ${c.name}`).join("\n")}

LIVRES DISPONIBLES À LA LOCATION:
${books
    .slice(0, 15)
    .map((b: any) => `- "${b.title}" par ${b.author} (${b.category || "Sans catégorie"}) - ${b.price}€ - Propriétaire: ${b.owner}`)
    .join("\n")}
        `.trim();
    }
}

export default new ChatFunctions();
