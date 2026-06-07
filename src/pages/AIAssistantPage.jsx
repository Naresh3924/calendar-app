import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const SUGGESTIONS = [
  { icon: "📅", text: "What's on my schedule today?" },
  { icon: "✅", text: "What tasks should I prioritize?" },
  { icon: "🎯", text: "How are my goals progressing?" },
  { icon: "⚡", text: "Give me productivity tips" },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((ms) => [...ms, { role: "user", content: msg }]);
    setLoading(true);
    // Simulate AI response — replace with real API call if available
    await new Promise((r) => setTimeout(r, 1000));
    setMessages((ms) => [
      ...ms,
      {
        role: "assistant",
        content: `I'm AMZENO AI, your productivity companion! You asked: "${msg}". I can help you manage your tasks, events, and goals. Connect to the AI endpoint for full functionality.`,
      },
    ]);
    setLoading(false);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="right-side">
        <Topbar />
        <div className="main-content">
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: messages.length === 0 ? "center" : "flex-start",
              minHeight: 0,
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{ textAlign: "center", maxWidth: 500, width: "100%" }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "linear-gradient(135deg,#3b6ef5,#06b6d4)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg,#3b6ef5,#06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    AI Assistant
                  </span>
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>
                  Your intelligent productivity companion
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 32,
                  }}
                >
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="ai-suggestion"
                      onClick={() => sendMessage(s.text)}
                    >
                      <span style={{ fontSize: 18 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, color: "#374151" }}>
                        {s.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-chat-window">
                {messages.map((m, i) => (
                  <div key={i} className={`ai-msg ${m.role}`}>
                    {m.role === "assistant" && (
                      <div className="ai-avatar">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                        >
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                    )}
                    <div className={`ai-bubble ${m.role}`}>{m.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className="ai-msg assistant">
                    <div className="ai-avatar">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <div className="ai-bubble assistant ai-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="ai-input-bar">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask AMZENO anything…"
              />
              <button
                className="ai-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
