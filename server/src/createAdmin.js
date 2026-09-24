const bcrypt = require("bcrypt");
const prisma = require("./db");

async function setupDemoClinic() {
  const clinic = await prisma.clinic.create({
    data: {
      name: "CareDesk Demo Clinic",
      address: "Pune, Maharashtra",
      phone: "9876543210",
      email: "clinic@caredesk.com",
      whatsappNumber: null,
      aiPhoneNumber: null,
    },
  });

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.admin.create({
    data: {
      clinicId: clinic.id,
      name: "Clinic Admin",
      email: "admin@caredesk.com",
      passwordHash,
    },
  });

  console.log("Demo clinic created successfully:");
  console.log({
    clinicId: clinic.id,
    clinicName: clinic.name,
  });

  console.log("Admin created successfully:");
  console.log({
    adminId: admin.id,
    name: admin.name,
    email: admin.email,
    clinicId: admin.clinicId,
  });
}

setupDemoClinic()
  .catch((error) => {
    console.error("Failed to create demo clinic:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });