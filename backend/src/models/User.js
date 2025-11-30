import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    specialization: String,
    shift: {
      type: String,
      enum: ["MORNING", "AFTERNOON", "NIGHT"],
    },
    roles: [
      {
        type: String,
        enum: [
          "SUPER_ADMIN",
          "HOSPITAL_ADMIN",
          "DOCTOR",
          "NURSE",
          "PHARMACIST",
          "RECEPTIONIST",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LOCKED", "PASSWORD_EXPIRED"],
      default: "ACTIVE",
    },
    passwordHistory: [
      {
        hash: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    resetToken: String,
    resetTokenExpiry: Date,
    activationToken: String,
    activationTokenExpiry: Date,
    refreshTokens: [String],
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant isolation
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, username: 1 }, { unique: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);

    // Keep password history (last 3)
    if (!this.passwordHistory) {
      this.passwordHistory = [];
    }
    this.passwordHistory.push({
      hash: this.password,
      changedAt: new Date(),
    });
    if (this.passwordHistory.length > 3) {
      this.passwordHistory = this.passwordHistory.slice(-3);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Check if password was used before
userSchema.methods.wasPasswordUsedBefore = async function (candidatePassword) {
  for (const entry of this.passwordHistory) {
    const isMatch = await bcryptjs.compare(candidatePassword, entry.hash);
    if (isMatch) return true;
  }
  return false;
};

// Tenant filtering pre-hook
userSchema.pre(/^find/, function () {
  this.where({ tenantId: this.tenantId });
});

export const User = mongoose.model("User", userSchema);
