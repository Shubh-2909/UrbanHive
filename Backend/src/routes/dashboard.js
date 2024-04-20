import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/dashboard.js";

const router = express.Router();

router.get("/stats" ,adminOnly , getDashboardStats);
router.get("/pie" ,adminOnly, getPieCharts);
router.get("/bar" ,adminOnly, getBarCharts);
router.get("/line" ,adminOnly, getLineCharts);

export default router;
