import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import reservationRoutes from './routes/reservations.js';
import communityRoutes from './routes/community.js';
import menuRoutes from './routes/menu.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Mock Payment Gateway Integration
app.post('/api/stripe/checkout', (req, res) => {
  const { amount, items } = req.body;
  console.log(`Processing mock payment for $${amount}...`);
  res.json({ 
    success: true, 
    message: 'Payment processed successfully via Golden Hour Stripe Integration',
    transactionId: `gh_${Math.random().toString(36).substr(2, 9)}`
  });
});

// Basic Route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Connect to MongoDB FIRST, then start server
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/golden-hour-bistro";

// Clean URI for logging
const logUri = MONGO_URI.includes('@') ? MONGO_URI.split('@')[1] : MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("-----------------------------------------");
    console.log("✅ MongoDB connected successfully!");
    console.log(`🔗 Instance: ${logUri}`);
    console.log("📦 Active Database: golden-hour-bistro");
    console.log("👥 Users Collection ready for documents.");
    console.log("-----------------------------------------");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Please ensure MongoDB is running locally at: mongodb://localhost:27017/");
    process.exit(1);
  });

export default app;

