import React from "react";
import { Stethoscope, Phone, Mail, Clock, Sun } from "lucide-react";

export function Doctors({ doctors }) {
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>
          Doctors Directory & Shift Schedules
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>
          View attending clinic specialists, contact info, working hours, and bookings
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: "20px"
      }}>
        {doctors.map((doc) => {
          const bookedCount = doc.appointments?.filter(a => a.status === 'BOOKED').length || 0;
          return (
            <div key={doc.id} className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Doctor Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                  border: "1px solid #75aadb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0284c7"
                }}>
                  <Stethoscope size={28} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#0284c7", letterSpacing: "0.05em" }}>
                    SPECIALIST #{doc.id}
                  </div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
                    Dr. {doc.name}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: "600", marginTop: "2px" }}>
                    {doc.specialization}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "14px",
                background: "#f8fafc",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #e2e8f0",
                fontSize: "0.82rem",
                color: "#475569"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={14} color="#0284c7" />
                  <span style={{ color: "#0f172a", fontWeight: "600" }}>{doc.phone || "N/A"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={14} color="#0284c7" />
                  <span>{doc.email || "N/A"}</span>
                </div>
              </div>

              {/* Doctor Working Hours / Schedules */}
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock size={14} color="#0284c7" />
                  Working Shift Hours
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {doc.schedules && doc.schedules.length > 0 ? (
                    doc.schedules.map((sch) => (
                      <div key={sch.id} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8rem"
                      }}>
                        <span style={{ fontWeight: "600", color: "#334155" }}>
                          {DAYS[sch.dayOfWeek] || `Day ${sch.dayOfWeek}`}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "#0284c7", fontWeight: "700" }}>
                          {sch.startTime} - {sch.endTime}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No working schedule assigned</div>
                  )}
                </div>
              </div>

              {/* Total Appointments Stats Footer */}
              <div style={{
                marginTop: "auto",
                paddingTop: "14px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Active Appointments</span>
                <span className="badge badge-booked">
                  {bookedCount} Booked
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
