import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, MessageSquare, FileText, BarChart2, UserCircle,
  Lock, Mail, Sun, Moon, Globe, ShieldCheck, Activity, ChevronDown, Check, AlertCircle, Users, Loader2
} from "lucide-react";
import { EKIPSidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

const LANGUAGES = ["English (US)", "English (UK)", "French", "German", "Spanish", "Japanese"];
const ANALYTICS_VIEWS = ["Global Overview", "My Department (Engineering)", "Custom View"];

const LOGIN_ACTIVITY = [
  { device: "Chrome · macOS",        ip: "192.168.1.12",  time: "Today, 09:42 UTC",       current: true },
  { device: "Safari · iPhone 15",    ip: "10.0.0.8",      time: "Yesterday, 18:14 UTC",   current: false },
  { device: "Firefox · Windows 11",  ip: "172.16.0.3",    time: "Jun 18, 2026, 11:02 UTC", current: false },
];

const CARD = {
  background: "#111D30",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "20px 24px",
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#4A6080",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 12,
};

const INPUT: React.CSSProperties = {
  background: "#0C1525",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#E8EFF8",
  fontSize: 13,
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
};

const BTN_PRIMARY: React.CSSProperties = {
  background: "#2563EB",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const BTN_GHOST: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "8px 18px",
  color: "#4A6080",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-none">{label}</p>
        {hint && <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 99,
        background: on ? "#2563EB" : "rgba(255,255,255,0.1)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          display: "block",
        }}
      />
    </button>
  );
}

export default function ManagerSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };

  // Account
  const [pwFields, setPwFields] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [email, setEmail] = useState("alex.morgan@company.com");
  const [draftEmail, setDraftEmail] = useState("alex.morgan@company.com");
  const [emailSaved, setEmailSaved] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Preferences
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState("English (US)");
  const [langOpen, setLangOpen] = useState(false);
  const [notifs, setNotifs] = useState(true);

  // Department Preferences
  const [analyticsView, setAnalyticsView] = useState("My Department (Engineering)");
  const [analyticsViewOpen, setAnalyticsViewOpen] = useState(false);
  const [teamNotifs, setTeamNotifs] = useState(true);

  // Security
  const [twoFA, setTwoFA] = useState(true);

  // Global Save
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const savePassword = () => {
    if (!pwFields.current) { setPwErr("Current password is required."); return; }
    if (pwFields.next.length < 8) { setPwErr("New password must be at least 8 characters."); return; }
    if (pwFields.next !== pwFields.confirm) { setPwErr("Passwords do not match."); return; }
    setPwErr("");
    setIsSavingPw(true);
    setTimeout(() => {
      setIsSavingPw(false);
      setPwSaved(true);
      setTimeout(() => { setPwSaved(false); setPwFields({ current: "", next: "", confirm: "" }); }, 2000);
    }, 1000);
  };

  const saveEmail = () => {
    setIsSavingEmail(true);
    setTimeout(() => {
      setIsSavingEmail(false);
      setEmail(draftEmail);
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2000);
    }, 1000);
  };

  const saveGlobalSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }, 1200);
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif", background: "#0C1525", color: "#E8EFF8" }}
    >
      <EKIPSidebar
        items={NAV}
        subtitle="Manager"
        subtitleColor="rgba(37,99,235,0.5)"
        settingsPath="/manager-settings"
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
          style={{ background: "rgba(10,18,32,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 flex-1">
            <Lock className="w-5 h-5" style={{ color: "#2563EB" }} strokeWidth={1.8} />
            <h1 className="text-base font-bold text-white tracking-tight">Manager Settings</h1>
          </div>
          <button
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>AM</div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-200 leading-none">Alex Morgan</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Department Manager</p>
            </div>
          </button>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* ── Account Settings ── */}
            <section>
              <p style={SECTION_TITLE}>Account Settings</p>
              <div style={CARD} className="space-y-0 divide-y-0">

                {/* Change Password */}
                <div className="pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4" style={{ color: "#2563EB" }} strokeWidth={1.8} />
                    <p className="text-sm font-bold text-white">Change Password</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold mb-1.5" style={{ color: "#4A6080" }}>Current Password</p>
                      <input type="password" placeholder="••••••••" value={pwFields.current}
                        onChange={(e) => setPwFields((p) => ({ ...p, current: e.target.value }))} style={INPUT} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold mb-1.5" style={{ color: "#4A6080" }}>New Password</p>
                        <input type="password" placeholder="••••••••" value={pwFields.next}
                          onChange={(e) => setPwFields((p) => ({ ...p, next: e.target.value }))} style={INPUT} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold mb-1.5" style={{ color: "#4A6080" }}>Confirm Password</p>
                        <input type="password" placeholder="••••••••" value={pwFields.confirm}
                          onChange={(e) => setPwFields((p) => ({ ...p, confirm: e.target.value }))} style={INPUT} />
                      </div>
                    </div>
                    {pwErr && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#EF4444" }}>
                        <AlertCircle className="w-3.5 h-3.5" />{pwErr}
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      <button onClick={savePassword} disabled={isSavingPw} style={BTN_PRIMARY}>
                        {isSavingPw ? (
                          <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
                        ) : pwSaved ? (
                          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Update Email */}
                <div className="pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4" style={{ color: "#2563EB" }} strokeWidth={1.8} />
                    <p className="text-sm font-bold text-white">Update Email</p>
                  </div>
                  <div className="flex gap-3">
                    <input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)}
                      style={{ ...INPUT, flex: 1 }} />
                    <button onClick={saveEmail} disabled={isSavingEmail} style={BTN_PRIMARY}>
                      {isSavingEmail ? (
                        <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving</span>
                      ) : emailSaved ? (
                        <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                  {email !== draftEmail && (
                    <p className="text-[11px] mt-1.5" style={{ color: "#F59E0B" }}>Unsaved changes</p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Preferences ── */}
            <section>
              <p style={SECTION_TITLE}>Preferences</p>
              <div style={CARD}>

                <Row label="Theme" hint="Choose your interface appearance.">
                  <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                        style={{
                          background: theme === t ? "#2563EB" : "transparent",
                          color: theme === t ? "#fff" : "#4A6080",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {t === "dark" ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />} {t}
                      </button>
                    ))}
                  </div>
                </Row>

                <Row label="Language" hint="Select your preferred display language.">
                  <div className="relative">
                    <button
                      onClick={() => setLangOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 140 }}
                    >
                      <Globe className="w-3.5 h-3.5" style={{ color: "#4A6080" }} />
                      <span className="flex-1 text-left">{lang}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {langOpen && (
                      <div className="absolute right-0 top-9 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 170 }}>
                        {LANGUAGES.map((l) => (
                          <button
                            key={l}
                            onClick={() => { setLang(l); setLangOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between"
                            style={{ background: l === lang ? "rgba(37,99,235,0.12)" : "transparent", color: l === lang ? "#60A5FA" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {l}
                            {l === lang && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none">Notifications</p>
                    <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>Manage your notification preferences.</p>
                  </div>
                  <Toggle on={notifs} onChange={setNotifs} />
                </div>
              </div>
            </section>

            {/* ── Department Preferences ── */}
            <section>
              <p style={SECTION_TITLE}>Department Preferences</p>
              <div style={CARD}>

                <Row label="Default Analytics View" hint="Set the default dashboard scope for analytics.">
                  <div className="relative">
                    <button
                      onClick={() => setAnalyticsViewOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 200 }}
                    >
                      <BarChart2 className="w-3.5 h-3.5" style={{ color: "#4A6080" }} />
                      <span className="flex-1 text-left">{analyticsView}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {analyticsViewOpen && (
                      <div className="absolute right-0 top-9 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 200 }}>
                        {ANALYTICS_VIEWS.map((v) => (
                          <button
                            key={v}
                            onClick={() => { setAnalyticsView(v); setAnalyticsViewOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between"
                            style={{ background: v === analyticsView ? "rgba(37,99,235,0.12)" : "transparent", color: v === analyticsView ? "#60A5FA" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {v}
                            {v === analyticsView && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none">Team Notifications</p>
                    <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>Receive alerts for team document uploads and activity.</p>
                  </div>
                  <Toggle on={teamNotifs} onChange={setTeamNotifs} />
                </div>
              </div>
            </section>

            {/* ── Security ── */}
            <section>
              <p style={SECTION_TITLE}>Security</p>
              <div style={CARD}>

                <Row
                  label="Two-Factor Authentication"
                  hint={twoFA ? "2FA is enabled. Your account is protected." : "Add an extra layer of security to your account."}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color: twoFA ? "#10B981" : "#4A6080" }}>
                      {twoFA ? "ON" : "OFF"}
                    </span>
                    <Toggle on={twoFA} onChange={setTwoFA} />
                  </div>
                </Row>

                {twoFA && (
                  <div className="py-3 px-4 rounded-xl mb-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" style={{ color: "#10B981" }} />
                      <p className="text-xs font-semibold" style={{ color: "#10B981" }}>Two-factor authentication is active</p>
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>Verification codes will be sent to your registered device.</p>
                  </div>
                )}

                {/* Login Activity */}
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4" style={{ color: "#2563EB" }} strokeWidth={1.8} />
                    <p className="text-sm font-bold text-white">Login Activity</p>
                  </div>
                  <div className="space-y-2">
                    {LOGIN_ACTIVITY.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: s.current ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.02)", border: s.current ? "1px solid rgba(37,99,235,0.2)" : "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{s.device}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#4A6080" }}>{s.ip} · {s.time}</p>
                        </div>
                        {s.current ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.15)", color: "#60A5FA" }}>Current</span>
                        ) : (
                          <button style={{ ...BTN_GHOST, padding: "4px 10px", fontSize: 11 }}>Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Save Settings ── */}
            <div className="flex items-center justify-end gap-4 pt-4 pb-8">
              {settingsSaved && (
                <div className="flex items-center gap-2 text-sm font-semibold animate-in fade-in" style={{ color: "#10B981" }}>
                  <Check className="w-4 h-4" />
                  Settings saved successfully
                </div>
              )}
              <button
                onClick={saveGlobalSettings}
                disabled={isSavingSettings}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50 cursor-pointer"
                style={{ background: "#2563EB" }}
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
