import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LayoutDashboard, MessageSquare, BookOpen, FileText, History, UserCircle, Bell, Search, Brain, ArrowRight, TrendingUp, TrendingDown, Bookmark, Clock, ExternalLink, CheckCircle2, AlertCircle, Info, X, Zap, Star, Database, Network, Shield, Eye, MoreHorizontal, Loader2, Download } from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const SEARCHES = [
  { id: "1", query: "Q3 procurement policy updates", results: 47, time: "2 min ago", tag: "Procurement", tagColor: "#06B6D4" },
  { id: "2", query: "SOC 2 audit requirements 2026", results: 23, time: "38 min ago", tag: "Compliance", tagColor: "#8B5CF6" },
  { id: "3", query: "API rate limiting best practices", results: 91, time: "1h ago", tag: "Engineering", tagColor: "#6366F1" },
  { id: "4", query: "Employee onboarding checklist", results: 12, time: "3h ago", tag: "HR", tagColor: "#10B981" },
  { id: "5", query: "Data retention regulatory framework", results: 34, time: "Yesterday", tag: "Legal", tagColor: "#F97316" },
];

const DOCUMENTS = [
  { id: "1", title: "Enterprise Data Classification Framework v3.2", category: "Compliance", viewed: "Just now", saved: true, color: "#8B5CF6" },
  { id: "2", title: "Q2 2026 Board Strategy Presentation", category: "Executive", viewed: "12 min ago", saved: false, color: "#7C3AED" },
  { id: "3", title: "Vendor Risk Assessment Protocol", category: "Procurement", viewed: "1h ago", saved: true, color: "#06B6D4" },
  { id: "4", title: "APAC Region Expansion Playbook", category: "Strategy", viewed: "Yesterday", saved: false, color: "#2563EB" },
  { id: "5", title: "Security Incident Response Runbook", category: "Security", viewed: "2 days ago", saved: false, color: "#EF4444" },
];

const NOTIFS = [
  { id: "1", type: "success", title: "Document indexed", body: "\"APAC Expansion Playbook\" is now searchable.", time: "5 min ago", read: false },
  { id: "2", type: "warning", title: "Knowledge base sync", body: "SharePoint connector requires re-authentication.", time: "1h ago", read: false },
  { id: "3", type: "info", title: "AI model updated", body: "EKIP Reasoning Engine upgraded to v4.2.", time: "3h ago", read: true },
  { id: "4", type: "info", title: "Weekly digest ready", body: "Your personalized knowledge summary is available.", time: "Yesterday", read: true },
];

const AI_SUGGESTIONS = [
  "Summarize last quarter's compliance updates",
  "Compare vendor risk scores for 2026",
  "Draft onboarding email for new hires",
  "What changed in our data retention policy?",
];

const SPARK = [34, 52, 41, 78, 65, 20, 15];
const sparkData = SPARK.map((v, i) => ({ i, v }));

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [docs, setDocs] = useState(DOCUMENTS);
  const [notifs, setNotifs] = useState(NOTIFS);
  const [searches, setSearches] = useState(SEARCHES);
  const [aiInput, setAiInput] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  // Modals
  const [selectedSearch, setSelectedSearch] = useState<typeof SEARCHES[0] | null>(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<typeof DOCUMENTS[0] | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);

  const [selectedNotif, setSelectedNotif] = useState<typeof NOTIFS[0] | null>(null);

  // Success State
  const [successMsg, setSuccessMsg] = useState("");

  // Loading actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const unread = notifs.filter((n) => !n.read).length;
  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDocs((ds) => ds.map((d) => d.id === id ? { ...d, saved: !d.saved } : d));
    const isSaving = docs.find(d => d.id === id)?.saved === false;
    if (isSaving) {
      setSuccessMsg("Document saved!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };
  const dismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifs((ns) => ns.filter((n) => n.id !== id));
  };
  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));

  const handleSearchClick = (search: typeof SEARCHES[0]) => {
    setIsLoadingSearch(true);
    setSelectedSearch(search);
    setTimeout(() => setIsLoadingSearch(false), 800);
  };

  const handleDocClick = (doc: typeof DOCUMENTS[0]) => {
    setIsLoadingDoc(true);
    setSelectedDoc(doc);
    setTimeout(() => setIsLoadingDoc(false), 800);
  };

  const handleNotifClick = (notif: typeof NOTIFS[0]) => {
    setSelectedNotif(notif);
  };

  const handleQuickAction = (path: string, key: string) => {
    setActionLoading(key);
    setTimeout(() => {
      navigate(path);
    }, 600);
  };

  const NotifIcon = ({ type }: { type: string }) => {
    if (type === "success") return <CheckCircle2 className="w-4 h-4" style={{ color: "#10B981" }} />;
    if (type === "warning") return <AlertCircle className="w-4 h-4" style={{ color: "#F59E0B" }} />;
    return <Info className="w-4 h-4" style={{ color: "#60A5FA" }} />;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif", background: "#0C1525", color: "#E8EFF8" }}>
      <EKIPSidebar items={NAV} subtitle="Employee Portal" subtitleColor="#60A5FA40" settingsPath="/settings" onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="flex items-center gap-4 px-6 py-3 flex-shrink-0 relative z-50"
          style={{ background: "rgba(10,18,32,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#3D5A78" }} />
            <input type="search" placeholder="Search documents, knowledge, people…"
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }} />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <button onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#3D5A78" }}>
                <Bell className="w-4 h-4" />
                {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: "#2563EB" }}>{unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl z-50 shadow-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-sm font-bold text-white">Notifications</span>
                    <button onClick={markAllRead} className="text-xs font-semibold text-blue-400">Mark all read</button>
                  </div>
                  {notifs.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3" style={{ background: n.read ? "transparent" : "rgba(37,99,235,0.07)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <NotifIcon type={n.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                      </div>
                      <button onClick={() => dismiss(n.id)} className="text-slate-600 hover:text-slate-400"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-6 mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <button className="flex items-center gap-2.5 rounded-xl px-3 py-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>JR</div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">Jamie Reynolds</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Senior Analyst</p>
              </div>
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Welcome */}
          <div className="rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5"
            style={{ background: "linear-gradient(135deg,#1A2F5A,#0F2050,#0C1A40)", border: "1px solid rgba(37,99,235,0.25)" }}>
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%,rgba(37,99,235,0.3),transparent 60%)" }} />
            <div className="relative flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">Active Session</span>
              </div>
              <h1 className="text-xl font-extrabold text-white mb-1">Good afternoon, Jamie.</h1>
              <p className="text-sm text-blue-200/60 max-w-md">You have <span className="text-blue-300 font-semibold">34 searches</span> and <span className="text-blue-300 font-semibold">1,247 documents</span> accessed this week.</p>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
              <button onClick={() => handleQuickAction("/documents", "docs")} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 16px rgba(37,99,235,0.45)" }}>
                {actionLoading === "docs" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                View Documents
              </button>
              <button onClick={() => handleQuickAction("/ai-chat", "ai")} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#B8D4F5" }}>
                {actionLoading === "ai" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                Open AI Chat
              </button>
              <button onClick={() => handleQuickAction("/knowledge", "kb")} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#7AA4C8" }}>
                {actionLoading === "kb" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Open Knowledge Base
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Documents Accessed", value: "1,247", delta: "+18%", color: "#2563EB" },
              { label: "Searches This Week", value: "34", delta: "-4%", color: "#06B6D4" },
              { label: "Saved Documents", value: "89", delta: "Stable", color: "#8B5CF6" },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(145deg,#111D30,#131F33)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{k.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${k.color}18`, color: k.color }}>{k.delta}</span>
                </div>
                <span className="text-3xl font-extrabold tracking-tight text-white">{k.value}</span>
                <div className="h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`sg${k.label}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={k.color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={k.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={k.color} strokeWidth={1.5} fill={`url(#sg${k.label})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* Recent searches + AI */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2.5"><History className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-bold text-white">Recent Searches</h3></div>
                <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">View all<ArrowRight className="w-3 h-3" /></button>
              </div>
              {searches.length === 0 ? (
                <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                  <Search className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-300">No recent searches</p>
                  <p className="text-xs text-slate-500 mt-1">Your search history will appear here.</p>
                </div>
              ) : (
                searches.map((s) => (
                  <div key={s.id} onClick={() => handleSearchClick(s)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.025] transition-colors cursor-pointer" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <Search className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    <span className="flex-1 text-sm text-slate-300 truncate">{s.query}</span>
                    <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "#3D5A78" }}>{s.results} hits</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${s.tagColor}18`, color: s.tagColor }}>{s.tag}</span>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{s.time}</span>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2 rounded-2xl flex flex-col relative overflow-hidden" style={{ background: "linear-gradient(145deg,#111D30,#0E1928)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-4 relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2.5"><Zap className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-bold text-white">AI Assistant</h3></div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.2)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}>v4.2</span>
              </div>
              <div className="flex-1 px-5 py-4 flex flex-col gap-3">
                <p className="text-xs text-slate-500">Suggested prompts:</p>
                {AI_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => navigate("/ai-chat")}
                    className="flex items-start gap-2.5 text-left rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#93B8D4" }}>
                    <Zap className="w-3 h-3 text-blue-400/60 flex-shrink-0 mt-0.5" />{s}
                  </button>
                ))}
                <div className="mt-auto flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
                  <input type="text" placeholder="Ask EKIP anything…" value={aiInput} onChange={(e) => setAiInput(e.target.value)}
                    className="flex-1 text-xs bg-transparent outline-none placeholder-slate-600 text-slate-200" />
                  <button onClick={() => { if (aiInput.trim()) navigate("/ai-chat"); }} disabled={!aiInput.trim()}
                    className="rounded-lg p-1.5 transition-all disabled:opacity-40" style={{ background: aiInput.trim() ? "#2563EB" : "transparent" }}>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Docs + Notifs */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-2">
            <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2.5"><FileText className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-bold text-white">Recently Viewed</h3></div>
                <button onClick={() => navigate("/documents")} className="text-xs font-semibold text-blue-400 flex items-center gap-1">View all<ArrowRight className="w-3 h-3" /></button>
              </div>
              {docs.length === 0 ? (
                <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-300">No recent documents</p>
                  <p className="text-xs text-slate-500 mt-1">Documents you view will appear here.</p>
                </div>
              ) : (
                docs.map((doc) => (
                  <div key={doc.id} onClick={() => handleDocClick(doc)} className="flex items-center gap-3 px-5 py-3.5 group cursor-pointer hover:bg-white/[0.025] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${doc.color}15`, border: `1px solid ${doc.color}25` }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: doc.color }} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate group-hover:text-blue-400 transition-colors">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${doc.color}14`, color: doc.color }}>{doc.category}</span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{doc.viewed}</span>
                      </div>
                    </div>
                    <button onClick={(e) => toggleSave(e, doc.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                      <Bookmark className="w-3.5 h-3.5" style={{ color: doc.saved ? "#2563EB" : "#3D5A78", fill: doc.saved ? "#2563EB" : "none" }} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-400"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2 rounded-2xl flex flex-col overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unread > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "#2563EB" }}>{unread}</span>}
                </div>
                <button onClick={markAllRead} className="text-xs font-semibold text-blue-400">Mark all read</button>
              </div>
              {notifs.length === 0 ? (
                <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                  <Bell className="w-8 h-8 text-slate-600 mb-3" />
                  <p className="text-sm font-medium text-slate-300">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">You have no new notifications.</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div key={n.id} onClick={() => handleNotifClick(n)} className="flex items-start gap-3 px-5 py-3.5 relative cursor-pointer hover:bg-white/[0.02]" style={{ background: n.read ? "transparent" : "rgba(37,99,235,0.05)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {!n.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r-full" style={{ background: "#2563EB" }} />}
                    <div className="mt-0.5 flex-shrink-0">
                      {n.type === "success" ? <CheckCircle2 className="w-4 h-4" style={{ color: "#10B981" }} /> : n.type === "warning" ? <AlertCircle className="w-4 h-4" style={{ color: "#F59E0B" }} /> : <Info className="w-4 h-4" style={{ color: "#60A5FA" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                    </div>
                    <button onClick={(e) => dismiss(e, n.id)} className="text-slate-700 hover:text-slate-500 transition-colors"><X className="w-3 h-3" /></button>
                  </div>
                ))
              )}
              <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">View all notifications<ArrowRight className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {notifOpen && <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Search Details Modal */}
      {selectedSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-200" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Search Details</h2>
              <button onClick={() => setSelectedSearch(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            {isLoadingSearch ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-400">Loading search details...</p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-1">Query</p>
                  <p className="text-base font-semibold text-white">{selectedSearch.query}</p>
                </div>
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Date</p>
                    <p className="text-sm text-slate-200">{selectedSearch.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Results</p>
                    <p className="text-sm text-slate-200">{selectedSearch.results} hits</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Category</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded inline-block" style={{ background: `${selectedSearch.tagColor}18`, color: selectedSearch.tagColor }}>{selectedSearch.tag}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-sm font-semibold text-slate-300">Result summary</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    We found {selectedSearch.results} documents matching "{selectedSearch.query}". Most relevant results are from the {selectedSearch.tag} category.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-200" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Document Viewer</h2>
              <button onClick={() => setSelectedDoc(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            {isLoadingDoc ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-sm text-slate-400">Loading document...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${selectedDoc.color}15`, border: `1px solid ${selectedDoc.color}25` }}>
                    <FileText className="w-6 h-6" style={{ color: selectedDoc.color }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 leading-tight">{selectedDoc.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${selectedDoc.color}14`, color: selectedDoc.color }}>{selectedDoc.category}</span>
                      <span className="text-xs text-slate-500">Last viewed {selectedDoc.viewed}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-xl flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-5/6 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                  <div className="h-3 w-4/5 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/10" />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-300 hover:bg-white/5 transition-colors">Close</button>
                  <button className="px-4 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 transition-opacity hover:opacity-90" style={{ background: "#2563EB" }}>
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 relative flex flex-col gap-4 animate-in zoom-in-95 duration-200" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Notification</h2>
              <button onClick={() => setSelectedNotif(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                {selectedNotif.type === "success" ? <CheckCircle2 className="w-6 h-6" style={{ color: "#10B981" }} /> : selectedNotif.type === "warning" ? <AlertCircle className="w-6 h-6" style={{ color: "#F59E0B" }} /> : <Info className="w-6 h-6" style={{ color: "#60A5FA" }} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{selectedNotif.title}</h3>
                <p className="text-sm text-slate-300 mb-3">{selectedNotif.body}</p>
                <p className="text-xs text-slate-500">{selectedNotif.time}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setSelectedNotif(null)} className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-300 hover:bg-white/5 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:9999px}`}</style>
    </div>
  );
}
