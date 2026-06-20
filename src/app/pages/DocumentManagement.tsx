import { useState, useMemo, useRef, useCallback } from "react";
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
  Search,
  Grid3X3,
  List,
  Upload,
  Trash2,
  Download,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
  MoreHorizontal,
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

const TYPE_COLORS: Record<string, string> = {
  PDF: "#EF4444",
  DOCX: "#2563EB",
  PPTX: "#F59E0B",
};

const DEPT_COLORS: Record<string, string> = {
  HR: "#10B981",
  Finance: "#F59E0B",
  Legal: "#F97316",
  Operations: "#06B6D4",
  Compliance: "#8B5CF6",
  Technology: "#2563EB",
  Executive: "#7C3AED",
  Marketing: "#EC4899",
};

const DEPARTMENTS = Object.keys(DEPT_COLORS);

interface Doc {
  id: string;
  name: string;
  sizeKB: number;
  pages: number;
  department: string;
  type: "PDF" | "DOCX" | "PPTX";
  uploadedBy: string;
  uploadedByInitials: string;
  uploadDate: string;
  status: "Indexed" | "Processing" | "Failed";
}

const DOCUMENTS: Doc[] = [
  { id: "1", name: "Employee Handbook 2026", sizeKB: 4240, pages: 88, department: "HR", type: "PDF", uploadedBy: "Sarah M.", uploadedByInitials: "SM", uploadDate: "2026-01-15", status: "Indexed" },
  { id: "2", name: "Leave & Absence Policy v3.1", sizeKB: 980, pages: 24, department: "HR", type: "DOCX", uploadedBy: "Tom R.", uploadedByInitials: "TR", uploadDate: "2026-02-20", status: "Indexed" },
  { id: "3", name: "Q1 2026 Financial Report", sizeKB: 7820, pages: 64, department: "Finance", type: "PPTX", uploadedBy: "Alice K.", uploadedByInitials: "AK", uploadDate: "2026-03-15", status: "Indexed" },
  { id: "4", name: "Expense Reimbursement Policy", sizeKB: 820, pages: 19, department: "Finance", type: "PDF", uploadedBy: "David L.", uploadedByInitials: "DL", uploadDate: "2026-03-01", status: "Indexed" },
  { id: "5", name: "Master Services Agreement Template", sizeKB: 2340, pages: 52, department: "Legal", type: "DOCX", uploadedBy: "Priya S.", uploadedByInitials: "PS", uploadDate: "2026-01-08", status: "Indexed" },
  { id: "6", name: "Data Processing Agreement v2", sizeKB: 1880, pages: 44, department: "Legal", type: "PDF", uploadedBy: "Priya S.", uploadedByInitials: "PS", uploadDate: "2025-12-01", status: "Failed" },
  { id: "7", name: "Remote Work Policy v2.0", sizeKB: 640, pages: 16, department: "Operations", type: "DOCX", uploadedBy: "James O.", uploadedByInitials: "JO", uploadDate: "2026-02-28", status: "Indexed" },
  { id: "8", name: "SOC 2 Type II Audit Report", sizeKB: 5210, pages: 96, department: "Compliance", type: "PDF", uploadedBy: "Nina W.", uploadedByInitials: "NW", uploadDate: "2026-03-10", status: "Processing" },
  { id: "9", name: "Data Retention Framework", sizeKB: 1640, pages: 38, department: "Compliance", type: "PDF", uploadedBy: "Nina W.", uploadedByInitials: "NW", uploadDate: "2026-01-22", status: "Indexed" },
  { id: "10", name: "Information Security Policy", sizeKB: 1390, pages: 33, department: "Technology", type: "DOCX", uploadedBy: "Raj P.", uploadedByInitials: "RP", uploadDate: "2026-03-05", status: "Processing" },
  { id: "11", name: "Board Presentation Q1 2026", sizeKB: 12400, pages: 42, department: "Executive", type: "PPTX", uploadedBy: "CEO Office", uploadedByInitials: "CO", uploadDate: "2026-03-20", status: "Indexed" },
  { id: "12", name: "Brand Guidelines 2026", sizeKB: 8900, pages: 71, department: "Marketing", type: "PDF", uploadedBy: "Brand Team", uploadedByInitials: "BT", uploadDate: "2026-02-05", status: "Failed" },
];

const PAGE_SIZE = 8;

function formatSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function StatusBadge({ status }: { status: Doc["status"] }) {
  const conf: Record<Doc["status"], { bg: string; color: string; icon: React.ReactNode }> = {
    Indexed: { bg: "#10B98118", color: "#10B981", icon: <CheckCircle size={11} /> },
    Processing: { bg: "#F59E0B18", color: "#F59E0B", icon: <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> },
    Failed: { bg: "#EF444418", color: "#EF4444", icon: <XCircle size={11} /> },
  };
  const c = conf[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        borderRadius: 6,
        padding: "3px 9px",
      }}
    >
      {c.icon}
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || COLORS.muted;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        color,
        background: color + "18",
        border: `1px solid ${color}33`,
        borderRadius: 4,
        padding: "2px 7px",
        letterSpacing: "0.04em",
      }}
    >
      .{type.toLowerCase()}
    </span>
  );
}

function DeptBadge({ dept }: { dept: string }) {
  const color = DEPT_COLORS[dept] || COLORS.muted;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color,
        background: color + "18",
        borderRadius: 6,
        padding: "3px 8px",
      }}
    >
      {dept}
    </span>
  );
}

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  done: boolean;
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dept, setDept] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map((f) => ({ name: f.name, size: f.size, progress: 0, done: false }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const startUpload = () => {
    if (!dept || files.length === 0) return;
    setUploading(true);
    files.forEach((_, i) => {
      let prog = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 20 + 5;
        if (prog >= 100) {
          prog = 100;
          clearInterval(iv);
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress: 100, done: true } : f));
        } else {
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress: Math.min(prog, 99) } : f));
        }
      }, 200);
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, width: 560, maxHeight: "80vh", overflowY: "auto", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>Upload Documents</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", padding: 4, display: "flex" }}><X size={18} /></button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? COLORS.accent : COLORS.border}`,
            borderRadius: 12,
            padding: "36px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? `${COLORS.accent}08` : COLORS.bg,
            transition: "all 0.15s",
            marginBottom: 20,
          }}
        >
          <Upload size={32} color={dragging ? COLORS.accent : COLORS.muted} style={{ margin: "0 auto 10px", display: "block" }} />
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {dragging ? "Drop files here" : "Drag & drop files here"}
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>or click to browse · PDF, DOCX, PPTX supported</div>
          <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.pptx" style={{ display: "none" }} onChange={(e) => e.target.files && addFiles(e.target.files)} />
        </div>

        {/* File queue */}
        {files.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>File Queue</div>
            {files.map((f, i) => (
              <div key={i} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>{(f.size / 1024).toFixed(0)} KB</span>
                </div>
                <div style={{ height: 4, background: COLORS.border, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${f.progress}%`, height: "100%", background: f.done ? "#10B981" : COLORS.accent, borderRadius: 99, transition: "width 0.2s" }} />
                </div>
                {f.done && <div style={{ fontSize: 11, color: "#10B981", marginTop: 4 }}>Upload complete</div>}
              </div>
            ))}
          </div>
        )}

        {/* Department selector */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Assign Department</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {DEPARTMENTS.map((d) => {
              const color = DEPT_COLORS[d];
              return (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  style={{
                    background: dept === d ? `${color}22` : COLORS.bg,
                    border: `1px solid ${dept === d ? color : COLORS.border}`,
                    borderRadius: 8,
                    padding: "8px 6px",
                    color: dept === d ? color : COLORS.muted,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    textAlign: "center",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 20px", color: COLORS.muted, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={startUpload}
            disabled={!dept || files.length === 0 || uploading}
            style={{
              background: dept && files.length > 0 && !uploading ? COLORS.accent : COLORS.border,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              color: "white",
              cursor: dept && files.length > 0 && !uploading ? "pointer" : "default",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Upload size={15} />
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const color = DEPT_COLORS[doc.department] || COLORS.accent;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, width: 640, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{doc.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 3 }}>Preview</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", display: "flex" }}><X size={18} /></button>
        </div>

        {/* Metadata strip */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Department", value: doc.department },
            { label: "Type", value: doc.type },
            { label: "Size", value: formatSize(doc.sizeKB) },
            { label: "Pages", value: `${doc.pages}p` },
            { label: "Uploaded", value: new Date(doc.uploadDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
            { label: "By", value: doc.uploadedBy },
            { label: "Status", value: doc.status },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Fake page thumbnails */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {Array.from({ length: Math.min(doc.pages, 9) }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "0.77",
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: 12,
                gap: 6,
              }}
            >
              <div style={{ width: "100%", height: 6, background: color + "55", borderRadius: 3 }} />
              {[...Array(6)].map((_, j) => (
                <div key={j} style={{ width: `${70 + Math.random() * 30}%`, height: 4, background: COLORS.border, borderRadius: 2, alignSelf: "flex-start" }} />
              ))}
              <div style={{ marginTop: "auto", fontSize: 10, color: COLORS.muted }}>p.{i + 1}</div>
            </div>
          ))}
          {doc.pages > 9 && (
            <div style={{ aspectRatio: "0.77", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.muted, fontSize: 13, fontWeight: 600 }}>
              +{doc.pages - 9} more
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "9px 18px", color: COLORS.muted, cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}
          >
            Close
          </button>
          <button
            style={{ background: COLORS.accent, border: "none", borderRadius: 8, padding: "9px 18px", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ count, onCancel, onConfirm }: { count: number; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, width: 400, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#EF444418", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={24} color="#EF4444" />
          </div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>Delete {count} Document{count !== 1 ? "s" : ""}?</div>
          <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>
            This will permanently remove {count === 1 ? "this document" : `these ${count} documents`} from the knowledge base. This action cannot be undone.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "11px", color: COLORS.muted, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, background: "#EF4444", border: "none", borderRadius: 8, padding: "11px", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocumentManagement() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const nav = role === "admin" ? NAV_ADMIN : role === "manager" ? NAV_MANAGER : NAV_EMPLOYEE;
  const settingsPath = role === "admin" ? "/admin-settings" : role === "manager" ? "/manager-settings" : "/settings";
  const [docs, setDocs] = useState<Doc[]>(DOCUMENTS);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string[]>([]);
  const [filterDept, setFilterDept] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let d = docs;
    if (search) d = d.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()));
    if (filterDept) d = d.filter((x) => x.department === filterDept);
    if (filterType) d = d.filter((x) => x.type === filterType);
    if (filterStatus) d = d.filter((x) => x.status === filterStatus);
    return d;
  }, [docs, search, filterDept, filterType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpis = useMemo(() => ({
    total: docs.length,
    indexed: docs.filter((d) => d.status === "Indexed").length,
    processing: docs.filter((d) => d.status === "Processing").length,
    failed: docs.filter((d) => d.status === "Failed").length,
    showing: filtered.length,
  }), [docs, filtered]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleAll = useCallback(() => {
    const pageIds = paginated.map((d) => d.id);
    const allSelected = pageIds.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }, [paginated, selected]);

  const handleDelete = (ids: string[]) => {
    setDeleteTarget(ids);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    setDocs((prev) => prev.filter((d) => !deleteTarget.includes(d.id)));
    setSelected((prev) => prev.filter((id) => !deleteTarget.includes(id)));
    setShowDelete(false);
    setDeleteTarget([]);
  };

  const KPI_CONFIGS = [
    { label: "Total Documents", value: kpis.total, color: COLORS.accent },
    { label: "Indexed", value: kpis.indexed, color: "#10B981" },
    { label: "Processing", value: kpis.processing, color: "#F59E0B" },
    { label: "Failed", value: kpis.failed, color: "#EF4444" },
    { label: "Showing", value: kpis.showing, color: COLORS.muted },
  ];

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2D45; border-radius: 3px; }
      `}</style>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
      {showDelete && <DeleteModal count={deleteTarget.length} onCancel={() => setShowDelete(false)} onConfirm={confirmDelete} />}

      <EKIPSidebar items={nav} settingsPath={settingsPath} onLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            background: COLORS.card,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>Document Management</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>Upload, manage and index enterprise documents</div>
          </div>
          <div
            style={{
              position: "relative",
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
            }}
          >
            <Search size={14} color={COLORS.muted} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search documents…"
              style={{ background: "transparent", border: "none", outline: "none", padding: "9px 10px", color: COLORS.text, fontSize: 13, fontFamily: "inherit", width: 220 }}
            />
          </div>
          <button
            onClick={() => setViewMode((p) => p === "table" ? "grid" : "table")}
            style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "9px 10px", color: COLORS.muted, cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            {viewMode === "table" ? <Grid3X3 size={15} /> : <List size={15} />}
          </button>

          {/* Filters */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setFilterOpen((p) => !p)}
              style={{
                background: (filterDept || filterType || filterStatus) ? `${COLORS.accent}18` : "transparent",
                border: `1px solid ${(filterDept || filterType || filterStatus) ? COLORS.accent : COLORS.border}`,
                borderRadius: 8,
                padding: "9px 14px",
                color: (filterDept || filterType || filterStatus) ? COLORS.accent : COLORS.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              <Filter size={14} />
              Filters
              {(filterDept || filterType || filterStatus) && (
                <span style={{ background: COLORS.accent, color: "white", borderRadius: 10, fontSize: 10, padding: "1px 5px" }}>
                  {[filterDept, filterType, filterStatus].filter(Boolean).length}
                </span>
              )}
            </button>
            {filterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 16,
                  zIndex: 100,
                  width: 280,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Filter Documents</div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Department</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {DEPARTMENTS.map((d) => (
                    <button key={d} onClick={() => setFilterDept(filterDept === d ? null : d)}
                      style={{ background: filterDept === d ? `${DEPT_COLORS[d]}22` : COLORS.bg, border: `1px solid ${filterDept === d ? DEPT_COLORS[d] : COLORS.border}`, borderRadius: 6, padding: "3px 9px", color: filterDept === d ? DEPT_COLORS[d] : COLORS.muted, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 600 }}>
                      {d}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>File Type</div>
                <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                  {["PDF", "DOCX", "PPTX"].map((t) => (
                    <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
                      style={{ background: filterType === t ? `${TYPE_COLORS[t]}22` : COLORS.bg, border: `1px solid ${filterType === t ? TYPE_COLORS[t] : COLORS.border}`, borderRadius: 6, padding: "3px 9px", color: filterType === t ? TYPE_COLORS[t] : COLORS.muted, cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 700 }}>
                      .{t.toLowerCase()}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Status</div>
                <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                  {["Indexed", "Processing", "Failed"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                      style={{ background: filterStatus === s ? "#ffffff12" : COLORS.bg, border: `1px solid ${filterStatus === s ? COLORS.muted : COLORS.border}`, borderRadius: 6, padding: "3px 9px", color: filterStatus === s ? COLORS.text : COLORS.muted, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setFilterDept(null); setFilterType(null); setFilterStatus(null); setFilterOpen(false); }}
                  style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px", color: COLORS.muted, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowUpload(true)}
            style={{
              background: COLORS.accent,
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            <Upload size={14} />
            Upload Document
          </button>
        </div>

        {/* KPI strip */}
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 14, flexShrink: 0 }}>
          {KPI_CONFIGS.map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Selection toolbar */}
        {selected.length > 0 && (
          <div
            style={{
              margin: "14px 24px 0",
              background: `${COLORS.accent}14`,
              border: `1px solid ${COLORS.accent}44`,
              borderRadius: 10,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>
              {selected.length} selected
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => {}}
              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "6px 14px", color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}
            >
              <Download size={13} /> Download
            </button>
            <button
              onClick={() => handleDelete(selected)}
              style={{ background: "#EF444418", border: "1px solid #EF444444", borderRadius: 7, padding: "6px 14px", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => setSelected([])} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", display: "flex" }}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 24px 24px" }} onClick={() => filterOpen && setFilterOpen(false)}>
          {viewMode === "table" ? (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                      <th style={{ padding: "12px 16px", width: 40 }}>
                        <input
                          type="checkbox"
                          checked={paginated.length > 0 && paginated.every((d) => selected.includes(d.id))}
                          onChange={toggleAll}
                          style={{ accentColor: COLORS.accent, cursor: "pointer" }}
                        />
                      </th>
                      {["Document", "Department", "Type", "Uploaded By", "Date", "Status", ""].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 14px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 700,
                            color: COLORS.muted,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((doc) => {
                      const isSelected = selected.includes(doc.id);
                      const isHovered = hoveredRow === doc.id;
                      return (
                        <tr
                          key={doc.id}
                          onMouseEnter={() => setHoveredRow(doc.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            borderBottom: `1px solid ${COLORS.border}`,
                            background: isSelected ? `${COLORS.accent}0A` : isHovered ? COLORS.cardHover : "transparent",
                            transition: "background 0.1s",
                          }}
                        >
                          <td style={{ padding: "13px 16px" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(doc.id)}
                              style={{ accentColor: COLORS.accent, cursor: "pointer" }}
                            />
                          </td>
                          <td style={{ padding: "13px 14px", minWidth: 220 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  background: `${TYPE_COLORS[doc.type]}18`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <FileText size={15} color={TYPE_COLORS[doc.type]} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{doc.name}</div>
                                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace", marginTop: 2 }}>
                                  {formatSize(doc.sizeKB)} · {doc.pages}p
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "13px 14px" }}><DeptBadge dept={doc.department} /></td>
                          <td style={{ padding: "13px 14px" }}><TypeBadge type={doc.type} /></td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: `${DEPT_COLORS[doc.department]}44`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 9,
                                  fontWeight: 800,
                                  color: DEPT_COLORS[doc.department],
                                  flexShrink: 0,
                                }}
                              >
                                {doc.uploadedByInitials}
                              </div>
                              <span style={{ fontSize: 12 }}>{doc.uploadedBy}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 14px" }}>
                            <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.muted }}>
                              {new Date(doc.uploadDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                            </span>
                          </td>
                          <td style={{ padding: "13px 14px" }}><StatusBadge status={doc.status} /></td>
                          <td style={{ padding: "13px 14px", width: 100 }}>
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                opacity: isHovered ? 1 : 0,
                                transition: "opacity 0.15s",
                              }}
                            >
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                title="Preview"
                                style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                title="Download"
                                style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete([doc.id])}
                                title="Delete"
                                style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: 5, borderRadius: 5, display: "flex" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: `1px solid ${COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, color: COLORS.muted }}>
                  Page {page} of {totalPages} · {filtered.length} documents
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "6px 10px", color: page === 1 ? COLORS.border : COLORS.muted, cursor: page === 1 ? "default" : "pointer", display: "flex" }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{
                        background: page === i + 1 ? COLORS.accent : "transparent",
                        border: `1px solid ${page === i + 1 ? COLORS.accent : COLORS.border}`,
                        borderRadius: 7,
                        padding: "6px 11px",
                        color: page === i + 1 ? "white" : COLORS.muted,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "inherit",
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "6px 10px", color: page === totalPages ? COLORS.border : COLORS.muted, cursor: page === totalPages ? "default" : "pointer", display: "flex" }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Grid view */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {paginated.map((doc) => {
                const color = DEPT_COLORS[doc.department] || COLORS.accent;
                const typeColor = TYPE_COLORS[doc.type] || COLORS.muted;
                const isSelected = selected.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    style={{
                      background: COLORS.card,
                      border: `1px solid ${isSelected ? COLORS.accent : COLORS.border}`,
                      borderRadius: 12,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ height: 5, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(doc.id)} style={{ accentColor: COLORS.accent, cursor: "pointer" }} />
                          <div style={{ width: 32, height: 32, borderRadius: 7, background: `${typeColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={15} color={typeColor} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5 }}>
                          <TypeBadge type={doc.type} />
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10 }}>{doc.department} · {formatSize(doc.sizeKB)} · {doc.pages}p</div>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StatusBadge status={doc.status} />
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => setPreviewDoc(doc)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", padding: 4, display: "flex" }}><Eye size={13} /></button>
                          <button onClick={() => handleDelete([doc.id])} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: 4, display: "flex" }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: COLORS.muted }}>
              <FileText size={48} color={COLORS.border} style={{ margin: "0 auto 16px", display: "block" }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No documents found</div>
              <div style={{ fontSize: 13 }}>Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
