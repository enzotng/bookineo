import express from "express";
import type { Request, Response } from "express"; // Types uniquement
import { rentalController } from "../controllers/index.ts";

const router = express.Router();

router.post("/rent", (req: Request, res: Response) => rentalController.rentBook(req, res));
router.post("/return", (req: Request, res: Response) => rentalController.returnBook(req, res));
router.get("/", (req: Request, res: Response) => rentalController.getRentals(req, res));
router.get("/user/:id", (req: any, res: Response) => rentalController.getRentalByUser(req, res));

export default router;
