import mongoose from "mongoose";
import { config } from "./env.js";

let cachedConnection = null;

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = connection;
    console.log("✓ MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("✗ MongoDB connection error:", error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
};
