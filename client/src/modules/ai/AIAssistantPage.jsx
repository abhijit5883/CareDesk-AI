import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, RefreshCw, Terminal, ArrowRight, Zap, Sun } from "lucide-react";
import { api } from "../../services/api";

export function AIAssistantPage({ onRefreshData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am Riya, your AI Clinic Receptionist powered by OpenRouter Gemini function-calling.\n\nI can autonomously execute database tools like checking doctor shifts, booking slots, suggesting alternative times, rescheduling, and cancelling appointments. How can I assist you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toolLogs, setToolLogs] = useState([]);

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

      if (result.messages) {
        const toolCalls = result.messages.filter(m => m.role === "tool" || m.tool_calls);
        if (toolCalls.length > 0) {
          setToolLogs((prev) => [...prev, ...toolCalls]);
        }
      }

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${err.message || "Failed to communicate with AI service."}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation history cleared. Ready for a new receptionist interaction!"
      }
    ]);
    setHistory([]);
    setToolLogs([]);
  };

  const testScenarios = [
    {
      title: "1. Check Slot Availability",
      prompt: "I am patient 1. Check if Dr. Smith (doctor 1) is available tomorrow at 10:00 AM.",
      desc: "Queries doctor working hours and checks database slot collision"
    },
    {
      title: "2. Book New Appointment",
      prompt: "I am patient 1. Book an appointment tomorrow at 10:00 AM with doctor 1 for routine cleaning.",
      desc: "Triggers book_appointment function tool"
    },
    {
      title: "3. Reschedule Appointment",
      prompt: "I want to reschedule appointment 1 to tomorrow at 4:00 PM.",
      desc: "Triggers reschedule_appointment tool with automatic alternative suggestions"
    },
    {
      title: "4. Cancel Appointment",
      prompt: "Please cancel appointment 1 for patient 1.",
      desc: "Triggers cancel_appointment function tool"
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              padding: "3px 10px", borderRadius: "99px",
              background: "#fffbeb", color: "#b45309",
              border: "1px solid #fde68a",
              fontSize: "0.75rem", fontWeight: "800",
              display: "inline-flex", alignItems: "center", gap: "4px"
            }}>
              <Sun size={12} color="#f6b40e" fill="#f6b40e" /> OPENROUTER GEMINI ENGINE
            </span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>
            AI Clinic Receptionist Suite
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
            Test live multi-turn conversational AI receptionist capabilities with autonomous database tool execution
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleClearChat}>
          <RefreshCw size={15} /> Clear History
        </button>
      </div>

      {/* Preset Test Scenarios Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "14px"
      }}>
        {testScenarios.map((sc, i) => (
          <div 
            key={i} 
            className="glass-card-interactive" 
            onClick={() => handleSendMessage(sc.prompt)}
            style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#0284c7", marginBottom: "4px" }}>
                {sc.title}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {sc.desc}
              </p>
            </div>

            <div style={{
              marginTop: "12px",
              paddingTop: "8px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "#0369a1",
              fontWeight: "700"
            }}>
              <span>Run Test Prompt</span>
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Workspace Split: Chat Console + Function Log Inspector */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "24px"
      }}>
        {/* Chat Console */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "550px", overflow: "hidden" }}>
          <div style={{
            padding: "14px 20px",
            background: "#f1f7fd",
            borderBottom: "1px solid #dce8f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", fontWeight: "700", fontSize: "0.95rem" }}>
              <Bot size={18} color="#0284c7" />
              Receptionist Dialogue Stream
            </div>
            <span className="badge badge-booked">LIVE ENDPOINT</span>
          </div>

          <div style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
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
                  maxWidth: "80%",
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" 
                    ? "16px 16px 4px 16px" 
                    : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #4a90e2, #3b82f6)"
                    : "#ffffff",
                  color: msg.role === "user" ? "#ffffff" : "#0f172a",
                  fontWeight: msg.role === "user" ? "600" : "400",
                  fontSize: "0.92rem",
                  border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                  boxShadow: msg.role === "assistant" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px", padding: "0 6px" }}>
                  {msg.role === "user" ? "Staff / Patient Query" : "Riya (AI Receptionist)"}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0284c7", fontSize: "0.88rem", padding: "10px" }}>
                <RefreshCw size={16} className="spin" />
                <span>Riya is evaluating clinic rules and calling database tools...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: "16px 20px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "12px"
          }}>
            <input 
              type="text"
              placeholder="Type your message to the AI receptionist..."
              className="form-input"
              style={{ padding: "12px 16px" }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={loading}
            />
            <button 
              className="btn btn-primary"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              style={{ padding: "12px 20px" }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Function Calling Inspector Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={16} color="#0284c7" />
              Active System Tools
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#64748b" }}>
              The AI receptionist is authorized to invoke the following function calls:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
              <div style={{ padding: "8px 10px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "var(--radius-sm)", color: "#0284c7" }}>
                • check_availability()
              </div>
              <div style={{ padding: "8px 10px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "var(--radius-sm)", color: "#047857" }}>
                • book_appointment()
              </div>
              <div style={{ padding: "8px 10px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "var(--radius-sm)", color: "#b45309" }}>
                • reschedule_appointment()
              </div>
              <div style={{ padding: "8px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", color: "#b91c1c" }}>
                • cancel_appointment()
              </div>
              <div style={{ padding: "8px 10px", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "var(--radius-sm)", color: "#6d28d9" }}>
                • find_patient_appointment()
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={16} color="#0284c7" />
              Tool Execution Audit
            </h3>

            {toolLogs.length === 0 ? (
              <p style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic" }}>
                No tool calls executed in this session yet. Run a scenario above to inspect tool payloads.
              </p>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px" }}>
                {toolLogs.map((log, i) => (
                  <div key={i} style={{
                    padding: "8px 10px",
                    background: "#f8fafc",
                    borderRadius: "4px",
                    border: "1px solid #e2e8f0",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "#0369a1"
                  }}>
                    {log.content || JSON.stringify(log)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
