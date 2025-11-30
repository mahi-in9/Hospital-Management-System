import {
  listPatients as listPatientsService,
  getPatientById,
  createPatient as createPatientService,
  updatePatient as updatePatientService,
  deletePatient as deletePatientService,
} from "../services/patientService.js";
import logger from "../utils/logger.js";
import { ValidationError } from "../utils/errors.js";

export const listPatients = async (req, res) => {
  const { page = 1, limit = 20, search, department, patientType } = req.query;
  const { tenantId } = req.tenant || {};

  const filters = {};
  if (department) filters.department = department;
  if (patientType) filters.patientType = patientType;

  const result = await listPatientsService({
    tenantId,
    page: Number(page),
    limit: Number(limit),
    search,
    filters,
  });

  res.json({ message: "Patients retrieved", data: result });
};

export const getPatient = async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.tenant || {};

  const patient = await getPatientById(id, tenantId);
  res.json({ message: "Patient retrieved", data: patient });
};

export const createPatient = async (req, res) => {
  // Determine tenantId: prefer authenticated tenant, but accept tenantId in body/query for dev flexibility
  const tenantId = req.tenant?.id || req.body.tenantId || req.query.tenantId;
  if (!tenantId) throw new ValidationError('tenantId is required to create a patient');

  const payload = req.body || {};

  // Basic validation: require names and DOB and phone
  if (!payload.firstName || !payload.lastName || !payload.dateOfBirth || !payload.phone) {
    throw new ValidationError('Missing required patient fields: firstName, lastName, dateOfBirth, phone');
  }

  const patient = await createPatientService(payload, tenantId);
  logger.info(`Patient created: ${patient.patientId} (${tenantId})`);
  res.status(201).json({ message: 'Patient created', data: patient });
};

export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.tenant || {};
  const payload = req.body;

  const patient = await updatePatientService(id, payload, tenantId);
  res.json({ message: "Patient updated", data: patient });
};

export const removePatient = async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.tenant || {};

  const patient = await deletePatientService(id, tenantId);
  res.json({ message: "Patient removed", data: patient });
};
