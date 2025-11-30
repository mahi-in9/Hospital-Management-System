import { ForbiddenError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new ForbiddenError("Tenant context not found");
      }

      const hasPermission =
        req.tenant.permissions?.includes(requiredPermission);

      if (!hasPermission) {
        logger.warn(
          `Permission denied: User ${req.tenant.userId} lacks permission ${requiredPermission}`
        );
        throw new ForbiddenError(`Missing permission: ${requiredPermission}`);
      }

      next();
    } catch (error) {
      return res
        .status(error.statusCode || 403)
        .json({ message: error.message });
    }
  };
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.tenant) {
        throw new ForbiddenError("Tenant context not found");
      }

      const userRoles = req.tenant.roles || [];
      const hasRole = userRoles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        logger.warn(
          `Role denied: User ${req.tenant.userId} has roles ${userRoles.join(
            ", "
          )} but needs one of ${allowedRoles.join(", ")}`
        );
        throw new ForbiddenError(
          `Requires one of these roles: ${allowedRoles.join(", ")}`
        );
      }

      next();
    } catch (error) {
      return res
        .status(error.statusCode || 403)
        .json({ message: error.message });
    }
  };
};

export const requireABAC = (attributeCheck) => {
  return async (req, res, next) => {
    try {
      const hasAccess = await attributeCheck(req);

      if (!hasAccess) {
        logger.warn(
          `ABAC denied: User ${req.tenant.userId} failed attribute-based access control`
        );
        throw new ForbiddenError("Access denied based on resource attributes");
      }

      next();
    } catch (error) {
      return res
        .status(error.statusCode || 403)
        .json({ message: error.message });
    }
  };
};
