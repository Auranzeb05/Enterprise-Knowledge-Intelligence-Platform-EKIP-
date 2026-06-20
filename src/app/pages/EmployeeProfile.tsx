import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, MessageSquare, BookOpen, FileText, UserCircle,
  Camera, Mail, Hash, Building2, Shield, Clock, Key, Edit3, Check, X, Phone
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const PROFILE = {
  name: "Jamie Reynolds",
  email: "jamie.reynolds@company.com",
  phone: "+1 (555) 123-4567",
  employeeId: "EMP-2024-0847",
  department: "Engineering",
  role: "Employee",
  lastLogin: "Today at 09:42 UTC",
  initials: "JR",
  avatarUrl: null as string | null,
};

const FIELD_STYLE = {
  background: "#0C1525",
  border: "1px solid rgba(255,255,255,0.07)",
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

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [name, setName] = useState(PROFILE.name);
  const [email, setEmail] = useState(PROFILE.email);
  const [phone, setPhone] = useState(PROFILE.phone);
  const [dept, setDept] = useState(PROFILE.department);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(PROFILE.avatarUrl);

  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [draftDept, setDraftDept] = useState(dept);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const saveProfile = () => {
    // Basic validation
    if (!draftName.trim() || !draftEmail.trim() || !draftEmail.includes("@")) {
      return;
    }
    setName(draftName);
    setEmail(draftEmail);
    setPhone(draftPhone);
    setDept(draftDept);
    
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setEditOpen(false);
    }, 1500);
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
      <EKIPSidebar items={NAV} subtitle="Employee Portal" subtitleColor="#60A5FA40" settingsPath="/settings" onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{ background: "rgba(10,18,32,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 flex-1">
            <UserCircle className="w-5 h-5" style={{ color: "#2563EB" }} />
            <h1 className="text-base font-bold text-white tracking-tight">Employee Profile</h1>
          </div>
          <button
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>
              {PROFILE.initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-none">{name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{dept}</p>
            </div>
          </button>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Avatar card */}
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)", boxShadow: "0 0 0 3px rgba(37,99,235,0.3),0 8px 24px rgba(37,99,235,0.25)" }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    PROFILE.initials
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                  style={{ background: "#2563EB", border: "2px solid #0C1525" }}
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-extrabold text-white leading-tight">{name}</h2>
                <p className="text-sm mt-0.5" style={{ color: "#4A6080" }}>{dept} · {PROFILE.role}</p>
                <span
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.2)" }}
                >
                  <Shield className="w-3 h-3" /> {PROFILE.role}
                </span>
              </div>
            </div>

            {/* Info fields */}
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-sm font-bold text-white">Account Details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  <div style={FIELD_STYLE}>{email}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Phone className="w-3 h-3" /> Phone Number
                  </div>
                  <div style={FIELD_STYLE}>{phone}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Hash className="w-3 h-3" /> Employee ID
                  </div>
                  <div style={FIELD_STYLE}>{PROFILE.employeeId}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Building2 className="w-3 h-3" /> Department
                  </div>
                  <div style={FIELD_STYLE}>{dept}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5" style={LABEL_STYLE}>
                    <Shield className="w-3 h-3" /> Role
                  </div>
                  <div style={FIELD_STYLE}>{PROFILE.role}</div>
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
                onClick={() => {
                  setDraftName(name);
                  setDraftEmail(email);
                  setDraftPhone(phone);
                  setDraftDept(dept);
                  setEditOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#fff", border: "none" }}
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
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-bold text-white">Edit Profile</p>
              <button onClick={() => setEditOpen(false)} style={{ background: "transparent", border: "none", color: "#4A6080", cursor: "pointer" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {profileSaved ? (
              <div className="flex items-center gap-2 py-8 justify-center" style={{ color: "#10B981" }}>
                <Check className="w-5 h-5" />
                <span className="font-semibold text-sm">Profile updated successfully</span>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                  <div>
                    <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Full Name</p>
                    <input value={draftName} onChange={(e) => setDraftName(e.target.value)} style={inputStyle} />
                    {!draftName.trim() && <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>Name is required</p>}
                  </div>
                  <div>
                    <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Email</p>
                    <input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} style={inputStyle} />
                    {(!draftEmail.trim() || !draftEmail.includes("@")) && <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>Valid email is required</p>}
                  </div>
                  <div>
                    <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Phone Number</p>
                    <input type="tel" value={draftPhone} onChange={(e) => setDraftPhone(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <p style={{ ...LABEL_STYLE, display: "block", marginBottom: 6 }}>Department</p>
                    <input value={draftDept} onChange={(e) => setDraftDept(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <button onClick={() => setEditOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#4A6080", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={saveProfile} disabled={!draftName.trim() || !draftEmail.trim() || !draftEmail.includes("@")} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: "#2563EB", border: "none", color: "#fff", cursor: (!draftName.trim() || !draftEmail.trim() || !draftEmail.includes("@")) ? "default" : "pointer" }}>
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)" }}>
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
                  <button onClick={savePassword} disabled={!pw.current || !pw.next || pw.next !== pw.confirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: pw.current && pw.next && pw.next === pw.confirm ? "#2563EB" : "rgba(37,99,235,0.3)", border: "none", color: "#fff", cursor: pw.current && pw.next && pw.next === pw.confirm ? "pointer" : "default" }}>
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
