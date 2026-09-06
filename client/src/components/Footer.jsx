import React from "react";
import { 
  HeartPulse, 
  Sun, 
  Globe, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Share2,
  Mail,
  Phone
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Twitter / X",
      href: "https://twitter.com",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      )
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    },
    {
      name: "Facebook",
      href: "https://facebook.com",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      name: "GitHub",
      href: "https://github.com",
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      )
    }
  ];

  return (
    <footer style={{
      marginTop: "48px",
      padding: "32px 0 24px 0",
      borderTop: "1px solid var(--border-color)",
      background: "#ffffff",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{
        padding: "0 28px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "32px",
        marginBottom: "28px"
      }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #4a90e2, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 10px rgba(74, 144, 226, 0.25)"
            }}>
              <HeartPulse size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
              CareDesk
            </span>
          </div>

          <p style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.5, marginBottom: "14px" }}>
            Intelligent AI Clinic Receptionist & Practice Operating System. Streamlining patient scheduling and doctor workflows.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#0284c7", fontWeight: "700" }}>
            <Sun size={13} color="#f6b40e" fill="#f6b40e" /> Powered by OpenRouter Sol Engine
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            Follow Us On Social Media
          </h4>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "14px" }}>
            Stay connected for healthcare tech updates & AI announcements:
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {socialLinks.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#f1f7fd",
                  border: "1px solid #dce8f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0369a1",
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f1f7fd";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Resources */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
            Practice Resources
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.83rem" }}>
            <li>
              <a href="#docs" style={{ color: "#475569", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                <span>Documentation & API</span> <ExternalLink size={12} color="#94a3b8" />
              </a>
            </li>
            <li>
              <a href="#security" style={{ color: "#475569", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                <ShieldCheck size={14} color="#10b981" /> <span>HIPAA Compliance</span>
              </a>
            </li>
            <li>
              <a href="#support" style={{ color: "#475569", textDecoration: "none" }}>
                24/7 Clinic Support Center
              </a>
            </li>
            <li>
              <a href="#privacy" style={{ color: "#475569", textDecoration: "none" }}>
                Privacy Policy & Terms
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{
        padding: "16px 28px 0 28px",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "0.78rem",
        color: "#64748b"
      }}>
        <div>
          © {currentYear} <strong>CareDesk Health Inc.</strong> All rights reserved.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>Version 1.2.0 • Light Celeste Edition</span>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <a href="#privacy" style={{ color: "#64748b", textDecoration: "none" }}>Privacy</a>
          <a href="#terms" style={{ color: "#64748b", textDecoration: "none" }}>Terms</a>
        </div>
      </div>
    </footer>
  );
}
