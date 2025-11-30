import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    // Use flexible string fields for gender / bloodGroup / patientType to accept varied inputs from clients.
    gender: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
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
    // Emergency contact stored as a nested object, frontend may send separate fields which are normalized in service
    emergencyContact: {
      name: { type: String },
      relationship: String,
      phone: { type: String },
    },
    patientType: {
      type: String,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      default: "General",
    },
    // assignedDoctor can be an ObjectId or a plain string (doctor name or username) depending on client
    assignedDoctor: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String,
      },
    ],
    allergies: [String],
    currentMedications: [String],
    photo: {
      url: String,
      uploadedAt: Date,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DISCHARGED", "DECEASED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for tenant isolation and common queries
patientSchema.index({ tenantId: 1, status: 1 });
patientSchema.index({ tenantId: 1, patientType: 1 });
patientSchema.index({ tenantId: 1, department: 1 });
patientSchema.index({
  tenantId: 1,
  firstName: "text",
  lastName: "text",
  phone: "text",
});

// Tenant filtering pre-hook
patientSchema.pre(/^find/, function () {
  this.where({ tenantId: this.tenantId });
});

export const Patient = mongoose.model("Patient", patientSchema);
