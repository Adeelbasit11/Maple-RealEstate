import { Router } from "express";
import {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController";
import { authenticate } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

router.get("/", authenticate, getAllProducts);
router.get("/:id", authenticate, getProduct);
router.post("/", authenticate, upload.single("image"), createProduct);
router.put("/:id", authenticate, upload.single("image"), updateProduct);
router.delete("/:id", authenticate, deleteProduct);

export default router;
