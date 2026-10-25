import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const dbURL = process.env.MONGO_URI;
    if (!dbURL) {
      throw new Error("MONGO_URI is not defined in environment variables. Please add it to your Render dashboard.");
    }

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    await mongoose.connect(dbURL, {
      serverSelectionTimeoutMS: 8000,
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("👉 If deploying on Render, make sure:");
    console.error("   1. In MongoDB Atlas -> Network Access, IP 0.0.0.0/0 (Allow from anywhere) is added.");
    console.error("   2. MONGO_URI is added in your Render Web Service -> Environment variables.");
    throw error;
  }
};
