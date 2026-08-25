const express = require("express");

const {
  createPatient,
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", createPatient);

module.exports = router;