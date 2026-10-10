const prisma = require("../../db");

async function findDoctor(clinicId, name) {
  const raw = name.trim();

  // Remove "Dr", "Dr.", "Dr " from the beginning
  const withoutTitle = raw
    .replace(/^dr\.?\s*/i, "")
    .trim();

  const queries = [...new Set([raw, withoutTitle].filter(Boolean))];

  const doctors = await prisma.doctor.findMany({
    where: {
      clinicId: Number(clinicId),
      OR: [
        ...queries.map((query) => ({
          name: {
            contains: query,
            mode: "insensitive",
          },
        })),
        ...queries.map((query) => ({
          specialization: {
            contains: query,
            mode: "insensitive",
          },
        })),
      ],
    },
    select: {
      id: true,
      name: true,
      specialization: true,
      phone: true,
      email: true,
    },
  });

  return doctors;
}

/**
 * List all doctors belonging to a specific clinic.
 * Returns only patient-appropriate fields.
 */
async function listDoctors(clinicId) {
  const doctors = await prisma.doctor.findMany({
    where: {
      clinicId: Number(clinicId),
    },
    select: {
      name: true,
      specialization: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return doctors;
}

module.exports = { findDoctor, listDoctors };