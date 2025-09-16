import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB, userRoutes, bookRoutes, categoryRoutes, rentalRoutes, messageRoutes, chatRoutes } from "./src";

dotenv.config();

// Import des routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the API");
});

// Routes principales
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/messages", messageRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Gestion des 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Gestion des erreurs serveur
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);  
});
