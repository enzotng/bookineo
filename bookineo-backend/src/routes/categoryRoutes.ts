import express from "express";
import type { Request, Response } from "express"; // pour TypeScript uniquement
import { categoryController } from "../controllers/index.ts";

const router = express.Router();

router.post("/", (req: Request, res: Response) => categoryController.createCategory(req, res));
router.get("/", (req: Request, res: Response) => categoryController.getCategories(req, res));
router.put("/:id", (req: Request, res: Response) => categoryController.updateCategory(req, res));
router.delete("/:id", (req: Request, res: Response) => categoryController.deleteCategory(req, res));

export default router;
