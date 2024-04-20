import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
} from "../controllers/payment.js";

const router = express.Router();


router.post("/create" , createPaymentIntent)
router.post("/coupon/new",adminOnly, newCoupon);
router.get("/discount", applyDiscount);
router.get("/coupon/all",adminOnly, allCoupons);
router.delete("/coupon/:id", adminOnly ,deleteCoupon);

export default router;
