import { useState, useId } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, MessageSquare, FileText, BarChart2, History, UserCircle,
  RefreshCw, Bell, TrendingUp, TrendingDown, Upload, Search,
  FileSpreadsheet, FileType, ChevronDown, X, Check, Loader2
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";

const NAV: SidebarNavItem[] = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

const PERIOD_DATA: Record<string, { label: string; searches: number; uploads: number; views: number }[]> = {
  "7d": [
    { label: "Mon", searches: 28, uploads: 12, views: 45 },
    { label: "Tue", searches: 34, uploads: 8, views: 52 },
    { label: "Wed", searches: 22, uploads: 15, views: 38 },
    { label: "Thu", searches: 41, uploads: 11, views: 67 },
    { label: "Fri", searches: 37, uploads: 19, views: 58 },
    { label: "Sat", searches: 14, uploads: 4, views: 22 },
    { label: "Sun", searches: 9, uploads: 2, views: 15 },
  ],
  "30d": [
    { label: "W1", searches: 142, uploads: 54, views: 231 },
    { label: "W2", searches: 168, uploads: 67, views: 278 },
    { label: "W3", searches: 134, uploads: 48, views: 198 },
    { label: "W4", searches: 189, uploads: 72, views: 312 },
  ],
  "90d": [
    { label: "Jan", searches: 520, uploads: 198, views: 840 },
    { label: "Feb", searches: 612, uploads: 231, views: 970 },
    { label: "Mar", searches: 589, uploads: 215, views: 910 },
  ],
};

const DEPT_PIE = [
  { name: "Engineering", value: 312, color: "#2563EB" },
  { name: "HR", value: 189, color: "#7C3AED" },
  { name: "Finance", value: 234, color: "#0891B2" },
  { name: "Legal", value: 145, color: "#059669" },
  { name: "Sales", value: 267, color: "#D97706" },
  { name: "Operations", value: 100, color: "#DC2626" },
];

const DEPT_TRENDS = [
  { dept: "Engineering", searches: 312, growth: 18 },
  { dept: "Sales", searches: 267, growth: 12 },
  { dept: "Finance", searches: 234, growth: -3 },
  { dept: "HR", searches: 189, growth: 7 },
  { dept: "Legal", searches: 145, growth: 22 },
  { dept: "Operations", searches: 100, growth: -8 },
];

const TOP_QUERIES = [
  { rank: 1, query: "Q4 compliance requirements", dept: "Legal", count: 87, delta: 12 },
  { rank: 2, query: "Employee benefits 2026", dept: "HR", count: 74, delta: -5 },
  { rank: 3, query: "Budget allocation process", dept: "Finance", count: 68, delta: 8 },
  { rank: 4, query: "API documentation v3", dept: "Engineering", count: 62, delta: 31 },
  { rank: 5, query: "Sales pipeline template", dept: "Sales", count: 58, delta: -2 },
  { rank: 6, query: "Onboarding checklist", dept: "HR", count: 51, delta: 15 },
  { rank: 7, query: "Cloud infrastructure cost", dept: "Engineering", count: 44, delta: 6 },
  { rank: 8, query: "Contract review process", dept: "Legal", count: 39, delta: -11 },
];

const EMPLOYEES = [
  { name: "Sarah Chen", dept: "Engineering", status: "active", searches: 42, uploads: 8, docs: 127, lastActive: "2m ago", avatar: "SC" },
  { name: "Marcus Johnson", dept: "Sales", status: "active", searches: 31, uploads: 5, docs: 89, lastActive: "5m ago", avatar: "MJ" },
  { name: "Priya Patel", dept: "HR", status: "away", searches: 28, uploads: 12, docs: 104, lastActive: "23m ago", avatar: "PP" },
  { name: "David Kim", dept: "Finance", status: "active", searches: 19, uploads: 3, docs: 76, lastActive: "1m ago", avatar: "DK" },
  { name: "Lisa Torres", dept: "Legal", status: "offline", searches: 14, uploads: 7, docs: 58, lastActive: "2h ago", avatar: "LT" },
  { name: "James Wright", dept: "Engineering", status: "active", searches: 37, uploads: 9, docs: 143, lastActive: "8m ago", avatar: "JW" },
  { name: "Nina Okonkwo", dept: "Operations", status: "away", searches: 11, uploads: 2, docs: 44, lastActive: "45m ago", avatar: "NO" },
];

const UPLOADS = [
  { name: "Q4 Compliance Report.pdf", dept: "Legal", status: "Indexed", uploader: "LT", time: "12m ago", size: "2.4 MB", type: "pdf" },
  { name: "Engineering Roadmap.xlsx", dept: "Engineering", status: "Processing", uploader: "JW", time: "34m ago", size: "1.1 MB", type: "xlsx" },
  { name: "HR Policy Update.pdf", dept: "HR", status: "Indexed", uploader: "PP", time: "1h ago", size: "840 KB", type: "pdf" },
  { name: "Sales Deck Q1.pptx", dept: "Sales", status: "Failed", uploader: "MJ", time: "2h ago", size: "5.7 MB", type: "img" },
  { name: "Budget Analysis 2026.xlsx", dept: "Finance", status: "Indexed", uploader: "DK", time: "3h ago", size: "3.2 MB", type: "xlsx" },
];

const NOTIFICATIONS = [
  { id: 1, text: "5 documents indexed successfully", time: "3m ago", read: false },
  { id: 2, text: "Employee upload quota at 85%", time: "1h ago", read: false },
  { id: 3, text: "Weekly analytics report ready", time: "2h ago", read: true },
];

const DEPT_COLORS: Record<string, string> = {
  Legal: "#059669", Engineering: "#2563EB", HR: "#7C3AED",
  Finance: "#0891B2", Sales: "#D97706", Operations: "#DC2626",
};

const STATUS_DOT: Record<string, string> = {
  active: "#22C55E", away: "#F59E0B", offline: "#6B7280",
};

const statusPillStyle = (s: string) =>
  s === "Indexed"
    ? { background: "rgba(34,197,94,0.15)", color: "#22C55E" }
    : s === "Processing"
    ? { background: "rgba(245,158,11,0.15)", color: "#F59E0B" }
    : { background: "rgba(239,68,68,0.15)", color: "#EF4444" };

const FileIcon = ({ type }: { type: string }) => {
  if (type === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
  if (type === "xlsx") return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
  return <FileType className="w-4 h-4 text-blue-400" />;
};

const DARK_TOOLTIP_STYLE = {
  contentStyle: { background: "#1A2B45", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, color: "#E8EFF8" },
  cursor: { fill: "rgba(37,99,235,0.07)" },
};

function SparkKPI({
  label, value, sub, delta, positive, data,
}: {
  label: string; value: string; sub?: string; delta: string; positive: boolean;
  data: { v: number }[];
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#4A6080" }}>{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
          {sub && <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>{sub}</p>}
        </div>
        <span
          className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: positive ? "#22C55E" : "#EF4444" }}
        >
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={positive ? "#22C55E" : "#EF4444"} stopOpacity={0.4} />
                <stop offset="95%" stopColor={positive ? "#22C55E" : "#EF4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={positive ? "#22C55E" : "#EF4444"} strokeWidth={1.5} fill={`url(#spark-${uid})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");
  const [spinning, setSpinning] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  // New Modals State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<typeof EMPLOYEES[0] | null>(null);
  
  const [previewDoc, setPreviewDoc] = useState<typeof UPLOADS[0] | null>(null);

  const handleUploadSubmit = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadOpen(false);
      }, 1500);
    }, 2000);
  };

  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const activityData = PERIOD_DATA[period];

  const areaId1 = useId().replace(/:/g, "");
  const areaId2 = useId().replace(/:/g, "");
  const areaId3 = useId().replace(/:/g, "");

  const doRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1200);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0C1525", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <EKIPSidebar items={NAV} subtitle="Manager" subtitleColor="rgba(37,99,235,0.5)" settingsPath="/manager-settings" onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3"
          style={{ background: "rgba(12,21,37,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-lg font-extrabold text-white tracking-tight">Manager Dashboard</h1>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
            <span className="text-xs ml-2" style={{ color: "#4A6080" }}>June 20, 2026</span>
          </div>

          <div className="flex items-center gap-1 rounded-xl p-0.5" style={{ background: "#111D30" }}>
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={period === p ? { background: "#2563EB", color: "#fff" } : { color: "#4A6080" }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={doRefresh}
            className="p-2 rounded-xl transition-all"
            style={{ background: "#111D30", color: "#4A6080" }}
          >
            <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
          </button>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs((v) => !v)}
              className="p-2 rounded-xl relative"
              style={{ background: "#111D30", color: "#4A6080" }}
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white" style={{ background: "#EF4444" }}>
                  {unread}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-10 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4" style={{ color: "#4A6080" }} /></button>
                </div>
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex gap-3 items-start" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: n.read ? 0.5 : 1 }}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-600" : "bg-blue-500"}`} />
                    <div>
                      <p className="text-xs text-white">{n.text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 ml-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>AM</div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">Alex Morgan</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>Department Manager</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/ai-chat")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#111D30", border: "1px solid rgba(37,99,235,0.3)", color: "#60A5FA" }}
            >
              <MessageSquare className="w-4 h-4" /> Open AI Chat
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "#111D30", border: "1px solid rgba(124,58,237,0.3)", color: "#A78BFA" }}
            >
              <BarChart2 className="w-4 h-4" /> View Analytics
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 cursor-pointer"
              style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <SparkKPI
              label="Documents Accessed"
              value="1,247"
              delta="18%"
              positive
              data={[{v:900},{v:980},{v:1050},{v:1100},{v:1180},{v:1220},{v:1247}]}
            />
            <SparkKPI
              label="Active Employees"
              value="47"
              delta="+2"
              positive
              data={[{v:40},{v:42},{v:43},{v:44},{v:45},{v:46},{v:47}]}
            />
            <SparkKPI
              label="Searches This Week"
              value="34"
              delta="4%"
              positive={false}
              data={[{v:42},{v:40},{v:39},{v:37},{v:36},{v:35},{v:34}]}
            />
            <SparkKPI
              label="Uploads This Month"
              value="73"
              delta="4%"
              positive={false}
              data={[{v:84},{v:82},{v:80},{v:78},{v:77},{v:75},{v:73}]}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Activity area chart */}
            <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white">Activity Overview</p>
                <div className="flex items-center gap-3 text-[10px] font-semibold" style={{ color: "#4A6080" }}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Searches</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />Uploads</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" />Views</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`act1-${areaId1}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`act2-${areaId2}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id={`act3-${areaId3}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...DARK_TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="searches" stroke="#2563EB" strokeWidth={2} fill={`url(#act1-${areaId1})`} dot={false} />
                  <Area type="monotone" dataKey="uploads" stroke="#7C3AED" strokeWidth={2} fill={`url(#act2-${areaId2})`} dot={false} />
                  <Area type="monotone" dataKey="views" stroke="#0891B2" strokeWidth={2} fill={`url(#act3-${areaId3})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut pie */}
            <div 
              className="rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/5" 
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}
              onClick={() => setAnalyticsOpen(true)}
            >
              <p className="text-sm font-bold text-white mb-4">Docs by Department</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={DEPT_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {DEPT_PIE.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1A2B45", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, color: "#E8EFF8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {DEPT_PIE.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span style={{ color: "#A0AFBF" }}>{d.name}</span>
                    </div>
                    <span className="font-semibold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dept trends + top queries */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Dept search trends */}
            <div 
              className="rounded-2xl p-5 cursor-pointer transition-all hover:bg-white/5" 
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}
              onClick={() => setAnalyticsOpen(true)}
            >
              <p className="text-sm font-bold text-white mb-4">Department Search Trends</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={DEPT_TRENDS} layout="vertical" margin={{ top: 0, right: 40, left: 60, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="dept" tick={{ fill: "#A0AFBF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...DARK_TOOLTIP_STYLE} />
                  <Bar dataKey="searches" radius={[0, 6, 6, 0]}>
                    {DEPT_TRENDS.map((d, i) => <Cell key={i} fill={DEPT_COLORS[d.dept] || "#2563EB"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {DEPT_TRENDS.map((d) => (
                  <div key={d.dept} className="flex items-center gap-3">
                    <div className="w-24 text-[10px] font-semibold truncate" style={{ color: "#A0AFBF" }}>{d.dept}</div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(d.searches / 312) * 100}%`, background: DEPT_COLORS[d.dept] || "#2563EB" }} />
                    </div>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: d.growth >= 0 ? "#22C55E" : "#EF4444", minWidth: 36, textAlign: "right" }}
                    >
                      {d.growth >= 0 ? "+" : ""}{d.growth}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top search queries */}
            <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white mb-4">Top Search Queries</p>
              <div className="space-y-2">
                {TOP_QUERIES.map((q) => (
                  <div key={q.rank} className="flex items-center gap-3 py-1.5 rounded-xl px-2" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-extrabold" style={{ background: q.rank <= 3 ? "#2563EB" : "rgba(255,255,255,0.06)", color: q.rank <= 3 ? "#fff" : "#4A6080" }}>
                      {q.rank}
                    </span>
                    <Search className="w-3 h-3 flex-shrink-0" style={{ color: "#4A6080" }} />
                    <p className="flex-1 text-xs truncate" style={{ color: "#E8EFF8" }}>{q.query}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${DEPT_COLORS[q.dept]}22`, color: DEPT_COLORS[q.dept] || "#2563EB" }}>{q.dept}</span>
                    <span className="text-[10px] font-semibold text-white w-6 text-right">{q.count}</span>
                    <span className="text-[10px] font-bold w-9 text-right" style={{ color: q.delta >= 0 ? "#22C55E" : "#EF4444" }}>
                      {q.delta >= 0 ? "+" : ""}{q.delta}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employee activity table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white">Employee Activity</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}>This week</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {["Employee", "Department", "Searches", "Uploads", "Docs Accessed", "Status", "Last Active"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EMPLOYEES.map((e) => (
                    <tr 
                      key={e.name} 
                      className="transition-all cursor-pointer hover:bg-white/5" 
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onClick={() => {
                        setSelectedEmployee(e);
                        setActivityOpen(true);
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>{e.avatar}</div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#111D30]" style={{ background: STATUS_DOT[e.status] }} />
                          </div>
                          <span className="font-semibold text-white">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${DEPT_COLORS[e.dept]}22`, color: DEPT_COLORS[e.dept] }}>{e.dept}</span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-white">{e.searches}</td>
                      <td className="px-5 py-3 font-semibold text-white">{e.uploads}</td>
                      <td className="px-5 py-3 font-semibold text-white">{e.docs}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_DOT[e.status]}22`, color: STATUS_DOT[e.status] }}>{e.status}</span>
                      </td>
                      <td className="px-5 py-3" style={{ color: "#4A6080" }}>{e.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent uploads + analytics strip */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white">Recent Uploads</p>
                <button 
                  onClick={() => setUploadOpen(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white cursor-pointer hover:opacity-90" 
                  style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}
                >
                  <Upload className="w-3 h-3" /> Upload
                </button>
              </div>
              <div className="space-y-2">
                {UPLOADS.map((u, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all" 
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                    onClick={() => setPreviewDoc(u)}
                  >
                    <FileIcon type={u.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-white">{u.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>{u.size} · {u.time}</p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${DEPT_COLORS[u.dept]}22`, color: DEPT_COLORS[u.dept] }}>{u.dept}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={statusPillStyle(u.status)}>{u.status}</span>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-extrabold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>{u.uploader}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics strip */}
            <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white">Analytics Summary</p>
              {[
                { label: "AI Accuracy", value: "94.2%", color: "#22C55E" },
                { label: "Knowledge Coverage", value: "87%", color: "#2563EB" },
                { label: "Compliance", value: "A+", color: "#7C3AED" },
                { label: "Uptime", value: "99.97%", color: "#0891B2" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-xs font-semibold" style={{ color: "#A0AFBF" }}>{m.label}</span>
                  <span className="text-base font-extrabold" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Upload Document</p>
              <button onClick={() => setUploadOpen(false)} disabled={isUploading} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {uploadSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-[#10B981]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm">Document uploaded successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <Upload className="w-8 h-8 mb-3" style={{ color: "#4A6080" }} />
                  <p className="text-sm font-semibold text-white mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs" style={{ color: "#4A6080" }}>PDF, XLSX, DOCX up to 10MB</p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setUploadOpen(false)} 
                    disabled={isUploading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/5" 
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080" }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUploadSubmit} 
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer" 
                    style={{ background: "#2563EB" }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                <p className="text-base font-bold text-white">Detailed Analytics View</p>
              </div>
              <button onClick={() => setAnalyticsOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
               <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xs font-semibold text-[#4A6080] mb-1">Most Active Dept</p>
                  <p className="text-xl font-bold text-white">Engineering</p>
                  <p className="text-[10px] text-green-400 mt-1">+18% vs last week</p>
               </div>
               <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xs font-semibold text-[#4A6080] mb-1">Total Dept Searches</p>
                  <p className="text-xl font-bold text-white">1,247</p>
                  <p className="text-[10px] text-green-400 mt-1">+4% vs last week</p>
               </div>
            </div>
            <p className="text-sm font-semibold text-white">Department Drill-down</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {DEPT_TRENDS.map(d => (
                  <div key={d.dept} className="flex justify-between items-center p-3 rounded-lg bg-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: DEPT_COLORS[d.dept] }} />
                        <span className="text-xs font-semibold text-white">{d.dept}</span>
                     </div>
                     <div className="flex items-center gap-4 text-xs" style={{ color: "#4A6080" }}>
                        <span>{d.searches} searches</span>
                        <span className={d.growth >= 0 ? "text-green-400" : "text-red-400"} style={{ color: d.growth >= 0 ? "#22C55E" : "#EF4444" }}>
                          {d.growth >= 0 ? "+" : ""}{d.growth}%
                        </span>
                     </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {activityOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Activity Details</p>
              <button onClick={() => setActivityOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4 border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>{selectedEmployee.avatar}</div>
               <div>
                  <p className="text-sm font-bold text-white">{selectedEmployee.name}</p>
                  <p className="text-[11px] capitalize" style={{ color: "#4A6080" }}>{selectedEmployee.dept} • {selectedEmployee.status}</p>
               </div>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-xs" style={{ color: "#4A6080" }}>Recent Searches</span>
                  <span className="text-xs font-semibold text-white">{selectedEmployee.searches} this week</span>
               </div>
               <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-xs" style={{ color: "#4A6080" }}>Documents Uploaded</span>
                  <span className="text-xs font-semibold text-white">{selectedEmployee.uploads}</span>
               </div>
               <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-xs" style={{ color: "#4A6080" }}>Docs Accessed</span>
                  <span className="text-xs font-semibold text-white">{selectedEmployee.docs}</span>
               </div>
               <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-xs" style={{ color: "#4A6080" }}>Last Active</span>
                  <span className="text-xs font-semibold text-white">{selectedEmployee.lastActive}</span>
               </div>
            </div>
            <button 
              onClick={() => setActivityOpen(false)} 
              className="w-full py-2.5 mt-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer" 
              style={{ background: "#2563EB" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "80vh" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <FileIcon type={previewDoc.type} />
                <div>
                   <p className="text-sm font-bold text-white">{previewDoc.name}</p>
                   <p className="text-[10px]" style={{ color: "#4A6080" }}>{previewDoc.dept} • {previewDoc.size}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-8 flex items-center justify-center min-h-[300px]" style={{ background: "rgba(0,0,0,0.2)" }}>
               <div className="text-center space-y-3">
                  <FileText className="w-16 h-16 mx-auto opacity-50" style={{ color: "#4A6080" }} />
                  <p className="text-sm font-medium" style={{ color: "#4A6080" }}>Document preview generation in progress...</p>
               </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-white/5" 
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080" }}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90" 
                style={{ background: "#2563EB" }}
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
