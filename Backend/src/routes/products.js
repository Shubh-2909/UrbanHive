import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getSingleProduct,
  getlatestProducts,
  newProduct,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", adminOnly, singleUpload, newProduct);
router.get("/latest", getlatestProducts);
router.get("/categories", getAllCategories);
router.get("/admin-products", adminOnly, getAdminProducts);
router.get("/all", getAllProducts);
router.get("/:id",  getSingleProduct);
router.put("/:id", updateProduct);
router.delete("/:id",adminOnly , deleteProduct);
export default router;
