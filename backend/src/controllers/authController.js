import { sendMail } from '../utils/mailer.js';
import { config } from '../config/env.js';
import { User } from "../models/User.js";
import { Hospital } from "../models/Hospital.js";
import {
  generateTokens,
  storeRefreshToken,
  getPermissionsForUser,
  invalidateAllSessions,
  verifyRefreshToken,
} from "../services/authService.js";
import {
  generateTenantId,
  generateUsername,
  generateResetToken,
  generateVerificationToken,
} from "../utils/idGenerator.js";
import {
  ConflictError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors.js";
import logger from "../utils/logger.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerHospital = async (req, res) => {
  try {
    const {
      name,
      address,
      contactNumber,
      adminEmail,
      phone,
      licenseNumber,
      domain,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !address ||
      !contactNumber ||
      !adminEmail ||
      !phone ||
      !licenseNumber ||
      !domain
    ) {
      throw new ValidationError("All fields are required");
    }

    // Check if license number already exists
    const existingHospital = await Hospital.findOne({ licenseNumber });
    if (existingHospital) {
      throw new ConflictError("License number already registered");
    }

    const tenantId = generateTenantId();
    const verificationToken = generateVerificationToken();

    const hospital = new Hospital({
      tenantId,
      name,
      address,
      contactNumber,
      adminEmail,
      phone,
      licenseNumber,
      domain,
      verificationToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await hospital.save();

    // Auto-create admin user
    const adminUsername = generateUsername("admin", domain, domain);
    const adminPassword = generateTenantId().substring(0, 12); // Temporary password

    const adminUser = new User({
      tenantId,
      firstName: "Admin",
      lastName: domain.charAt(0).toUpperCase() + domain.slice(1),
      email: adminEmail,
      username: adminUsername,
      password: adminPassword,
      phone,
      department: "Administration",
      roles: ["HOSPITAL_ADMIN"],
    });

    await adminUser.save();

    // In production, send verification email. Token is stored on hospital document.

    logger.info(`Hospital registered: ${tenantId} (${name})`);

    res.status(201).json({
      message: "Hospital registered successfully",
      data: {
        tenantId,
        hospitalName: name,
        adminEmail,
        temporaryPassword: adminPassword,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      },
    });
  } catch (error) {
    logger.error(`Hospital registration error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError("Verification token is required");
    }

    const hospital = await Hospital.findOne({ verificationToken: token });

    if (!hospital || hospital.verificationTokenExpiry < new Date()) {
      throw new UnauthorizedError("Invalid or expired verification token");
    }

    hospital.status = "VERIFIED";
    hospital.verifiedAt = new Date();
    hospital.verificationToken = undefined;
    hospital.verificationTokenExpiry = undefined;

    await hospital.save();

    logger.info(`Hospital verified: ${hospital.tenantId}`);

    res.json({
      message: "Email verified successfully",
      data: { tenantId: hospital.tenantId },
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status === "LOCKED") {
      throw new UnauthorizedError("User account is locked");
    }

    if (user.status === "PASSWORD_EXPIRED") {
      throw new UnauthorizedError("Password has expired. Please reset it.");
    }

    // Get user permissions
    const permissions = await getPermissionsForUser(user._id, user.tenantId);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.tenantId,
      user.roles,
      permissions
    );

    // Store refresh token (DB-backed). Send refresh token as HttpOnly cookie.
    await storeRefreshToken(user._id.toString(), user.tenantId, refreshToken);
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 1000 * 60 * 60 * 24 * 7, // match refresh expiry default 7 days
    });

    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    logger.info(`User login: ${user.email} (${user.tenantId})`);

    res.json({
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          department: user.department,
        },
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    // Try to read refresh token from cookie first, then body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new ValidationError('Refresh token is required');

    // Decode refresh token to get user info
    const decoded = validateToken(refreshToken, config.JWT_REFRESH_SECRET);

    // Verify against stored token
    await verifyRefreshToken(decoded.userId, decoded.tenantId, refreshToken);

    const user = await User.findOne({ _id: decoded.userId, tenantId: decoded.tenantId });
    if (!user) throw new NotFoundError('User not found');

    const permissions = await getPermissionsForUser(user._id, user.tenantId);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
      user.tenantId,
      user.roles,
      permissions
    );

    // Rotate refresh token: replace old with new
    await rotateRefreshToken(user._id.toString(), user.tenantId, refreshToken, newRefreshToken);

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 24 * 7 });

    res.json({ message: 'Token refreshed', data: { accessToken: newAccessToken } });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const { token, tenantId } = req.body;
    if (!token || !tenantId) {
      throw new ValidationError('Activation token and tenantId are required');
    }

    const user = await User.findOne({ activationToken: token, tenantId });
    if (!user) throw new UnauthorizedError('Invalid activation token');
    if (user.activationTokenExpiry < new Date()) throw new UnauthorizedError('Activation token expired');

    user.status = 'ACTIVE';
    user.activationToken = undefined;
    user.activationTokenExpiry = undefined;
    await user.save();

    // Generate tokens and return so user can be auto-logged-in
    const permissions = await getPermissionsForUser(user._id, user.tenantId);
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.tenantId, user.roles, permissions);
    await storeRefreshToken(user._id.toString(), user.tenantId, refreshToken);
    // set refresh token cookie for browser-based flows
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 24 * 7 });

    // Return user info along with tokens for frontend
    const userData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      department: user.department,
      tenantId: user.tenantId,
    };

    res.json({ message: 'Account activated', data: { accessToken, user: userData } });
  } catch (error) {
    logger.error(`Activation error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, tenantId } = req.body;

    if (!firstName || !lastName || !email || !password || !tenantId) {
      throw new ValidationError('Missing required fields');
    }

    // Ensure hospital exists and is active
    const hospital = await Hospital.findOne({ tenantId });
    if (!hospital || hospital.status !== 'ACTIVE') {
      throw new ValidationError('Hospital not found or not active');
    }

    const existing = await User.findOne({ email, tenantId });
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const username = generateUsername(firstName, lastName, hospital.domain || 'hospital');

    // If AUTO_ACTIVATE_USERS is enabled, create ACTIVE user and return tokens
    if (config.AUTO_ACTIVATE_USERS) {
      if (config.NODE_ENV === 'production') {
        throw new ValidationError('AUTO_ACTIVATE_USERS not permitted in production');
      }
      const user = new User({
        tenantId,
        firstName,
        lastName,
        email,
        username,
        password,
        phone,
        department: 'General',
        roles: [],
        status: 'ACTIVE',
      });
      await user.save();

      // Generate tokens and return so user can be auto-logged-in
      const permissions = await getPermissionsForUser(user._id, user.tenantId);
      const { accessToken, refreshToken } = generateTokens(
        user._id.toString(),
        user.tenantId,
        user.roles,
        permissions
      );
      await storeRefreshToken(user._id.toString(), user.tenantId, refreshToken);

      // set refresh token cookie
      res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 24 * 7 });

      res.status(201).json({
        message: 'User registered and activated',
        data: { accessToken, user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          department: user.department,
          tenantId: user.tenantId,
        } },
      });
      return;
    }

    // Default: require activation via email
    // Generate activation token and expiry (24 hours)
    const activationToken = generateResetToken();
    const activationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      tenantId,
      firstName,
      lastName,
      email,
      username,
      password,
      phone,
      department: 'General',
      roles: [],
      status: 'INACTIVE',
      activationToken,
      activationTokenExpiry: activationExpiry,
    });

    await user.save();

    // Build activation link
    const activationLink = `${config.FRONTEND_URL}/activate?token=${activationToken}&tenantId=${tenantId}`;

    // Send activation email (in production). If mail fails, still return response.
    let mailInfo = null;
    try {
      const subject = 'Activate your account';
      const html = `<p>Hello ${firstName},</p>
          <p>Thank you for registering. Please activate your account by clicking the link below:</p>
          <p><a href="${activationLink}">Activate account</a></p>
          <p>This link will expire in 24 hours.</p>`;

      mailInfo = await sendMail({ to: email, subject, html, text: `Activate your account: ${activationLink}` });
    } catch (err) {
      logger.warn('Failed to send activation email, returning link in response for dev/testing');
    }

    // In non-production return activation link and Ethereal preview URL for convenience (dev/testing)
    const responseData = {};
    if (config.NODE_ENV !== 'production') {
      responseData.activationLink = activationLink;
      if (mailInfo && mailInfo.previewUrl) responseData.previewUrl = mailInfo.previewUrl;
    }

    res.status(201).json({
      message: 'User registered — activation required',
      data: responseData,
    });
  } catch (error) {
    logger.error(`User registration error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { userId, tenantId } = req.tenant;

    await invalidateAllSessions(userId, tenantId);

    logger.info(`User logout: ${userId} (${tenantId})`);

    // Clear refresh token cookie in browser
    try {
      res.clearCookie('refreshToken', COOKIE_OPTIONS);
    } catch (e) {
      // ignore if cookie clearing fails
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
