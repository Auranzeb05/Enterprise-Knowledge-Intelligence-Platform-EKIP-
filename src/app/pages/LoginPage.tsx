import "../../styles/login-autofill.css";
import React, {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileSearch,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  useAuth,
} from "../context/AuthContext";
import type {
  EkipUser,
  UserRole,
} from "../context/AuthContext";

const CAPABILITIES = [
  {
    icon: FileSearch,
    label: "Grounded answers",
    desc: "Answers are retrieved from authorized enterprise documents and backed by sources.",
  },
  {
    icon: Database,
    label: "One knowledge workspace",
    desc: "Documents, semantic search, and AI-assisted retrieval stay connected in EKIP.",
  },
  {
    icon: ShieldCheck,
    label: "Role-aware by design",
    desc: "Employees, managers, and admins only access knowledge allowed for their role and department.",
  },
];

const ROLE_META: Record<
  UserRole,
  {
    label: string;
    path: string;
    color: string;
  }
> = {
  employee: {
    label: "Employee",
    path: "/dashboard",
    color: "#2563EB",
  },
  manager: {
    label: "Manager",
    path: "/manager",
    color: "#8B5CF6",
  },
  admin: {
    label: "Admin",
    path: "/admin",
    color: "#EF4444",
  },
};

function validate(
  email: string,
  password: string
) {
  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "Email address is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    login,
    logout,
    user,
    session,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPw, setShowPw] =
    useState(false);

  const [touched, setTouched] =
    useState({
      email: false,
      password: false,
    });

  const [status, setStatus] =
    useState<
      "idle" |
      "loading" |
      "error" |
      "success"
    >("idle");

  const [serverErr, setServerErr] =
    useState("");

  const [
    authenticatedUser,
    setAuthenticatedUser,
  ] =
    useState<EkipUser | null>(null);

  const errors =
    validate(
      email.trim(),
      password
    );

  // Do NOT auto-redirect just because an older session exists.
  useEffect(() => {
    if (
      status !== "success" ||
      !authenticatedUser
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        navigate(
          ROLE_META[
            authenticatedUser.role
          ].path,
          { replace: true }
        );
      }, 700);

    return () =>
      window.clearTimeout(timer);
  }, [
    status,
    authenticatedUser,
    navigate,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (status === "loading") return;

    setTouched({
      email: true,
      password: true,
    });

    const normalizedEmail =
      email.trim().toLowerCase();

    const currentErrors =
      validate(
        normalizedEmail,
        password
      );

    if (
      Object.keys(currentErrors).length >
      0
    ) {
      setServerErr("");
      setStatus("idle");
      return;
    }

    try {
      setStatus("loading");
      setServerErr("");
      setAuthenticatedUser(null);

      const ekipUser =
        await login(
          normalizedEmail,
          password
        );

      setAuthenticatedUser(ekipUser);
      setPassword("");
      setStatus("success");
    } catch (error) {
      setAuthenticatedUser(null);

      setServerErr(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your email and password."
      );

      setStatus("error");
    }
  }

  async function handleExistingLogout() {
    await logout();

    setEmail("");
    setPassword("");
    setServerErr("");
    setAuthenticatedUser(null);
    setStatus("idle");
  }

  function continueExistingSession() {
    if (!user) return;

    navigate(
      ROLE_META[user.role].path,
      { replace: true }
    );
  }

  const currentRole =
    authenticatedUser
      ? ROLE_META[
          authenticatedUser.role
        ]
      : null;

  const existingRole =
    user
      ? ROLE_META[user.role]
      : null;

  return (
    <div
      className="min-h-screen w-full flex"
      style={{
        fontFamily:
          "'Plus Jakarta Sans','Inter',system-ui,sans-serif",
      }}
    >
      <section
        className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg,#09152D 0%,#0D2148 52%,#12326F 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 16% 18%,rgba(59,130,246,0.18),transparent 28%), radial-gradient(circle at 82% 78%,rgba(96,165,250,0.10),transparent 34%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg,#2563EB,#1D4ED8)",
                boxShadow:
                  "0 10px 28px rgba(37,99,235,0.28)",
              }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>

            <div>
              <span className="text-white font-extrabold text-lg tracking-tight">
                EKIP
              </span>
              <p className="text-blue-200/50 text-[10px] uppercase tracking-[0.18em] mt-0.5">
                Enterprise Knowledge Intelligence
              </p>
            </div>
          </div>

          <div className="mt-auto mb-10 max-w-xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-5 text-[11px] font-semibold"
              style={{
                background:
                  "rgba(96,165,250,0.10)",
                border:
                  "1px solid rgba(147,197,253,0.14)",
                color: "#93C5FD",
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              Secure enterprise knowledge access
            </div>

            <h1 className="text-white text-4xl xl:text-[44px] font-extrabold leading-[1.08] tracking-tight">
              Find the right answer.
              <br />
              <span style={{ color: "#60A5FA" }}>
                From the right knowledge.
              </span>
            </h1>

            <p className="text-blue-100/60 max-w-lg mt-5 text-[15px] leading-7">
              EKIP connects authorized documents, semantic retrieval, and grounded AI in one role-aware workspace.
            </p>
          </div>

          <div className="grid gap-3 mb-10 max-w-xl">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3.5 rounded-xl px-4 py-3.5"
                  style={{
                    background:
                      "rgba(255,255,255,0.035)",
                    border:
                      "1px solid rgba(255,255,255,0.055)",
                  }}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background:
                        "rgba(37,99,235,0.15)",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "#7DB4FF" }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-100">
                      {item.label}
                    </p>
                    <p className="text-xs leading-5 text-blue-100/45 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="flex flex-wrap gap-x-5 gap-y-2 pt-5"
            style={{
              borderTop:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              "Supabase Auth",
              "Role-Based Access",
              "Private Storage",
              "Ollama RAG",
            ].map((badge) => (
              <span
                key={badge}
                className="text-[9px] uppercase tracking-[0.14em] text-blue-100/35"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main
        className="flex-1 flex items-start md:items-center justify-center overflow-y-auto px-5 py-8 sm:px-8 md:px-10 md:py-10 lg:px-6 lg:py-12"
        style={{ background: "#F4F7FB" }}
      >
        {status === "success" ? (
          <div className="w-full max-w-[560px] lg:max-w-[420px] text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Authentication successful
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Redirecting to your EKIP workspace…
            </p>

            {currentRole && (
              <p
                className="text-xs font-semibold mt-3"
                style={{
                  color:
                    currentRole.color,
                }}
              >
                Signing in as{" "}
                {currentRole.label}
              </p>
            )}

            <Loader2 className="w-5 h-5 animate-spin mx-auto mt-6 text-blue-600" />
          </div>
        ) : (
          <div className="w-full max-w-[560px] lg:max-w-[420px]">
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600 mb-2">
                EKIP Workspace
              </p>

              <h2 className="text-[32px] leading-tight font-extrabold tracking-tight text-slate-900">
                Sign in
              </h2>

              <p className="text-slate-500 text-sm mt-2">
                Use your organization account to continue.
              </p>
            </div>

            {!authLoading &&
              session &&
              user &&
              existingRole && (
                <div className="rounded-xl p-4 mb-5 bg-blue-50 border border-blue-200">
                  <p className="text-sm font-semibold text-slate-800">
                    Existing session detected
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Signed in as {user.email} (
                    {existingRole.label}).
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={
                        continueExistingSession
                      }
                      className="flex-1 rounded-lg py-2 text-xs font-bold text-white bg-blue-600"
                    >
                      Continue
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleExistingLogout()
                      }
                      className="rounded-lg px-3 py-2 text-xs font-bold bg-white border border-slate-200"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}

            {status === "error" &&
              serverErr && (
                <div className="flex gap-3 rounded-xl px-4 py-3 mb-5 text-sm bg-red-50 border border-red-200 text-red-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{serverErr}</span>
                </div>
              )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="username"
                  type="email"
                  autoComplete="username"
                  value={email}
                  disabled={
                    status === "loading"
                  }
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );

                    if (
                      status === "error"
                    ) {
                      setStatus("idle");
                      setServerErr("");
                    }
                  }}
                  onBlur={() =>
                    setTouched((previous) => ({
                      ...previous,
                      email: true,
                    }))
                  }
                  className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  style={{
                    border:
                      touched.email &&
                      errors.email
                        ? "1.5px solid #DC2626"
                        : "1.5px solid #D9E2EE",
                  }}
                />

                {touched.email &&
                  errors.email && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors.email}
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPw
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    disabled={
                      status === "loading"
                    }
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );

                      if (
                        status === "error"
                      ) {
                        setStatus("idle");
                        setServerErr("");
                      }
                    }}
                    onBlur={() =>
                      setTouched(
                        (previous) => ({
                          ...previous,
                          password: true,
                        })
                      )
                    }
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 bg-white outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                    style={{
                      border:
                        touched.password &&
                        errors.password
                          ? "1.5px solid #DC2626"
                          : "1.5px solid #D9E2EE",
                    }}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPw
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPw(
                        (previous) =>
                          !previous
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {touched.password &&
                  errors.password && (
                    <p className="text-xs text-red-600 mt-1.5">
                      {errors.password}
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={
                  status === "loading"
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Continue to EKIP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div
              className="mt-6 rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: "#EEF4FB",
                border:
                  "1px solid #DEE8F4",
              }}
            >
              <Lock className="w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0" />

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Secure sign-in
                </p>
                <p className="text-[11px] leading-5 text-slate-500 mt-0.5">
                  Authentication is handled by Supabase Auth and verified against your EKIP user record.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
