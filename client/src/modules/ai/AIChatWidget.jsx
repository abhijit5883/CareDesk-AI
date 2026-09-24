import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sun, RefreshCw } from "lucide-react";
import { api } from "../../services/api";

export function AIChatWidget({ isOpen, onClose, onRefreshData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am Riya, your CareDesk AI Clinic Receptionist. How can I help you or your patients today? You can ask me to check doctor availability, book appointments, reschedule, or cancel bookings!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const result = await api.sendAIChat(query, history, true);
      
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
      setHistory(result.messages || []);

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${err.message || "Failed to reach AI receptionist service."}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetText) => {
    handleSendMessage(presetText);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "420px",
      height: "600px",
      maxHeight: "calc(100vh - 100px)",
      background: "#ffffff",
      border: "1px solid #bae6fd",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
      display: "flex",
      flexDirection: "column",
      zIndex: 1000,
      overflow: "hidden",
      animation: "slideUp 0.25s ease-out"
    }}>
      {/* Widget Header */}
      <div style={{
        padding: "16px 20px",
        background: "linear-gradient(135deg, #4a90e2, #3b82f6)",
        borderBottom: "1px solid #bae6fd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <Bot size={22} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontWeight: "800", color: "#ffffff", fontSize: "0.95rem" }}>
              CareDesk • AI Receptionist
            </div>
            <div style={{ fontSize: "0.72rem", color: "#fffbeb", display: "flex", alignItems: "center", gap: "4px", fontWeight: "700" }}>
              <Sun size={12} color="#f6b40e" fill="#f6b40e" /> Function-Calling Active
            </div>
          </div>
        </div>

        <button 
          className="btn-icon" 
          onClick={onClose}
          style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", color: "#fff" }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Preset Chips */}
      <div style={{
        padding: "10px 14px",
        background: "#f0f9ff",
        borderBottom: "1px solid #e0f2fe",
        display: "flex",
        gap: "6px",
        overflowX: "auto"
      }}>
        <button 
          className="btn btn-secondary"
          style={{ padding: "3px 8px", fontSize: "0.72rem", whiteSpace: "nowrap" }}
          onClick={() => handlePresetClick("Check Dr. Smith's availability for tomorrow at 10:00 AM")}
        >
          Dr. Smith tomorrow 10am?
        </button>

        <button 
          className="btn btn-secondary"
          style={{ padding: "3px 8px", fontSize: "0.72rem", whiteSpace: "nowrap" }}
          onClick={() => handlePresetClick("Book an appointment for patient 1 with doctor 1 tomorrow at 2:00 PM for tooth ache")}
        >
          Book Patient 1
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        background: "#f8fafc"
      }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" 
                ? "14px 14px 2px 14px" 
                : "14px 14px 14px 2px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #4a90e2, #3b82f6)"
                : "#ffffff",
              color: msg.role === "user" ? "#ffffff" : "#0f172a",
              fontWeight: msg.role === "user" ? "600" : "400",
              fontSize: "0.86rem",
              border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
              boxShadow: msg.role === "assistant" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              whiteSpace: "pre-wrap",
              lineHeight: 1.4
            }}>
              {msg.content}
            </div>
            <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "3px", padding: "0 4px" }}>
              {msg.role === "user" ? "You" : "Riya AI"}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0284c7", fontSize: "0.8rem", padding: "8px" }}>
            <RefreshCw size={14} className="spin" />
            <span>Riya is checking clinic schedules...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: "12px 16px",
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        gap: "10px"
      }}>
        <input 
          type="text"
          placeholder="Ask Riya to book, check or cancel..."
          className="form-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={loading}
        />
        <button 
          className="btn btn-primary"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMessage.trim()}
          style={{ padding: "10px 14px" }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
