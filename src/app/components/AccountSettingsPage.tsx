import { useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Key,
  Loader2,
  Lock,
  Mail,
  Shield,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { EKIPSidebar } from "./Sidebar";
import type { SidebarNavItem } from "./Sidebar";
import { useAuth } from "../context/AuthContext";

type Props = {
  title: string;
  subtitle: string;
  profilePath: string;
  settingsPath: string;
  nav: SidebarNavItem[];
  accent: string;
};

const INPUT = {
  background: "#0C1525",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#E8EFF8",
  fontSize: 13,
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AccountSettingsPage({
  title,
  subtitle,
  profilePath,
  settingsPath,
  nav,
  accent,
}: Props) {
  const navigate = useNavigate();
  const { user, logout, changePassword } = useAuth();

  const [fields, setFields] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function updatePassword() {
    if (fields.next !== fields.confirm) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);
      await changePassword(fields.current, fields.next);
      setFields({ current: "", next: "", confirm: "" });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "#0C1525",
        color: "#E8EFF8",
        fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
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
        <header className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Lock className="w-5 h-5" style={{ color: accent }} />
          <h1 className="font-bold text-white">{title}</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <section className="rounded-2xl p-6 bg-[#111D30] border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <UserCircle className="w-5 h-5" style={{ color: accent }} />
                <div>
                  <h2 className="text-sm font-bold text-white">Account Identity</h2>
                  <p className="text-[11px] text-slate-500">
                    Verified EKIP account information.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase text-slate-500 mb-1">Full Name</p>
                  <p className="text-sm text-white">{user.fullName}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase text-slate-500 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-sm text-white">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] uppercase text-slate-500 mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Role
                    </p>
                    <p className="text-sm text-white">{titleCase(user.role)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-slate-500 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Department
                    </p>
                    <p className="text-sm text-white">
                      {user.department?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Display name can be changed from Profile. Email, role and department are administrator-managed.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(profilePath)}
                  className="text-xs font-semibold whitespace-nowrap"
                  style={{ color: accent }}
                >
                  Open Profile
                </button>
              </div>
            </section>

            <section className="rounded-2xl p-6 bg-[#111D30] border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <Key className="w-4 h-4" style={{ color: accent }} />
                <div>
                  <h2 className="text-sm font-bold text-white">Change Password</h2>
                  <p className="text-[11px] text-slate-500">
                    Current password is verified before applying a new one.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Current password"
                  value={fields.current}
                  onChange={(event) =>
                    setFields((previous) => ({
                      ...previous,
                      current: event.target.value,
                    }))
                  }
                  style={INPUT}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    value={fields.next}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        next: event.target.value,
                      }))
                    }
                    style={INPUT}
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    value={fields.confirm}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        confirm: event.target.value,
                      }))
                    }
                    style={INPUT}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {saved && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <Check className="w-4 h-4" />
                    Password updated successfully.
                  </div>
                )}

                <button
                  type="button"
                  onClick={updatePassword}
                  disabled={
                    saving ||
                    !fields.current ||
                    fields.next.length < 8 ||
                    fields.next !== fields.confirm
                  }
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
                  style={{ background: accent }}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl p-6 bg-[#111D30] border border-white/10">
              <h2 className="text-sm font-bold text-white">Session</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign out of the current browser session.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold border border-red-500/30 text-red-400"
              >
                Sign Out
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
