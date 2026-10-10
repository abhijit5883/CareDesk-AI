const {
  findDoctor,
  listDoctors,
} = require("../modules/doctors/doctorService");

async function findDoctorTool({
  clinicId,
  name,
}) {
  const doctors = await findDoctor(
    clinicId,
    name
  );

  if (doctors.length === 0) {
    return {
      success: false,
      found: false,
      message: "Doctor not found",
      doctors: [],
    };
  }

  return {
    success: true,
    found: true,
    doctors,
  };
}

async function listDoctorsTool({ clinicId }) {
  const doctors = await listDoctors(clinicId);

  if (doctors.length === 0) {
    return {
      success: true,
      doctors: [],
      message:
        "No doctors are currently registered at this hospital.",
    };
  }

  return {
    success: true,
    doctors,
  };
}

module.exports = {
  findDoctorTool,
  listDoctorsTool,
};