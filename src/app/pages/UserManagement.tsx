import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, BarChart2, ClipboardList, Brain, FileText,
  Search, Filter, Download, UserPlus, Edit2, Key, Trash2, ChevronLeft,
  ChevronRight, Shield, Clock, X, Check, Eye, EyeOff, ChevronDown, UserCircle
} from "lucide-react";

const NAV: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

type Role = "Super Admin" | "Dept. Admin" | "Manager" | "Employee" | "Guest";
type Status = "Active" | "Idle" | "Suspended" | "Pending";

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  department: string;
  status: Status;
  lastLogin: string;
  memberSince: string;
  mfa: boolean;
}

const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  "Super Admin": { bg: "rgba(239,68,68,0.15)", text: "#F87171", border: "rgba(239,68,68,0.3)" },
  "Dept. Admin": { bg: "rgba(245,158,11,0.15)", text: "#FCD34D", border: "rgba(245,158,11,0.3)" },
  "Manager": { bg: "rgba(139,92,246,0.15)", text: "#A78BFA", border: "rgba(139,92,246,0.3)" },
  "Employee": { bg: "rgba(37,99,235,0.15)", text: "#60A5FA", border: "rgba(37,99,235,0.3)" },
  "Guest": { bg: "rgba(6,182,212,0.15)", text: "#67E8F9", border: "rgba(6,182,212,0.3)" },
};

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  "Super Admin": ["Full system access", "Manage all users", "View audit logs", "Configure AI models", "Export all data", "Delete records"],
  "Dept. Admin": ["Manage dept users", "View dept analytics", "Approve requests", "Export dept data"],
  "Manager": ["View team data", "Assign tasks", "Generate reports", "Approve leave"],
  "Employee": ["View own data", "Submit requests", "Access documents", "Use AI tools"],
  "Guest": ["Read-only access", "View public docs"],
};

const STATUS_COLORS: Record<Status, { bg: string; text: string; dot: string }> = {
  "Active": { bg: "rgba(34,197,94,0.12)", text: "#4ADE80", dot: "#22C55E" },
  "Idle": { bg: "rgba(234,179,8,0.12)", text: "#FDE047", dot: "#EAB308" },
  "Suspended": { bg: "rgba(239,68,68,0.12)", text: "#F87171", dot: "#EF4444" },
  "Pending": { bg: "rgba(156,163,175,0.12)", text: "#9CA3AF", dot: "#6B7280" },
};

const SEED_USERS: User[] = [
  { id: 1, name: "Alexandra Chen", email: "a.chen@ekip.io", avatar: "AC", role: "Super Admin", department: "Engineering", status: "Active", lastLogin: "2026-06-20 09:12", memberSince: "2023-01-15", mfa: true },
  { id: 2, name: "Marcus Johnson", email: "m.johnson@ekip.io", avatar: "MJ", role: "Dept. Admin", department: "Operations", status: "Active", lastLogin: "2026-06-20 08:44", memberSince: "2023-03-02", mfa: true },
  { id: 3, name: "Priya Sharma", email: "p.sharma@ekip.io", avatar: "PS", role: "Manager", department: "HR", status: "Active", lastLogin: "2026-06-19 17:30", memberSince: "2023-06-10", mfa: true },
  { id: 4, name: "Daniel Torres", email: "d.torres@ekip.io", avatar: "DT", role: "Employee", department: "Finance", status: "Idle", lastLogin: "2026-06-18 14:22", memberSince: "2024-01-08", mfa: false },
  { id: 5, name: "Sophie Müller", email: "s.muller@ekip.io", avatar: "SM", role: "Employee", department: "Marketing", status: "Active", lastLogin: "2026-06-20 07:55", memberSince: "2024-02-20", mfa: true },
  { id: 6, name: "James Okafor", email: "j.okafor@ekip.io", avatar: "JO", role: "Manager", department: "Engineering", status: "Active", lastLogin: "2026-06-20 09:01", memberSince: "2023-09-14", mfa: false },
  { id: 7, name: "Yuki Tanaka", email: "y.tanaka@ekip.io", avatar: "YT", role: "Dept. Admin", department: "Legal", status: "Pending", lastLogin: "2026-06-15 11:08", memberSince: "2025-11-03", mfa: false },
  { id: 8, name: "Carlos Rivera", email: "c.rivera@ekip.io", avatar: "CR", role: "Employee", department: "Sales", status: "Suspended", lastLogin: "2026-06-10 16:45", memberSince: "2024-05-17", mfa: false },
  { id: 9, name: "Emma Williams", email: "e.williams@ekip.io", avatar: "EW", role: "Guest", department: "External", status: "Active", lastLogin: "2026-06-20 08:30", memberSince: "2026-01-22", mfa: false },
  { id: 10, name: "Ravi Patel", email: "r.patel@ekip.io", avatar: "RP", role: "Employee", department: "Engineering", status: "Active", lastLogin: "2026-06-19 23:50", memberSince: "2024-07-01", mfa: true },
  { id: 11, name: "Fatima Al-Hassan", email: "f.alhassan@ekip.io", avatar: "FA", role: "Manager", department: "Operations", status: "Idle", lastLogin: "2026-06-18 09:20", memberSince: "2023-11-28", mfa: true },
];

const DEPARTMENTS = ["Engineering", "Operations", "HR", "Finance", "Marketing", "Legal", "Sales", "External"];
const ROLES: Role[] = ["Super Admin", "Dept. Admin", "Manager", "Employee", "Guest"];
const STATUSES: Status[] = ["Active", "Idle", "Suspended", "Pending"];
const PAGE_SIZE = 8;

function getInitialBg(name: string): string {
  const colors = ["#2563EB", "#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626"];
  return colors[name.charCodeAt(0) % colors.length];
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);
  const labels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#2563EB", "#22C55E"];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      {password && <p className="text-[10px]" style={{ color: colors[strength] }}>{labels[strength]}</p>}
    </div>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sortCol, setSortCol] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const [deleteMultiOpen, setDeleteMultiOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", role: "Employee" as Role, department: "Engineering", status: "Active" as Status, mfa: false, password: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("Employee");

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.department.toLowerCase().includes(q)) return false;
      if (filterRole && u.role !== filterRole) return false;
      if (filterDept && u.department !== filterDept) return false;
      if (filterStatus && u.status !== filterStatus) return false;
      return true;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortCol === "name") return dir * a.name.localeCompare(b.name);
      if (sortCol === "email") return dir * a.email.localeCompare(b.email);
      if (sortCol === "role") return dir * a.role.localeCompare(b.role);
      if (sortCol === "department") return dir * a.department.localeCompare(b.department);
      if (sortCol === "status") return dir * a.status.localeCompare(b.status);
      if (sortCol === "lastLogin") return dir * a.lastLogin.localeCompare(b.lastLogin);
      return 0;
    });
  }, [users, search, filterRole, filterDept, filterStatus, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const mfaCount = users.filter(u => u.mfa).length;
  const activeNow = users.filter(u => u.status === "Active").length;
  const suspended = users.filter(u => u.status === "Suspended").length;

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  }

  function toggleAll() {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(u => u.id)));
  }

  function toggleOne(id: number) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function openCreate() {
    setForm({ name: "", email: "", role: "Employee", department: "Engineering", status: "Active", mfa: false, password: "" });
    setSelectedRole("Employee");
    setFormErrors({});
    setShowPassword(false);
    setSaveDone(false);
    setCreateOpen(true);
  }

  function openEdit(u: User) {
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status, mfa: u.mfa, password: "" });
    setSelectedRole(u.role);
    setFormErrors({});
    setSaveDone(false);
    setEditUser(u);
  }

  function validateForm(isCreate: boolean) {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (isCreate && !form.password) errs.password = "Password is required";
    return errs;
  }

  async function handleSave(isCreate: boolean) {
    const errs = validateForm(isCreate);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    if (isCreate) {
      setUsers(prev => [...prev, { id: Date.now(), name: form.name, email: form.email, role: form.role, department: form.department, status: form.status, mfa: form.mfa, avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), lastLogin: "Never", memberSince: new Date().toISOString().slice(0, 10) }]);
    } else if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, name: form.name, email: form.email, role: form.role, department: form.department, status: form.status, mfa: form.mfa } : u));
    }
    setSaving(false);
    setSaveDone(true);
    await new Promise(r => setTimeout(r, 600));
    setCreateOpen(false);
    setEditUser(null);
    setSaveDone(false);
  }

  const [assigningRole, setAssigningRole] = useState<Role>("Employee");
  const [roleSpinner, setRoleSpinner] = useState(false);
  const [roleSuccess, setRoleSuccess] = useState(false);

  async function handleAssignRole() {
    setRoleSpinner(true);
    await new Promise(r => setTimeout(r, 800));
    const targets = roleUsers.length ? roleUsers.map(u => u.id) : roleUser ? [roleUser.id] : [];
    setUsers(prev => prev.map(u => targets.includes(u.id) ? { ...u, role: assigningRole } : u));
    setRoleSpinner(false);
    setRoleSuccess(true);
    await new Promise(r => setTimeout(r, 700));
    setRoleUser(null);
    setRoleUsers([]);
    setRoleSuccess(false);
  }

  const [deleteSpinner, setDeleteSpinner] = useState(false);

  async function handleDelete(id?: number) {
    setDeleteSpinner(true);
    await new Promise(r => setTimeout(r, 700));
    if (id) {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      setUsers(prev => prev.filter(u => !selected.has(u.id)));
      setSelected(new Set());
    }
    setDeleteSpinner(false);
    setDeleteUser(null);
    setDeleteMultiOpen(false);
    setDeleteConfirmText("");
  }

  const colHeader = (col: string, label: string) => (
    <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => toggleSort(col)}>
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>
        {label}
        <span style={{ opacity: sortCol === col ? 1 : 0.3 }}>{sortDir === "asc" || sortCol !== col ? "↑" : "↓"}</span>
      </span>
    </th>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0C1525", fontFamily: "'Plus Jakarta Sans',Inter,sans-serif" }}>
      <EKIPSidebar items={NAV} subtitle="Admin" subtitleColor="rgba(37,99,235,0.5)" settingsPath="/admin-settings" onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "rgba(8,15,28,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">User Management</h1>
            <p className="text-xs mt-0.5" style={{ color: "#3D5A78" }}>254 total users · {activeNow} active</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#3D5A78" }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="pl-9 pr-3 py-2 text-xs rounded-lg outline-none" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8", width: 200 }} />
            </div>
            <div className="relative">
              <button onClick={() => setFilterOpen(f => !f)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-10 z-50 p-4 rounded-xl shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 280 }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#3D5A78" }}>Role</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {ROLES.map(r => (
                      <button key={r} onClick={() => setFilterRole(filterRole === r ? "" : r)} className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all" style={{ background: filterRole === r ? ROLE_COLORS[r].bg : "rgba(255,255,255,0.05)", color: filterRole === r ? ROLE_COLORS[r].text : "#6B7280", border: `1px solid ${filterRole === r ? ROLE_COLORS[r].border : "transparent"}` }}>{r}</button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#3D5A78" }}>Department</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {DEPARTMENTS.map(d => (
                      <button key={d} onClick={() => setFilterDept(filterDept === d ? "" : d)} className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all" style={{ background: filterDept === d ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)", color: filterDept === d ? "#60A5FA" : "#6B7280", border: `1px solid ${filterDept === d ? "rgba(37,99,235,0.4)" : "transparent"}` }}>{d}</button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#3D5A78" }}>Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "" : s)} className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all" style={{ background: filterStatus === s ? STATUS_COLORS[s].bg : "rgba(255,255,255,0.05)", color: filterStatus === s ? STATUS_COLORS[s].text : "#6B7280", border: `1px solid ${filterStatus === s ? STATUS_COLORS[s].dot + "55" : "transparent"}` }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "#2563EB" }}>
              <UserPlus className="w-3.5 h-3.5" /> Create User
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              { label: "Total Users", value: 254, color: "#2563EB" },
              { label: "Active Now", value: activeNow, color: "#22C55E" },
              { label: "MFA Enabled", value: `${mfaCount}/11`, color: "#8B5CF6" },
              { label: "Suspended", value: suspended, color: "#EF4444" },
              { label: "Showing", value: filtered.length, color: "#F59E0B" },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-xl p-4" style={{ background: "#111D30", borderLeft: `3px solid ${kpi.color}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#3D5A78" }}>{kpi.label}</p>
                <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Selection toolbar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <span className="text-xs font-semibold" style={{ color: "#60A5FA" }}>{selected.size} user{selected.size > 1 ? "s" : ""} selected</span>
              <button onClick={() => { const sel = users.filter(u => selected.has(u.id)); setRoleUsers(sel); setAssigningRole("Employee"); setRoleSuccess(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Key className="w-3 h-3" /> Assign Role
              </button>
              <button onClick={() => setDeleteMultiOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button onClick={() => setSelected(new Set())} className="ml-auto" style={{ color: "#3D5A78" }}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 accent-blue-500" />
                  </th>
                  {colHeader("name", "User")}
                  {colHeader("email", "Email")}
                  {colHeader("role", "Role")}
                  {colHeader("department", "Department")}
                  {colHeader("status", "Status")}
                  {colHeader("lastLogin", "Last Login")}
                  <th className="px-4 py-3 w-24"><span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, i) => (
                  <tr key={u.id} className="group transition-colors" style={{ borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined, background: selected.has(u.id) ? "rgba(37,99,235,0.06)" : undefined }}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} className="w-3.5 h-3.5 accent-blue-500" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: getInitialBg(u.name) }}>
                            {u.avatar}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: "#111D30", background: STATUS_COLORS[u.status].dot }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold" style={{ color: "#E8EFF8" }}>{u.name}</span>
                            {u.mfa && <Shield className="w-3 h-3" style={{ color: "#8B5CF6" }} />}
                          </div>
                          <span className="text-[10px]" style={{ color: "#3D5A78" }}>Since {u.memberSince}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs font-mono" style={{ color: "#6B7280" }}>{u.email}</span></td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: ROLE_COLORS[u.role].bg, color: ROLE_COLORS[u.role].text, border: `1px solid ${ROLE_COLORS[u.role].border}` }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.05)", color: "#9CA3AF", border: "1px solid rgba(255,255,255,0.08)" }}>{u.department}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[u.status].dot }} />
                        <span className="text-xs font-medium" style={{ color: STATUS_COLORS[u.status].text }}>{u.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" style={{ color: "#3D5A78" }} />
                        <span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>{u.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg transition-colors" style={{ background: "rgba(37,99,235,0.12)", color: "#60A5FA" }} title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setRoleUser(u); setAssigningRole(u.role); setRoleSuccess(false); }} className="p-1.5 rounded-lg transition-colors" style={{ background: "rgba(139,92,246,0.12)", color: "#A78BFA" }} title="Assign Role"><Key className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setDeleteUser(u); setDeleteConfirmText(""); }} className="p-1.5 rounded-lg transition-colors" style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }} title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: "#3D5A78" }}>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
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

      {/* Create/Edit Modal */}
      {(createOpen || editUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-[560px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-base font-bold text-white">{editUser ? "Edit User" : "Create User"}</h2>
              <button onClick={() => { setCreateOpen(false); setEditUser(null); }} style={{ color: "#3D5A78" }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {editUser && (
                <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: getInitialBg(editUser.name) }}>{editUser.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{editUser.name}</p>
                    <p className="text-xs" style={{ color: "#3D5A78" }}>{editUser.email}</p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: ROLE_COLORS[editUser.role].bg, color: ROLE_COLORS[editUser.role].text }}>{editUser.role}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#3D5A78" }}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${formErrors.name ? "#EF4444" : "rgba(255,255,255,0.08)"}`, color: "#E8EFF8" }} placeholder="John Doe" />
                  {formErrors.name && <p className="text-[10px] mt-1" style={{ color: "#EF4444" }}>{formErrors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#3D5A78" }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${formErrors.email ? "#EF4444" : "rgba(255,255,255,0.08)"}`, color: "#E8EFF8" }} placeholder="john@ekip.io" />
                  {formErrors.email && <p className="text-[10px] mt-1" style={{ color: "#EF4444" }}>{formErrors.email}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#3D5A78" }}>Role</label>
                  <select value={form.role} onChange={e => { const r = e.target.value as Role; setForm(f => ({ ...f, role: r })); setSelectedRole(r); }} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#3D5A78" }}>Department</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#3D5A78" }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-sm font-medium" style={{ color: "#E8EFF8" }}>MFA Enabled</span>
                  <button onClick={() => setForm(f => ({ ...f, mfa: !f.mfa }))} className="relative w-10 h-5 rounded-full transition-all" style={{ background: form.mfa ? "#2563EB" : "rgba(255,255,255,0.1)" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: form.mfa ? "calc(100% - 18px)" : "2px" }} />
                  </button>
                </div>
                {!editUser && (
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#3D5A78" }}>Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg outline-none" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${formErrors.password ? "#EF4444" : "rgba(255,255,255,0.08)"}`, color: "#E8EFF8" }} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#3D5A78" }}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={form.password} />
                    {formErrors.password && <p className="text-[10px] mt-1" style={{ color: "#EF4444" }}>{formErrors.password}</p>}
                  </div>
                )}
              </div>
              {/* Role permissions preview */}
              <div className="mt-4 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#3D5A78" }}>Permissions for {selectedRole}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PERMISSIONS[selectedRole].map(p => (
                    <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: ROLE_COLORS[selectedRole].bg, color: ROLE_COLORS[selectedRole].text }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => { setCreateOpen(false); setEditUser(null); }} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#E8EFF8" }}>Cancel</button>
              <button onClick={() => handleSave(!editUser)} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white min-w-[120px] justify-center" style={{ background: saveDone ? "#22C55E" : "#2563EB" }}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saveDone ? <><Check className="w-4 h-4" /> Saved!</> : editUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {(roleUser || roleUsers.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-[500px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-base font-bold text-white">Assign Role</h2>
              <button onClick={() => { setRoleUser(null); setRoleUsers([]); }} style={{ color: "#3D5A78" }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {roleUser && (
                <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: getInitialBg(roleUser.name) }}>{roleUser.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{roleUser.name}</p>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: ROLE_COLORS[roleUser.role].bg, color: ROLE_COLORS[roleUser.role].text }}>{roleUser.role}</span>
                  </div>
                </div>
              )}
              {roleUsers.length > 0 && <p className="text-xs mb-4" style={{ color: "#3D5A78" }}>{roleUsers.length} users selected</p>}
              <div className="flex flex-col gap-2">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setAssigningRole(r)} className="flex items-center gap-3 p-3 rounded-xl text-left transition-all" style={{ background: assigningRole === r ? ROLE_COLORS[r].bg : "rgba(255,255,255,0.03)", border: `1px solid ${assigningRole === r ? ROLE_COLORS[r].border : "rgba(255,255,255,0.06)"}` }}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: assigningRole === r ? ROLE_COLORS[r].text : "#3D5A78" }}>
                      {assigningRole === r && <div className="w-2 h-2 rounded-full" style={{ background: ROLE_COLORS[r].text }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: assigningRole === r ? ROLE_COLORS[r].text : "#E8EFF8" }}>{r}</p>
                      <p className="text-[10px]" style={{ color: "#3D5A78" }}>{ROLE_PERMISSIONS[r].slice(0, 2).join(" · ")}</p>
                    </div>
                    {assigningRole === r && <Check className="w-4 h-4" style={{ color: ROLE_COLORS[r].text }} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => { setRoleUser(null); setRoleUsers([]); }} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#E8EFF8" }}>Cancel</button>
              <button onClick={handleAssignRole} disabled={roleSpinner} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white min-w-[130px] justify-center" style={{ background: roleSuccess ? "#22C55E" : "#2563EB" }}>
                {roleSpinner ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : roleSuccess ? <><Check className="w-4 h-4" /> Assigned!</> : "Assign Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {(deleteUser || deleteMultiOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-[420px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#111D30", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-base font-bold" style={{ color: "#F87171" }}>Confirm Delete</h2>
              <button onClick={() => { setDeleteUser(null); setDeleteMultiOpen(false); }} style={{ color: "#3D5A78" }}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {deleteUser ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: getInitialBg(deleteUser.name) }}>{deleteUser.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{deleteUser.name}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>{deleteUser.email}</p>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>This action cannot be undone. The user will lose access to all EKIP resources.</p>
                </>
              ) : (
                <>
                  <p className="text-sm mb-4" style={{ color: "#9CA3AF" }}>You are about to delete <strong style={{ color: "#F87171" }}>{selected.size} users</strong>. Type <strong style={{ color: "#F87171" }}>DELETE</strong> to confirm.</p>
                  <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none font-mono" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }} placeholder="DELETE" />
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => { setDeleteUser(null); setDeleteMultiOpen(false); }} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(255,255,255,0.06)", color: "#E8EFF8" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteUser?.id)} disabled={deleteSpinner || (deleteMultiOpen && deleteConfirmText !== "DELETE")} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white min-w-[110px] justify-center disabled:opacity-50" style={{ background: "#EF4444" }}>
                {deleteSpinner ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
