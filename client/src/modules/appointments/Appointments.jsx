import React, { useState } from "react";
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  X, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  AlertCircle
} from "lucide-react";
import { api } from "../../services/api";
import { MORNING_SLOTS, EVENING_SLOTS, formatSlotLabel } from "../../constants/timeSlots";

export function Appointments({ 
  appointments, 
  doctors, 
  patients, 
  onRefresh, 
  onOpenBookModal, 
  isBookModalOpen, 
  onCloseBookModal 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [doctorFilter, setDoctorFilter] = useState("ALL");

  // Booking Modal State
  const [bookPatientId, setBookPatientId] = useState("");
  const [bookDoctorId, setBookDoctorId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookReason, setBookReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookError, setBookError] = useState("");

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleAlternatives, setRescheduleAlternatives] = useState([]);

  // Cancel Modal State
  const [cancelAptId, setCancelAptId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const patientName = apt.patient?.name?.toLowerCase() || "";
    const doctorName = apt.doctor?.name?.toLowerCase() || "";
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || doctorName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === "ALL" || apt.doctorId === Number(doctorFilter);
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookError("");

    try {
      await api.createAppointment({
        patientId: Number(bookPatientId),
        doctorId: Number(bookDoctorId),
        appointmentDate: bookDate,
        startTime: bookTime,
        reason: bookReason,
      });

      onCloseBookModal();
      onRefresh();
      setBookPatientId("");
      setBookDoctorId("");
      setBookDate("");
      setBookTime("");
      setBookReason("");
    } catch (err) {
      setBookError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleApt) return;
    setRescheduleLoading(true);
    setRescheduleError("");
    setRescheduleAlternatives([]);

    try {
      await api.rescheduleAppointment(rescheduleApt.id, {
        newDate: rescheduleDate,
        newTime: rescheduleTime,
      });

      setRescheduleApt(null);
      onRefresh();
    } catch (err) {
      setRescheduleError(err.message);
      if (err.alternatives) {
        setRescheduleAlternatives(err.alternatives);
      }
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!cancelAptId) return;
    setCancelLoading(true);

    try {
      await api.cancelAppointment(cancelAptId);
      setCancelAptId(null);
      onRefresh();
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>
            Appointments Directory
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>
            Schedule, reschedule, or cancel patient appointments
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenBookModal}>
          <Plus size={16} />
          Book Appointment
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text"
            placeholder="Search patient or doctor name..."
            className="form-input"
            style={{ paddingLeft: "36px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="#64748b" />
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "150px" }}
          >
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Doctor Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserCheck size={15} color="#64748b" />
          <select 
            className="form-select"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            style={{ width: "180px" }}
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{
                background: "#f1f7fd",
                borderBottom: "1px solid #dce8f5",
                color: "#475569",
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                <th style={{ padding: "14px 20px" }}>ID</th>
                <th style={{ padding: "14px 20px" }}>Patient</th>
                <th style={{ padding: "14px 20px" }}>Doctor</th>
                <th style={{ padding: "14px 20px" }}>Date & Time</th>
                <th style={{ padding: "14px 20px" }}>Reason</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                    No appointments match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const dateFormatted = new Date(apt.appointmentDate).toISOString().split("T")[0];
                  return (
                    <tr key={apt.id} style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.15s"
                    }}>
                      <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", color: "#64748b", fontSize: "0.85rem" }}>
                        #{apt.id}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.92rem" }}>
                          {apt.patient?.name || `Patient #${apt.patientId}`}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {apt.patient?.phone}
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: "600", color: "#0284c7", fontSize: "0.9rem" }}>
                          Dr. {apt.doctor?.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {apt.doctor?.specialization}
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "0.88rem" }}>
                          {dateFormatted}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#0284c7", fontWeight: "700" }}>
                          {apt.startTime}
                        </div>
                      </td>

                      <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: "#475569" }}>
                        {apt.reason || "Consultation"}
                      </td>

                      <td style={{ padding: "14px 20px" }}>
                        <span className={`badge ${apt.status === 'BOOKED' ? 'badge-booked' : 'badge-cancelled'}`}>
                          {apt.status}
                        </span>
                      </td>

                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        {apt.status === "BOOKED" && (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                              onClick={() => {
                                setRescheduleApt(apt);
                                setRescheduleDate(dateFormatted);
                                setRescheduleTime(apt.startTime);
                                setRescheduleError("");
                              }}
                            >
                              Reschedule
                            </button>

                            <button 
                              className="btn btn-danger" 
                              style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                              onClick={() => setCancelAptId(apt.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a" }}>Book New Appointment</h3>
              <button className="btn-icon" onClick={onCloseBookModal}><X size={18} /></button>
            </div>

            {bookError && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-sm)",
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#b91c1c", fontSize: "0.83rem", marginBottom: "14px"
              }}>
                {bookError}
              </div>
            )}

            <form onSubmit={handleCreateAppointment}>
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select 
                  className="form-select"
                  value={bookPatientId}
                  onChange={(e) => setBookPatientId(e.target.value)}
                  required
                >
                  <option value="">Select Patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor</label>
                <select 
                  className="form-select"
                  value={bookDoctorId}
                  onChange={(e) => setBookDoctorId(e.target.value)}
                  required
                >
                  <option value="">Select Doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <select 
                    className="form-select"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    required
                  >
                    <option value="">Select Time Slot...</option>
                    <optgroup label="Morning Shift (10:00 AM - 01:30 PM)">
                      {MORNING_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatSlotLabel(slot)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Evening Shift (04:00 PM - 07:30 PM)">
                      {EVENING_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatSlotLabel(slot)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <input 
                  type="text"
                  placeholder="e.g. Routine Dental Checkup"
                  className="form-input"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={onCloseBookModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a" }}>
                Reschedule Appointment #{rescheduleApt.id}
              </h3>
              <button className="btn-icon" onClick={() => setRescheduleApt(null)}><X size={18} /></button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "14px" }}>
              Patient: <strong style={{ color: "#0f172a" }}>{rescheduleApt.patient?.name}</strong> • With Dr. {rescheduleApt.doctor?.name}
            </p>

            {rescheduleError && (
              <div style={{
                padding: "12px", borderRadius: "var(--radius-sm)",
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#b91c1c", fontSize: "0.83rem", marginBottom: "14px"
              }}>
                <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle size={15} /> {rescheduleError}
                </div>

                {rescheduleAlternatives.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <span style={{ fontWeight: "600", color: "#0f172a" }}>Click an available slot to select:</span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                      {rescheduleAlternatives.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}
                          onClick={() => setRescheduleTime(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">New Date</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Time Slot</label>
                  <select 
                    className="form-select"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                  >
                    <option value="">Select Time Slot...</option>
                    <optgroup label="Morning Shift (10:00 AM - 01:30 PM)">
                      {MORNING_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatSlotLabel(slot)}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Evening Shift (04:00 PM - 07:30 PM)">
                      {EVENING_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {formatSlotLabel(slot)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRescheduleApt(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={rescheduleLoading}>
                  {rescheduleLoading ? "Saving..." : "Update Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelAptId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "10px" }}>
              Cancel Appointment #{cancelAptId}?
            </h3>
            <p style={{ color: "#475569", fontSize: "0.88rem", marginBottom: "20px" }}>
              Are you sure you want to cancel this appointment slot? This status update will be logged.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setCancelAptId(null)}>Keep Appointment</button>
              <button className="btn btn-danger" onClick={handleCancelSubmit} disabled={cancelLoading}>
                {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
