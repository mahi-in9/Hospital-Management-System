import dotenv from "dotenv";

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/hospital-db",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "1h",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  AUTO_ACTIVATE_USERS: (process.env.AUTO_ACTIVATE_USERS === 'true') || false,
  MODEL_MAX_SIZE: parseInt(process.env.MODEL_MAX_SIZE, 10) || 25 * 1024 * 1024, // 25 MB default
  CLAMAV_ENABLED: (process.env.CLAMAV_ENABLED === 'true') || false,
  CLAMAV_CMD: process.env.CLAMAV_CMD || 'clamscan',
};
