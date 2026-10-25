import mongoose from "mongoose";
import dns from "dns";

// Prefer IPv4 for DNS resolution to prevent IPv6 SRV lookup timeouts on Render/cloud hosts
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Not supported on older Node versions
}

export let lastDbError = null;

export const connectDB = async () => {
  try {
    let dbURL = process.env.MONGO_URI;
    if (!dbURL) {
      throw new Error("MONGO_URI is not defined in environment variables. Please add it to your Render dashboard.");
    }

    // Clean up any stray quotes, spaces, or newlines
    dbURL = dbURL.trim().replace(/^["']|["']$/g, '').trim();

    if (mongoose.connection.readyState === 1) {
      return true;
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(dbURL, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    lastDbError = null;
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    lastDbError = error.message;
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};
