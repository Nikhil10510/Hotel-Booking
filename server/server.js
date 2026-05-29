import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import { clerkMiddleware } from '@clerk/express';
import bodyParser from "body-parser"; // need this
import clerkWebhooks from "./controllers/clerkWebhooks.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Connect to database and Cloudinary
connectDB();
connectCloudinary();

const app = express();

// Global middlewares
app.use(cors());

// MARK: Only JSON for regular routes
app.use(express.json());
app.use(clerkMiddleware());

// ✅ MARK: For Clerk webhook — use raw body parser (must be before express.json!)
app.post("/api/clerk",clerkWebhooks);

// Test route
app.get('/', (req, res) => res.send("API is working ✅"));

// Routes
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
