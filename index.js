import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || (process.env.VERCEL ? null : "mongodb://localhost:27017/golden-hour-bistro");
let connectionPromise;

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

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI must be configured in the deployment environment.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGO_URI).then(
      (connection) => {
        connectionPromise = null;
        return connection;
      },
      (err) => {
        connectionPromise = null;
        throw err;
      }
    );
  }

  await connectionPromise;
};

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    res.status(503).json({ message: "Database unavailable. Check the backend database configuration." });
  }
});

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

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}
