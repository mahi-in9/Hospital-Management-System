import express from "express";
import "express-async-errors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./src/config/env.js";
import { connectDB } from "./src/config/database.js";
import logger from "./src/utils/logger.js";
import {
  extractTenantMiddleware,
  validateTenantAccess,
  tenantContextMiddleware,
} from "./src/middleware/tenantMiddleware.js";
import path from 'path';
import rateLimit from 'express-rate-limit';
import patientRoutes from "./src/routes/patientRoutes.js";
import hospitalRoutes from "./src/routes/hospitalRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("combined", { stream: { write: (message) => logger.info(message) } })
);

// Parse cookies for HttpOnly token support
app.use(cookieParser());

// CORS middleware
app.use((req, res, next) => {
  // Only allow configured frontend origin
  res.header("Access-Control-Allow-Origin", config.FRONTEND_URL);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  // Allow credentials so the browser will send HttpOnly cookies
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Hospital Management System API is running",
  });
});

// Public routes (no tenant middleware required)
// Rate limiters
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: 'Too many auth attempts, please try again later.' });
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Too many uploads, slow down.' });
app.post("/api/auth/register-hospital", authLimiter, async (req, res) => {
  const { registerHospital } = await import(
    "./src/controllers/authController.js"
  );
  registerHospital(req, res);
});

app.post("/api/auth/verify-email", authLimiter, async (req, res) => {
  const { verifyEmail } = await import("./src/controllers/authController.js");
  verifyEmail(req, res);
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { login } = await import("./src/controllers/authController.js");
  login(req, res);
});

app.post("/api/auth/refresh-token", authLimiter, async (req, res) => {
  const { refreshAccessToken } = await import(
    "./src/controllers/authController.js"
  );
  refreshAccessToken(req, res);
});

app.post('/api/auth/activate', authLimiter, async (req, res) => {
  const { activateUser } = await import('./src/controllers/authController.js');
  activateUser(req, res);
});

// Public user registration (join a hospital)
app.post('/api/auth/register-user', authLimiter, async (req, res) => {
  const { registerUser } = await import('./src/controllers/authController.js');
  registerUser(req, res);
});

// Public hospital directory
app.use("/api/hospitals", hospitalRoutes);

// Serve uploaded models from backend public folder
app.use('/models', express.static(path.join(process.cwd(), 'public', 'models')));

// Protected routes (require tenant middleware)
app.use(
  "/api/protected",
  extractTenantMiddleware,
  validateTenantAccess,
  tenantContextMiddleware
);

app.post("/api/protected/auth/logout", async (req, res) => {
  const { logout } = await import("./src/controllers/authController.js");
  logout(req, res);
});

// Patient routes (tenant-scoped)
app.use(
  "/api/patients",
  extractTenantMiddleware,
  validateTenantAccess,
  tenantContextMiddleware,
  patientRoutes
);

// Protected user admin routes (requires tenant middleware)
import userRoutes from './src/routes/userRoutes.js';
app.use('/api/protected/users', extractTenantMiddleware, validateTenantAccess, tenantContextMiddleware, userRoutes);

// Model upload routes (mounted protected below)
import modelRoutes from './src/routes/modelRoutes.js';

import multer from 'multer';
import path from 'path';
import { uploadModel } from './src/controllers/modelController.js';

// Protected dashboard route
app.get(
  "/api/protected/dashboard",
  extractTenantMiddleware,
  validateTenantAccess,
  tenantContextMiddleware,
  async (req, res) => {
    const { getDashboardStats } = await import(
      "./src/controllers/dashboardController.js"
    );
    return getDashboardStats(req, res);
  }
);

// Mount protected model upload route
// Apply upload rate limiter to model upload routes
app.use('/api/protected/models', extractTenantMiddleware, validateTenantAccess, tenantContextMiddleware, uploadLimiter, modelRoutes);

// Dev-only unprotected upload endpoint for local testing
if (config.NODE_ENV !== 'production') {
  const devUpload = multer({ dest: path.join(process.cwd(), 'tmp', 'uploads') });
  app.post('/api/models/dev-upload', devUpload.single('file'), uploadLimiter, async (req, res) => {
    // allow tenantId via body for dev convenience
    try {
      await uploadModel(req, res);
    } catch (err) {
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res
    .status(statusCode)
    .json({ message, error: config.NODE_ENV === "development" ? err : {} });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Redis removed - using DB-backed refresh tokens

    // Start listening
    app.listen(config.PORT, () => {
      logger.info(`✓ Server running on port ${config.PORT}`);
      logger.info(`✓ Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    logger.error(`✗ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
