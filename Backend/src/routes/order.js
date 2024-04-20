import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js";

const router = express.Router();

router.post("/new", newOrder);
router.get("/my", myOrders);
router.get("/all", adminOnly, allOrders);
router.get("/:id", getSingleOrder);
router.put("/:id",adminOnly, processOrder);
router.delete("/:id", adminOnly , deleteOrder);

export default router;
