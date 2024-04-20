import express from "express";
import { config } from "dotenv";
import Stripe from "stripe"
import cors from "cors"
import morgan from "morgan";
import NodeCache from "node-cache";
import bodyParser from "body-parser";
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import paymentRoute from "./routes/payments.js";
import dashboardRoute from "./routes/dashboard.js";
import orderRoute from "./routes/order.js";
import { connectDB } from "./utils/db.js";
import { errorMiddleware } from "./middlewares/error.js";

config({
  path: "./.env",
});
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const stripeKey = process.env.STRIPE_KEY || "";
export const stripe = new Stripe(stripeKey)
export const nodeCache = new NodeCache();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Api Working");
});

// Route to access all uploaded files to show on frontend
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

// For error handling
app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(mongoURI);
});
