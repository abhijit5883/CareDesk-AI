import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";

export function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleQuickDemoLogin = () => {
    setEmail("admin@caredesk.com");
    setPassword("Admin@123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await api.login({
        email: email.trim(),
        password,
      });

      setSuccessMsg("Login successful! Loading dashboard...");
      setTimeout(() => {
        onLoginSuccess();
      }, 600);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header text */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
          Welcome back to CareDesk
        </h3>
        <p style={{ fontSize: "0.86rem", color: "#64748b" }}>
          Enter your admin credentials to access your clinic dashboard.
        </p>
      </div>

      {/* Banners */}
      {error && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
          fontSize: "0.85rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "10px",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          fontSize: "0.85rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Mail size={14} color="#0284c7" /> Email Address
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. admin@caredesk.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Lock size={14} color="#0284c7" /> Password
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px", fontSize: "0.95rem", marginBottom: "16px" }}
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="spin" /> Signing In...
            </>
          ) : (
            <>
              Sign In to Dashboard <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Quick Fill Demo Helper */}
        <div style={{
          padding: "12px",
          borderRadius: "10px",
          background: "#f0f9ff",
          border: "1px dashed #bae6fd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.8rem",
        }}>
          <div style={{ color: "#0369a1", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={15} color="#0284c7" /> Demo Admin: admin@caredesk.com
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            style={{
              background: "#0284c7",
              color: "#ffffff",
              border: "none",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Quick Fill
          </button>
        </div>
      </form>
    </div>
  );
}
