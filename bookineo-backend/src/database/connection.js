import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("Database connection established successfully");
        console.log(`Database: ${process.env.DB_NAME}`);

        const result = await client.query("SELECT NOW()");
        console.log(`Database server time: ${result.rows[0].now}`);

        client.release();
        return true;
    } catch (error) {
        console.error("Database connection failed:", error.message);
        return false;
    }
};

const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error("SQL query error:", error.message);
        throw error;
    }
};

const getPool = () => pool;

export { connectDB, query, getPool };
