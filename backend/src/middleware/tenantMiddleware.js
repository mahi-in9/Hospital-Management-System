import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export const extractTenantMiddleware = (req, res, next) => {
  try {
    // Accept token from several places to be flexible for frontend integration:
    // 1. Authorization: Bearer <token>
    // 2. x-access-token header
    // 3. query param: ?access_token=...
    // 4. body param: access_token
    let token = null;
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token && req.headers["x-access-token"]) {
      token = req.headers["x-access-token"];
    }
    if (!token && req.query && req.query.access_token) {
      token = req.query.access_token;
    }
    if (!token && req.body && req.body.access_token) {
      token = req.body.access_token;
    }

    if (!token) {
      throw new UnauthorizedError("Missing authorization token");
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.tenant = {
      id: decoded.tenantId,
      userId: decoded.userId,
      roles: decoded.roles,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const validateTenantAccess = (req, res, next) => {
  try {
    const tenantIdFromParam = req.params.tenantId || req.body.tenantId;

    if (tenantIdFromParam && tenantIdFromParam !== req.tenant.id) {
      logger.warn(
        `Attempted cross-tenant access: User ${req.tenant.userId} from tenant ${req.tenant.id} accessed tenant ${tenantIdFromParam}`
      );
      throw new ForbiddenError("Cannot access resources from another tenant");
    }

    next();
  } catch (error) {
    return res.status(error.statusCode || 403).json({ message: error.message });
  }
};

export const tenantContextMiddleware = (req, res, next) => {
  // Attach tenant context to all Mongoose queries
  if (req.tenant) {
    req.query = req.query || {};
    req.query.tenantId = req.tenant.id;
  }
  next();
};
