const prisma = require("../db");

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
        name,
        phone,
        email,
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

module.exports = {
  createPatient,
};