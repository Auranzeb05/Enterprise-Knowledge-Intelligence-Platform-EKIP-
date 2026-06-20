import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, BarChart2, ClipboardList, Brain, FileText,
  Search, Shield, Terminal, LogIn, LogOut, Eye, Upload, Trash2,
  Edit2, Download, Key, UserPlus, Lock, AlertTriangle, CheckCircle,
  XCircle, Share2, FileDown, Activity, X, ChevronLeft, ChevronRight,
  Wifi, Clock, Filter, RefreshCw, UserCircle
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const NAV: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

type LogStatus = "Success" | "Failed" | "Blocked" | "Warning";
type ActionType = "LOGIN" | "LOGOUT" | "SEARCH" | "VIEW" | "UPLOAD" | "DELETE" | "EDIT" | "EXPORT" | "ROLE_CHANGE" | "USER_CREATE" | "USER_SUSPEND" | "ACCESS_DENIED" | "FAILED_LOGIN" | "MFA" | "DOWNLOAD" | "SHARE";

interface LogEntry {
  id: number;
  user: string;
  avatar: string;
  dept: string;
  action: ActionType;
  resource: string;
  resourceType: string;
  timestamp: string;
  ip: string;
  location: string;
  status: LogStatus;
  sessionId: string;
  userAgent: string;
  severity: "low" | "medium" | "high" | "critical";
}

const ACTION_ICONS: Record<ActionType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  LOGIN: LogIn, LOGOUT: LogOut, SEARCH: Search, VIEW: Eye, UPLOAD: Upload,
  DELETE: Trash2, EDIT: Edit2, EXPORT: FileDown, ROLE_CHANGE: Key,
  USER_CREATE: UserPlus, USER_SUSPEND: Lock, ACCESS_DENIED: Shield,
  FAILED_LOGIN: XCircle, MFA: Shield, DOWNLOAD: Download, SHARE: Share2,
};

const ACTION_COLORS: Record<ActionType, string> = {
  LOGIN: "#22C55E", LOGOUT: "#6B7280", SEARCH: "#60A5FA", VIEW: "#60A5FA",
  UPLOAD: "#A78BFA", DELETE: "#EF4444", EDIT: "#F59E0B", EXPORT: "#67E8F9",
  ROLE_CHANGE: "#F59E0B", USER_CREATE: "#22C55E", USER_SUSPEND: "#EF4444",
  ACCESS_DENIED: "#EF4444", FAILED_LOGIN: "#EF4444", MFA: "#8B5CF6",
  DOWNLOAD: "#67E8F9", SHARE: "#60A5FA",
};

const STATUS_CFG: Record<LogStatus, { bg: string; text: string; border: string; glow: string }> = {
  Success: { bg: "rgba(34,197,94,0.12)", text: "#4ADE80", border: "rgba(34,197,94,0.3)", glow: "" },
  Failed: { bg: "rgba(239,68,68,0.12)", text: "#F87171", border: "rgba(239,68,68,0.3)", glow: "rgba(239,68,68,0.08)" },
  Blocked: { bg: "rgba(139,92,246,0.12)", text: "#A78BFA", border: "rgba(139,92,246,0.3)", glow: "rgba(139,92,246,0.08)" },
  Warning: { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.06)" },
};

const SEVERITY_BORDER: Record<string, string> = {
  low: "transparent", medium: "rgba(245,158,11,0.4)", high: "rgba(239,68,68,0.5)", critical: "rgba(239,68,68,0.8)",
};

const SEED_LOGS: LogEntry[] = [
  { id: 1, user: "Alexandra Chen", avatar: "AC", dept: "Engineering", action: "LOGIN", resource: "EKIP Platform", resourceType: "System", timestamp: "09:12:44", ip: "192.168.1.42", location: "San Francisco, CA", status: "Success", sessionId: "sess_9f2a1b3c", userAgent: "Chrome/125 macOS", severity: "low" },
  { id: 2, user: "Unknown", avatar: "??", dept: "External", action: "FAILED_LOGIN", resource: "Admin Panel", resourceType: "System", timestamp: "09:08:11", ip: "45.33.32.156", location: "Amsterdam, NL", status: "Failed", sessionId: "sess_null", userAgent: "curl/7.81", severity: "critical" },
  { id: 3, user: "Marcus Johnson", avatar: "MJ", dept: "Operations", action: "EXPORT", resource: "Q2 Financial Report", resourceType: "Document", timestamp: "08:55:02", ip: "10.0.0.5", location: "New York, NY", status: "Success", sessionId: "sess_4e7f8a12", userAgent: "Firefox/126 Windows", severity: "low" },
  { id: 4, user: "Carlos Rivera", avatar: "CR", dept: "Sales", action: "ACCESS_DENIED", resource: "HR Records", resourceType: "Database", timestamp: "08:44:33", ip: "10.0.0.18", location: "Chicago, IL", status: "Blocked", sessionId: "sess_7b2c4d19", userAgent: "Edge/124 Windows", severity: "high" },
  { id: 5, user: "Priya Sharma", avatar: "PS", dept: "HR", action: "USER_SUSPEND", resource: "carlos.rivera@ekip.io", resourceType: "User", timestamp: "08:40:17", ip: "10.0.0.9", location: "Austin, TX", status: "Success", sessionId: "sess_1a3e5f70", userAgent: "Chrome/125 macOS", severity: "medium" },
  { id: 6, user: "James Okafor", avatar: "JO", dept: "Engineering", action: "DELETE", resource: "legacy_v2_backup.tar.gz", resourceType: "File", timestamp: "08:31:55", ip: "10.0.0.12", location: "Seattle, WA", status: "Success", sessionId: "sess_8d4a0c22", userAgent: "Chrome/125 Linux", severity: "medium" },
  { id: 7, user: "Bot Scanner", avatar: "BS", dept: "External", action: "SEARCH", resource: "/api/users?limit=9999", resourceType: "API", timestamp: "08:22:08", ip: "192.241.177.34", location: "Frankfurt, DE", status: "Blocked", sessionId: "sess_null", userAgent: "python-requests/2.31", severity: "critical" },
  { id: 8, user: "Sophie Müller", avatar: "SM", dept: "Marketing", action: "UPLOAD", resource: "campaign_assets_jun2026.zip", resourceType: "File", timestamp: "08:15:30", ip: "10.0.0.21", location: "London, UK", status: "Success", sessionId: "sess_2f6b8e91", userAgent: "Chrome/125 macOS", severity: "low" },
  { id: 9, user: "Alexandra Chen", avatar: "AC", dept: "Engineering", action: "ROLE_CHANGE", resource: "yuki.tanaka@ekip.io", resourceType: "User", timestamp: "08:10:14", ip: "192.168.1.42", location: "San Francisco, CA", status: "Success", sessionId: "sess_9f2a1b3c", userAgent: "Chrome/125 macOS", severity: "high" },
  { id: 10, user: "Ravi Patel", avatar: "RP", dept: "Engineering", action: "MFA", resource: "EKIP Platform", resourceType: "Auth", timestamp: "08:05:59", ip: "10.0.0.31", location: "Boston, MA", status: "Warning", sessionId: "sess_3c7d9a40", userAgent: "Safari/17 iOS", severity: "medium" },
  { id: 11, user: "Fatima Al-Hassan", avatar: "FA", dept: "Operations", action: "VIEW", resource: "Operations Dashboard", resourceType: "Page", timestamp: "07:58:22", ip: "10.0.0.14", location: "Dallas, TX", status: "Success", sessionId: "sess_5e1b3f82", userAgent: "Firefox/126 macOS", severity: "low" },
  { id: 12, user: "Unknown", avatar: "??", dept: "External", action: "FAILED_LOGIN", resource: "Admin Panel", resourceType: "System", timestamp: "07:44:05", ip: "185.220.101.47", location: "Moscow, RU", status: "Failed", sessionId: "sess_null", userAgent: "Python/3.11", severity: "critical" },
  { id: 13, user: "Daniel Torres", avatar: "DT", dept: "Finance", action: "DOWNLOAD", resource: "payroll_june2026.xlsx", resourceType: "File", timestamp: "07:32:18", ip: "10.0.0.8", location: "Miami, FL", status: "Success", sessionId: "sess_6a4c2d53", userAgent: "Chrome/125 Windows", severity: "medium" },
  { id: 14, user: "Yuki Tanaka", avatar: "YT", dept: "Legal", action: "EDIT", resource: "Contract Template v3", resourceType: "Document", timestamp: "07:20:44", ip: "10.0.0.27", location: "Tokyo, JP", status: "Success", sessionId: "sess_0b8e1f34", userAgent: "Chrome/125 macOS", severity: "low" },
  { id: 15, user: "Emma Williams", avatar: "EW", dept: "External", action: "SHARE", resource: "Partnership Proposal.pdf", resourceType: "Document", timestamp: "07:05:11", ip: "203.0.113.51", location: "Sydney, AU", status: "Success", sessionId: "sess_7d2a5c68", userAgent: "Chrome/125 macOS", severity: "low" },
  { id: 16, user: "Marcus Johnson", avatar: "MJ", dept: "Operations", action: "USER_CREATE", resource: "new.contractor@ekip.io", resourceType: "User", timestamp: "06:55:30", ip: "10.0.0.5", location: "New York, NY", status: "Success", sessionId: "sess_4e7f8a12", userAgent: "Firefox/126 Windows", severity: "medium" },
  { id: 17, user: "Alexandra Chen", avatar: "AC", dept: "Engineering", action: "LOGOUT", resource: "EKIP Platform", resourceType: "System", timestamp: "06:40:22", ip: "192.168.1.42", location: "San Francisco, CA", status: "Success", sessionId: "sess_9f2a1b3c", userAgent: "Chrome/125 macOS", severity: "low" },
  { id: 18, user: "Bot Scanner", avatar: "BS", dept: "External", action: "ACCESS_DENIED", resource: "/.env", resourceType: "File", timestamp: "06:22:08", ip: "45.33.32.156", location: "Amsterdam, NL", status: "Blocked", sessionId: "sess_null", userAgent: "Googlebot/2.1", severity: "critical" },
  { id: 19, user: "Priya Sharma", avatar: "PS", dept: "HR", action: "SEARCH", resource: "Employee Records DB", resourceType: "Database", timestamp: "06:10:15", ip: "10.0.0.9", location: "Austin, TX", status: "Success", sessionId: "sess_1a3e5f70", userAgent: "Chrome/125 macOS", severity: "low" },
  { id: 20, user: "James Okafor", avatar: "JO", dept: "Engineering", action: "UPLOAD", resource: "deployment_config_prod.yaml", resourceType: "File", timestamp: "05:58:44", ip: "10.0.0.12", location: "Seattle, WA", status: "Warning", sessionId: "sess_8d4a0c22", userAgent: "Chrome/125 Linux", severity: "high" },
];

const SPARKLINE_DATA = [12, 18, 14, 22, 19, 28, 24, 31, 27, 35, 29, 38];
const PAGE_SIZE = 10;

function getInitialBg(name: string): string {
  const colors = ["#2563EB", "#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626"];
  return name === "??" ? "#374151" : colors[name.charCodeAt(0) % colors.length];
}

function ThreatSummary({ logs }: { logs: LogEntry[] }) {
  const blocked = logs.filter(l => l.status === "Blocked").length;
  const failed = logs.filter(l => l.status === "Failed").length;
  const warnings = logs.filter(l => l.status === "Warning").length;
  return (
    <div className="mx-3 mb-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
      <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(239,68,68,0.6)" }}>Threat Summary</p>
      {[{ label: "Blocked", val: blocked, color: "#A78BFA" }, { label: "Failed", val: failed, color: "#F87171" }, { label: "Warnings", val: warnings, color: "#FCD34D" }].map(item => (
        <div key={item.label} className="flex justify-between items-center mb-1">
          <span className="text-[10px]" style={{ color: "#3D5A78" }}>{item.label}</span>
          <span className="text-xs font-bold" style={{ color: item.color }}>{item.val}</span>
        </div>
      ))}
    </div>
  );
}

export default function AuditLogs() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LogStatus | "">("");
  const [filterAction, setFilterAction] = useState<ActionType | "">("");
  const [filterResource, setFilterResource] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [drawerLog, setDrawerLog] = useState<LogEntry | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"CSV" | "JSON" | "PDF">("CSV");
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const activeFilters = [filterStatus, filterAction, filterResource, filterUser].filter(Boolean).length;

  const filtered = useMemo(() => {
    return SEED_LOGS.filter(l => {
      const q = search.toLowerCase();
      if (q && !l.user.toLowerCase().includes(q) && !l.action.toLowerCase().includes(q) && !l.resource.toLowerCase().includes(q) && !l.ip.includes(q)) return false;
      if (filterStatus && l.status !== filterStatus) return false;
      if (filterAction && l.action !== filterAction) return false;
      if (filterResource && !l.resourceType.toLowerCase().includes(filterResource.toLowerCase())) return false;
      if (filterUser && !l.user.toLowerCase().includes(filterUser.toLowerCase())) return false;
      return true;
    });
  }, [search, filterStatus, filterAction, filterResource, filterUser]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalEvents = filtered.length;
  const successCount = filtered.filter(l => l.status === "Success").length;
  const failedCount = filtered.filter(l => l.status === "Failed").length;
  const blockedCount = filtered.filter(l => l.status === "Blocked").length;
  const warningCount = filtered.filter(l => l.status === "Warning").length;

  function toggleAll() {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(l => l.id)));
  }

  function toggleOne(id: number) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  async function handleExport() {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1200));
    setExporting(false);
    setExportDone(true);
    await new Promise(r => setTimeout(r, 800));
    setExportOpen(false);
    setExportDone(false);
  }

  const isHighRisk = (l: LogEntry) => l.status === "Failed" || l.status === "Blocked";

  const badgeSidebar = (
    <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-3.5 h-3.5" style={{ color: "#F87171" }} />
        <span className="text-[10px] font-bold text-white">Security Audit</span>
      </div>
      <p className="text-[9px]" style={{ color: "rgba(239,68,68,0.6)" }}>Immutable log record</p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080F1C", fontFamily: "'Plus Jakarta Sans',Inter,sans-serif" }}>
      <EKIPSidebar items={NAV} subtitle="Security Audit" subtitleColor="rgba(239,68,68,0.4)" badge={badgeSidebar} settingsPath="/admin-settings" onLogout={handleLogout}>
        <ThreatSummary logs={SEED_LOGS} />
      </EKIPSidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex-shrink-0" style={{ background: "rgba(6,12,24,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5" style={{ color: "#EF4444" }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">Audit Logs</h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)" }}>SOC 2 Certified</span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "#3D5A78" }}>Immutable · Tamper-proof</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#3D5A78" }} />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search logs..." className="pl-9 pr-3 py-2 text-xs rounded-lg outline-none" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8", width: 190 }} />
              </div>
              <button onClick={() => setLive(l => !l)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                <span className={`w-2 h-2 rounded-full ${live ? "bg-green-400" : "bg-gray-500"}`} style={{ boxShadow: live ? "0 0 6px #22C55E" : undefined }} />
                {live ? "Live" : "Paused"}
              </button>
              <button onClick={() => setFilterOpen(f => !f)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: filterOpen ? "rgba(37,99,235,0.15)" : "#111D30", border: `1px solid ${filterOpen ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.08)"}`, color: "#E8EFF8" }}>
                <Filter className="w-3.5 h-3.5" /> Apply Filter {activeFilters > 0 && <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "#2563EB" }}>{activeFilters}</span>}
              </button>
              {activeFilters > 0 && (
                <button onClick={() => { setFilterStatus(""); setFilterAction(""); setFilterResource(""); setFilterUser(""); setPage(1); }} className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                  Clear Filter
                </button>
              )}
              <button onClick={() => { setExportOpen(true); setExportDone(false); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "#2563EB" }}>
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {filterOpen && (
            <div className="flex items-center gap-4 px-6 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,8,16,0.8)" }}>
              {[
                { label: "Status", val: filterStatus, set: (v: string) => { setFilterStatus(v as LogStatus | ""); setPage(1); }, opts: ["", "Success", "Failed", "Blocked", "Warning"] },
                { label: "Action Type", val: filterAction, set: (v: string) => { setFilterAction(v as ActionType | ""); setPage(1); }, opts: ["", "LOGIN", "LOGOUT", "SEARCH", "VIEW", "UPLOAD", "DELETE", "EDIT", "EXPORT", "ROLE_CHANGE", "USER_CREATE", "USER_SUSPEND", "ACCESS_DENIED", "FAILED_LOGIN", "MFA", "DOWNLOAD", "SHARE"] },
                { label: "Resource Type", val: filterResource, set: (v: string) => { setFilterResource(v); setPage(1); }, opts: ["", "System", "Document", "File", "Database", "API", "User", "Auth", "Page"] },
                { label: "User", val: filterUser, set: (v: string) => { setFilterUser(v); setPage(1); }, opts: ["", ...Array.from(new Set(SEED_LOGS.map(l => l.user)))] },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>{f.label}</span>
                  <select value={f.val} onChange={e => f.set(e.target.value)} className="px-2.5 py-1.5 text-xs rounded-lg outline-none appearance-none" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                    {f.opts.map(o => <option key={o} value={o}>{o || "All"}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            <div className="rounded-xl p-4 col-span-1" style={{ background: "#111D30", borderLeft: "3px solid #2563EB" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#3D5A78" }}>Total Events</p>
              <p className="text-2xl font-bold mb-2" style={{ color: "#60A5FA" }}>{totalEvents}</p>
              <div className="h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SPARKLINE_DATA.map((v, i) => ({ v, i }))}>
                    <Area type="monotone" dataKey="v" stroke="#2563EB" fill="rgba(37,99,235,0.2)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {[
              { label: "Success", val: successCount, pct: totalEvents ? Math.round(successCount / totalEvents * 100) : 0, color: "#22C55E" },
              { label: "Failed", val: failedCount, pct: totalEvents ? Math.round(failedCount / totalEvents * 100) : 0, color: "#EF4444" },
              { label: "Blocked", val: blockedCount, pct: totalEvents ? Math.round(blockedCount / totalEvents * 100) : 0, color: "#8B5CF6" },
              { label: "Warnings", val: warningCount, pct: totalEvents ? Math.round(warningCount / totalEvents * 100) : 0, color: "#F59E0B" },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-4" style={{ background: "#111D30", borderLeft: `3px solid ${kpi.color}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#3D5A78" }}>{kpi.label}</p>
                <p className="text-2xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.val}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${kpi.color}20`, color: kpi.color }}>{kpi.pct}%</span>
              </div>
            ))}
          </div>

          {/* Selection toolbar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <span className="text-xs font-semibold" style={{ color: "#60A5FA" }}>{selected.size} events selected</span>
              <button onClick={() => { setExportOpen(true); setExportDone(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.3)" }}>
                <Download className="w-3 h-3" /> Export Selected
              </button>
              <button onClick={() => setSelected(new Set())} className="ml-auto" style={{ color: "#3D5A78" }}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="px-4 py-3 w-10"><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 accent-blue-500" /></th>
                  <th className="px-3 py-3 w-8"></th>
                  {["User", "Action", "Resource", "Timestamp / Network", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left"><span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>{h}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, i) => {
                  const ActionIcon = ACTION_ICONS[log.action];
                  const high = isHighRisk(log);
                  return (
                    <tr key={log.id} className="group transition-all" style={{ borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined, background: selected.has(log.id) ? "rgba(37,99,235,0.06)" : high ? STATUS_CFG[log.status].glow : undefined, borderLeft: high ? `3px solid ${STATUS_CFG[log.status].border}` : "3px solid transparent" }}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.has(log.id)} onChange={() => toggleOne(log.id)} className="w-3.5 h-3.5 accent-blue-500" /></td>
                      <td className="px-3 py-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: STATUS_CFG[log.status].text, boxShadow: high ? `0 0 6px ${STATUS_CFG[log.status].text}` : undefined }} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: getInitialBg(log.user) }}>{log.avatar}</div>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: "#E8EFF8" }}>{log.user}</p>
                            <p className="text-[10px]" style={{ color: "#3D5A78" }}>{log.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 flex-shrink-0" style={{ color: ACTION_COLORS[log.action] }} strokeWidth={1.8} />
                          <span className="text-xs font-semibold font-mono" style={{ color: ACTION_COLORS[log.action] }}>{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ maxWidth: 180 }}>
                        <p className="text-xs truncate" style={{ color: "#9CA3AF" }}>{log.resource}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#6B7280" }}>{log.resourceType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Clock className="w-3 h-3" style={{ color: "#3D5A78" }} />
                          <span className="text-xs font-mono" style={{ color: "#9CA3AF" }}>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3 h-3" style={{ color: "#3D5A78" }} />
                          <span className="text-[10px] font-mono" style={{ color: "#6B7280" }}>{log.ip} · {log.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: STATUS_CFG[log.status].bg, color: STATUS_CFG[log.status].text, border: `1px solid ${STATUS_CFG[log.status].border}` }}>{log.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerLog(log)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.2)" }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 4px #22C55E" }} />
                <span className="text-[10px] font-mono" style={{ color: "#3D5A78" }}>Retention: 7 years · WORM protected · SHA-256 integrity</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: "#111D30", color: "#E8EFF8" }}><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map(p => (
                <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg text-xs font-semibold" style={{ background: p === page ? "#2563EB" : "#111D30", color: p === page ? "#fff" : "#6B7280" }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: "#111D30", color: "#E8EFF8" }}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Detail Drawer */}
      {drawerLog && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setDrawerLog(null)}>
          <div className="w-[420px] h-full overflow-y-auto shadow-2xl" style={{ background: "#0C1525", borderLeft: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
            {(() => {
              const ActionIcon = ACTION_ICONS[drawerLog.action];
              const sc = STATUS_CFG[drawerLog.status];
              return (
                <>
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3">
                      <ActionIcon className="w-5 h-5" style={{ color: ACTION_COLORS[drawerLog.action] }} strokeWidth={1.8} />
                      <span className="text-base font-bold text-white">{drawerLog.action}</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{drawerLog.status}</span>
                    </div>
                    <button onClick={() => setDrawerLog(null)} style={{ color: "#3D5A78" }}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: getInitialBg(drawerLog.user) }}>{drawerLog.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{drawerLog.user}</p>
                        <p className="text-xs" style={{ color: "#3D5A78" }}>{drawerLog.dept}</p>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      {[
                        { label: "Action", val: drawerLog.action, mono: true },
                        { label: "Resource", val: drawerLog.resource, mono: false },
                        { label: "Type", val: drawerLog.resourceType, mono: false },
                        { label: "Timestamp", val: drawerLog.timestamp, mono: true },
                        { label: "Session ID", val: drawerLog.sessionId, mono: true },
                      ].map((row, i) => (
                        <div key={row.label} className="flex" style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : undefined, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : undefined }}>
                          <div className="w-28 px-4 py-2.5 flex-shrink-0"><span className="text-[11px] font-semibold" style={{ color: "#3D5A78" }}>{row.label}</span></div>
                          <div className="px-4 py-2.5"><span className={`text-xs ${row.mono ? "font-mono" : ""}`} style={{ color: "#E8EFF8" }}>{row.val}</span></div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#3D5A78" }}>Network Context</p>
                      {[{ icon: Wifi, label: "IP Address", val: drawerLog.ip }, { icon: Activity, label: "Location", val: drawerLog.location }, { icon: RefreshCw, label: "User Agent", val: drawerLog.userAgent }].map(row => (
                        <div key={row.label} className="flex items-start gap-2 mb-2">
                          <row.icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#3D5A78" }} />
                          <div>
                            <p className="text-[10px]" style={{ color: "#3D5A78" }}>{row.label}</p>
                            <p className="text-xs font-mono" style={{ color: "#9CA3AF" }}>{row.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-4" style={{ background: `${sc.bg}`, border: `1px solid ${sc.border}` }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: sc.text }}>Audit Detail · Severity: {drawerLog.severity.toUpperCase()}</p>
                      <p className="text-xs" style={{ color: sc.text, opacity: 0.8 }}>This event was recorded as <strong>{drawerLog.status}</strong>. Severity level: <strong>{drawerLog.severity}</strong>. IP origin: {drawerLog.ip} ({drawerLog.location}). Logged under session {drawerLog.sessionId}.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setExportOpen(true); setExportDone(false); setDrawerLog(null); }} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#2563EB" }}>
                        <Download className="w-4 h-4" /> Export This Event
                      </button>
                      <button onClick={() => setDrawerLog(null)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#E8EFF8" }}>Close</button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-[380px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-base font-bold text-white">Export Logs</h2>
              <button onClick={() => setExportOpen(false)} style={{ color: "#3D5A78" }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-xs mb-4" style={{ color: "#6B7280" }}>Select format to export {selected.size > 0 ? selected.size : totalEvents} log entries.</p>
              <div className="flex gap-2 mb-5">
                {(["CSV", "JSON", "PDF"] as const).map(fmt => (
                  <button key={fmt} onClick={() => setExportFormat(fmt)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: exportFormat === fmt ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)", color: exportFormat === fmt ? "#60A5FA" : "#6B7280", border: `1px solid ${exportFormat === fmt ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.08)"}` }}>{fmt}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setExportOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#E8EFF8" }}>Cancel</button>
              <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white min-w-[120px] justify-center" style={{ background: exportDone ? "#22C55E" : "#2563EB" }}>
                {exporting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : exportDone ? <><CheckCircle className="w-4 h-4" /> Exported!</> : `Export ${exportFormat}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
