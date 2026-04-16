// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

// Database
import connectDB from "./config/database";

// Routes
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import teamRoutes from "./routes/team";
import productRoutes from "./routes/products";
import ordersRoutes from "./routes/orders";

// Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

// Import Stripe routes
import stripeRoutes, { webhookRouter } from "./routes/stripe";

// Webhook needs raw body, must be before express.json()
app.use("/api/stripe", webhookRouter);

app.use(express.json());
app.use(cookieParser());

// Serve Uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/products", productRoutes);
app.use("/api", ordersRoutes);

// SERVER
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
