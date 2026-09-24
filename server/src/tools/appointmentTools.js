const {
  checkAvailability,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  findPatientAppointment,
} = require("../modules/appointments/appointmentService");

async function checkAvailabilityTool({
  doctorId,
  appointmentDate,
  startTime,
}) {
  return await checkAvailability(
    doctorId,
    appointmentDate,
    startTime
  );
}

async function bookAppointmentTool({
  patientId,
  doctorId,
  appointmentDate,
  startTime,
  reason,
}) {
  // Safety check before booking
  const availability = await checkAvailability(
    doctorId,
    appointmentDate,
    startTime
  );

  if (!availability.available) {
    return {
      success: false,
      message: availability.message,
      alternatives: availability.alternatives,
    };
  }

  const appointment = await createAppointment({
    patientId,
    doctorId,
    appointmentDate,
    startTime,
    reason,
  });

  return {
    success: true,
    message: "Appointment booked successfully",
    appointment,
  };
}

async function cancelAppointmentTool({
  appointmentId,
}) {
  const appointment = await cancelAppointment(
    appointmentId
  );

  return {
    success: true,
    message: "Appointment cancelled successfully",
    appointment,
  };
}

async function rescheduleAppointmentTool({
  appointmentId,
  newDate,
  newTime,
}) {
  const appointment = await rescheduleAppointment(
    appointmentId,
    newDate,
    newTime
  );

  return {
    success: true,
    message: "Appointment rescheduled successfully",
    appointment,
  };
}
async function findPatientAppointmentTool({
  patientId,
  doctorId,
  appointmentDate,
  startTime,
}) {
  return await findPatientAppointment({
    patientId,
    doctorId,
    appointmentDate,
    startTime,
  });
}

module.exports = {
  checkAvailabilityTool,
  bookAppointmentTool,
  cancelAppointmentTool,
  rescheduleAppointmentTool,
  findPatientAppointmentTool,
};