import {
  listHospitals as listHospitalsService,
  getHospitalByTenantId,
} from "../services/hospitalService.js";

export const listHospitals = async (req, res) => {
  const { page = 1, limit = 20, search, city, state } = req.query;
  const result = await listHospitalsService({
    page: Number(page),
    limit: Number(limit),
    search,
    city,
    state,
  });
  res.json({ message: "Hospitals retrieved", data: result });
};

export const getHospital = async (req, res) => {
  const { tenantId } = req.params;
  const hospital = await getHospitalByTenantId(tenantId);
  res.json({ message: "Hospital retrieved", data: hospital });
};
