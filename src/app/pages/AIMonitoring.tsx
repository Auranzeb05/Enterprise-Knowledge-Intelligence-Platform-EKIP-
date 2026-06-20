import { useState, useId, useMemo } from "react";
import { useNavigate } from "react-router";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, BarChart2, ClipboardList, Brain, FileText,
  Sparkles, RefreshCw, Download, ChevronDown, Check, AlertTriangle,
  X, Zap, Target, Activity, Database, Shield, Clock, UserCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid,
} from "recharts";

const NAV: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

type Period = "1h" | "24h" | "7d" | "30d";
type ModelId = "ekip-v4-2" | "ekip-v4-1" | "ekip-v3-8" | "ekip-embed-v2";

interface Model {
  id: ModelId;
  name: string;
  version: string;
  status: "live" | "shadow" | "deprecated";
  type: string;
  statusColor: string;
  accentColor: string;
  uptime: string;
  latency: string;
  accuracy: string;
  tokens: string;
}

const MODELS: Model[] = [
  { id: "ekip-v4-2", name: "ekip-v4-2", version: "4.2.1", status: "live", type: "Reasoning LLM", statusColor: "#22C55E", accentColor: "#2563EB", uptime: "99.97%", latency: "142ms", accuracy: "94.2%", tokens: "2.4B" },
  { id: "ekip-v4-1", name: "ekip-v4-1", version: "4.1.8", status: "shadow", type: "Reasoning LLM", statusColor: "#8B5CF6", accentColor: "#7C3AED", uptime: "99.91%", latency: "158ms", accuracy: "92.1%", tokens: "1.1B" },
  { id: "ekip-v3-8", name: "ekip-v3-8", version: "3.8.5", status: "deprecated", type: "Legacy LLM", statusColor: "#F59E0B", accentColor: "#D97706", uptime: "98.40%", latency: "211ms", accuracy: "87.5%", tokens: "340M" },
  { id: "ekip-embed-v2", name: "ekip-embed-v2", version: "2.4.0", status: "live", type: "Embedding", statusColor: "#06B6D4", accentColor: "#0891B2", uptime: "99.99%", latency: "28ms", accuracy: "96.8%", tokens: "890M" },
];

const MODEL_SWITCHER_COLORS: Record<ModelId, { bg: string; border: string; text: string }> = {
  "ekip-v4-2": { bg: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.3)", text: "#60A5FA" },
  "ekip-v4-1": { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", text: "#A78BFA" },
  "ekip-v3-8": { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#FCD34D" },
  "ekip-embed-v2": { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)", text: "#67E8F9" },
};

function generateResponseTimeData(period: Period) {
  const counts: Record<Period, number> = { "1h": 12, "24h": 24, "7d": 14, "30d": 30 };
  const n = counts[period];
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    p50: 110 + Math.round(Math.sin(i / 3) * 20 + Math.random() * 25),
    p90: 180 + Math.round(Math.sin(i / 3.5) * 30 + Math.random() * 35),
    p99: 280 + Math.round(Math.sin(i / 4) * 40 + Math.random() * 50),
  }));
}

function generateTokenData(period: Period) {
  const scale: Record<Period, number> = { "1h": 1, "24h": 24, "7d": 168, "30d": 720 };
  const s = scale[period];
  const n = period === "1h" ? 12 : period === "24h" ? 24 : period === "7d" ? 14 : 30;
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    input: Math.round((12000 + Math.random() * 5000) * s / n),
    output: Math.round((8000 + Math.random() * 3000) * s / n),
    cached: Math.round((4000 + Math.random() * 2000) * s / n),
  }));
}

function generateRetrievalData(period: Period) {
  const n = period === "1h" ? 12 : period === "24h" ? 24 : period === "7d" ? 14 : 30;
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    accuracy: 90 + Math.sin(i / 4) * 4 + Math.random() * 2,
    recall: 88 + Math.sin(i / 3) * 5 + Math.random() * 2,
    precision: 92 + Math.sin(i / 5) * 3 + Math.random() * 1.5,
  }));
}

function generateUsageTrendData(period: Period) {
  const n = period === "1h" ? 12 : period === "24h" ? 24 : period === "7d" ? 14 : 30;
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    queries: 800 + Math.round(Math.sin(i / 4) * 200 + Math.random() * 150),
    aiAssisted: 600 + Math.round(Math.sin(i / 5) * 150 + Math.random() * 100),
    retrievalHits: 400 + Math.round(Math.sin(i / 3) * 100 + Math.random() * 80),
  }));
}

const RADAR_DATA = [
  { axis: "Latency", v42: 88, v41: 82 },
  { axis: "Accuracy", v42: 94, v41: 92 },
  { axis: "Throughput", v42: 91, v41: 86 },
  { axis: "Safety", v42: 99, v41: 97 },
  { axis: "Cache Hit", v42: 72, v41: 68 },
  { axis: "Uptime", v42: 100, v41: 99 },
];

const FAILED_QUERIES = [
  { id: 1, reason: "Context window exceeded", severity: "high", model: "ekip-v4-2", timestamp: "09:44:02", tokens: 32768 },
  { id: 2, reason: "Rate limit reached", severity: "medium", model: "ekip-v4-1", timestamp: "09:38:17", tokens: 0 },
  { id: 3, reason: "Retrieval timeout", severity: "high", model: "ekip-v4-2", timestamp: "09:31:55", tokens: 1240 },
  { id: 4, reason: "Safety filter triggered", severity: "critical", model: "ekip-v4-2", timestamp: "09:22:08", tokens: 880 },
  { id: 5, reason: "Invalid tool call schema", severity: "low", model: "ekip-embed-v2", timestamp: "09:14:33", tokens: 512 },
];

const ERROR_TYPES = [
  { label: "Context Window", pct: 32, color: "#EF4444" },
  { label: "Rate Limit", pct: 24, color: "#F59E0B" },
  { label: "Retrieval Timeout", pct: 18, color: "#8B5CF6" },
  { label: "Safety Filter", pct: 12, color: "#EC4899" },
  { label: "Schema Error", pct: 8, color: "#6B7280" },
  { label: "Other", pct: 6, color: "#374151" },
];

const SEV_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(107,114,128,0.15)", text: "#9CA3AF" },
  medium: { bg: "rgba(245,158,11,0.15)", text: "#FCD34D" },
  high: { bg: "rgba(239,68,68,0.15)", text: "#F87171" },
  critical: { bg: "rgba(239,68,68,0.2)", text: "#FCA5A5" },
};

function GaugeRing({ label, value, color, id }: { label: string; value: number; color: string; id: string }) {
  const r = 40;
  const sweep = 225;
  const circumference = 2 * Math.PI * r;
  const dashLen = (sweep / 360) * circumference;
  const offset = dashLen * (1 - value / 100);
  const startAngle = -225 / 2 - 90;
  const startRad = (startAngle * Math.PI) / 180;
  const cx = 52, cy = 56;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const gradId = `gauge-grad-${id}`;

  return (
    <div className="flex flex-col items-center">
      <svg width="104" height="88" viewBox="0 0 104 88">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeDasharray={`${dashLen} ${circumference}`} strokeDashoffset="0" strokeLinecap="round" style={{ transform: `rotate(${startAngle + 90}deg)`, transformOrigin: `${cx}px ${cy}px` }} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="8" strokeDasharray={`${dashLen} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round" style={{ transform: `rotate(${startAngle + 90}deg)`, transformOrigin: `${cx}px ${cy}px` }} />
        <text x={cx} y={cy - 2} textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="Inter,monospace">{value}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={color} fontSize="8" fontWeight="600">{label}</text>
      </svg>
    </div>
  );
}

function ModelSwitcherButton({ model, selected, onClick }: { model: Model; selected: boolean; onClick: () => void }) {
  const c = MODEL_SWITCHER_COLORS[model.id];
  return (
    <button onClick={onClick} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-all mb-1" style={{ background: selected ? c.bg : "rgba(255,255,255,0.02)", border: `1px solid ${selected ? c.border : "rgba(255,255,255,0.05)"}` }}>
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: model.statusColor, boxShadow: model.status === "live" ? `0 0 6px ${model.statusColor}` : undefined }} />
      <span className="text-[10px] font-semibold font-mono flex-1" style={{ color: selected ? c.text : "#3D5A78" }}>{model.name}</span>
      {selected && <Check className="w-3 h-3" style={{ color: c.text }} />}
    </button>
  );
}

const TOOLTIP_STYLE = { background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, color: "#E8EFF8" };

export default function AIMonitoring() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [period, setPeriod] = useState<Period>("24h");
  const [alertsOn, setAlertsOn] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelId>("ekip-v4-2");
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [exportDropOpen, setExportDropOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const uid = useId();

  const model = MODELS.find(m => m.id === selectedModel)!;
  const rtData = useMemo(() => generateResponseTimeData(period), [period]);
  const tokenData = useMemo(() => generateTokenData(period), [period]);
  const retrievalData = useMemo(() => generateRetrievalData(period), [period]);
  const usageData = useMemo(() => generateUsageTrendData(period), [period]);

  async function handleRefresh() {
    setSpinning(true);
    await new Promise(r => setTimeout(r, 800));
    setSpinning(false);
  }

  async function handleExport(fmt: string) {
    setExportDropOpen(false);
    setExporting(true);
    await new Promise(r => setTimeout(r, 900));
    setExporting(false);
    setExportDone(true);
    await new Promise(r => setTimeout(r, 800));
    setExportDone(false);
  }

  const BANNER_COLORS: Record<ModelId, { bg: string; border: string; accent: string }> = {
    "ekip-v4-2": { bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)", accent: "#2563EB" },
    "ekip-v4-1": { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", accent: "#7C3AED" },
    "ekip-v3-8": { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", accent: "#D97706" },
    "ekip-embed-v2": { bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)", accent: "#0891B2" },
  };
  const bannerCfg = BANNER_COLORS[selectedModel];

  const kpiGaugeId = (label: string) => `${uid}-gauge-${label}`;

  const badgeSidebar = (
    <div className="p-3 rounded-xl" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#60A5FA" }} />
          <span className="text-[10px] font-bold text-white">AI Ops Center</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 4px #22C55E" }} />
      </div>
      <p className="text-[9px] font-mono" style={{ color: "rgba(37,99,235,0.7)" }}>v4.2.1 · ekip-v4-2</p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060D1A", fontFamily: "'Plus Jakarta Sans',Inter,sans-serif" }}>
      <EKIPSidebar items={NAV} subtitle="Intelligence" subtitleColor="rgba(37,99,235,0.5)" badge={badgeSidebar} settingsPath="/admin-settings" onLogout={handleLogout}>
        <div className="px-2 pb-3">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2 px-2" style={{ color: "#1E3A5F" }}>Models</p>
          {MODELS.map(m => <ModelSwitcherButton key={m.id} model={m} selected={selectedModel === m.id} onClick={() => setSelectedModel(m.id)} />)}
        </div>
      </EKIPSidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "rgba(4,8,15,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: "#60A5FA" }} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">AI Monitoring</h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.25)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 4px #22C55E" }} />Live
                </span>
              </div>
              <p className="text-[11px]" style={{ color: "#3D5A78" }}>Operations Center · Jun 20 2026 09:51 UTC</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(["1h", "24h", "7d", "30d"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: period === p ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.04)", color: period === p ? "#60A5FA" : "#3D5A78", border: `1px solid ${period === p ? "rgba(37,99,235,0.35)" : "rgba(255,255,255,0.06)"}` }}>{p}</button>
            ))}
            <button onClick={() => setAlertsOn(a => !a)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: alertsOn ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)", color: alertsOn ? "#FCD34D" : "#3D5A78", border: `1px solid ${alertsOn ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"}` }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Alerts {alertsOn ? "On" : "Off"}
            </button>
            <div className="relative">
              <button onClick={() => setModelDropOpen(d => !d)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                <Brain className="w-3.5 h-3.5" style={{ color: "#60A5FA" }} /> {model.name} <ChevronDown className="w-3 h-3" />
              </button>
              {modelDropOpen && (
                <div className="absolute right-0 top-10 z-50 p-2 rounded-xl shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 220 }}>
                  {MODELS.map(m => (
                    <button key={m.id} onClick={() => { setSelectedModel(m.id); setModelDropOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left hover:bg-white/5 transition-colors">
                      <div className="w-2 h-2 rounded-full" style={{ background: m.statusColor, boxShadow: m.status === "live" ? `0 0 5px ${m.statusColor}` : undefined }} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold font-mono" style={{ color: "#E8EFF8" }}>{m.name}</p>
                        <p className="text-[10px]" style={{ color: "#3D5A78" }}>{m.type}</p>
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: m.statusColor }}>{m.status}</span>
                      {selectedModel === m.id && <Check className="w-3.5 h-3.5" style={{ color: "#60A5FA" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleRefresh} className="p-2 rounded-lg" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
              <RefreshCw className={`w-3.5 h-3.5 ${spinning ? "animate-spin" : ""}`} />
            </button>
            <div className="relative">
              <button onClick={() => setExportDropOpen(d => !d)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: exportDone ? "#22C55E" : "#2563EB" }}>
                {exporting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : exportDone ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                {exportDone ? "Done!" : "Export Metrics"}
              </button>
              {exportDropOpen && (
                <div className="absolute right-0 top-10 z-50 p-2 rounded-xl shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 140 }}>
                  {["JSON", "CSV", "PDF"].map(fmt => (
                    <button key={fmt} onClick={() => handleExport(fmt)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors" style={{ color: "#E8EFF8" }}><Download className="w-3 h-3" style={{ color: "#3D5A78" }} />{fmt}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Model Banner */}
          <div className="rounded-xl px-5 py-4 mb-5 flex items-center gap-6" style={{ background: bannerCfg.bg, border: `1px solid ${bannerCfg.border}` }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: bannerCfg.accent }}>Active Model</p>
              <p className="text-base font-bold font-mono text-white">{model.name}</p>
              <p className="text-xs" style={{ color: "#3D5A78" }}>{model.type} · v{model.version}</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{ background: `${model.statusColor}20`, color: model.statusColor, border: `1px solid ${model.statusColor}40` }}>{model.status.toUpperCase()}</span>
            <div className="flex-1" />
            {[{ label: "Uptime", val: model.uptime }, { label: "Avg Latency", val: model.latency }, { label: "Accuracy", val: model.accuracy }, { label: "Total Tokens", val: model.tokens }].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>{stat.label}</p>
                <p className="text-base font-bold font-mono" style={{ color: bannerCfg.accent }}>{stat.val}</p>
              </div>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              { label: "Avg LLM Latency", val: "142ms", icon: Clock, color: "#2563EB", mono: true },
              { label: "Token Usage", val: "2.4B", icon: Database, color: "#8B5CF6", mono: true },
              { label: "Retrieval Accuracy", val: "94.2%", icon: Target, color: "#22C55E", mono: false },
              { label: "Failed Queries", val: "5", icon: AlertTriangle, color: "#EF4444", mono: false },
              { label: "Query Success Rate", val: "98.6%", icon: Zap, color: "#F59E0B", mono: false },
            ].map(kpi => {
              const IconCmp = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>{kpi.label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}18` }}>
                      <IconCmp className="w-3.5 h-3.5" style={{ color: kpi.color }} strokeWidth={1.8} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${kpi.mono ? "font-mono" : ""}`} style={{ color: kpi.color }}>{kpi.val}</p>
                </div>
              );
            })}
          </div>

          {/* Gauge Rings */}
          <div className="rounded-xl p-5 mb-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Model Performance Metrics</p>
            <div className="flex items-center justify-around">
              {[
                { label: "Accuracy", value: 94, color: "#22C55E" },
                { label: "Precision", value: 96, color: "#60A5FA" },
                { label: "Recall", value: 93, color: "#A78BFA" },
                { label: "Cache Hit", value: 72, color: "#F59E0B" },
                { label: "Uptime", value: 100, color: "#4ADE80" },
                { label: "Safety", value: 99, color: "#67E8F9" },
              ].map(g => <GaugeRing key={g.label} {...g} id={kpiGaugeId(g.label)} />)}
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Response Time Trend</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={rtData}>
                  <defs>
                    <linearGradient id={`${uid}-rtp50`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    <linearGradient id={`${uid}-rtp90`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
                    <linearGradient id={`${uid}-rtp99`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="t" hide />
                  <YAxis tick={{ fontSize: 10, fill: "#3D5A78" }} axisLine={false} tickLine={false} unit="ms" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                  <Area type="monotone" dataKey="p50" name="P50" stroke="#22C55E" fill={`url(#${uid}-rtp50)`} strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="p90" name="P90" stroke="#F59E0B" fill={`url(#${uid}-rtp90)`} strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="p99" name="P99" stroke="#EF4444" fill={`url(#${uid}-rtp99)`} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Token Usage</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tokenData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="t" hide />
                  <YAxis tick={{ fontSize: 10, fill: "#3D5A78" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                  <Bar dataKey="input" name="Input" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="output" name="Output" stackId="a" fill="#7C3AED" />
                  <Bar dataKey="cached" name="Cached" stackId="a" fill="#0891B2" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Retrieval Performance</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={retrievalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "#3D5A78" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => v.toFixed(1) + "%"} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#22C55E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="recall" name="Recall" stroke="#60A5FA" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="precision" name="Precision" stroke="#A78BFA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Model Comparison Radar</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#6B7280" }} />
                  <Radar name="ekip-v4-2" dataKey="v42" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="ekip-v4-1" dataKey="v41" stroke="#7C3AED" fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Usage Trend */}
          <div className="rounded-xl p-5 mb-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>AI Usage Trend</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id={`${uid}-uq`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                  <linearGradient id={`${uid}-ua`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                  <linearGradient id={`${uid}-ur`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" hide />
                <YAxis tick={{ fontSize: 10, fill: "#3D5A78" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6B7280" }} />
                <Area type="monotone" dataKey="queries" name="Queries" stroke="#2563EB" fill={`url(#${uid}-uq)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="aiAssisted" name="AI-Assisted" stroke="#22C55E" fill={`url(#${uid}-ua)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="retrievalHits" name="Retrieval Hits" stroke="#8B5CF6" fill={`url(#${uid}-ur)`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Row: Failed Queries + Error Distribution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Failed Queries</p>
              <div className="space-y-2">
                {FAILED_QUERIES.map(fq => (
                  <div key={fq.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style={{ background: SEV_COLORS[fq.severity].bg, color: SEV_COLORS[fq.severity].text }}>{fq.severity}</span>
                    <span className="text-xs flex-1 truncate" style={{ color: "#9CA3AF" }}>{fq.reason}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(37,99,235,0.1)", color: "#60A5FA" }}>{fq.model}</span>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-mono" style={{ color: "#3D5A78" }}>{fq.timestamp}</p>
                      {fq.tokens > 0 && <p className="text-[9px] font-mono" style={{ color: "#1E3A5F" }}>{fq.tokens.toLocaleString()} tok</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#3D5A78" }}>Error Distribution</p>
              <div className="space-y-2.5 mb-5">
                {ERROR_TYPES.map(e => (
                  <div key={e.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px]" style={{ color: "#9CA3AF" }}>{e.label}</span>
                      <span className="text-[11px] font-semibold font-mono" style={{ color: e.color }}>{e.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${e.pct}%`, background: e.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#3D5A78" }}>Model Comparison</p>
              <table className="w-full">
                <thead>
                  <tr>
                    {["Model", "Errors", "Rate"].map(h => <th key={h} className="text-left pb-2"><span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#1E3A5F" }}>{h}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map(m => (
                    <tr key={m.id}>
                      <td className="py-1"><span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>{m.name}</span></td>
                      <td className="py-1"><span className="text-[11px] font-mono" style={{ color: "#9CA3AF" }}>{Math.round(Math.random() * 20 + 2)}</span></td>
                      <td className="py-1"><span className="text-[11px] font-mono" style={{ color: m.status === "deprecated" ? "#F59E0B" : "#22C55E" }}>{(Math.random() * 2 + 0.2).toFixed(2)}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
