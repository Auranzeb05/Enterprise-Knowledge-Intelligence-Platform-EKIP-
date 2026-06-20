import { useState, useId } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  LayoutDashboard, Users, BarChart2, ClipboardList, Brain, FileText,
  Terminal, RefreshCw, Bell, ShieldCheck, TrendingUp, TrendingDown,
  UserPlus, Key, Eye, Settings, Download, Shield, X, CheckCircle,
  AlertTriangle, AlertCircle, Activity, LogIn, Upload, Search, UserCircle,
  Loader2, Edit2, Trash2, UserCog, ChevronRight
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";

const NAV: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

type Period = "24h" | "7d" | "30d";

const QUERY_DATA: Record<Period, { label: string; queries: number; ai: number }[]> = {
  "24h": [
    { label: "00:00", queries: 42, ai: 31 }, { label: "04:00", queries: 18, ai: 13 },
    { label: "08:00", queries: 87, ai: 65 }, { label: "12:00", queries: 134, ai: 101 },
    { label: "16:00", queries: 112, ai: 84 }, { label: "20:00", queries: 78, ai: 59 },
    { label: "Now", queries: 47, ai: 35 },
  ],
  "7d": [
    { label: "Mon", queries: 420, ai: 310 }, { label: "Tue", queries: 380, ai: 280 },
    { label: "Wed", queries: 510, ai: 390 }, { label: "Thu", queries: 460, ai: 340 },
    { label: "Fri", queries: 530, ai: 400 }, { label: "Sat", queries: 190, ai: 140 },
    { label: "Sun", queries: 140, ai: 100 },
  ],
  "30d": [
    { label: "W1", queries: 2100, ai: 1600 }, { label: "W2", queries: 2480, ai: 1890 },
    { label: "W3", queries: 2240, ai: 1700 }, { label: "W4", queries: 2710, ai: 2050 },
  ],
};

const USERS_TABLE = [
  { name: "Alex Morgan", avatar: "AM", role: "Super Admin", dept: "IT", sessions: 3, mfa: true, status: "active", gradient: "135deg,#EF4444,#DC2626" },
  { name: "Sarah Chen", avatar: "SC", role: "Manager", dept: "Engineering", sessions: 1, mfa: true, status: "active", gradient: "135deg,#2563EB,#7C3AED" },
  { name: "Marcus Johnson", avatar: "MJ", role: "Employee", dept: "Sales", sessions: 1, mfa: false, status: "active", gradient: "135deg,#D97706,#B45309" },
  { name: "Priya Patel", avatar: "PP", role: "Manager", dept: "HR", sessions: 2, mfa: true, status: "away", gradient: "135deg,#7C3AED,#6D28D9" },
  { name: "David Kim", avatar: "DK", role: "Employee", dept: "Finance", sessions: 1, mfa: true, status: "active", gradient: "135deg,#0891B2,#0E7490" },
  { name: "Lisa Torres", avatar: "LT", role: "Employee", dept: "Legal", sessions: 0, mfa: false, status: "offline", gradient: "135deg,#059669,#047857" },
  { name: "James Wright", avatar: "JW", role: "Manager", dept: "Engineering", sessions: 1, mfa: true, status: "active", gradient: "135deg,#2563EB,#1D4ED8" },
];

const SERVICES = [
  { name: "API Gateway", latency: "12ms", uptime: 99.99, healthy: true },
  { name: "Database Cluster", latency: "3ms", uptime: 99.97, healthy: true },
  { name: "AI Engine", latency: "248ms", uptime: 99.94, healthy: true },
  { name: "Vector Store", latency: "18ms", uptime: 99.89, healthy: true },
  { name: "Auth Service", latency: "8ms", uptime: 100, healthy: true },
  { name: "Storage Layer", latency: "24ms", uptime: 99.72, healthy: false },
];

const ROLES = [
  { name: "Super Admin", users: 2, color: "#EF4444" },
  { name: "Manager", users: 12, color: "#2563EB" },
  { name: "Employee", users: 187, color: "#7C3AED" },
  { name: "Viewer", users: 41, color: "#0891B2" },
  { name: "Guest", users: 12, color: "#4A6080" },
];

const SECURITY_ALERTS = [
  { severity: "high", msg: "Failed login attempts from 192.168.1.45 (×12)", time: "4m ago", resolved: false },
  { severity: "medium", msg: "MFA not enabled for 3 active employee accounts", time: "2h ago", resolved: false },
  { severity: "low", msg: "Storage Layer latency above threshold", time: "15m ago", resolved: false },
  { severity: "high", msg: "Unusual off-hours bulk document access detected", time: "6h ago", resolved: true },
  { severity: "medium", msg: "API rate limit warning: 89% of quota reached", time: "1d ago", resolved: true },
];

const NOTIFICATIONS = [
  { text: "User James Wright changed role", time: "3m ago" },
  { text: "Storage Layer health degraded", time: "15m ago" },
  { text: "Security scan completed - 2 findings", time: "1h ago" },
];

const RECENT_ACTIVITY = [
  { icon: LogIn, msg: "Sarah Chen logged in from new device", time: "2m ago", color: "#22C55E" },
  { icon: Upload, msg: "47 documents indexed by AI engine", time: "8m ago", color: "#2563EB" },
  { icon: Shield, msg: "Security policy updated by Alex Morgan", time: "22m ago", color: "#EF4444" },
  { icon: UserPlus, msg: "New employee Nina Okonkwo onboarded", time: "1h ago", color: "#7C3AED" },
  { icon: Search, msg: "Audit log export completed", time: "2h ago", color: "#0891B2" },
  { icon: Activity, msg: "System backup completed successfully", time: "3h ago", color: "#059669" },
];

const STATUS_DOT: Record<string, string> = { active: "#22C55E", away: "#F59E0B", offline: "#6B7280" };
const ROLE_COLORS: Record<string, string> = { "Super Admin": "#EF4444", Manager: "#2563EB", Employee: "#7C3AED", Viewer: "#0891B2", Guest: "#4A6080" };

const severityStyle = (s: string) => ({
  high: { border: "#EF4444", badge: { background: "rgba(239,68,68,0.12)", color: "#EF4444" } },
  medium: { border: "#F59E0B", badge: { background: "rgba(245,158,11,0.12)", color: "#F59E0B" } },
  low: { border: "#0891B2", badge: { background: "rgba(8,145,178,0.12)", color: "#0891B2" } },
}[s] || { border: "#4A6080", badge: { background: "rgba(74,96,128,0.12)", color: "#4A6080" } });

const DARK_TT = {
  contentStyle: { background: "#1A2B45", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, color: "#E8EFF8" },
  cursor: { fill: "rgba(239,68,68,0.07)" },
};

function SparkKPI({ label, value, sub, delta, positive, data, onClick }: {
  label: string; value: string; sub?: string; delta: string; positive: boolean; data: { v: number }[]; onClick?: () => void;
}) {
  const uid = useId().replace(/:/g, "");
  const col = positive ? "#22C55E" : "#EF4444";
  return (
    <div 
      className={`rounded-2xl p-4 flex flex-col gap-2 ${onClick ? "cursor-pointer hover:bg-white/5 transition-colors" : ""}`} 
      style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}
      onClick={onClick}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#4A6080" }}>{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
          {sub && <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>{sub}</p>}
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: col }}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`adm-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={col} stopOpacity={0.4} />
                <stop offset="95%" stopColor={col} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={col} strokeWidth={1.5} fill={`url(#adm-${uid})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* Custom SVG ring for storage */
function StorageRing({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={140} height={140} className="flex-shrink-0">
      <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
      <circle cx={70} cy={70} r={r} fill="none" stroke="#F59E0B" strokeWidth={14}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x={70} y={65} textAnchor="middle" fill="#F59E0B" fontSize={22} fontWeight={800}>{pct}%</text>
      <text x={70} y={82} textAnchor="middle" fill="#4A6080" fontSize={10} fontWeight={600}>Used</text>
    </svg>
  );
}

/* Admin badge sidebar element */
const AdminBadge = (
  <div className="rounded-xl p-3 mx-0" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
    <div className="flex items-center gap-2">
      <ShieldCheck className="w-4 h-4 text-red-400" strokeWidth={2} />
      <div>
        <p className="text-[10px] font-extrabold text-red-400 leading-none">Super Admin</p>
        <p className="text-[9px] mt-0.5 font-semibold" style={{ color: "rgba(239,68,68,0.6)" }}>All systems access</p>
      </div>
    </div>
  </div>
);

/* System mini panel for sidebar children */
const SystemPanel = (
  <div className="px-3 pb-3 pt-2">
    <p className="text-[9px] font-extrabold uppercase tracking-widest mb-2 px-1" style={{ color: "#4A6080" }}>System</p>
    {[
      { label: "API", uptime: "99.99%", ok: true },
      { label: "DB", uptime: "99.97%", ok: true },
      { label: "AI", uptime: "99.94%", ok: true },
    ].map((s) => (
      <div key={s.label} className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? "#22C55E" : "#EF4444" }} />
          <span className="text-[10px] font-semibold" style={{ color: "#4A6080" }}>{s.label}</span>
        </div>
        <span className="text-[10px] font-semibold text-white">{s.uptime}</span>
      </div>
    ))}
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [period, setPeriod] = useState<Period>("24h");
  const [spinning, setSpinning] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [alerts, setAlerts] = useState(SECURITY_ALERTS);

  const queryData = QUERY_DATA[period];
  const areaId1 = useId().replace(/:/g, "");
  const areaId2 = useId().replace(/:/g, "");
  const totalRoles = ROLES.reduce((s, r) => s + r.users, 0);

  // New Modals State
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);

  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState("");

  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

  const [aiMonitoringOpen, setAiMonitoringOpen] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");

  const handleAction = (setter: React.Dispatch<React.SetStateAction<boolean>>, closeSetter: React.Dispatch<React.SetStateAction<boolean>>, msg: string) => {
    setter(true);
    setTimeout(() => {
      setter(false);
      setSuccessMsg(msg);
      setTimeout(() => {
        setSuccessMsg("");
        closeSetter(false);
      }, 1500);
    }, 1500);
  };

  const resolveAlert = (i: number) => {
    setAlerts((prev) => prev.map((a, idx) => idx === i ? { ...a, resolved: true } : a));
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0C1525", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <EKIPSidebar
        items={NAV}
        subtitle="Admin Control"
        subtitleColor="rgba(239,68,68,0.5)"
        badge={AdminBadge}
        settingsPath="/admin-settings"
        onLogout={handleLogout}
      >
        {SystemPanel}
      </EKIPSidebar>

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 flex-wrap"
          style={{ background: "rgba(8,15,28,0.95)", borderBottom: "1px solid rgba(239,68,68,0.12)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Terminal className="w-5 h-5 text-red-400" strokeWidth={2} />
            <h1 className="text-lg font-extrabold text-white tracking-tight">Admin Control Center</h1>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
            <span className="text-[10px] hidden sm:block ml-1" style={{ color: "#4A6080" }}>
              Platform v4.2 · All 6 services operational · June 20, 2026 09:42 UTC
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl p-0.5" style={{ background: "#111D30" }}>
            {(["24h", "7d", "30d"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={period === p ? { background: "#EF4444", color: "#fff" } : { color: "#4A6080" }}>{p}</button>
            ))}
          </div>

          <button onClick={() => { setSpinning(true); setTimeout(() => setSpinning(false), 1200); }}
            className="p-2 rounded-xl" style={{ background: "#111D30", color: "#4A6080" }}>
            <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
          </button>

          {/* Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs((v) => !v)} className="p-2 rounded-xl relative" style={{ background: "#111D30", color: "#4A6080" }}>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white" style={{ background: "#EF4444" }}>3</span>
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-10 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(239,68,68,0.15)" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm font-bold text-white">Admin Alerts</span>
                  <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4" style={{ color: "#4A6080" }} /></button>
                </div>
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="px-4 py-3 flex gap-3 items-start" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
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
          <button onClick={() => navigate("/admin-profile")} className="flex items-center gap-2 ml-1 cursor-pointer transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white" style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)" }}>AM</div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-none">Alex Morgan</p>
              <p className="text-[10px] mt-0.5 text-red-400">Super Admin</p>
            </div>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Add User", icon: UserPlus, color: "#22C55E", bg: "rgba(34,197,94,0.12)", action: () => setCreateUserOpen(true) },
              { label: "Assign Role", icon: Key, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", action: () => setAssignRoleOpen(true) },
              { label: "View Logs", icon: Eye, color: "#2563EB", bg: "rgba(37,99,235,0.12)", action: () => setAuditLogOpen(true) },
              { label: "System Settings", icon: Settings, color: "#7C3AED", bg: "rgba(124,58,237,0.12)", action: () => {} },
              { label: "Export Audit", icon: Download, color: "#0891B2", bg: "rgba(8,145,178,0.12)", action: () => {} },
              { label: "Security Scan", icon: Shield, color: "#EF4444", bg: "rgba(239,68,68,0.12)", action: () => {} },
            ].map(({ label, icon: Icon, color, bg, action }) => (
              <button key={label} onClick={action}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 cursor-pointer"
                style={{ background: bg, border: `1px solid ${color}33`, color }}>
                <Icon className="w-4 h-4" strokeWidth={2} /> {label}
              </button>
            ))}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <SparkKPI label="Total Users" value="254" delta="+6" positive onClick={() => { setSelectedKpi("Users"); setAnalyticsOpen(true); }}
              data={[{v:220},{v:228},{v:234},{v:238},{v:244},{v:249},{v:254}]} />
            <SparkKPI label="Total Documents" value="1,560" delta="+12%" positive onClick={() => { setSelectedKpi("Documents"); setAnalyticsOpen(true); }}
              data={[{v:1200},{v:1280},{v:1360},{v:1420},{v:1480},{v:1520},{v:1560}]} />
            <SparkKPI label="Total Queries" value="19,420" delta="+14%" positive onClick={() => { setSelectedKpi("Queries"); setAnalyticsOpen(true); }}
              data={[{v:14200},{v:15800},{v:16400},{v:17100},{v:17900},{v:18600},{v:19420}]} />
            <SparkKPI label="Active Sessions" value="47" delta="+3" positive onClick={() => { setSelectedKpi("Sessions"); setAnalyticsOpen(true); }}
              data={[{v:38},{v:40},{v:42},{v:43},{v:44},{v:45},{v:47}]} />
          </div>

          {/* Query/AI chart + Storage ring */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white">Query & AI Volume</p>
                <div className="flex items-center gap-3 text-[10px] font-semibold" style={{ color: "#4A6080" }}>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/>Total</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500"/>AI</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={queryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`adq1-${areaId1}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id={`adq2-${areaId2}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                  <Tooltip {...DARK_TT}/>
                  <Area type="monotone" dataKey="queries" stroke="#EF4444" strokeWidth={2} fill={`url(#adq1-${areaId1})`} dot={false}/>
                  <Area type="monotone" dataKey="ai" stroke="#7C3AED" strokeWidth={2} fill={`url(#adq2-${areaId2})`} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Storage ring */}
            <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white mb-4">Storage Usage</p>
              <div className="flex items-center justify-center mb-4">
                <StorageRing pct={79} />
              </div>
              <div className="space-y-2">
                {[
                  { label: "Documents", pct: 42, color: "#2563EB" },
                  { label: "AI Embeddings", pct: 21, color: "#7C3AED" },
                  { label: "Audit Logs", pct: 9, color: "#0891B2" },
                  { label: "Backups", pct: 5, color: "#059669" },
                  { label: "Temp/Cache", pct: 2, color: "#4A6080" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }}/>
                    <span className="text-[10px] flex-1 font-semibold" style={{ color: "#A0AFBF" }}>{b.label}</span>
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(b.pct / 42) * 100}%`, background: b.color }}/>
                    </div>
                    <span className="text-[10px] font-bold text-white w-6 text-right">{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User management table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white">User Management</p>
              <button onClick={() => navigate("/users")}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)" }}>
                <UserPlus className="w-3.5 h-3.5"/> Manage Users
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {["User", "Role", "Department", "Sessions", "MFA", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {USERS_TABLE.map((u) => (
                    <tr key={u.name} className="transition-colors hover:bg-white/5" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: `linear-gradient(${u.gradient})` }}>{u.avatar}</div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#111D30]" style={{ background: STATUS_DOT[u.status] }}/>
                          </div>
                          <span className="font-semibold text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${ROLE_COLORS[u.role] || "#4A6080"}22`, color: ROLE_COLORS[u.role] || "#4A6080" }}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3 font-semibold" style={{ color: "#A0AFBF" }}>{u.dept}</td>
                      <td className="px-5 py-3 font-semibold text-white">{u.sessions}</td>
                      <td className="px-5 py-3">
                        {u.mfa
                          ? <CheckCircle className="w-4 h-4 text-green-400"/>
                          : <AlertCircle className="w-4 h-4 text-red-400"/>}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: `${STATUS_DOT[u.status]}22`, color: STATUS_DOT[u.status] }}>{u.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedUser(u); setEditUserOpen(true); }} className="p-1 rounded-md hover:bg-blue-500/20 text-blue-400 transition-colors" title="Edit User">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setSelectedUser(u); setAssignRoleOpen(true); }} className="p-1 rounded-md hover:bg-yellow-500/20 text-yellow-400 transition-colors" title="Assign Role">
                            <UserCog className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setSelectedUser(u); setDeleteUserOpen(true); }} className="p-1 rounded-md hover:bg-red-500/20 text-red-400 transition-colors" title="Delete User">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System health + Role management */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* System health */}
            <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white mb-4">System Health</p>
              <div className="space-y-3">
                {SERVICES.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.healthy ? "#22C55E" : "#F59E0B" }}/>
                    <span className="flex-1 text-xs font-semibold text-white">{s.name}</span>
                    <span className="text-[10px] font-semibold" style={{ color: "#4A6080" }}>{s.latency}</span>
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${s.uptime}%`, background: s.healthy ? "#22C55E" : "#F59E0B" }}/>
                    </div>
                    <span className="text-[10px] font-bold text-white w-12 text-right">{s.uptime}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role management */}
            <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-sm font-bold text-white mb-4">Role Distribution</p>
              {/* Stacked proportion bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4">
                {ROLES.map((r) => (
                  <div key={r.name} style={{ width: `${(r.users / totalRoles) * 100}%`, background: r.color }} title={`${r.name}: ${r.users}`}/>
                ))}
              </div>
              <div className="space-y-2.5">
                {ROLES.map((r) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }}/>
                    <span className="flex-1 text-xs font-semibold text-white">{r.name}</span>
                    <span className="text-[10px] font-semibold" style={{ color: "#4A6080" }}>{r.users} users</span>
                    <span className="text-[10px] font-bold text-white">{((r.users / totalRoles) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security alerts + AI performance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Security alerts */}
            <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-white">Security Alerts</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
                  {alerts.filter((a) => !a.resolved).length} active
                </span>
              </div>
              <div className="space-y-2">
                {alerts.map((a, i) => {
                  const sty = severityStyle(a.severity);
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", borderLeft: `3px solid ${a.resolved ? "rgba(74,96,128,0.3)" : sty.border}`, opacity: a.resolved ? 0.5 : 1 }}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: a.resolved ? "#4A6080" : sty.border }}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{a.msg}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>{a.time}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded" style={sty.badge}>{a.severity}</span>
                        {!a.resolved && (
                          <button onClick={() => resolveAlert(i)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI performance + Recent activity */}
            <div className="space-y-4">
              <div 
                className="rounded-2xl p-5 cursor-pointer hover:bg-white/5 transition-colors" 
                style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}
                onClick={() => setAiMonitoringOpen(true)}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-white">AI Performance</p>
                  <ChevronRight className="w-4 h-4" style={{ color: "#4A6080" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Latency", value: "248ms", color: "#F59E0B" },
                    { label: "Citation Accuracy", value: "94.2%", color: "#22C55E" },
                    { label: "Cache Hit Rate", value: "71.8%", color: "#2563EB" },
                    { label: "Error Rate", value: "0.14%", color: "#EF4444" },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <p className="text-base font-extrabold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#4A6080" }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-sm font-bold text-white mb-3">Recent Activity</p>
                <div className="space-y-2.5">
                  {RECENT_ACTIVITY.map((e, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                      onClick={() => { setSelectedAuditLog(e); setAuditLogOpen(true); }}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${e.color}22` }}>
                        <e.icon className="w-3 h-3" style={{ color: e.color }} strokeWidth={2}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">{e.msg}</p>
                      </div>
                      <span className="text-[10px] flex-shrink-0" style={{ color: "#4A6080" }}>{e.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Success Overlay */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4" style={{ background: "#059669", color: "#fff" }}>
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {/* Create User Modal */}
      {createUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Create New User</p>
              <button onClick={() => setCreateUserOpen(false)} disabled={isCreatingUser} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Full Name</p>
                <input type="text" placeholder="John Doe" className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Email</p>
                <input type="email" placeholder="john@company.com" className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Role</p>
                  <select className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}>
                    <option>Employee</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Department</p>
                  <select className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}>
                    <option>Engineering</option>
                    <option>Sales</option>
                    <option>HR</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setCreateUserOpen(false)} disabled={isCreatingUser} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080" }}>
                Cancel
              </button>
              <button onClick={() => handleAction(setIsCreatingUser, setCreateUserOpen, "User created successfully!")} disabled={isCreatingUser} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer" style={{ background: "#22C55E" }}>
                {isCreatingUser ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Edit User</p>
              <button onClick={() => setEditUserOpen(false)} disabled={isEditingUser} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Full Name</p>
                <input type="text" defaultValue={selectedUser.name} className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Role</p>
                  <select defaultValue={selectedUser.role} className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }}>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Department</p>
                  <input type="text" defaultValue={selectedUser.dept} className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                 <span className="text-sm font-semibold text-white">Require MFA</span>
                 <button className={`w-10 h-6 rounded-full relative transition-colors ${selectedUser.mfa ? 'bg-blue-500' : 'bg-gray-600'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${selectedUser.mfa ? 'left-5' : 'left-1'}`} />
                 </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditUserOpen(false)} disabled={isEditingUser} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080" }}>
                Cancel
              </button>
              <button onClick={() => handleAction(setIsEditingUser, setEditUserOpen, "User updated successfully!")} disabled={isEditingUser} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer" style={{ background: "#2563EB" }}>
                {isEditingUser ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5 text-center" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
             <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                <AlertTriangle className="w-8 h-8" />
             </div>
             <div>
                <p className="text-lg font-bold text-white mb-2">Delete User?</p>
                <p className="text-sm" style={{ color: "#4A6080" }}>Are you sure you want to delete <strong className="text-white">{selectedUser.name}</strong>? This action cannot be undone.</p>
             </div>
             <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteUserOpen(false)} disabled={isDeletingUser} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080" }}>
                Cancel
              </button>
              <button onClick={() => handleAction(setIsDeletingUser, setDeleteUserOpen, "User deleted successfully")} disabled={isDeletingUser} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer" style={{ background: "#EF4444" }}>
                {isDeletingUser ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {assignRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Assign Roles</p>
              <button onClick={() => setAssignRoleOpen(false)} disabled={isAssigningRole} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Target User / Group</p>
                <input type="text" placeholder="Search user..." defaultValue={selectedUser ? selectedUser.name : ""} className="w-full px-3 py-2 text-sm rounded-lg text-white" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", outline: "none" }} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#4A6080] mb-1.5 uppercase tracking-wide">Role Assignment</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                   {ROLES.map(r => (
                     <label key={r.name} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "rgba(255,255,255,0.02)" }}>
                       <input type="radio" name="role_sel" className="text-blue-500" defaultChecked={selectedUser ? selectedUser.role === r.name : false} />
                       <span className="text-sm font-semibold text-white">{r.name}</span>
                     </label>
                   ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAssignRoleOpen(false)} disabled={isAssigningRole} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080" }}>
                Cancel
              </button>
              <button onClick={() => handleAction(setIsAssigningRole, setAssignRoleOpen, "Role assigned successfully")} disabled={isAssigningRole} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 cursor-pointer" style={{ background: "#F59E0B" }}>
                {isAssigningRole ? <><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</> : "Confirm Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
             <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-blue-400" />
                <p className="text-base font-bold text-white">Detailed {selectedKpi} Analytics</p>
              </div>
              <button onClick={() => setAnalyticsOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-64 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.2)" }}>
               <div className="text-center">
                 <BarChart2 className="w-12 h-12 mx-auto text-blue-400 opacity-50 mb-3" />
                 <p className="text-sm font-medium" style={{ color: "#4A6080" }}>Advanced analytics visualization loading...</p>
               </div>
            </div>
            <div className="flex justify-end pt-2">
               <button onClick={() => setAnalyticsOpen(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {auditLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
             <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-blue-400" />
                <p className="text-base font-bold text-white">Audit Log Details</p>
              </div>
              <button onClick={() => setAuditLogOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {selectedAuditLog ? (
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${selectedAuditLog.color}22` }}>
                        <selectedAuditLog.icon className="w-6 h-6" style={{ color: selectedAuditLog.color }} strokeWidth={2}/>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-white">{selectedAuditLog.msg}</p>
                        <p className="text-xs" style={{ color: "#4A6080" }}>{selectedAuditLog.time}</p>
                     </div>
                  </div>
                  <div className="p-4 rounded-xl space-y-2 text-xs" style={{ background: "rgba(0,0,0,0.2)" }}>
                     <div className="flex justify-between"><span className="text-[#4A6080]">Event ID</span><span className="text-white font-mono">EVT-9923-ALX</span></div>
                     <div className="flex justify-between"><span className="text-[#4A6080]">Source IP</span><span className="text-white font-mono">192.168.1.104</span></div>
                     <div className="flex justify-between"><span className="text-[#4A6080]">Actor ID</span><span className="text-white font-mono">USR-204</span></div>
                     <div className="flex justify-between"><span className="text-[#4A6080]">Status</span><span className="text-green-400">Success</span></div>
                  </div>
               </div>
            ) : (
               <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Select an audit log to view details.</p>
               </div>
            )}
            <div className="flex justify-end pt-2">
               <button onClick={() => setAuditLogOpen(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Monitoring Details Modal */}
      {aiMonitoringOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
             <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-violet-500" />
                <p className="text-base font-bold text-white">AI Engine Diagnostics</p>
              </div>
              <button onClick={() => setAiMonitoringOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl space-y-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold text-[#4A6080] uppercase">Model Version</p>
                <p className="text-base font-bold text-white">GPT-4 Turbo (Custom Fine-tuned)</p>
              </div>
              <div className="p-4 rounded-xl space-y-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold text-[#4A6080] uppercase">Vector DB Health</p>
                <p className="text-base font-bold text-green-400">Optimal (99.98% Sync)</p>
              </div>
              <div className="p-4 rounded-xl space-y-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold text-[#4A6080] uppercase">Avg Token Generation</p>
                <p className="text-base font-bold text-white">42 tokens/sec</p>
              </div>
              <div className="p-4 rounded-xl space-y-1" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-semibold text-[#4A6080] uppercase">Token Usage (24h)</p>
                <p className="text-base font-bold text-white">1.2M / 2.0M Quota</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
               <button onClick={() => setAiMonitoringOpen(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">Close Diagnostics</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
