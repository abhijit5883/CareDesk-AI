const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctorById,
} = require("./doctorController");

const { requireAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", createDoctor);

router.get("/", getDoctors);

router.get("/:id", getDoctorById);

module.exports = router;