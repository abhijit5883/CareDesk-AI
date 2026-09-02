const prisma = require("../db");

async function getDashboard(req, res) {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      bookedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      prisma.patient.count(),

      prisma.doctor.count(),

      prisma.appointment.count(),

      prisma.appointment.count({
        where: {
          status: "BOOKED",
        },
      }),

      prisma.appointment.count({
        where: {
          status: "CANCELLED",
        },
      }),
    ]);

    // Get today's date in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const todaysAppointments = await prisma.appointment.findMany({
      where: {
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

    res.json({
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
}

module.exports = {
  getDashboard,
};