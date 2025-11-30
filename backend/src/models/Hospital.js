import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    zipCode: String,
    contactNumber: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING",
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    verifiedAt: Date,
    activatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure tenant isolation
hospitalSchema.pre("find", function () {
  // This schema doesn't need tenant filtering as it's hospital-level
});

export const Hospital = mongoose.model("Hospital", hospitalSchema);
