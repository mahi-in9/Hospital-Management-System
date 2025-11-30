import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true }, // e.g., "TDS" (thrice daily)
        duration: { type: String, required: true }, // e.g., "7 days"
        instructions: String,
      },
    ],
    diagnosis: {
      type: String,
      required: true,
    },
    notes: String,
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateName: String,
    status: {
      type: String,
      enum: ["CREATED", "PRESCRIBED", "DISPENSED", "COMPLETED", "CANCELLED"],
      default: "CREATED",
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dispensedAt: Date,
    validUntil: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for tenant isolation and common queries
prescriptionSchema.index({ tenantId: 1, status: 1 });
prescriptionSchema.index({ tenantId: 1, patientId: 1 });
prescriptionSchema.index({ tenantId: 1, doctorId: 1 });
prescriptionSchema.index({ tenantId: 1, isTemplate: 1 });

// Tenant filtering pre-hook
prescriptionSchema.pre(/^find/, function () {
  this.where({ tenantId: this.tenantId });
});

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
