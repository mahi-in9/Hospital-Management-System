import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { UnauthorizedError, ValidationError } from "../utils/errors.js";

export const generateTokens = (userId, tenantId, roles, permissions) => {
  const accessToken = jwt.sign(
    {
      userId,
      tenantId,
      roles,
      permissions,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );

  const refreshToken = jwt.sign(
    {
      userId,
      tenantId,
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const validateToken = (token, secret = config.JWT_SECRET) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export const storeRefreshToken = async (userId, tenantId, refreshToken) => {
  // Persist refresh tokens on the user document (simple replacement for Redis)
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw new ValidationError("User not found");
  user.refreshTokens = user.refreshTokens || [];
  // push token (allow multiple devices)
  user.refreshTokens.push(refreshToken);
  await user.save();
};

export const rotateRefreshToken = async (userId, tenantId, oldRefreshToken, newRefreshToken) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw new ValidationError('User not found');
  user.refreshTokens = user.refreshTokens || [];
  // remove old token if present
  if (oldRefreshToken) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== oldRefreshToken);
  }
  // add new token
  user.refreshTokens.push(newRefreshToken);
  await user.save();
};

export const invalidateAllSessions = async (userId, tenantId) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) return;
  user.refreshTokens = [];
  await user.save();
};

export const verifyRefreshToken = async (userId, tenantId, refreshToken) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) throw new UnauthorizedError("User not found");
  const stored = user.refreshTokens || [];
  if (!stored.includes(refreshToken)) {
    throw new UnauthorizedError("Refresh token invalid or expired");
  }
  const decoded = validateToken(refreshToken, config.JWT_REFRESH_SECRET);
  return decoded;
};

export const getPermissionsForUser = async (userId, tenantId) => {
  // Placeholder - in production, fetch from database with role-permission mapping
  const user = await User.findOne({ _id: userId, tenantId });

  const rolePermissionMap = {
    SUPER_ADMIN: [
      "PATIENT:CREATE",
      "PATIENT:READ",
      "PATIENT:UPDATE",
      "PATIENT:DELETE",
      "PRESCRIPTION:CREATE",
      "PRESCRIPTION:READ",
      "PRESCRIPTION:UPDATE",
      "PRESCRIPTION:DISPENSE",
      "USER:CREATE",
      "USER:READ",
      "USER:UPDATE",
      "USER:DELETE",
      "USER:MANAGE",
    ],
    HOSPITAL_ADMIN: ["USER:CREATE", "USER:READ", "USER:UPDATE", "USER:DELETE"],
    DOCTOR: [
      "PATIENT:CREATE",
      "PATIENT:READ",
      "PATIENT:UPDATE",
      "PRESCRIPTION:CREATE",
      "PRESCRIPTION:READ",
    ],
    NURSE: ["PATIENT:CREATE", "PATIENT:READ", "PATIENT:UPDATE"],
    PHARMACIST: ["PRESCRIPTION:READ", "PRESCRIPTION:DISPENSE"],
    RECEPTIONIST: ["PATIENT:CREATE", "PATIENT:READ"],
  };

  const permissions = new Set();
  for (const role of user.roles) {
    const rolePermissions = rolePermissionMap[role] || [];
    rolePermissions.forEach((perm) => permissions.add(perm));
  }

  return Array.from(permissions);
};
