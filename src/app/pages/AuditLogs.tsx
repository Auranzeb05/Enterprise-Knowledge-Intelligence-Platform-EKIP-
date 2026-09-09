import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ClipboardList,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type AuditStatus = "success" | "failure" | "blocked" | string;

interface AuditLog {
  id: string;
  userId: string | null;
  actorEmail: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  resourceLabel: string | null;
  status: AuditStatus;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface FilterOption {
  value: string;
  count: number;
}

interface AuditResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    actions: FilterOption[];
    statuses: FilterOption[];
    resources: FilterOption[];
  };
  message?: string;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  success: {
    bg: "rgba(34,197,94,0.10)",
    text: "#4ADE80",
    border: "rgba(34,197,94,0.25)",
  },
  failure: {
    bg: "rgba(239,68,68,0.10)",
    text: "#F87171",
    border: "rgba(239,68,68,0.25)",
  },
  blocked: {
    bg: "rgba(139,92,246,0.10)",
    text: "#A78BFA",
    border: "rgba(139,92,246,0.25)",
  },
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export default function AuditLogs() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditResponse["filters"]>({
    actions: [],
    statuses: [],
    resources: [],
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  async function loadLogs() {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), pageSize: "25" });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (action) params.set("action", action);
      if (status) params.set("status", status);
      if (resourceType) params.set("resourceType", resourceType);

      const response = await fetch(`${API_URL}/api/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = (await response.json()) as AuditResponse;
      if (!response.ok) throw new Error(payload.message || "Failed to load audit logs");

      setLogs(payload.logs);
      setFilters(payload.filters);
      setTotal(payload.pagination.total);
      setTotalPages(payload.pagination.totalPages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLogs();
  }, [session?.access_token, page, debouncedSearch, action, status, resourceType]);

  const statusCounts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const item of filters.statuses) result[item.value] = item.count;
    return result;
  }, [filters.statuses]);

  function exportCsv() {
    const header = [
      "Timestamp",
      "Actor",
      "Email",
      "Role",
      "Action",
      "Resource Type",
      "Resource",
      "Status",
      "IP Address",
      "Request ID",
    ];

    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.actorName,
      log.actorEmail,
      log.actorRole,
      log.action,
      log.resourceType,
      log.resourceLabel || log.resourceId || "",
      log.status,
      log.ipAddress || "",
      log.requestId || "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ekip-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#0C1525", color: "#E8EFF8" }}>
      <EKIPSidebar subtitle="Admin" settingsPath="/admin-settings" onLogout={handleLogout} />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-4" style={{ background: "#0A1220", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-extrabold text-white">Audit Logs</h1>
            </div>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>
              Security and administrative activity recorded by EKIP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadLogs()}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={logs.length === 0}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
              style={{ background: "#2563EB", border: "none", color: "#fff" }}
            >
              <Download className="w-3.5 h-3.5" />
              Export Page
            </button>
          </div>
        </header>

        <main className="p-6 space-y-5">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#4A6080" }}>Total Recorded</p>
              <p className="text-2xl font-extrabold text-white mt-2">{total.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#4A6080" }}>Successful</p>
              <p className="text-2xl font-extrabold mt-2" style={{ color: "#4ADE80" }}>{(statusCounts.success || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#4A6080" }}>Blocked</p>
              <p className="text-2xl font-extrabold mt-2" style={{ color: "#A78BFA" }}>{(statusCounts.blocked || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "#4A6080" }}>Failures</p>
              <p className="text-2xl font-extrabold mt-2" style={{ color: "#F87171" }}>{(statusCounts.failure || 0).toLocaleString()}</p>
            </div>
          </section>

          <section className="rounded-2xl p-4" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#4A6080" }} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search actor, email, action, or resource…"
                  className="w-full rounded-lg pl-9 pr-3 py-2 text-xs outline-none"
                  style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }}
                />
              </div>

              <select value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="rounded-lg px-3 py-2 text-xs outline-none" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }}>
                <option value="">All Actions</option>
                {filters.actions.map((item) => <option key={item.value} value={item.value}>{humanize(item.value)} ({item.count})</option>)}
              </select>

              <select value={resourceType} onChange={(event) => { setResourceType(event.target.value); setPage(1); }} className="rounded-lg px-3 py-2 text-xs outline-none" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }}>
                <option value="">All Resources</option>
                {filters.resources.map((item) => <option key={item.value} value={item.value}>{humanize(item.value)} ({item.count})</option>)}
              </select>

              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg px-3 py-2 text-xs outline-none" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }}>
                <option value="">All Statuses</option>
                {filters.statuses.map((item) => <option key={item.value} value={item.value}>{humanize(item.value)} ({item.count})</option>)}
              </select>
            </div>
          </section>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}>
              {error}
            </div>
          )}

          <section className="rounded-2xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest" style={{ color: "#4A6080", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Network</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && logs.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: "#64748B" }}>Loading audit records…</td></tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <ShieldCheck className="w-8 h-8 mx-auto mb-3" style={{ color: "#2563EB" }} />
                        <p className="text-sm font-semibold text-white">No matching audit records</p>
                        <p className="text-xs mt-1" style={{ color: "#64748B" }}>New supported EKIP actions will be recorded here automatically.</p>
                      </td>
                    </tr>
                  ) : logs.map((log) => {
                    const style = STATUS_STYLE[log.status] || STATUS_STYLE.success;
                    return (
                      <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-white">{log.actorName}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{log.actorEmail} · {humanize(log.actorRole)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-blue-400">{humanize(log.action)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-white">{log.resourceLabel || log.resourceId || "—"}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{humanize(log.resourceType)}</p>
                        </td>
                        <td className="px-4 py-3 text-[11px]" style={{ color: "#64748B" }}>{log.ipAddress || "Not available"}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-white">{new Date(log.createdAt).toLocaleDateString()}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{new Date(log.createdAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
                            {humanize(log.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[11px]" style={{ color: "#64748B" }}>Page {page} of {totalPages} · {total} records</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg px-3 py-1.5 text-xs disabled:opacity-30" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }}>Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-lg px-3 py-1.5 text-xs disabled:opacity-30" style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.07)", color: "#E8EFF8" }}>Next</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
