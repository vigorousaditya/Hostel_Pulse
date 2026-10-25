import "./config/loadEnv.mjs";
import express from "express";
import mongoose from "mongoose";
import net from "net";
import authRoutes from "./routes/auth.routes.mjs";
import studentRoutes from "./routes/student.routes.mjs";
import adminRoutes from "./routes/admin.routes.mjs";
import { connectDB, lastDbError } from "./config/db.mjs";
import { sendOtp } from "./utils/sendOtp.mjs";
import cors from "cors";

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: "HostelPulse Backend API is running 🚀",
    status: "online",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      student: "/api/student",
      admin: "/api/admin"
    }
  });
});

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
    uriConfigured: Boolean(process.env.MONGO_URI),
    emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

// Test port reachability from Render
app.get('/api/test-ports', async (req, res) => {
  const host = process.env.EMAIL_HOST || "smtp-relay.brevo.com";
  const ports = [587, 2525, 465, 80, 443];
  const results = {};

  for (const port of ports) {
    results[port] = await new Promise((resolve) => {
      const socket = net.createConnection(port, host);
      socket.setTimeout(3000);
      socket.on("connect", () => {
        socket.end();
        resolve("OPEN");
      });
      socket.on("error", (err) => resolve(`ERROR: ${err.message}`));
      socket.on("timeout", () => {
        socket.destroy();
        resolve("TIMEOUT");
      });
    });
  }

  res.json({ host, results });
});

// Test email endpoint for diagnostics
app.get('/api/test-email', async (req, res) => {
  try {
    const to = req.query.email || process.env.EMAIL_SENDER || process.env.EMAIL_USER;
    const otp = await sendOtp(to);
    res.json({ success: true, message: `Email sent successfully to ${to}`, otp });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT,
      emailSender: process.env.EMAIL_SENDER,
      userConfigured: Boolean(process.env.EMAIL_USER)
    });
  }
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
