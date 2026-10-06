const {
  findDoctor,
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

module.exports = {
  findDoctorTool,
};