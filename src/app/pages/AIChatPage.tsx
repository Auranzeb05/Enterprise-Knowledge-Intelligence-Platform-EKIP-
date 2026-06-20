import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FileText,
  UserCircle,
  BarChart2,
  Users,
  ClipboardList,
  Brain,
  Sparkles,
  Send,
  Mic,
  Copy,
  RefreshCw,
  Bookmark,
  Download,
  FileDown,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Check,
  ExternalLink,
  X,
  Shield,
  Database,
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const NAV_EMPLOYEE = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const NAV_MANAGER = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

const NAV_ADMIN = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

const COLORS = {
  bg: "#0C1525",
  card: "#111D30",
  accent: "#2563EB",
  text: "#E8EFF8",
  muted: "#64748B",
  border: "#1E2D45",
  cardHover: "#162035",
};

const CITATIONS = [
  {
    id: 1,
    docName: "Employee Handbook 2026",
    page: 34,
    confidence: 97,
    section: "Section 4.2 — Annual Leave Entitlement",
    category: "HR",
    excerpt:
      "Full-time employees are entitled to 20 days of annual leave per calendar year, accruing at a rate of 1.67 days per month from the date of commencement...",
  },
  {
    id: 2,
    docName: "Leave & Absence Policy v3.1",
    page: 7,
    confidence: 91,
    section: "Section 2 — Types of Leave",
    category: "Policy",
    excerpt:
      "Sick leave shall be granted for a period not exceeding 14 consecutive days upon presentation of a medical certificate from a registered practitioner...",
  },
  {
    id: 3,
    docName: "Benefits Guide APAC",
    page: 12,
    confidence: 84,
    section: "Regional Variations — APAC Leave",
    category: "Benefits",
    excerpt:
      "Employees based in Singapore, Malaysia, and Indonesia are subject to local statutory leave requirements which may exceed the global minimum standards...",
  },
];

const RELATED_DOCS = [
  { name: "Parental Leave Framework 2025", category: "HR", pages: 18 },
  { name: "Remote Work Policy v2.0", category: "Operations", pages: 24 },
  { name: "Disciplinary & Grievance Procedure", category: "Legal", pages: 31 },
];

const SUGGESTED_QUESTIONS = [
  "What is the leave policy?",
  "Explain reimbursement rules.",
  "Which contracts expire this quarter?",
  "Summarize data retention framework.",
  "What are SOC 2 audit requirements?",
];

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  citations?: number[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "How many days of annual leave am I entitled to as a full-time employee?",
    timestamp: new Date(Date.now() - 120000),
    citations: [],
  },
  {
    id: "2",
    role: "ai",
    content: `Based on the **Employee Handbook 2026** and **Leave & Absence Policy v3.1**, here is a summary of your annual leave entitlements:

**Annual Leave Entitlement**

Full-time employees are entitled to:
- **20 days** of annual leave per calendar year
- Leave accrues at **1.67 days per month** from your start date
- Unused leave (up to 5 days) may be carried over to the following year

**Key Conditions**
- Leave must be approved by your line manager at least **5 business days** in advance
- Public holidays are in addition to your annual leave allowance
- Part-time employees receive a pro-rated entitlement

> **Regional Note:** Employees in APAC regions (Singapore, Malaysia, Indonesia) may be subject to higher statutory minimums under local employment law. Please refer to the Benefits Guide APAC for region-specific details.`,
    timestamp: new Date(Date.now() - 90000),
    citations: [1, 2, 3],
  },
];

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 4,
          background: COLORS.border,
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: 99,
          }}
        />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, minWidth: 36 }}>{value}%</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.accent}, #7C3AED)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Sparkles size={16} color="white" />
      </div>
      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 16px",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: COLORS.accent,
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CitationCard({ citation, expanded, onToggle }: { citation: typeof CITATIONS[0]; expanded: boolean; onToggle: () => void }) {
  const confColor = citation.confidence >= 90 ? "#10B981" : citation.confidence >= 75 ? "#F59E0B" : "#EF4444";

  return (
    <div
      style={{
        background: COLORS.cardHover,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: COLORS.accent + "22",
                color: COLORS.accent,
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              #{citation.id}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                background: "#10B98122",
                color: "#10B981",
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              {citation.category}
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, lineHeight: 1.3 }}>{citation.docName}</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Page {citation.page} · {citation.section}</div>
        </div>
      </div>
      <ConfidenceBar value={citation.confidence} color={confColor} />
      {expanded && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: COLORS.bg,
            borderRadius: 8,
            borderLeft: `3px solid ${COLORS.accent}`,
            fontSize: 12,
            color: COLORS.muted,
            lineHeight: 1.6,
          }}
        >
          {citation.excerpt}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={onToggle}
          style={{
            flex: 1,
            background: "transparent",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: "5px 10px",
            color: COLORS.muted,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {expanded ? "Hide excerpt" : "Show excerpt"}
        </button>
        <button
          style={{
            flex: 1,
            background: COLORS.accent,
            border: "none",
            borderRadius: 6,
            padding: "5px 10px",
            color: "white",
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            fontFamily: "inherit",
          }}
        >
          <ExternalLink size={10} />
          Open Source
        </button>
      </div>
    </div>
  );
}

function renderAIContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          style={{
            borderLeft: `3px solid ${COLORS.accent}`,
            paddingLeft: 12,
            margin: "8px 0",
            color: COLORS.muted,
            fontSize: 13,
            fontStyle: "italic",
          }}
        >
          {line.slice(2)}
        </blockquote>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <div key={i} style={{ display: "flex", gap: 8, margin: "3px 0", fontSize: 14, lineHeight: 1.6 }}>
          <span style={{ color: COLORS.accent, flexShrink: 0 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
        </div>
      );
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <div key={i} style={{ fontWeight: 700, fontSize: 14, margin: "10px 0 4px", color: COLORS.text }}>
          {line.slice(2, -2)}
        </div>
      );
    }
    if (line === "") return <div key={i} style={{ height: 6 }} />;
    return (
      <div
        key={i}
        style={{ fontSize: 14, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
      />
    );
  });
}

export default function AIChatPage() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const nav = role === "admin" ? NAV_ADMIN : role === "manager" ? NAV_MANAGER : NAV_EMPLOYEE;
  const settingsPath = role === "admin" ? "/admin-settings" : role === "manager" ? "/manager-settings" : "/settings";
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [citationPanelOpen, setCitationPanelOpen] = useState(true);
  const [expandedCitations, setExpandedCitations] = useState<number[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [savedConversation, setSavedConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I am searching the knowledge base for the most relevant information on your query. Based on the **indexed documents**, here is what I found:\n\n- The relevant policy documents are being cross-referenced\n- Results are ranked by semantic relevance and recency\n\n> This is a simulated response. Connect to the EKIP AI backend for live answers.",
        timestamp: new Date(),
        citations: [1, 2],
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 2200);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleCitationExpand = (id: number) => {
    setExpandedCitations((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2D45; border-radius: 3px; }
        textarea { resize: none; }
      `}</style>

      <EKIPSidebar items={nav} settingsPath={settingsPath} onLogout={handleLogout} />

      {/* Middle: Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            background: COLORS.card,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "0 20px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                }}
              />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Leave Policy Q&A</span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: `${COLORS.accent}22`,
                color: COLORS.accent,
                borderRadius: 6,
                padding: "3px 8px",
                letterSpacing: "0.02em",
              }}
            >
              EKIP v4.2
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[
              { icon: Copy, label: "Copy Answer" },
              { icon: RefreshCw, label: "Regenerate" },
              { icon: FileDown, label: "Export PDF" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                title={label}
                style={{
                  background: "transparent",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: "6px 10px",
                  color: COLORS.muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
            <button
              onClick={() => setSavedConversation((p) => !p)}
              title="Save Conversation"
              style={{
                background: savedConversation ? `${COLORS.accent}22` : "transparent",
                border: `1px solid ${savedConversation ? COLORS.accent : COLORS.border}`,
                borderRadius: 8,
                padding: "6px 10px",
                color: savedConversation ? COLORS.accent : COLORS.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontFamily: "inherit",
              }}
            >
              <Bookmark size={14} fill={savedConversation ? COLORS.accent : "none"} />
            </button>
            <button
              onClick={() => setCitationPanelOpen((p) => !p)}
              style={{
                background: citationPanelOpen ? COLORS.accent : "transparent",
                border: `1px solid ${citationPanelOpen ? COLORS.accent : COLORS.border}`,
                borderRadius: 8,
                padding: "6px 12px",
                color: citationPanelOpen ? "white" : COLORS.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              <Database size={14} />
              Sources
              {citationPanelOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 24 }}>
              {msg.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "70%" }}>
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.accent}, #1D4ED8)`,
                        borderRadius: "16px 4px 16px 16px",
                        padding: "12px 16px",
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "white",
                      }}
                    >
                      {msg.content}
                    </div>
                    <div style={{ textAlign: "right", marginTop: 4, fontSize: 11, color: COLORS.muted }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${COLORS.accent}, #7C3AED)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={16} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        background: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "4px 16px 16px 16px",
                        padding: "14px 18px",
                        color: COLORS.text,
                      }}
                    >
                      {renderAIContent(msg.content)}
                    </div>
                    {/* Citation chips */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        {msg.citations.map((cId) => {
                          const c = CITATIONS.find((x) => x.id === cId);
                          if (!c) return null;
                          return (
                            <span
                              key={cId}
                              style={{
                                fontSize: 11,
                                background: `${COLORS.accent}18`,
                                border: `1px solid ${COLORS.accent}44`,
                                color: COLORS.accent,
                                borderRadius: 6,
                                padding: "2px 8px",
                                cursor: "pointer",
                              }}
                            >
                              #{cId} {c.docName.split(" ").slice(0, 2).join(" ")}…
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {/* Message actions */}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {[
                        {
                          icon: copiedMsgId === msg.id ? Check : Copy,
                          action: () => copyMessage(msg.id, msg.content),
                          active: copiedMsgId === msg.id,
                          label: "Copy",
                        },
                        { icon: RefreshCw, action: () => {}, active: false, label: "Regenerate" },
                        { icon: ThumbsUp, action: () => {}, active: false, label: "Good" },
                        { icon: ThumbsDown, action: () => {}, active: false, label: "Bad" },
                      ].map(({ icon: Icon, action, active, label }) => (
                        <button
                          key={label}
                          onClick={action}
                          title={label}
                          style={{
                            background: active ? `${COLORS.accent}22` : "transparent",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 8px",
                            color: active ? COLORS.accent : COLORS.muted,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontFamily: "inherit",
                          }}
                        >
                          <Icon size={13} />
                        </button>
                      ))}
                      <span style={{ fontSize: 11, color: COLORS.muted, alignSelf: "center", marginLeft: 4 }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        <div
          style={{
            padding: "10px 20px 0",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: "5px 12px",
                color: COLORS.muted,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = COLORS.accent;
                (e.target as HTMLButtonElement).style.color = COLORS.text;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor = COLORS.border;
                (e.target as HTMLButtonElement).style.color = COLORS.muted;
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "12px 20px 16px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your enterprise documents…"
              rows={2}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: COLORS.text,
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: "inherit",
                maxHeight: 120,
                overflowY: "auto",
              }}
            />
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setIsRecording((p) => !p)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isRecording ? "#EF444422" : "transparent",
                  border: `1px solid ${isRecording ? "#EF4444" : COLORS.border}`,
                  color: isRecording ? "#EF4444" : COLORS.muted,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: isRecording ? "pulse 1s infinite" : "none",
                }}
              >
                <Mic size={16} />
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: input.trim() ? COLORS.accent : COLORS.border,
                  border: "none",
                  color: "white",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  background: "#10B98118",
                  color: "#10B981",
                  border: "1px solid #10B98133",
                  borderRadius: 6,
                  padding: "2px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Shield size={10} /> Enterprise encrypted
              </span>
              <span
                style={{
                  fontSize: 11,
                  background: `${COLORS.accent}18`,
                  color: COLORS.accent,
                  border: `1px solid ${COLORS.accent}33`,
                  borderRadius: 6,
                  padding: "2px 8px",
                }}
              >
                3 sources active
              </span>
            </div>
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              AI may make mistakes. Verify critical information with source documents.
            </span>
          </div>
        </div>
      </div>

      {/* Right: Citation Panel */}
      {citationPanelOpen && (
        <div
          style={{
            width: 320,
            background: COLORS.card,
            borderLeft: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Source Citations</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>3 verified sources</div>
            </div>
            <button
              onClick={() => setCitationPanelOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: COLORS.muted,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {CITATIONS.map((c) => (
              <CitationCard
                key={c.id}
                citation={c}
                expanded={expandedCitations.includes(c.id)}
                onToggle={() => toggleCitationExpand(c.id)}
              />
            ))}

            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Related Documents
              </div>
              {RELATED_DOCS.map((doc) => (
                <div
                  key={doc.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                      {doc.category} · {doc.pages}p
                    </div>
                  </div>
                  <ChevronRight size={14} color={COLORS.muted} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
