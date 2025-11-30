import { Patient } from "../models/Patient.js";
import { generatePatientId } from "../utils/idGenerator.js";
import { NotFoundError } from "../utils/errors.js";

export const listPatients = async ({
  tenantId,
  page = 1,
  limit = 20,
  search,
  filters = {},
}) => {
  const query = { tenantId, ...filters };

  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const [patients, total] = await Promise.all([
    Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Patient.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { patients, total, totalPages, currentPage: Number(page) };
};

export const getPatientById = async (id, tenantId) => {
  const patient = await Patient.findOne({ _id: id, tenantId });
  if (!patient) throw new NotFoundError("Patient not found");
  return patient;
};

export const createPatient = async (data, tenantId) => {
  const patientId = generatePatientId(tenantId);

  // Normalize input to match schema
  const payload = {
    tenantId,
    patientId,
    firstName: (data.firstName || '').trim(),
    lastName: (data.lastName || '').trim(),
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    gender: data.gender ? String(data.gender).trim().toLowerCase() : undefined,
    bloodGroup: data.bloodGroup ? String(data.bloodGroup).trim().toUpperCase() : undefined,
    email: data.email ? String(data.email).toLowerCase().trim() : undefined,
    phone: data.phone ? String(data.phone).trim() : undefined,
    address: data.address ? String(data.address).trim() : undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    zipCode: data.zipCode || undefined,
    emergencyContact: {
      name: data.emergencyContact || data.emergencyContactName || '',
      phone: data.emergencyPhone || data.emergencyContactPhone || '',
      relationship: data.emergencyContactRelationship || undefined,
    },
    patientType: data.type ? String(data.type).trim().toUpperCase() : (data.patientType ? String(data.patientType).trim().toUpperCase() : undefined),
    department: data.currentDepartment || data.department || 'General',
    assignedDoctor: data.assignedDoctor || data.doctor || null,
    medicalHistory: data.medicalHistory || [],
    allergies: data.allergies || [],
    currentMedications: data.currentMedications || [],
    photo: data.photo || undefined,
    status: data.status || 'ACTIVE',
    admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
  };

  const patient = new Patient(payload);
  await patient.save();
  return patient;
};

export const updatePatient = async (id, data, tenantId) => {
  const patient = await Patient.findOneAndUpdate({ _id: id, tenantId }, data, {
    new: true,
  });
  if (!patient) throw new NotFoundError("Patient not found");
  return patient;
};

export const deletePatient = async (id, tenantId) => {
  // Soft delete: set status to INACTIVE
  const patient = await Patient.findOneAndUpdate(
    { _id: id, tenantId },
    { status: "INACTIVE" },
    { new: true }
  );
  if (!patient) throw new NotFoundError("Patient not found");
  return patient;
};
