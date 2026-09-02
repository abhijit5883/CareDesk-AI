const express = require("express");

const {
  checkAvailabilityController,
  createAppointmentController,
  cancelAppointmentController,
  rescheduleAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
} = require("../controllers/appointmentController");

const router = express.Router();

// Get appointments
router.get("/", getAppointmentsController);
router.get("/:id", getAppointmentByIdController);

// Create appointment
router.post("/", createAppointmentController);

// Check availability
router.post("/check-availability", checkAvailabilityController);

// Cancel appointment
router.patch("/:id/cancel", cancelAppointmentController);

// Reschedule appointment
router.patch("/:id/reschedule", rescheduleAppointmentController);

module.exports = router;
