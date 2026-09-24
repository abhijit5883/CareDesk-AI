const prisma = require("../../db");

async function getDashboard(req, res) {
  try {
    const clinicId = req.clinicId;

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      bookedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      // Total patients for this clinic
      prisma.patient.count({
        where: {
          clinicId,
        },
      }),

      // Total doctors for this clinic
      prisma.doctor.count({
        where: {
          clinicId,
        },
      }),

      // Total appointments for this clinic
      prisma.appointment.count({
        where: {
          clinicId,
        },
      }),

      // Booked appointments for this clinic
      prisma.appointment.count({
        where: {
          clinicId,
          status: "BOOKED",
        },
      }),

      // Cancelled appointments for this clinic
      prisma.appointment.count({
        where: {
          clinicId,
          status: "CANCELLED",
        },
      }),
    ]);

    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Get today's booked appointments
    // only for the logged-in clinic
    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        clinicId,
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
        status: "BOOKED",
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        bookedAppointments,
        cancelledAppointments,
      },
      todaysAppointments,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
}

module.exports = {
  getDashboard,
};