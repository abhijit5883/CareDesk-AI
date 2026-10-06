const {
  findPatient,
  createPatient,
} = require("../modules/patients/patientService");
 
async function findPatientTool({
  clinicId,
  name,
  phone,
}) {
  const patient = await findPatient(
    clinicId,
    name,
    phone
  );

  if (!patient) {
    return {
      success: false,
      found: false,
      message: "Patient not found",
    };
  }

  return {
    success: true,
    found: true,
    patient: {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
    },
  };
}

async function createPatientTool({
  clinicId,
  name,
  phone,
  email,
}) {
  const patient = await createPatient(
    clinicId,
    {
      name,
      phone,
      email,
    }
  );

  return {
    success: true,
    message: "Patient registered successfully",
    patient: {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
    },
  };
}

module.exports = {
  findPatientTool,
  createPatientTool,
};