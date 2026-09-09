import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart2,
  BookOpen,
  FileText,
  LayoutDashboard,
  MessageSquare,
  RefreshCw,
  Search,
  UserCircle,
  Users,
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const MANAGER_NAV: SidebarNavItem[] = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

type Period = "7d" | "30d" | "90d";

interface AnalyticsResponse {
  success: boolean;
  period: string;
  scope: {
    role: "manager" | "admin";
    departmentId: string | null;
    departmentName: string | null;
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalDocuments: number;
    readyDocuments: number;
    failedDocuments: number;
    knowledgeChunks: number;
    conversations: number;
    aiQuestions: number;
  };
  roleDistribution: {
    admin: number;
    manager: number;
    employee: number;
  };
  activity: Array<{
    date: string;
    label: string;
    aiQuestions: number;
    documents: number;
    newUsers: number;
  }>;
  departmentCoverage: Array<{
    id: string;
    name: string;
    users: number;
    documents: number;
    readyDocuments: number;
    chunks: number;
  }>;
  topDocuments: Array<{
    id: string;
    title: string;
    fileName: string;
    department: string;
    chunks: number;
    createdAt: string;
  }>;
  departments: Array<{ id: string; name: string }>;
  generatedAt: string;
  message?: string;
}

const CARD = {
  background: "#111D30",
  border: "1px solid rgba(255,255,255,0.06)",
};

function MetricCard({
  label,
  value,
  hint,
  primary = false,
}: {
  label: string;
  value: number;
  hint: string;
  primary?: boolean;
}) {
  return (
    <div
      className={primary ? "rounded-2xl p-5" : "rounded-xl px-4 py-3.5"}
      style={{
        background: primary ? "#111D30" : "#0F1A2B",
        border: primary
          ? "1px solid rgba(96,165,250,0.10)"
          : "1px solid rgba(255,255,255,0.05)",
        boxShadow: primary ? "0 8px 28px rgba(0,0,0,0.10)" : "none",
      }}
    >
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: primary ? "#5B77A0" : "#465A75" }}>
        {label}
      </p>
      <p className={primary ? "text-3xl font-extrabold text-white mt-2" : "text-xl font-extrabold text-white mt-1.5"}>
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] mt-1" style={{ color: "#64748B" }}>{hint}</p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { user, session, logout } = useAuth();
  const [period, setPeriod] = useState<Period>("7d");
  const [departmentId, setDepartmentId] = useState("");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function loadAnalytics() {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ period });
      if (user?.role === "admin" && departmentId) {
        params.set("departmentId", departmentId);
      }

      const response = await fetch(`${API_URL}/api/admin/analytics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = (await response.json()) as AnalyticsResponse;
      if (!response.ok) throw new Error(payload.message || "Failed to load analytics");
      setData(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, [session?.access_token, period, departmentId]);

  const scopeLabel = useMemo(() => {
    if (!data) return "Loading current EKIP data";
    if (
      data.scope.role === "manager" &&
      data.scope.departmentName
    ) {
      return `${data.scope.departmentName} department + General knowledge`;
    }

    if (data.scope.departmentName) {
      return `${data.scope.departmentName} scope`;
    }

    return data.scope.role === "admin"
      ? "Organization-wide"
      : "Manager scope";
  }, [data]);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0C1525", color: "#E8EFF8" }}>
      <EKIPSidebar
        items={MANAGER_NAV}
        subtitle="Manager"
        subtitleColor="#A78BFA"
        settingsPath="/manager-settings"
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-4" style={{ background: "#0A1220", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-extrabold text-white">Analytics</h1>
            </div>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>
              Usage and knowledge metrics · {scopeLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <select
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                className="rounded-lg px-3 py-2 text-xs outline-none"
                style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}
              >
                <option value="">All Departments</option>
                {data?.departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            )}

            {(["7d", "30d", "90d"] as Period[]).map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className="rounded-lg px-3 py-2 text-xs font-bold"
                style={{
                  background: period === item ? "#2563EB" : "#111D30",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: period === item ? "#fff" : "#64748B",
                }}
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => void loadAnalytics()}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}>
              {error}
            </div>
          )}

          {!data && loading ? (
            <div className="flex items-center justify-center h-64 text-sm" style={{ color: "#64748B" }}>Loading real analytics…</div>
          ) : data ? (
            <>
              <section className="space-y-3">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-white">Overview</h2>
                    <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                      Core usage and knowledge health for the selected scope.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {user?.role === "manager" ? (
                    <>
                      <MetricCard primary label="Department Users" value={data.summary.totalUsers} hint={`${data.summary.activeUsers} active in ${data.scope.departmentName || "your department"}`} />
                      <MetricCard primary label="AI Questions" value={data.summary.aiQuestions} hint={`${data.summary.conversations} conversations stored`} />
                      <MetricCard primary label="Ready Documents" value={data.summary.readyDocuments} hint="General + department documents" />
                      <MetricCard primary label="Accessible Chunks" value={data.summary.knowledgeChunks} hint="General + department indexed chunks" />
                    </>
                  ) : (
                    <>
                      <MetricCard primary label="Users" value={data.summary.totalUsers} hint={`${data.summary.activeUsers} active accounts`} />
                      <MetricCard primary label="AI Questions" value={data.summary.aiQuestions} hint={`${data.summary.conversations} conversations stored`} />
                      <MetricCard primary label="Ready Documents" value={data.summary.readyDocuments} hint={`${data.summary.totalDocuments} total documents`} />
                      <MetricCard primary label="Knowledge Chunks" value={data.summary.knowledgeChunks} hint="Indexed document chunks" />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {user?.role === "manager" ? (
                    <>
                      <MetricCard label="Failed Documents" value={data.summary.failedDocuments} hint="Processing failures" />
                      <MetricCard label="Managers" value={data.roleDistribution.manager} hint="Assigned to this department" />
                      <MetricCard label="Employees" value={data.roleDistribution.employee} hint="Assigned to this department" />
                      <MetricCard
                        label="General Knowledge"
                        value={data.departmentCoverage.find((department) => department.name === "General")?.chunks || 0}
                        hint="Shared knowledge chunks"
                      />
                    </>
                  ) : (
                    <>
                      <MetricCard label="Failed Documents" value={data.summary.failedDocuments} hint="Processing failures" />
                      <MetricCard label="Admins" value={data.roleDistribution.admin} hint="Accounts in scope" />
                      <MetricCard label="Managers" value={data.roleDistribution.manager} hint="Accounts in scope" />
                      <MetricCard label="Employees" value={data.roleDistribution.employee} hint="Accounts in scope" />
                    </>
                  )}
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={CARD}>
                  <div className="mb-4">
                    <h2 className="font-bold text-white">Activity Trends</h2>
                    <p className="text-xs mt-1" style={{ color: "#64748B" }}>Questions, uploads, and new accounts over the selected period.</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.activity}>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="label" stroke="#4A6080" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#4A6080" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#17253A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff" }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="aiQuestions" name="AI Questions" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="documents" name="Documents" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="newUsers" name="New Users" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={CARD}>
                  <h2 className="font-bold text-white">Department Knowledge Coverage</h2>
                  <p className="text-xs mt-1 mb-4" style={{ color: "#64748B" }}>Users, ready documents, and indexed knowledge by department.</p>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {data.departmentCoverage.length === 0 ? (
                      <p className="text-sm" style={{ color: "#64748B" }}>No department data in this scope.</p>
                    ) : data.departmentCoverage.map((department) => (
                      <div key={department.id} className="rounded-xl px-4 py-3" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{department.name}</span>
                          <span className="text-xs text-blue-400">{department.chunks} chunks</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-[11px]" style={{ color: "#64748B" }}>
                          <span>{department.users} users</span>
                          <span>{department.readyDocuments}/{department.documents} ready docs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl overflow-hidden" style={CARD}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <h2 className="font-bold text-white">Top Indexed Documents</h2>
                    <p className="text-xs mt-1" style={{ color: "#64748B" }}>Documents contributing the most indexed knowledge.</p>
                  </div>
                  <Search className="w-4 h-4" style={{ color: "#4A6080" }} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest" style={{ color: "#4A6080", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <th className="px-5 py-3">Document</th>
                        <th className="px-5 py-3">Department</th>
                        <th className="px-5 py-3">Chunks</th>
                        <th className="px-5 py-3">Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topDocuments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: "#64748B" }}>
                            No indexed documents in this scope yet.
                          </td>
                        </tr>
                      ) : data.topDocuments.map((document) => (
                        <tr key={document.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="px-5 py-3">
                            <p className="text-sm font-semibold text-white">{document.title}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>{document.fileName}</p>
                          </td>
                          <td className="px-5 py-3 text-xs" style={{ color: "#94A3B8" }}>{document.department}</td>
                          <td className="px-5 py-3 text-xs font-bold text-blue-400">{document.chunks}</td>
                          <td className="px-5 py-3 text-xs" style={{ color: "#64748B" }}>{new Date(document.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <p className="text-[10px] text-right" style={{ color: "#3D5A78" }}>
                Generated from current EKIP database records at {new Date(data.generatedAt).toLocaleString()}.
              </p>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
