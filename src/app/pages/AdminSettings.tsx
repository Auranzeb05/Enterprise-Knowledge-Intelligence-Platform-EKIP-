import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, BarChart2, Users, ClipboardList, Brain, UserCircle,
  Settings, Building2, ShieldCheck, Bell, Check, ChevronDown, Moon, Sun, AlertCircle, Loader2, CheckCircle
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

const LLM_MODELS = ["EKIP Reasoning Engine v4.2", "GPT-4o", "Claude 3.5 Sonnet"];
const EMBEDDING_MODELS = ["EKIP Embeddings v2", "text-embedding-3-large", "Cohere English v3"];
const ROLE_PERMISSIONS = ["Strict (Default)", "Custom", "Open (Not Recommended)"];

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
  background: "#EF4444",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  color: "#fff",
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
        background: on ? "#EF4444" : "rgba(255,255,255,0.1)",
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

export default function AdminSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/"); };

  // Platform
  const [orgName, setOrgName] = useState("Enterprise Inc.");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [branding, setBranding] = useState("EKIP Default");

  // AI
  const [llmModelOpen, setLlmModelOpen] = useState(false);
  const [llmModel, setLlmModel] = useState("EKIP Reasoning Engine v4.2");
  const [embModelOpen, setEmbModelOpen] = useState(false);
  const [embModel, setEmbModel] = useState("EKIP Embeddings v2");
  const [chunkSize, setChunkSize] = useState("1024");

  // Security
  const [authSettingsOpen, setAuthSettingsOpen] = useState(false);
  const [authSettings, setAuthSettings] = useState("SSO + Password");
  const [rolePermsOpen, setRolePermsOpen] = useState(false);
  const [rolePerms, setRolePerms] = useState("Strict (Default)");
  const [twoFA, setTwoFA] = useState(true);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Form State
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const saveSettings = () => {
    if (!orgName.trim()) {
      setErrorMsg("Organization Name is required.");
      return;
    }
    const chunkNum = parseInt(chunkSize);
    if (isNaN(chunkNum) || chunkNum < 1) {
      setErrorMsg("Chunk Size must be a valid positive number.");
      return;
    }

    setErrorMsg("");
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
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
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
          style={{ background: "rgba(8,15,28,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(239,68,68,0.12)" }}
        >
          <div className="flex items-center gap-2 flex-1">
            <Settings className="w-5 h-5 text-red-400" strokeWidth={1.8} />
            <h1 className="text-base font-bold text-white tracking-tight">Admin Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs font-semibold animate-in fade-in" style={{ color: "#EF4444" }}>
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </div>
            )}
            <button onClick={saveSettings} disabled={isSaving} style={BTN_PRIMARY} className="transition-opacity disabled:opacity-50 cursor-pointer">
              {isSaving ? (
                <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
              ) : saved ? (
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Saved</span>
              ) : (
                "Save Changes"
              )}
            </button>
            <div className="w-px h-6 mx-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            <button onClick={() => navigate("/admin-profile")} className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "transparent" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)" }}>AM</div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">Alex Morgan</p>
                <p className="text-[10px] text-red-400 mt-0.5">Super Admin</p>
              </div>
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Platform Settings ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-400" />
                <p style={{ ...SECTION_TITLE, marginBottom: 0 }}>Platform Settings</p>
              </div>
              <div style={CARD}>
                <Row label="Organization Name" hint="The legal or display name of your organization.">
                  <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} style={{ ...INPUT, width: 220, borderColor: errorMsg.includes("Organization") ? "#EF4444" : "rgba(255,255,255,0.09)" }} />
                </Row>
                
                <Row label="Branding" hint="Select the primary brand identity for the platform.">
                  <div className="relative">
                    <button
                      onClick={() => setBrandingOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 220 }}
                    >
                      <span className="flex-1 text-left">{branding}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {brandingOpen && (
                      <div className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 220 }}>
                        {["EKIP Default", "Custom Corporate", "Minimalist"].map((b) => (
                          <button
                            key={b}
                            onClick={() => { setBranding(b); setBrandingOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-white/5"
                            style={{ background: b === branding ? "rgba(239,68,68,0.12)" : "transparent", color: b === branding ? "#F87171" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {b}
                            {b === branding && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <Row label="Theme" hint="Default theme for all new users.">
                  <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.09)" }}>
                    {(["dark", "light"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold capitalize transition-all"
                        style={{
                          background: theme === t ? "#EF4444" : "transparent",
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
              </div>
            </section>

            {/* ── AI Settings ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-slate-400" />
                <p style={{ ...SECTION_TITLE, marginBottom: 0 }}>AI Settings</p>
              </div>
              <div style={CARD}>
                <Row label="LLM Model" hint="The primary model used for chat and reasoning tasks.">
                  <div className="relative">
                    <button
                      onClick={() => setLlmModelOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 260 }}
                    >
                      <span className="flex-1 text-left">{llmModel}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {llmModelOpen && (
                      <div className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 260 }}>
                        {LLM_MODELS.map((m) => (
                          <button
                            key={m}
                            onClick={() => { setLlmModel(m); setLlmModelOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-white/5"
                            style={{ background: m === llmModel ? "rgba(239,68,68,0.12)" : "transparent", color: m === llmModel ? "#F87171" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {m}
                            {m === llmModel && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <Row label="Embedding Model" hint="Model used to vectorize knowledge base documents.">
                  <div className="relative">
                    <button
                      onClick={() => setEmbModelOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 260 }}
                    >
                      <span className="flex-1 text-left">{embModel}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {embModelOpen && (
                      <div className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 260 }}>
                        {EMBEDDING_MODELS.map((m) => (
                          <button
                            key={m}
                            onClick={() => { setEmbModel(m); setEmbModelOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-white/5"
                            style={{ background: m === embModel ? "rgba(239,68,68,0.12)" : "transparent", color: m === embModel ? "#F87171" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {m}
                            {m === embModel && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none">Chunk Size</p>
                    <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>Max token length for document text chunking.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} style={{ ...INPUT, width: 100, textAlign: "right", borderColor: errorMsg.includes("Chunk") ? "#EF4444" : "rgba(255,255,255,0.09)" }} />
                    <span className="text-xs font-semibold text-slate-400">tokens</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Security ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <p style={{ ...SECTION_TITLE, marginBottom: 0 }}>Security Settings</p>
              </div>
              <div style={CARD}>
                <Row label="Authentication Settings" hint="Primary method for employee login.">
                  <div className="relative">
                    <button
                      onClick={() => setAuthSettingsOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 200 }}
                    >
                      <span className="flex-1 text-left">{authSettings}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {authSettingsOpen && (
                      <div className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 200 }}>
                        {["SSO Only (SAML/OIDC)", "SSO + Password", "Password Only"].map((a) => (
                          <button
                            key={a}
                            onClick={() => { setAuthSettings(a); setAuthSettingsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-white/5"
                            style={{ background: a === authSettings ? "rgba(239,68,68,0.12)" : "transparent", color: a === authSettings ? "#F87171" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {a}
                            {a === authSettings && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <Row label="Role Permissions" hint="Control how new system roles inherit base permissions.">
                  <div className="relative">
                    <button
                      onClick={() => setRolePermsOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      style={{ background: "#0C1525", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EFF8", cursor: "pointer", fontFamily: "inherit", minWidth: 200 }}
                    >
                      <span className="flex-1 text-left">{rolePerms}</span>
                      <ChevronDown className="w-3 h-3" style={{ color: "#4A6080" }} />
                    </button>
                    {rolePermsOpen && (
                      <div className="absolute right-0 top-10 z-20 rounded-xl overflow-hidden shadow-xl" style={{ background: "#111D30", border: "1px solid rgba(255,255,255,0.1)", minWidth: 200 }}>
                        {ROLE_PERMISSIONS.map((r) => (
                          <button
                            key={r}
                            onClick={() => { setRolePerms(r); setRolePermsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-white/5"
                            style={{ background: r === rolePerms ? "rgba(239,68,68,0.12)" : "transparent", color: r === rolePerms ? "#F87171" : "#A0AFBF", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {r}
                            {r === rolePerms && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Row>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none">Require Two-Factor Authentication (2FA)</p>
                    <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>Enforce 2FA globally for all active user accounts.</p>
                  </div>
                  <Toggle on={twoFA} onChange={setTwoFA} />
                </div>
              </div>
            </section>

            {/* ── Notifications ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-slate-400" />
                <p style={{ ...SECTION_TITLE, marginBottom: 0 }}>Notification Preferences</p>
              </div>
              <div style={CARD}>
                <Row label="Email Alerts" hint="Receive critical security and platform updates via email.">
                  <Toggle on={emailAlerts} onChange={setEmailAlerts} />
                </Row>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none">System Alerts</p>
                    <p className="text-[11px] mt-1" style={{ color: "#4A6080" }}>Broadcast global maintenance or downtime banners to users.</p>
                  </div>
                  <Toggle on={systemAlerts} onChange={setSystemAlerts} />
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Global Success Overlay */}
      {saved && (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4" style={{ background: "#059669", color: "#fff" }}>
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">Settings saved successfully</span>
        </div>
      )}
    </div>
  );
}
