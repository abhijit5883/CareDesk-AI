const express = require("express");

const {
  createPatient,
  getPatients,
  getPatientById,
} = require("./patientController");
const { requireAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, getPatients);
router.get("/:id", requireAuth, getPatientById);

router.post("/", requireAuth, createPatient);

module.exports = router;