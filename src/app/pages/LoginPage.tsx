import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, type UserRole } from "../context/AuthContext";
import { Brain, Eye, EyeOff, ArrowRight, Lock, Shield, CheckCircle2, AlertCircle, Loader2, Network, Database, Star } from "lucide-react";

const FEATURES = [
  { icon: Brain, label: "AI-Driven Intelligence", desc: "Surface insights across your entire knowledge base instantly." },
  { icon: Database, label: "Unified Data Layer", desc: "Structured and unstructured data unified in one platform." },
  { icon: Network, label: "Enterprise Graph", desc: "Map relationships and dependencies at organizational scale." },
  { icon: Shield, label: "SOC 2 Type II Certified", desc: "Bank-grade security with end-to-end encryption at rest." },
];

const ROLES = [
  { label: "Employee", path: "/dashboard", color: "#2563EB", hint: "Standard access" },
  { label: "Manager", path: "/manager", color: "#8B5CF6", hint: "Team analytics" },
  { label: "Admin", path: "/admin", color: "#EF4444", hint: "Full control" },
];

function validate(email: string, password: string) {
  const e: Record<string, string> = {};
  if (!email) e.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid corporate email address.";
  if (!password) e.password = "Password is required.";
  else if (password.length < 8) e.password = "Password must be at least 8 characters.";
  return e;
}

const ROLE_KEYS: UserRole[] = ["employee", "manager", "admin"];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [serverErr, setServerErr] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedRole, setSelectedRole] = useState(0);

  const errs = validate(email, password);
  const showEmailErr = touched.email && errs.email;
  const showPwErr = touched.password && errs.password;

  useState(() => {
    const iv = setInterval(() => setActiveFeature((p) => (p + 1) % FEATURES.length), 3200);
    return () => clearInterval(iv);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1600));
    if (password === "wrongpass") {
      setStatus("error");
      setServerErr("Invalid credentials. Please check your email and password.");
    } else {
      setRole(ROLE_KEYS[selectedRole]);
      setStatus("success");
      setTimeout(() => navigate(ROLES[selectedRole].path), 1400);
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#0C1B3A 0%,#0F2456 45%,#162F6B 80%,#1A3A7A 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "#2563EB" }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "#60A5FA" }} />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.85)", boxShadow: "0 0 0 1px rgba(96,165,250,0.3)" }}>
              <Brain className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight leading-none">EKIP</span>
              <p className="text-blue-300/60 text-[10px] font-medium tracking-widest uppercase leading-none mt-0.5">Enterprise Knowledge Intelligence</p>
            </div>
          </div>

          <div className="mt-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(96,165,250,0.25)", color: "#93C5FD", letterSpacing: "0.06em" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              PLATFORM v4.2 · NOW LIVE
            </div>
            <h1 className="text-white font-extrabold leading-[1.1] mb-4" style={{ fontSize: "clamp(2rem,3vw,2.75rem)" }}>
              Intelligence that<br />
              <span style={{ color: "#60A5FA" }}>scales with you.</span>
            </h1>
            <p className="text-blue-200/70 text-base leading-relaxed max-w-sm">
              Unlock organizational knowledge, accelerate decisions, and drive growth with AI-powered enterprise intelligence.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-12">
            {FEATURES.map((item, i) => {
              const Icon = item.icon;
              const isActive = i === activeFeature;
              return (
                <button key={item.label} onClick={() => setActiveFeature(i)}
                  className="w-full text-left flex items-start gap-4 p-3.5 rounded-xl transition-all duration-500"
                  style={{ background: isActive ? "rgba(37,99,235,0.22)" : "transparent", border: isActive ? "1px solid rgba(96,165,250,0.25)" : "1px solid transparent" }}>
                  <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.05)" }}>
                    <Icon className="w-4 h-4" style={{ color: isActive ? "#93C5FD" : "#475B80" }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: isActive ? "#E0EEFF" : "#475B80" }}>{item.label}</p>
                    <p className="text-xs leading-relaxed mt-0.5 transition-colors" style={{ color: isActive ? "#93B8D4" : "transparent" }}>{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-5 pt-6 border-t border-white/[0.08]">
            {["SOC 2", "ISO 27001", "GDPR", "HIPAA"].map((b) => (
              <span key={b} className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(148,190,220,0.45)" }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 xl:px-16 min-h-screen" style={{ background: "#F1F5F9" }}>
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#2563EB" }}>
            <Brain className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">EKIP</span>
        </div>

        {status === "success" ? (
          <div className="w-full max-w-[420px] text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#DCFCE7" }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: "#16A34A" }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication successful</h2>
            <p className="text-slate-500 text-sm mb-4">Redirecting to your EKIP workspace…</p>
            <p className="text-xs font-semibold" style={{ color: ROLES[selectedRole].color }}>
              Signing in as {ROLES[selectedRole].label}
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="h-1 rounded-full overflow-hidden" style={{ width: 200, background: "#E2E8F0" }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: "#2563EB", animation: "progressBar 1.4s linear forwards" }} />
              </div>
            </div>
            <style>{`@keyframes progressBar{from{width:0%}to{width:100%}}`}</style>
          </div>
        ) : (
          <div className="w-full max-w-[420px]">
            <div className="mb-6">
              <h2 className="font-extrabold text-slate-900 leading-tight mb-1.5" style={{ fontSize: "1.75rem" }}>Welcome back</h2>
              <p className="text-slate-500 text-sm">Sign in to your EKIP workspace to continue.</p>
            </div>

            {/* Demo role selector */}
            <div className="mb-5 rounded-2xl p-4" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#3D5A78" }}>
                Demo Mode — Sign in as:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r, i) => (
                  <button key={r.label} onClick={() => setSelectedRole(i)}
                    className="py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: selectedRole === i ? r.color : "rgba(255,255,255,0.8)",
                      color: selectedRole === i ? "#fff" : "#5B7A99",
                      border: selectedRole === i ? `1.5px solid ${r.color}` : "1.5px solid rgba(0,0,0,0.08)",
                      boxShadow: selectedRole === i ? `0 4px 12px ${r.color}30` : "none",
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {status === "error" && serverErr && (
              <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5 text-sm" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#DC2626" }} />
                {serverErr}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Corporate email</label>
                <input id="email" type="email" placeholder="you@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  style={{ background: "#fff", border: showEmailErr ? "1.5px solid #DC2626" : "1.5px solid #E2E8F0", boxShadow: showEmailErr ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 2px rgba(15,23,42,0.04)" }}
                  onFocus={(e) => { if (!showEmailErr) { e.currentTarget.style.border = "1.5px solid #2563EB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; } }}
                  onBlurCapture={(e) => { e.currentTarget.style.border = showEmailErr ? "1.5px solid #DC2626" : "1.5px solid #E2E8F0"; e.currentTarget.style.boxShadow = showEmailErr ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 2px rgba(15,23,42,0.04)"; }} />
                {showEmailErr && <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#DC2626" }}><AlertCircle className="w-3.5 h-3.5" />{errs.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <button type="button" className="text-xs font-semibold" style={{ color: "#2563EB" }}>Forgot password?</button>
                </div>
                <div className="relative">
                  <input id="password" type={showPw ? "text" : "password"} placeholder="••••••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    style={{ background: "#fff", border: showPwErr ? "1.5px solid #DC2626" : "1.5px solid #E2E8F0", boxShadow: showPwErr ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 2px rgba(15,23,42,0.04)" }}
                    onFocus={(e) => { if (!showPwErr) { e.currentTarget.style.border = "1.5px solid #2563EB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; } }}
                    onBlurCapture={(e) => { e.currentTarget.style.border = showPwErr ? "1.5px solid #DC2626" : "1.5px solid #E2E8F0"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.04)"; }} />
                  <button type="button" aria-label="toggle password" onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showPwErr && <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#DC2626" }}><AlertCircle className="w-3.5 h-3.5" />{errs.password}</p>}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember((v) => !v)}
                  className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ background: remember ? "#2563EB" : "#fff", border: remember ? "1.5px solid #2563EB" : "1.5px solid #CBD5E1" }}>
                  {remember && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
                <span className="text-sm text-slate-600 cursor-pointer" onClick={() => setRemember((v) => !v)}>Keep me signed in for 30 days</span>
              </div>

              {/* Submit */}
              <button type="submit" disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white transition-all mt-2 disabled:opacity-70"
                style={{ background: status === "loading" ? "#1D4ED8" : "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}>
                {status === "loading" ? (<><Loader2 className="w-4 h-4 animate-spin" />Authenticating…</>) : (<>Sign in to EKIP<ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            {/* SSO */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">or</span>
              <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
            </div>
            <button className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold text-slate-700 transition-all"
              style={{ background: "#fff", border: "1.5px solid #E2E8F0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
              <Lock className="w-4 h-4 text-slate-400" />Continue with SSO
            </button>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 text-center space-y-2">
              <p className="text-xs text-slate-400">Protected by enterprise-grade security. All sessions are encrypted.</p>
              <div className="flex items-center justify-center gap-4">
                {["Privacy Policy", "Terms of Service", "Security"].map((l) => (
                  <button key={l} className="text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">{l}</button>
                ))}
              </div>
              <p className="text-xs text-slate-300">&copy; 2026 EKIP Technologies, Inc.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
