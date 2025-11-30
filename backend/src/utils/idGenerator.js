import { v4 as uuidv4 } from "uuid";

let patientSequence = 10000;
let prescriptionSequence = 5000;

export const generateTenantId = () => uuidv4();

export const generatePatientId = (tenantId) => {
  return `${tenantId}-P-${++patientSequence}`;
};

export const generatePrescriptionId = (tenantId) => {
  return `${tenantId}-RX-${++prescriptionSequence}`;
};

export const generateUsername = (firstName, lastName, hospitalDomain) => {
  const sanitized = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${hospitalDomain}`;
  // Remove spaces and special characters, keep alphanumeric and dots
  return sanitized.replace(/[^a-z0-9.@]/g, "");
};

export const generateResetToken = () => {
  return uuidv4();
};

export const generateVerificationToken = () => {
  return uuidv4();
};
