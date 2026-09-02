const prisma = require("../db");

const {
  checkAvailability,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
} = require("../services/appointmentService");

async function checkAvailabilityController(req, res) {
  try {
    const { doctorId, appointmentDate, startTime } = req.body;

    const result = await checkAvailability(
      doctorId,
      appointmentDate,
      startTime,
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to check availability",
    });
  }
}

async function createAppointmentController(req, res) {
  try {
    const appointment = await createAppointment(req.body);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Patient not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Doctor not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Clinic is closed on Sundays") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (
      error.message ===
        "patientId, doctorId, appointmentDate and startTime are required" ||
      error.message === "Patient ID and Doctor ID must be valid numbers" ||
      error.message === "Invalid appointment date" ||
      error.message === "Invalid appointment time"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "This appointment slot is already booked") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
}
async function cancelAppointmentController(req, res) {
  try {
    const appointmentId = req.params.id;

    const appointment = await cancelAppointment(appointmentId);

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Appointment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Appointment is already cancelled") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
}
async function rescheduleAppointmentController(req, res) {
  try {
    const appointmentId = req.params.id;

    const {
      newDate,
      newTime,
    } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: "newDate and newTime are required",
      });
    }

    const appointment = await rescheduleAppointment(
      appointmentId,
      newDate,
      newTime
    );

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });

  } catch (error) {
    console.error(error);

    if (error.message === "Appointment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "Only booked appointments can be rescheduled"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "New slot is not available") {
      return res.status(409).json({
        success: false,
        message: error.message,
        alternatives: error.alternatives,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to reschedule appointment",
    });
  }
}
async function getAppointmentsController(req, res) {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: [
        {
          appointmentDate: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
}

async function getAppointmentByIdController(req, res) {
  try {
    const appointmentId = Number(req.params.id);

    if (!Number.isInteger(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
}
module.exports = {
  checkAvailabilityController,
  createAppointmentController,
  cancelAppointmentController,
  rescheduleAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
};
