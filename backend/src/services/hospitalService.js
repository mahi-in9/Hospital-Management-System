import { Hospital } from "../models/Hospital.js";
import { NotFoundError } from "../utils/errors.js";

export const listHospitals = async ({
  page = 1,
  limit = 20,
  search,
  city,
  state,
}) => {
  const query = { status: "ACTIVE" };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { domain: { $regex: search, $options: "i" } },
    ];
  }

  if (city) query.city = city;
  if (state) query.state = state;

  const skip = (page - 1) * limit;
  const [hospitals, total] = await Promise.all([
    Hospital.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Hospital.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);
  return { hospitals, total, totalPages, currentPage: Number(page) };
};

export const getHospitalByTenantId = async (tenantId) => {
  const hospital = await Hospital.findOne({ tenantId }).lean();
  if (!hospital) throw new NotFoundError("Hospital not found");
  return hospital;
};
