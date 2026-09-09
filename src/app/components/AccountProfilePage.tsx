import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Edit3,
  Fingerprint,
  Key,
  Loader2,
  Mail,
  Shield,
  UserCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { EKIPSidebar } from "./Sidebar";
import type { SidebarNavItem } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

type Props = {
  title: string;
  subtitle: string;
  settingsPath: string;
  nav: SidebarNavItem[];
  accent: string;
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

const INPUT_STYLE = {
  background: "#0C1525",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#E8EFF8",
  fontSize: 13,
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AccountProfilePage({
  title,
  subtitle,
  settingsPath,
  nav,
  accent,
}: Props) {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(user?.fullName || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function saveProfile() {
    try {
      setProfileSaving(true);
      setProfileError("");
      await updateProfile(draftName);
      setProfileSaved(true);
      window.setTimeout(() => {
        setEditOpen(false);
        setProfileSaved(false);
      }, 700);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword() {
    if (passwordFields.next !== passwordFields.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError("");
      await changePassword(passwordFields.current, passwordFields.next);
      setPasswordSaved(true);
      window.setTimeout(() => {
        setPasswordOpen(false);
        setPasswordSaved(false);
        setPasswordFields({ current: "", next: "", confirm: "" });
      }, 900);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password."
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  const department = user.department?.name || "Unassigned";

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
        background: "#0C1525",
        color: "#E8EFF8",
      }}
    >
      <EKIPSidebar
        items={nav}
        subtitle={subtitle}
        subtitleColor={`${accent}80`}
        settingsPath={settingsPath}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
          style={{
            background: "rgba(10,18,32,0.92)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <UserCircle className="w-5 h-5" style={{ color: accent }} />
          <h1 className="text-base font-bold text-white flex-1">{title}</h1>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: accent }}
            >
              {initials(user.fullName)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">
                {user.fullName}
              </p>
              <p className="text-[10px] text-slate-500">
                {titleCase(user.role)}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <div
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
              style={{
                background: "#111D30",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
                style={{ background: accent }}
              >
                {initials(user.fullName)}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-extrabold text-white">
                  {user.fullName}
                </h2>
                <p className="text-sm mt-1 text-slate-500">
                  {department} · {titleCase(user.role)}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{
                    background: `${accent}18`,
                    color: accent,
                    border: `1px solid ${accent}35`,
                  }}
                >
                  <Shield className="w-3 h-3" />
                  {titleCase(user.status)}
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "#111D30",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-sm font-bold text-white mb-5">Account Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  ["Full Name", user.fullName, Edit3],
                  ["Email", user.email, Mail],
                  ["Department", department, Building2],
                  ["Role", titleCase(user.role), Shield],
                  ["Account ID", user.id, Fingerprint],
                  ["Status", titleCase(user.status), Shield],
                ].map(([label, value, Icon]: any) => (
                  <div key={label}>
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                    <div style={FIELD_STYLE} className="truncate" title={value}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-5">
                Email, role and department are controlled by your EKIP administrator.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraftName(user.fullName);
                  setProfileError("");
                  setEditOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: accent }}
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setPasswordFields({ current: "", next: "", confirm: "" });
                  setPasswordError("");
                  setPasswordOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-white/10"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </main>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5 bg-[#111D30] border border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">Edit Profile</h2>
              <button type="button" onClick={() => setEditOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {profileSaved ? (
              <div className="flex items-center justify-center gap-2 py-8 text-emerald-400">
                <Check className="w-5 h-5" />
                Profile updated successfully
              </div>
            ) : (
              <>
                <input
                  value={draftName}
                  maxLength={100}
                  onChange={(event) => setDraftName(event.target.value)}
                  style={INPUT_STYLE}
                  placeholder="Full name"
                />
                {profileError && (
                  <div className="flex gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {profileError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    disabled={profileSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={profileSaving || draftName.trim().length < 2}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: accent }}
                  >
                    {profileSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4 bg-[#111D30] border border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">Change Password</h2>
              <button type="button" onClick={() => setPasswordOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {passwordSaved ? (
              <div className="py-8 flex items-center justify-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                Password updated successfully
              </div>
            ) : (
              <>
                {[
                  ["current", "Current password", "current-password"],
                  ["next", "New password", "new-password"],
                  ["confirm", "Confirm new password", "new-password"],
                ].map(([key, placeholder, autoComplete]) => (
                  <input
                    key={key}
                    type="password"
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={(passwordFields as any)[key]}
                    onChange={(event) =>
                      setPasswordFields((previous) => ({
                        ...previous,
                        [key]: event.target.value,
                      }))
                    }
                    style={INPUT_STYLE}
                  />
                ))}

                {passwordError && (
                  <div className="flex gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPasswordOpen(false)}
                    disabled={passwordSaving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={savePassword}
                    disabled={
                      passwordSaving ||
                      !passwordFields.current ||
                      passwordFields.next.length < 8 ||
                      passwordFields.next !== passwordFields.confirm
                    }
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: accent }}
                  >
                    {passwordSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
