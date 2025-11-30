import express from "express";
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  removePatient,
} from "../controllers/patientController.js";

const router = express.Router();

router.get("/", listPatients);
router.get("/:id", getPatient);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", removePatient);

export default router;
