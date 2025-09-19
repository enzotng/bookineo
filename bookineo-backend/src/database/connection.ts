import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg"; // juste pour TypeScript
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Connexion à la DB
export const connectDB = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        console.log("Database connection established successfully");
        console.log(`Database: ${process.env.DB_NAME}`);

        const result = await client.query("SELECT NOW()");
        console.log(`Database server time: ${result.rows[0].now}`);

        client.release();
        return true;
    } catch (error: any) {
        console.error("Database connection failed:", error.message);
        return false;
    }
};

// Fonction query avec support générique
export const query = async <T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
    try {
        return await pool.query<T>(text, params);
    } catch (error: any) {
        console.error("SQL query error:", error.message);
        throw error;
    }
};

export const getPool = (): Pool => pool;
