const API_BASE_URL = "http://localhost:5001/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data.message || "An API error occurred";
    const err = new Error(errorMsg);
    if (data.alternatives) {
      err.alternatives = data.alternatives;
    }
    throw err;
  }

  return data;
}

export const api = {
  // Dashboard
  getDashboardStats: () => request("/dashboard"),

  // Appointments
  getAppointments: () => request("/appointments"),
  getAppointmentById: (id) => request(`/appointments/${id}`),
  createAppointment: (payload) =>
    request("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkAvailability: (payload) =>
    request("/appointments/check-availability", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  cancelAppointment: (id) =>
    request(`/appointments/${id}/cancel`, {
      method: "PATCH",
    }),
  rescheduleAppointment: (id, payload) =>
    request(`/appointments/${id}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Doctors
  getDoctors: () => request("/doctors"),
  getDoctorById: (id) => request(`/doctors/${id}`),

  // Patients
  getPatients: () => request("/patients"),
  getPatientById: (id) => request(`/patients/${id}`),
  createPatient: (payload) =>
    request("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // AI Assistant Chat
  sendAIChat: (message, previousMessages = [], allowBooking = true) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, previousMessages, allowBooking }),
    }),
};
