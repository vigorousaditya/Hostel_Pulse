import "./config/loadEnv.mjs";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.mjs";
import studentRoutes from "./routes/student.routes.mjs";
import adminRoutes from "./routes/admin.routes.mjs";
import { connectDB } from "./config/db.mjs";
import cors from "cors";

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Health check endpoint (always accessible)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({ status: "ok", database: dbStatus });
});

// Guard: Return immediate 503 if database connection is down instead of buffering and timing out
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Please ensure MongoDB Atlas allows IP 0.0.0.0/0 (Network Access) and MONGO_URI is set on Render."
    });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

const startServer = async () => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error("Initial MongoDB connection failed. Please check MONGO_URI and Atlas Network Access.");
  }
};

startServer();
