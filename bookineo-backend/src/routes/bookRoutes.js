import express from "express";
import { bookControllers } from "../controllers";

const router = express.Router();

router.post("/", bookControllers.createBook);
router.get("/", bookControllers.getBooks);
router.get("/:id", bookControllers.getBookById);
router.put("/:id", bookControllers.updateBook);
router.delete("/:id", bookControllers.deleteBook);

export default router;
