import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { connectDB, userRoutes, bookRoutes, categoryRoutes, rentalRoutes, messageRoutes, chatRoutes } from "./src/index.js";
import { initSocket } from "./src/services/socketService.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "yaml";

dotenv.config();

const baseYaml = fs.readFileSync("./openapi-base.yaml", "utf8");
const openapiDoc = yaml.parse(baseYaml);


const app = express();

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the API");
});

app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));

app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    console.log("Starting Bookineo Backend server...");

    const dbConnected = await connectDB();
    if (!dbConnected) {
        console.error("Failed to connect to database. Server shutdown.");
        process.exit(1);
    }

    const server = createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`Bookineo server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
};

startServer();