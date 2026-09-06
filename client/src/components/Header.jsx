import React, { useState, useEffect } from "react";
import { Plus, Bot, Clock, RefreshCw, Sun, Search, Sparkles } from "lucide-react";

export function Header({ onOpenNewAppointment, onOpenNewPatient, onOpenAI, onRefresh, isRefreshing }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [date, setDate] = useState(new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      marginLeft: "260px",
      height: "70px",
      padding: "0 28px",
      background: "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-color)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 90,
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)"
    }}>
      {/* Time & Date Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#334155",
          fontSize: "0.85rem",
          fontWeight: "600",
          background: "#eaf4fd",
          padding: "6px 14px",
          borderRadius: "var(--radius-full)",
          border: "1px solid #bae6fd"
        }}>
          <Clock size={15} color="#0284c7" />
          <span>{date}</span>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span style={{ fontFamily: "var(--font-mono)", color: "#0369a1", fontWeight: "700" }}>{time}</span>
        </div>

        <button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="btn-icon" 
          title="Refresh Data"
        >
          <RefreshCw size={16} className={isRefreshing ? "spin" : ""} color="#475569" />
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button 
          className="btn btn-secondary"
          onClick={onOpenNewPatient}
        >
          <Plus size={16} />
          New Patient
        </button>

        <button 
          className="btn btn-primary"
          onClick={onOpenNewAppointment}
        >
          <Plus size={16} />
          Book Appointment
        </button>

        <button 
          className="btn btn-sun"
          onClick={onOpenAI}
        >
          <Bot size={17} />
          Ask AI Receptionist
        </button>
      </div>
    </header>
  );
}
