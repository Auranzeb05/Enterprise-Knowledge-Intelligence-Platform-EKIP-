import { useState, useMemo, useId, useEffect, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  LayoutDashboard, MessageSquare, FileText, UserCircle,
  BarChart2, ClipboardList, Brain,
  RefreshCw, Filter, ChevronDown, Download, Check,
  TrendingUp, TrendingDown, Users, Zap, Clock, Search,
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const NAV_MANAGER: SidebarNavItem[] = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

const NAV_ADMIN: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

const TABS = ["Overview", "Query Analytics", "User Activity", "Top Documents", "Departments"] as const;
type Tab = typeof TABS[number];

const PERIODS = ["7d", "30d", "90d", "12m"] as const;
type Period = typeof PERIODS[number];

const DEPTS = [
  { name: "Engineering", color: "#2563EB" },
  { name: "HR", color: "#7C3AED" },
  { name: "Finance", color: "#0891B2" },
  { name: "Legal", color: "#059669" },
  { name: "Sales", color: "#D97706" },
  { name: "Operations", color: "#DC2626" },
];

const QUERY_DATA: Record<Period, { label: string; total: number; ai: number; manual: number }[]> = {
  "7d": [
    { label: "Mon", total: 420, ai: 310, manual: 110 },
    { label: "Tue", total: 380, ai: 280, manual: 100 },
    { label: "Wed", total: 510, ai: 390, manual: 120 },
    { label: "Thu", total: 460, ai: 340, manual: 120 },
    { label: "Fri", total: 530, ai: 400, manual: 130 },
    { label: "Sat", total: 190, ai: 140, manual: 50 },
    { label: "Sun", total: 140, ai: 100, manual: 40 },
  ],
  "30d": [
    { label: "W1", total: 2100, ai: 1600, manual: 500 },
    { label: "W2", total: 2480, ai: 1890, manual: 590 },
    { label: "W3", total: 2240, ai: 1700, manual: 540 },
    { label: "W4", total: 2710, ai: 2050, manual: 660 },
  ],
  "90d": [
    { label: "Jan", total: 8400, ai: 6300, manual: 2100 },
    { label: "Feb", total: 9200, ai: 7000, manual: 2200 },
    { label: "Mar", total: 8900, ai: 6700, manual: 2200 },
  ],
  "12m": [
    { label: "Jul", total: 6200, ai: 4600, manual: 1600 },
    { label: "Aug", total: 6800, ai: 5100, manual: 1700 },
    { label: "Sep", total: 7400, ai: 5600, manual: 1800 },
    { label: "Oct", total: 7100, ai: 5400, manual: 1700 },
    { label: "Nov", total: 7800, ai: 5900, manual: 1900 },
    { label: "Dec", total: 6500, ai: 4800, manual: 1700 },
    { label: "Jan", total: 8400, ai: 6300, manual: 2100 },
    { label: "Feb", total: 9200, ai: 7000, manual: 2200 },
    { label: "Mar", total: 8900, ai: 6700, manual: 2200 },
    { label: "Apr", total: 9600, ai: 7300, manual: 2300 },
    { label: "May", total: 10200, ai: 7800, manual: 2400 },
    { label: "Jun", total: 9800, ai: 7500, manual: 2300 },
  ],
};

const USER_DATA: Record<Period, { label: string; returning: number; new: number }[]> = {
  "7d": [
    { label: "Mon", returning: 28, new: 6 },
    { label: "Tue", returning: 32, new: 4 },
    { label: "Wed", returning: 35, new: 9 },
    { label: "Thu", returning: 30, new: 7 },
    { label: "Fri", returning: 38, new: 5 },
    { label: "Sat", returning: 14, new: 2 },
    { label: "Sun", returning: 10, new: 1 },
  ],
  "30d": [
    { label: "W1", returning: 140, new: 22 },
    { label: "W2", returning: 158, new: 31 },
    { label: "W3", returning: 145, new: 18 },
    { label: "W4", returning: 172, new: 28 },
  ],
  "90d": [
    { label: "Jan", returning: 520, new: 84 },
    { label: "Feb", returning: 580, new: 96 },
    { label: "Mar", returning: 560, new: 88 },
  ],
  "12m": [
    { label: "Jul", returning: 380, new: 55 },
    { label: "Aug", returning: 410, new: 62 },
    { label: "Sep", returning: 440, new: 70 },
    { label: "Oct", returning: 430, new: 67 },
    { label: "Nov", returning: 460, new: 74 },
    { label: "Dec", returning: 400, new: 58 },
    { label: "Jan", returning: 520, new: 84 },
    { label: "Feb", returning: 580, new: 96 },
    { label: "Mar", returning: 560, new: 88 },
    { label: "Apr", returning: 600, new: 102 },
    { label: "May", returning: 630, new: 110 },
    { label: "Jun", returning: 615, new: 105 },
  ],
};

const SUCCESS_DATA = [
  { label: "Mon", rate: 91 }, { label: "Tue", rate: 94 }, { label: "Wed", rate: 88 },
  { label: "Thu", rate: 96 }, { label: "Fri", rate: 93 }, { label: "Sat", rate: 97 }, { label: "Sun", rate: 95 },
];

const RADAR_DATA = [
  { subject: "Engineering", A: 92, B: 85, C: 78, D: 88, E: 72, F: 81 },
  { subject: "HR", A: 78, B: 91, C: 84, D: 76, E: 88, F: 79 },
  { subject: "Finance", A: 85, B: 79, C: 94, D: 82, E: 75, F: 90 },
  { subject: "Legal", A: 71, B: 88, C: 80, D: 95, E: 82, F: 74 },
  { subject: "Sales", A: 89, B: 76, C: 71, D: 80, E: 93, F: 85 },
  { subject: "Operations", A: 76, B: 82, C: 88, D: 74, E: 79, F: 92 },
];

const DEPT_USAGE = DEPTS.map((d, i) => ({ dept: d.name, queries: [312, 189, 234, 145, 267, 100][i], color: d.color }));

const POPULAR_DOCS = [
  { rank: 1, name: "Q4 Compliance Guide", dept: "Legal", views: 847, searches: 312, trend: 18 },
  { rank: 2, name: "Engineering Handbook v3", dept: "Engineering", views: 734, searches: 289, trend: 12 },
  { rank: 3, name: "HR Benefits Manual 2026", dept: "HR", views: 621, searches: 241, trend: -3 },
  { rank: 4, name: "Sales Playbook Q2", dept: "Sales", views: 589, searches: 218, trend: 24 },
  { rank: 5, name: "Financial Policies 2026", dept: "Finance", views: 512, searches: 196, trend: 7 },
  { rank: 6, name: "Security Protocol v2", dept: "Operations", views: 478, searches: 182, trend: -8 },
  { rank: 7, name: "API Documentation v3", dept: "Engineering", views: 445, searches: 171, trend: 31 },
  { rank: 8, name: "Onboarding Checklist", dept: "HR", views: 412, searches: 158, trend: 15 },
];

const TOP_TERMS = [
  { term: "compliance requirements", count: 312, delta: 18 },
  { term: "employee benefits", count: 289, delta: -5 },
  { term: "budget allocation", count: 241, delta: 12 },
  { term: "API documentation", count: 218, delta: 31 },
  { term: "sales pipeline", count: 196, delta: -2 },
  { term: "onboarding process", count: 171, delta: 8 },
  { term: "cloud infrastructure", count: 158, delta: 6 },
  { term: "contract review", count: 142, delta: -11 },
];

const LATENCY_DIST = [
  { bucket: "<100ms", count: 28 },
  { bucket: "100-250ms", count: 41 },
  { bucket: "250-500ms", count: 19 },
  { bucket: "500-800ms", count: 8 },
  { bucket: ">800ms", count: 4 },
];

const DARK_TT = {
  contentStyle: { background: "#1A2B45", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, color: "#E8EFF8" },
  cursor: { fill: "rgba(37,99,235,0.07)" },
};

const DEPT_COLORS: Record<string, string> = Object.fromEntries(DEPTS.map((d) => [d.name, d.color]));

function SparkKPI({
  label, value, sub, delta, positive, data, icon: Icon, color,
}: {
  label: string; value: string; sub?: string; delta: string; positive: boolean;
  data: { v: number }[]; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; color: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#4A6080" }}>{label}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={2} />
        </div>
      </div>
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
              <linearGradient id={`kpi-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#kpi-${uid})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const nav = role === "admin" ? NAV_ADMIN : NAV_MANAGER;
  const settingsPath = role === "admin" ? "/admin-settings" : "/manager-settings";
  const [tab, setTab] = useState<Tab>("Overview");
  const [period, setPeriod] = useState<Period>("7d");
  const [spinning, setSpinning] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showDept, setShowDept] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

  const dateRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dateRef, () => setShowDate(false));
  useOutsideClick(deptRef, () => setShowDept(false));
  useOutsideClick(exportRef, () => setShowExport(false));

  const queryData = useMemo(() => QUERY_DATA[period], [period]);
  const userData = useMemo(() => USER_DATA[period], [period]);

  const areaId1 = useId().replace(/:/g, "");
  const areaId2 = useId().replace(/:/g, "");
  const areaId3 = useId().replace(/:/g, "");

  const triggerExport = (fmt: string) => {
    setExportLoading(true);
    setTimeout(() => { setExportLoading(false); setExportDone(true); setTimeout(() => { setExportDone(false); setShowExport(false); }, 1500); }, 1800);
  };

  const toggleDept = (d: string) =>
    setSelectedDepts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0C1525", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <EKIPSidebar items={nav} subtitle="Intelligence" subtitleColor="rgba(37,99,235,0.5)" settingsPath={settingsPath} onLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 flex-wrap"
          style={{ background: "rgba(12,21,37,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BarChart2 className="w-5 h-5 text-blue-400" strokeWidth={2} />
            <h1 className="text-lg font-extrabold text-white tracking-tight">Analytics</h1>
            <span className="text-xs ml-2 hidden sm:block" style={{ color: "#4A6080" }}>Platform intelligence · June 20, 2026</span>
          </div>

          {/* Period */}
          <div className="flex items-center gap-1 rounded-xl p-0.5" style={{ background: "#111D30" }}>
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={period === p ? { background: "#2563EB", color: "#fff" } : { color: "#4A6080" }}>{p}</button>
            ))}
          </div>

          <button onClick={() => { setSpinning(true); setTimeout(() => setSpinning(false), 1200); }}
            className="p-2 rounded-xl" style={{ background: "#111D30", color: "#4A6080" }}>
            <RefreshCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
          </button>

          {/* Date filter */}
          <div className="relative" ref={dateRef}>
            <button onClick={() => { setShowDate((v) => !v); setShowDept(false); setShowExport(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)", color: "#A0AFBF" }}>
              <Filter className="w-3.5 h-3.5" /> Filter Date <ChevronDown className="w-3 h-3" />
            </button>
            {showDate && (
              <div className="absolute right-0 top-10 w-56 rounded-2xl shadow-2xl z-50 p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#4A6080" }}>Date Range</p>
                {["Today", "Last 7 days", "Last 30 days", "Last 90 days", "This year", "Custom"].map((opt) => (
                  <button key={opt} className="w-full text-left text-xs px-2 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                    style={{ color: "#A0AFBF" }} onClick={() => setShowDate(false)}>{opt}</button>
                ))}
              </div>
            )}
          </div>

          {/* Dept filter */}
          <div className="relative" ref={deptRef}>
            <button onClick={() => { setShowDept((v) => !v); setShowDate(false); setShowExport(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)", color: "#A0AFBF" }}>
              <Users className="w-3.5 h-3.5" /> Department
              {selectedDepts.length > 0 && <span className="w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white" style={{ background: "#2563EB" }}>{selectedDepts.length}</span>}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showDept && (
              <div className="absolute right-0 top-10 w-52 rounded-2xl shadow-2xl z-50 p-3" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: "#4A6080" }}>Departments</p>
                {DEPTS.map((d) => (
                  <button key={d.name} onClick={() => toggleDept(d.name)}
                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ color: selectedDepts.includes(d.name) ? "#E8EFF8" : "#A0AFBF" }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                    {selectedDepts.includes(d.name) && <Check className="w-3 h-3 ml-auto text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button onClick={() => { setShowExport((v) => !v); setShowDate(false); setShowDept(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}>
              <Download className="w-3.5 h-3.5" /> Export Report <ChevronDown className="w-3 h-3" />
            </button>
            {showExport && (
              <div className="absolute right-0 top-10 w-48 rounded-2xl shadow-2xl z-50 p-2" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)" }}>
                {exportDone ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-xs font-bold text-green-400">
                    <Check className="w-4 h-4" /> Export complete
                  </div>
                ) : exportLoading ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-xs font-semibold" style={{ color: "#A0AFBF" }}>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                  </div>
                ) : (
                  ["PDF Report", "CSV Data", "XLSX Workbook"].map((fmt) => (
                    <button key={fmt} onClick={() => triggerExport(fmt)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                      style={{ color: "#A0AFBF" }}>{fmt}</button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>AM</div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-2xl p-1" style={{ background: "#111D30", width: "fit-content" }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={tab === t ? { background: "#2563EB", color: "#fff" } : { color: "#4A6080" }}>
                {t}
              </button>
            ))}
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <SparkKPI label="Total Queries" value="19,420" delta="14%" positive icon={Search} color="#2563EB"
              data={[{v:14200},{v:15800},{v:16400},{v:17100},{v:17900},{v:18600},{v:19420}]} />
            <SparkKPI label="Search Success Rate" value="94.2%" delta="2.1%" positive icon={Zap} color="#22C55E"
              data={[{v:88},{v:90},{v:91},{v:92},{v:93},{v:94},{v:94.2}]} />
            <SparkKPI label="Avg Response Time" value="248ms" sub="p95: 420ms" delta="12ms" positive={false} icon={Clock} color="#F59E0B"
              data={[{v:310},{v:290},{v:280},{v:270},{v:265},{v:255},{v:248}]} />
            <SparkKPI label="Daily Active Users" value="47" delta="8%" positive icon={Users} color="#7C3AED"
              data={[{v:38},{v:40},{v:42},{v:43},{v:44},{v:45},{v:47}]} />
          </div>

          {/* OVERVIEW TAB */}
          {tab === "Overview" && (
            <div className="space-y-4">
              {/* Query Trends + User Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-white">Query Trends</p>
                    <div className="flex items-center gap-3 text-[10px] font-semibold" style={{ color: "#4A6080" }}>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"/>Total</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500"/>AI</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"/>Manual</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={queryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`qt1-${areaId1}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id={`qt2-${areaId2}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id={`qt3-${areaId3}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0891B2" stopOpacity={0.3}/><stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip {...DARK_TT}/>
                      <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill={`url(#qt1-${areaId1})`} dot={false}/>
                      <Area type="monotone" dataKey="ai" stroke="#7C3AED" strokeWidth={2} fill={`url(#qt2-${areaId2})`} dot={false}/>
                      <Area type="monotone" dataKey="manual" stroke="#0891B2" strokeWidth={2} fill={`url(#qt3-${areaId3})`} dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-white">User Activity</p>
                    <div className="flex items-center gap-3 text-[10px] font-semibold" style={{ color: "#4A6080" }}>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"/>Returning</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/>New</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={userData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip {...DARK_TT}/>
                      <Bar dataKey="returning" stackId="a" fill="#2563EB" radius={[0,0,6,6]}/>
                      <Bar dataKey="new" stackId="a" fill="#22C55E" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dept Usage + Radar */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Department Usage</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={DEPT_USAGE} layout="vertical" margin={{ top: 0, right: 20, left: 70, bottom: 0 }}>
                      <XAxis type="number" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="dept" tick={{ fill: "#A0AFBF", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip {...DARK_TT}/>
                      <Bar dataKey="queries" radius={[0,6,6,0]}>
                        {DEPT_USAGE.map((d, i) => <Cell key={i} fill={d.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Coverage Radar</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)"/>
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#4A6080", fontSize: 10 }}/>
                      <Radar name="Coverage" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.18}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Success rate + Response dist */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Success Rate Trend</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={SUCCESS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis domain={[80, 100]} tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip {...DARK_TT}/>
                      <Line type="monotone" dataKey="rate" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Response Time Distribution</p>
                  <div className="space-y-3 mt-2">
                    {LATENCY_DIST.map((b) => (
                      <div key={b.bucket} className="flex items-center gap-3">
                        <span className="w-20 text-[11px] font-semibold" style={{ color: "#A0AFBF" }}>{b.bucket}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width: `${(b.count / 41) * 100}%`, background: "#2563EB" }}/>
                        </div>
                        <span className="text-[11px] font-semibold text-white w-6 text-right">{b.count}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular docs + Top terms */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Popular Documents</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          {["#", "Document", "Dept", "Views", "Searches", "Trend"].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {POPULAR_DOCS.map((d) => (
                          <tr key={d.rank} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td className="px-4 py-2.5">
                              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold" style={{ background: d.rank <= 3 ? "#2563EB" : "rgba(255,255,255,0.06)", color: d.rank <= 3 ? "#fff" : "#4A6080" }}>{d.rank}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="font-semibold text-white truncate max-w-[160px]">{d.name}</p>
                              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)", width: `${(d.views / 847) * 100}%` }}>
                                <div className="h-full rounded-full bg-blue-500"/>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${DEPT_COLORS[d.dept]}22`, color: DEPT_COLORS[d.dept] }}>{d.dept}</span>
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-white">{d.views}</td>
                            <td className="px-4 py-2.5 font-semibold text-white">{d.searches}</td>
                            <td className="px-4 py-2.5">
                              <span className="text-[10px] font-bold" style={{ color: d.trend >= 0 ? "#22C55E" : "#EF4444" }}>
                                {d.trend >= 0 ? "+" : ""}{d.trend}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Top Search Terms</p>
                  <div className="space-y-3">
                    {TOP_TERMS.map((t, i) => (
                      <div key={t.term} className="flex items-center gap-3">
                        <span className="w-5 text-[10px] font-extrabold text-right" style={{ color: "#4A6080" }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold truncate text-white">{t.term}</span>
                            <span className="text-[10px] font-bold ml-2" style={{ color: t.delta >= 0 ? "#22C55E" : "#EF4444" }}>
                              {t.delta >= 0 ? "+" : ""}{t.delta}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${(t.count / 312) * 100}%`, background: "#2563EB" }}/>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-white w-8 text-right">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QUERY ANALYTICS TAB */}
          {tab === "Query Analytics" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-sm font-bold text-white mb-4">Query Volume</p>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={queryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="qa-total" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="qa-ai" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <Tooltip {...DARK_TT}/>
                    <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2} fill="url(#qa-total)" dot={false}/>
                    <Area type="monotone" dataKey="ai" stroke="#7C3AED" strokeWidth={2} fill="url(#qa-ai)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Success Rate</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={SUCCESS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis domain={[80, 100]} tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip {...DARK_TT}/>
                      <Line type="monotone" dataKey="rate" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white mb-4">Latency Distribution</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={LATENCY_DIST} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="bucket" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip {...DARK_TT}/>
                      <Bar dataKey="count" fill="#2563EB" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* USER ACTIVITY TAB */}
          {tab === "User Activity" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-sm font-bold text-white mb-4">User Sessions</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={userData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="label" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <Tooltip {...DARK_TT}/>
                    <Legend wrapperStyle={{ fontSize: 11, color: "#4A6080" }}/>
                    <Bar dataKey="returning" name="Returning" stackId="a" fill="#2563EB" radius={[0,0,6,6]}/>
                    <Bar dataKey="new" name="New" stackId="a" fill="#22C55E" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Avg Session Duration", value: "12m 34s", color: "#2563EB" },
                  { label: "Pages per Session", value: "7.4", color: "#7C3AED" },
                  { label: "Return Rate", value: "78.3%", color: "#22C55E" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs mt-1 font-semibold" style={{ color: "#4A6080" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOP DOCUMENTS TAB */}
          {tab === "Top Documents" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-sm font-bold text-white">All Documents by Usage</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {["Rank", "Document Name", "Department", "Views", "Searches", "Trend", "Usage Bar"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold" style={{ color: "#4A6080" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {POPULAR_DOCS.map((d) => (
                      <tr key={d.rank} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td className="px-5 py-3">
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold" style={{ background: d.rank <= 3 ? "#2563EB" : "rgba(255,255,255,0.06)", color: d.rank <= 3 ? "#fff" : "#4A6080" }}>{d.rank}</span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-white max-w-[220px] truncate">{d.name}</td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: `${DEPT_COLORS[d.dept]}22`, color: DEPT_COLORS[d.dept] }}>{d.dept}</span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-white">{d.views.toLocaleString()}</td>
                        <td className="px-5 py-3 font-semibold text-white">{d.searches.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className="font-bold text-[11px]" style={{ color: d.trend >= 0 ? "#22C55E" : "#EF4444" }}>{d.trend >= 0 ? "+" : ""}{d.trend}%</span>
                        </td>
                        <td className="px-5 py-3 w-36">
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${(d.views / 847) * 100}%`, background: DEPT_COLORS[d.dept] || "#2563EB" }}/>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {tab === "Departments" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {DEPTS.map((d) => {
                  const usage = DEPT_USAGE.find((u) => u.dept === d.name);
                  return (
                    <div key={d.name} className="rounded-2xl p-5" style={{ background: "#111D30", border: `1px solid ${d.color}22` }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 rounded-full" style={{ background: d.color }}/>
                        <p className="text-sm font-bold text-white">{d.name}</p>
                      </div>
                      <p className="text-2xl font-extrabold" style={{ color: d.color }}>{usage?.queries}</p>
                      <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#4A6080" }}>Queries this period</p>
                      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${((usage?.queries || 0) / 312) * 100}%`, background: d.color }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-sm font-bold text-white mb-4">Comparative Usage</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={DEPT_USAGE} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="dept" tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: "#4A6080", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <Tooltip {...DARK_TT}/>
                    <Bar dataKey="queries" radius={[6,6,0,0]}>
                      {DEPT_USAGE.map((d, i) => <Cell key={i} fill={d.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
