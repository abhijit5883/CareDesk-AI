const prisma = require("../../db");

async function createPatient(req, res) {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const patient = await prisma.patient.create({
      data: {
         clinicId: req.clinicId,
        name,
        phone,
        email: email || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create patient",
    });
  }
}

// GET ALL PATIENTS
async function getPatients(req, res) {
  try {
    const patients = await prisma.patient.findMany({
  where: {
    clinicId: req.clinicId,
  },
  include: {
    appointments: true,
  },
  orderBy: {
    createdAt: "desc",
  },
});

    res.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
    });
  }
}

// GET PATIENT BY ID
async function getPatientById(req, res) {
  try {
    const patientId = Number(req.params.id);

    if (!Number.isInteger(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

  const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId: req.clinicId,
      },
      include: {
        appointments: {
          include: {
            doctor: true,
          },
          orderBy: {
            appointmentDate: "desc",
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
    });
  }
}

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
};
