const express = require("express");

const {
  checkAvailabilityController,
  createAppointmentController,
  cancelAppointmentController,
  rescheduleAppointmentController,
} = require("../controllers/appointmentController");

const router = express.Router();

router.post("/", createAppointmentController);

router.post("/check-availability", checkAvailabilityController);

router.patch("/:id/cancel", cancelAppointmentController);

router.patch("/:id/reschedule", rescheduleAppointmentController);

module.exports = router;
