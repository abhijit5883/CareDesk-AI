const prisma = require("../../db");

function generateSlots() {
  const slots = [];

  // Morning: 10:00 - 13:30
  for (let minutes = 10 * 60; minutes < 14 * 60; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    slots.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`,
    );
  }

  // Evening: 16:00 - 19:30
  for (let minutes = 16 * 60; minutes < 20 * 60; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    slots.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`,
    );
  }

  return slots;
}


// --------------------------------------------------
// DATE VALIDATION
// --------------------------------------------------

function validateAppointmentDate(appointmentDate) {
  const requestedDate = new Date(
    `${appointmentDate}T00:00:00.000Z`
  );

  if (isNaN(requestedDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const today = new Date();

  today.setUTCHours(0, 0, 0, 0);

  const maxDate = new Date(today);

  maxDate.setUTCDate(maxDate.getUTCDate() + 7);

  // Past date
  if (requestedDate < today) {
    throw new Error(
      "Appointments cannot be booked for a past date"
    );
  }

  // More than 7 days ahead
  if (requestedDate > maxDate) {
    throw new Error(
      "Appointments can only be booked up to 7 days ahead"
    );
  }

  return requestedDate;
}


// --------------------------------------------------
// CHECK AVAILABILITY
// --------------------------------------------------

async function checkAvailability(
  doctorId,
  appointmentDate,
  startTime
) {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: Number(doctorId),
    },
  });

  if (!doctor) {
    return {
      available: false,
      message: "Doctor not found",
      alternatives: [],
    };
  }

  // Validate date + 7-day booking window
  let date;

  try {
    date = validateAppointmentDate(appointmentDate);
  } catch (error) {
    return {
      available: false,
      message: error.message,
      alternatives: [],
    };
  }

  // Sunday
  if (date.getUTCDay() === 0) {
    return {
      available: false,
      message: "Clinic is closed on Sundays",
      alternatives: [],
    };
  }

  // Validate time
  const allSlots = generateSlots();

  if (!allSlots.includes(startTime)) {
    return {
      available: false,
      message: "This is not a valid appointment slot",
      alternatives: [],
    };
  }

  // Get booked appointments
  const bookedAppointments =
    await prisma.appointment.findMany({
      where: {
        doctorId: Number(doctorId),
        appointmentDate: date,
        status: "BOOKED",
      },
      select: {
        startTime: true,
      },
    });

  const bookedTimes = bookedAppointments.map(
    (appointment) => appointment.startTime
  );

  // Requested slot available
  if (!bookedTimes.includes(startTime)) {
    return {
      available: true,
      message: "This slot is available",
      alternatives: [],
    };
  }

  // Requested slot already booked
  const requestedIndex =
    allSlots.indexOf(startTime);

  const alternatives = [];

  for (
    let distance = 1;
    distance < allSlots.length;
    distance++
  ) {
    const beforeIndex =
      requestedIndex - distance;

    const afterIndex =
      requestedIndex + distance;

    if (
      beforeIndex >= 0 &&
      !bookedTimes.includes(
        allSlots[beforeIndex]
      )
    ) {
      alternatives.push(
        allSlots[beforeIndex]
      );
    }

    if (
      afterIndex < allSlots.length &&
      !bookedTimes.includes(
        allSlots[afterIndex]
      )
    ) {
      alternatives.push(
        allSlots[afterIndex]
      );
    }

    if (alternatives.length >= 2) {
      break;
    }
  }

  return {
    available: false,
    message: "This slot is already booked",
    alternatives: alternatives.slice(0, 2),
  };
}


// --------------------------------------------------
// CREATE APPOINTMENT
// --------------------------------------------------

async function createAppointment({
  patientId,
  doctorId,
  appointmentDate,
  startTime,
  reason,
}) {
  // Required fields
  if (
    !patientId ||
    !doctorId ||
    !appointmentDate ||
    !startTime
  ) {
    throw new Error(
      "patientId, doctorId, appointmentDate and startTime are required"
    );
  }

  // Validate IDs
  if (
    !Number.isInteger(Number(patientId)) ||
    !Number.isInteger(Number(doctorId))
  ) {
    throw new Error(
      "Patient ID and Doctor ID must be valid numbers"
    );
  }

  // Validate date + booking window
  const date =
    validateAppointmentDate(appointmentDate);

  // Sunday
  if (date.getUTCDay() === 0) {
    throw new Error(
      "Clinic is closed on Sundays"
    );
  }

  // Validate time
  const allSlots = generateSlots();

  if (!allSlots.includes(startTime)) {
    throw new Error(
      "Invalid appointment time"
    );
  }

  // Check patient
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: Number(patientId),
      },
    });

  if (!patient) {
    throw new Error(
      "Patient not found"
    );
  }

  // Check doctor
  const doctor =
    await prisma.doctor.findUnique({
      where: {
        id: Number(doctorId),
      },
    });

  if (!doctor) {
    throw new Error(
      "Doctor not found"
    );
  }

  // Check existing appointment
  const existingAppointment =
    await prisma.appointment.findFirst({
      where: {
        doctorId: Number(doctorId),
        appointmentDate: date,
        startTime,
      },
    });

  // Active booking exists
  if (
    existingAppointment &&
    existingAppointment.status === "BOOKED"
  ) {
    throw new Error(
      "This appointment slot is already booked"
    );
  }

  // Reuse cancelled appointment record
  if (
    existingAppointment &&
    existingAppointment.status === "CANCELLED"
  ) {
    return prisma.appointment.update({
      where: {
        id: existingAppointment.id,
      },

      data: {
        patientId: Number(patientId),
        status: "BOOKED",
        reason,
      },
    });
  }

  // Create new appointment
  return prisma.appointment.create({
    data: {
      patientId: Number(patientId),
      doctorId: Number(doctorId),
      appointmentDate: date,
      startTime,
      reason,
      status: "BOOKED",
    },
  });
}


// --------------------------------------------------
// CANCEL APPOINTMENT
// --------------------------------------------------

async function cancelAppointment(
  appointmentId
) {
  const appointment =
    await prisma.appointment.findUnique({
      where: {
        id: Number(appointmentId),
      },
    });

  if (!appointment) {
    throw new Error(
      "Appointment not found"
    );
  }

  if (
    appointment.status === "CANCELLED"
  ) {
    throw new Error(
      "Appointment is already cancelled"
    );
  }

  return prisma.appointment.update({
    where: {
      id: Number(appointmentId),
    },

    data: {
      status: "CANCELLED",
    },
  });
}


// --------------------------------------------------
// RESCHEDULE APPOINTMENT
// --------------------------------------------------

async function rescheduleAppointment(
  appointmentId,
  newDate,
  newTime
) {
  const appointment =
    await prisma.appointment.findUnique({
      where: {
        id: Number(appointmentId),
      },
    });

  if (!appointment) {
    throw new Error(
      "Appointment not found"
    );
  }

  if (
    appointment.status !== "BOOKED"
  ) {
    throw new Error(
      "Only booked appointments can be rescheduled"
    );
  }

  // Check new slot
  const availability =
    await checkAvailability(
      appointment.doctorId,
      newDate,
      newTime
    );

  if (!availability.available) {
    const error =
      new Error(
        "New slot is not available"
      );

    error.alternatives =
      availability.alternatives;

    throw error;
  }

  // Validate new date
  const date =
    validateAppointmentDate(newDate);

  return prisma.appointment.update({
    where: {
      id: Number(appointmentId),
    },

    data: {
      appointmentDate: date,
      startTime: newTime,
    },
  });
}


// --------------------------------------------------
// FIND PATIENT APPOINTMENT
// --------------------------------------------------

async function findPatientAppointment({
  patientId,
  doctorId,
  appointmentDate,
  startTime,
}) {
  const where = {
    patientId: Number(patientId),
    status: "BOOKED",
  };

  if (doctorId) {
    where.doctorId = Number(doctorId);
  }

  if (appointmentDate) {
    where.appointmentDate =
      new Date(
        `${appointmentDate}T00:00:00.000Z`
      );
  }

  if (startTime) {
    where.startTime = startTime;
  }

  const appointment =
    await prisma.appointment.findFirst({
      where,

      orderBy: {
        startTime: "asc",
      },
    });

  if (!appointment) {
    return {
      found: false,
      message:
        "No matching booked appointment was found.",
    };
  }

  return {
    found: true,
    message: "Appointment found.",
    appointment,
  };
}


// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  generateSlots,
  checkAvailability,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  findPatientAppointment,
};