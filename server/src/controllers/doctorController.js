const prisma = require("../db");


// GET ALL DOCTORS
async function getDoctors(req, res) {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        schedules: true,
        appointments: {
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

    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
}


// GET DOCTOR BY ID
async function getDoctorById(req, res) {
  try {
    const doctorId = Number(req.params.id);

    if (!Number.isInteger(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        schedules: true,
        appointments: {
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

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
    });
  }
}


module.exports = {
  getDoctors,
  getDoctorById,
};