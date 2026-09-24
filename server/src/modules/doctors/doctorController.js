const prisma = require("../../db");

// ==========================================
// CREATE DOCTOR
// ==========================================
async function createDoctor(req, res) {
  try {
    const {
      name,
      specialization,
      phone,
      email,
    } = req.body;

    // Basic validation
    if (!name || !specialization) {
      return res.status(400).json({
        success: false,
        message: "Name and specialization are required",
      });
    }

    // Create doctor inside the authenticated admin's clinic.
    // IMPORTANT:
    // clinicId comes from req.clinicId, NOT req.body.
    const doctor = await prisma.doctor.create({
      data: {
        clinicId: req.clinicId,
        name: name.trim(),
        specialization: specialization.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      },
      include: {
        schedules: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create doctor",
    });
  }
};

// ==========================================
// GET ALL DOCTORS
// ==========================================
async function getDoctors(req, res) {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        clinicId: req.clinicId,
      },
      include: {
        schedules: true,
        appointments: {
          where: {
            clinicId: req.clinicId,
          },
          include: {
            patient: true,
          },
          orderBy: [
            {
              appointmentDate: "asc",
            },
            {
              startTime: "asc",
            },
          ],
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

// ==========================================
// GET DOCTOR BY ID
// ==========================================
async function getDoctorById(req, res) {
  try {
    const doctorId = Number(req.params.id);

    if (!Number.isInteger(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await prisma.doctor.findFirst({
      where: {
        id: doctorId,
        clinicId: req.clinicId,
      },
      include: {
        schedules: true,
        appointments: {
          where: {
            clinicId: req.clinicId,
          },
          include: {
            patient: true,
          },
          orderBy: [
            {
              appointmentDate: "asc",
            },
            {
              startTime: "asc",
            },
          ],
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
    });
  }
}

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
};