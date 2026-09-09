import { useEffect, useState, type FormEvent } from "react";
import { Building2, Check, Edit2, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

interface Department {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentResponse {
  success: boolean;
  departments: Department[];
  message?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function DepartmentManagement() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function loadDepartments() {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data: DepartmentResponse = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load departments");
      setDepartments(Array.isArray(data.departments) ? data.departments : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.access_token) void loadDepartments();
  }, [session?.access_token]);

  async function handleCreateDepartment(event: FormEvent) {
    event.preventDefault();
    if (!session?.access_token || !name.trim()) {
      if (!name.trim()) setError("Department name is required");
      return;
    }
    try {
      setSaving(true); setError("");
      const response = await fetch(`${API_URL}/api/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create department");
      setName(""); setCreateOpen(false); await loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create department");
    } finally { setSaving(false); }
  }

  function openEditDepartment(department: Department) {
    setEditDepartment(department); setEditName(department.name); setError("");
  }

  async function handleUpdateDepartment() {
    if (!editDepartment || !session?.access_token || !editName.trim()) return;
    try {
      setSaving(true); setError("");
      const response = await fetch(`${API_URL}/api/departments/${editDepartment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update department");
      setEditDepartment(null); setEditName(""); await loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update department");
    } finally { setSaving(false); }
  }

  async function handleDeleteDepartment(department: Department) {
    if (!session?.access_token) return;
    if (!window.confirm(`Delete department "${department.name}"? This only works after its users and documents are reassigned.`)) return;
    try {
      setDeletingId(department.id); setError("");
      const response = await fetch(`${API_URL}/api/departments/${department.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete department");
      await loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete department");
    } finally { setDeletingId(null); }
  }

  const modalShell = { background: "#111D30", border: "1px solid rgba(255,255,255,0.08)" };
  const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E8EFF8" };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0C1525", color: "#E8EFF8", fontFamily: "'Plus Jakarta Sans',Inter,sans-serif" }}>
      <EKIPSidebar items={[]} subtitle="Admin" subtitleColor="rgba(37,99,235,0.5)" settingsPath="/admin-settings" onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div><h1 className="text-2xl font-bold">Department Management</h1><p className="text-sm mt-1" style={{ color: "#6B7280" }}>Manage organization departments.</p></div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <button onClick={() => void loadDepartments()} disabled={loading} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.08)" }}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
              <button onClick={() => { setName(""); setError(""); setCreateOpen(true); }} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "#2563EB" }}><Plus className="w-4 h-4" /> Add Department</button>
            </div>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}>{error}</div>}

          <div className="rounded-xl overflow-hidden" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}><p className="font-semibold">Departments</p><p className="text-xs mt-1" style={{ color: "#6B7280" }}>{departments.length} total</p></div>
            {loading ? <div className="py-16 text-center text-sm" style={{ color: "#6B7280" }}>Loading departments...</div> : departments.length === 0 ? <div className="py-16 text-center"><Building2 className="w-8 h-8 mx-auto mb-3" style={{ color: "#3D5A78" }} /><p style={{ color: "#6B7280" }}>No departments found.</p></div> : departments.map((department) => (
              <div key={department.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex min-w-0 items-start gap-3"><div className="w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.12)" }}><Building2 className="w-4 h-4" style={{ color: "#60A5FA" }} /></div><div className="min-w-0"><p className="text-sm font-semibold break-words">{department.name}</p><p className="text-xs mt-0.5 break-all" style={{ color: "#6B7280" }}>Department ID: {department.id}</p></div></div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <button onClick={() => openEditDepartment(department)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.25)" }}><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => void handleDeleteDepartment(department)} disabled={deletingId === department.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50" style={{ background: "rgba(239,68,68,0.10)", color: "#F87171", border: "1px solid rgba(239,68,68,0.22)" }}><Trash2 className="w-3.5 h-3.5" /> {deletingId === department.id ? "Deleting..." : "Delete"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}><form onSubmit={handleCreateDepartment} className="w-[calc(100%-24px)] max-w-[420px] rounded-xl" style={modalShell}><div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}><div><h2 className="font-bold">Add Department</h2><p className="text-xs mt-1" style={{ color: "#6B7280" }}>Create a new department for EKIP.</p></div><button type="button" onClick={() => { setCreateOpen(false); setName(""); }} style={{ color: "#6B7280" }}><X className="w-5 h-5" /></button></div><div className="p-5"><label className="text-xs font-semibold block mb-2" style={{ color: "#6B7280" }}>Department Name</label><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Engineering" className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /></div><div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}><button type="button" onClick={() => { setCreateOpen(false); setName(""); }} disabled={saving} className="px-4 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: "rgba(255,255,255,0.06)" }}>Cancel</button><button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: "#2563EB" }}><Plus className="w-4 h-4" />{saving ? "Creating..." : "Create Department"}</button></div></form></div>}

      {editDepartment && <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}><div className="w-[calc(100%-24px)] max-w-[420px] rounded-xl" style={modalShell}><div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}><div><h2 className="font-bold">Edit Department</h2><p className="text-xs mt-1" style={{ color: "#6B7280" }}>Rename this department.</p></div><button type="button" onClick={() => { setEditDepartment(null); setEditName(""); }} style={{ color: "#6B7280" }}><X className="w-5 h-5" /></button></div><div className="p-5"><label className="text-xs font-semibold block mb-2" style={{ color: "#6B7280" }}>Department Name</label><input value={editName} onChange={(event) => setEditName(event.target.value)} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle} /><p className="text-[10px] mt-2" style={{ color: "#3D5A78" }}>ID: {editDepartment.id}</p></div><div className="flex justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}><button type="button" onClick={() => { setEditDepartment(null); setEditName(""); }} disabled={saving} className="px-4 py-2 rounded-lg text-sm disabled:opacity-50" style={{ background: "rgba(255,255,255,0.06)" }}>Cancel</button><button type="button" onClick={() => void handleUpdateDepartment()} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50" style={{ background: "#2563EB" }}><Check className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}</button></div></div></div>}
    </div>
  );
}
