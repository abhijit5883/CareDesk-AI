import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Overview } from "./components/Overview";
import { Appointments } from "./components/Appointments";
import { Doctors } from "./components/Doctors";
import { Patients } from "./components/Patients";
import { AIChatWidget } from "./components/AIChatWidget";
import { AIAssistantPage } from "./components/AIAssistantPage";
import { Footer } from "./components/Footer";
import { api } from "./services/api";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");

  // Global state
  const [dashboardData, setDashboardData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAIWidgetOpen, setIsAIWidgetOpen] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    setError(null);

    try {
      const [dashRes, docsRes, patientsRes, aptsRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getDoctors().catch(() => ({ doctors: [] })),
        api.getPatients().catch(() => ({ patients: [] })),
        api.getAppointments().catch(() => ({ appointments: [] })),
      ]);

      if (dashRes) setDashboardData(dashRes);
      if (docsRes) setDoctors(docsRes.doctors || []);
      if (patientsRes) setPatients(patientsRes.patients || []);
      if (aptsRes) setAppointments(aptsRes.appointments || []);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setError("Unable to connect to Express backend server on port 5001. Please ensure the backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main App Container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Sticky Top Header */}
        <Header 
          onOpenNewAppointment={() => setIsBookModalOpen(true)}
          onOpenNewPatient={() => setIsPatientModalOpen(true)}
          onOpenAI={() => setIsAIWidgetOpen(true)}
          onRefresh={() => fetchData(false)}
          isRefreshing={refreshing}
        />

        {/* Content View Container */}
        <main style={{
          marginLeft: "260px",
          flex: 1,
          padding: "28px",
          maxWidth: "1400px"
        }}>
          {error && (
            <div style={{
              padding: "16px 20px",
              marginBottom: "24px",
              borderRadius: "var(--radius-md)",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={20} />
                <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{error}</span>
              </div>
              <button className="btn btn-secondary" onClick={() => fetchData(false)}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {loading ? (
            <div style={{
              padding: "80px",
              textAlign: "center",
              color: "#0284c7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px"
            }}>
              <RefreshCw size={32} className="spin" />
              <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "1.1rem" }}>
                Loading CareDesk Clinic Dashboard...
              </div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <Overview 
                  dashboardData={dashboardData}
                  doctors={doctors}
                  patients={patients}
                  onNavigate={setActiveTab}
                  onOpenNewAppointment={() => setIsBookModalOpen(true)}
                  onOpenAI={() => setIsAIWidgetOpen(true)}
                />
              )}

              {activeTab === "appointments" && (
                <Appointments 
                  appointments={appointments}
                  doctors={doctors}
                  patients={patients}
                  onRefresh={() => fetchData(true)}
                  onOpenBookModal={() => setIsBookModalOpen(true)}
                  isBookModalOpen={isBookModalOpen}
                  onCloseBookModal={() => setIsBookModalOpen(false)}
                />
              )}

              {activeTab === "doctors" && (
                <Doctors doctors={doctors} />
              )}

              {activeTab === "patients" && (
                <Patients 
                  patients={patients}
                  onRefresh={() => fetchData(true)}
                  onOpenPatientModal={() => setIsPatientModalOpen(true)}
                  isPatientModalOpen={isPatientModalOpen}
                  onClosePatientModal={() => setIsPatientModalOpen(false)}
                />
              )}

              {activeTab === "ai-assistant" && (
                <AIAssistantPage onRefreshData={() => fetchData(true)} />
              )}

              {/* Footer Component */}
              <Footer />
            </>
          )}
        </main>
      </div>

      {/* Floating AI Receptionist Widget */}
      <AIChatWidget 
        isOpen={isAIWidgetOpen}
        onClose={() => setIsAIWidgetOpen(false)}
        onRefreshData={() => fetchData(true)}
      />
    </div>
  );
}
