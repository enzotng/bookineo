import express from "express";
import { rentalController } from "../controllers";

const router = express.Router();

router.post("/rent", rentalController.rentBook);
router.post("/return", rentalController.returnBook);
router.get("/", rentalController.getRentals);
router.get("/user/:id", rentalController.getRentalByUser);

export default router;
