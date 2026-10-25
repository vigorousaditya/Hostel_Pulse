import "./config/loadEnv.mjs";
import express from "express";
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
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok" });
});

const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
