import express from "express";
import type { Request, Response } from "express"; // pour TypeScript uniquement

import { bookControllers } from "../controllers/index.ts";

const router = express.Router();

router.post("/", (req: Request, res: Response) => bookControllers.createBook(req, res));
router.get("/", (req: Request, res: Response) => bookControllers.getBooks(req, res));
router.get("/:id", (req: Request, res: Response) => bookControllers.getBookById(req, res));
router.put("/:id", (req: Request, res: Response) => bookControllers.updateBook(req, res));
router.delete("/:id", (req: Request, res: Response) => bookControllers.deleteBook(req, res));

export default router;
