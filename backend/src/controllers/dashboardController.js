import { Patient } from "../models/Patient.js";
import { Prescription } from "../models/Prescription.js";
import { User } from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  const { tenantId } = req.tenant || {};

  const [
    totalPatients,
    ipdPatients,
    opdPatients,
    activePatients,
    totalPrescriptions,
    totalDoctors,
  ] = await Promise.all([
    Patient.countDocuments({ tenantId }),
    Patient.countDocuments({ tenantId, patientType: "IPD" }),
    Patient.countDocuments({ tenantId, patientType: "OPD" }),
    Patient.countDocuments({ tenantId, status: "ACTIVE" }),
    Prescription.countDocuments({ tenantId }),
    User.countDocuments({ tenantId, roles: "DOCTOR" }),
  ]);

  const recentActivity = [];

  res.json({
    message: "Dashboard stats",
    data: {
      stats: {
        totalPatients,
        ipdPatients,
        opdPatients,
        activePatients,
        totalPrescriptions,
        totalDoctors,
      },
      recentActivity,
    },
  });
};
