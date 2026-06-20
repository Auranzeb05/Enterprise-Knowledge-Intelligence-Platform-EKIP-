import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, BarChart2,
  Camera, Mail, Shield, Clock, Key, Edit3, Check, X,
  Users, ClipboardList, Brain, ShieldCheck, UserCircle
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const NAV: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

const PROFILE = {
  name: "Alex Morgan",
  email: "alex.morgan@company.com",
  role: "Administrator",
  securityStatus: "Optimal",
  lastLogin: "Today at 09:42 UTC",
  initials: "AM",
};

const FIELD_STYLE = {
  background: "#111D30",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#E8EFF8",
  fontSize: 13,
  fontWeight: 500,
};

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: "#4A6080",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  marginBottom: 6,
};

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

export default function AdminProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [name, setName] = useState(PROFILE.name);
  const [draftName, setDraftName] = useState(PROFILE.name);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);

  const saveProfile = () => {
    setName(draftName);
    setEditOpen(false);
  };

  const savePassword = () => {
    if (pw.next && pw.next === pw.confirm) {
      setPwSaved(true);
      setTimeout(() => { setPwSaved(false); setPwOpen(false); setPw({ current: "", next: "", confirm: "" }); }, 1500);
    }
  };

  const inputStyle = {
    background: "#0C1525",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#E8EFF8",
    fontSize: 13,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif", background: "#0C1525", color: "#E8EFF8" }}
    >
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{ background: "rgba(8,15,28,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(239,68,68,0.12)" }}
        >
          <div className="flex items-center gap-2 flex-1">
            <ShieldCheck className="w-5 h-5 text-red-400" strokeWidth={2} />
            <h1 className="text-lg font-extrabold text-white tracking-tight">Admin Profile</h1>
          </div>
          <button
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5"
            style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)" }}>
              {PROFILE.initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-none">{name}</p>
              <p className="text-[10px] text-red-400 mt-0.5">Super Admin</p>
            </div>
          </button>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Avatar card */}
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
              style={{ background: "rgba(17,29,48,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
                  style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)", boxShadow: "0 0 0 3px rgba(239,68,68,0.15),0 8px 24px rgba(239,68,68,0.2)" }}
                >
                  {PROFILE.initials}
                </div>
                <button
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "#EF4444", border: "2px solid #0C1525" }}
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-extrabold text-white leading-tight">{name}</h2>
                <p className="text-sm mt-0.5" style={{ color: "#4A6080" }}>{PROFILE.email}</p>
                <span
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <ShieldCheck className="w-3 h-3" /> {PROFILE.role}
                </span>
              </div>
            </div>

            {/* Info fields */}
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{ background: "rgba(17,29,48,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-sm font-bold text-white">Profile Information</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Edit3 className="w-3 h-3" /> Full Name
                  </div>
                  <div style={FIELD_STYLE}>{name}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Mail className="w-3 h-3" /> Email
                  </div>
                  <div style={FIELD_STYLE}>{PROFILE.email}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Shield className="w-3 h-3" /> Role
                  </div>
                  <div style={FIELD_STYLE}>{PROFILE.role}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <ShieldCheck className="w-3 h-3" /> Security Status
                  </div>
                  <div style={FIELD_STYLE} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {PROFILE.securityStatus}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Clock className="w-3 h-3" /> Last Login
                  </div>
                  <div style={FIELD_STYLE}>{PROFILE.lastLogin}</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { setDraftName(name); setEditOpen(true); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)", color: "#fff", border: "none" }}
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button
                onClick={() => setPwOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#111D30", color: "#E8EFF8", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Key className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Edit Profile</p>
              <button onClick={() => setEditOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Full Name</p>
                <input value={draftName} onChange={(e) => setDraftName(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={saveProfile} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#EF4444", border: "none", color: "#fff", cursor: "pointer" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-white">Change Password</p>
              <button onClick={() => { setPwOpen(false); setPw({ current: "", next: "", confirm: "" }); }} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {pwSaved ? (
              <div className="flex items-center gap-2 py-4 justify-center" style={{ color: "#10B981" }}>
                <Check className="w-5 h-5" />
                <span className="font-semibold text-sm">Password updated successfully</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Current Password</p>
                  <input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} style={inputStyle} placeholder="••••••••" />
                </div>
                <div>
                  <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>New Password</p>
                  <input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} style={inputStyle} placeholder="••••••••" />
                </div>
                <div>
                  <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Confirm New Password</p>
                  <input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} style={inputStyle} placeholder="••••••••" />
                  {pw.confirm && pw.next !== pw.confirm && (
                    <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>Passwords do not match</p>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setPwOpen(false); setPw({ current: "", next: "", confirm: "" }); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={savePassword} disabled={!pw.current || !pw.next || pw.next !== pw.confirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: pw.current && pw.next && pw.next === pw.confirm ? "#EF4444" : "rgba(239,68,68,0.3)", border: "none", color: "#fff", cursor: pw.current && pw.next && pw.next === pw.confirm ? "pointer" : "default" }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
