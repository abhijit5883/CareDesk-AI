const prisma = require("../../db");

async function findPatient(clinicId, name, phone) {
  const patient = await prisma.patient.findFirst({
    where: {
      clinicId,
      OR: [
        name ? { name: { equals: name, mode: "insensitive" } } : undefined,
        phone ? { phone } : undefined,
      ].filter(Boolean),
    },
  });

  return patient;
}

async function createPatient(clinicId, { name, phone, email }) {
  const existingPatient = await prisma.patient.findFirst({
    where: {
      clinicId,
      phone,
    },
  });

  if (existingPatient) {
    return existingPatient;
  }

  return await prisma.patient.create({
    data: {
      clinicId,
      name,
      phone,
      email: email || null,
    },
  });
}

module.exports = {
  findPatient,
  createPatient,
};