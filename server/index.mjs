import "./config/loadEnv.mjs";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.mjs";
import studentRoutes from "./routes/student.routes.mjs";
import adminRoutes from "./routes/admin.routes.mjs";
import { connectDB, lastDbError } from "./config/db.mjs";
import cors from "cors";

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Health check endpoint (always accessible)
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {
      // Caught and saved in lastDbError
    }
  }

  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({ 
    status: "ok", 
    database: dbStatus,
    error: lastDbError,
    uriConfigured: Boolean(process.env.MONGO_URI)
  });
});

// Guard: Return immediate 503 if database connection is down instead of buffering and timing out
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {
      // Connect failed
    }
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: `Database not connected: ${lastDbError || "Unable to reach MongoDB Atlas"}. Please check Atlas Network Access and MONGO_URI.`
    });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection retry in 5s...", error.message);
    setTimeout(connectWithRetry, 5000);
  }
};

const startServer = async () => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  connectWithRetry();
};

startServer();
