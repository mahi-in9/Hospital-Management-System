import express from "express";
import {
  listHospitals,
  getHospital,
} from "../controllers/hospitalController.js";

const router = express.Router();

// Public hospital directory
router.get("/", listHospitals);
router.get("/:tenantId", getHospital);

export default router;
