import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router";

import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FileText,
  UserCircle,
  RefreshCw,
  Building2,
  UserRound,
  CheckCircle2,
  CalendarDays,
  Mail,
} from "lucide-react";

import { EKIPSidebar } from "../components/Sidebar";
import type { SidebarNavItem } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   TYPES
========================================================= */

type UserRole =
  | "employee"
  | "manager"
  | "admin";

type UserStatus =
  | "active"
  | "pending"
  | "suspended";

interface EmployeeDashboardResponse {
  success: boolean;

  employee: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;

    department: {
      id: string;
      name: string;
    } | null;

    manager: {
      id: string;
      fullName: string;
      email: string;

      department: {
        id: string;
        name: string;
      } | null;
    } | null;
  };

  message?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL;

const NAV: SidebarNavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/ai-chat",
    label: "AI Chat",
    icon: MessageSquare,
  },
  {
    path: "/knowledge",
    label: "Knowledge Base",
    icon: BookOpen,
  },
  {
    path: "/documents",
    label: "Documents",
    icon: FileText,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: UserCircle,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function initials(
  name: string
) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(
      (part) => part[0]
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStatus(
  status: UserStatus
) {
  if (
    status === "active"
  ) {
    return "Active";
  }

  if (
    status === "pending"
  ) {
    return "Pending";
  }

  return "Suspended";
}

function statusColor(
  status: UserStatus
) {
  if (
    status === "active"
  ) {
    return "#22C55E";
  }

  if (
    status === "pending"
  ) {
    return "#F59E0B";
  }

  return "#EF4444";
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EmployeeDashboard() {
  const navigate =
    useNavigate();

  const {
    session,
    logout,
  } = useAuth();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<EmployeeDashboardResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  async function loadDashboard() {
    if (
      !session?.access_token
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/employee/dashboard`,
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data: EmployeeDashboardResponse =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
            "Failed to load employee dashboard"
        );
      }

      setDashboard(
        data
      );
    } catch (err) {
      console.error(
        "Employee dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load employee dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      !session?.access_token
    ) {
      return;
    }

    loadDashboard();
  }, [
    session?.access_token,
  ]);

  async function handleLogout() {
    await logout();

    navigate("/", {
      replace: true,
    });
  }

  if (
    loading
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "#0C1525",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />

          <p
            className="text-sm"
            style={{
              color:
                "#6B7280",
            }}
          >
            Loading employee dashboard...
          </p>
        </div>
      </div>
    );
  }

  const employee =
    dashboard?.employee;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background:
          "#0C1525",

        fontFamily:
          "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      <EKIPSidebar
        items={
          NAV
        }
        subtitle="Employee"
        subtitleColor="rgba(37,99,235,0.5)"
        settingsPath="/settings"
        onLogout={
          handleLogout
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4"
          style={{
            background:
              "rgba(8,15,28,0.96)",

            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-white">
              Employee Dashboard
            </h1>

            <p
              className="text-xs mt-1"
              style={{
                color:
                  "#6B7280",
              }}
            >
              Welcome back
              {employee
                ?.fullName
                ? `, ${employee.fullName}`
                : ""}
              .
            </p>
          </div>

          <button
            onClick={
              loadDashboard
            }
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.08)",

              color:
                "#E8EFF8",
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />

            Refresh
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{
                background:
                  "rgba(239,68,68,0.1)",

                border:
                  "1px solid rgba(239,68,68,0.25)",

                color:
                  "#F87171",
              }}
            >
              {
                error
              }
            </div>
          )}

          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background:
                    "#2563EB",
                }}
              >
                {employee
                  ?.fullName
                  ? initials(
                      employee.fullName
                    )
                  : "E"}
              </div>

              <div>
                <h2 className="text-base font-semibold text-white">
                  {employee
                    ?.fullName ||
                    "Employee"}
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "#6B7280",
                  }}
                >
                  {employee
                    ?.email ||
                    ""}
                </p>
              </div>

              <div className="sm:ml-auto sm:text-right">
                <p
                  className="text-[10px] uppercase tracking-wider font-semibold"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Account Status
                </p>

                <div className="flex items-center justify-end gap-1.5 mt-1">

                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        employee
                          ? statusColor(
                              employee.status
                            )
                          : "#6B7280",
                    }}
                  />

                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        employee
                          ? statusColor(
                              employee.status
                            )
                          : "#6B7280",
                    }}
                  >
                    {employee
                      ? formatStatus(
                          employee.status
                        )
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

            <InfoCard
              title="Department"
              value={
                employee
                  ?.department
                  ?.name ||
                "Unassigned"
              }
              icon={
                Building2
              }
              color="#A78BFA"
            />

            <InfoCard
              title="Manager"
              value={
                employee
                  ?.manager
                  ?.fullName ||
                "Unassigned"
              }
              icon={
                UserRound
              }
              color="#60A5FA"
            />

            <InfoCard
              title="Role"
              value="Employee"
              icon={
                CheckCircle2
              }
              color="#4ADE80"
            />

            <InfoCard
              title="Member Since"
              value={
                employee
                  ?.createdAt
                  ? formatDate(
                      employee.createdAt
                    )
                  : "—"
              }
              icon={
                CalendarDays
              }
              color="#FBBF24"
            />
          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* =============================================
                EMPLOYEE DETAILS
            ============================================= */}

            <div
              className="xl:col-span-2 rounded-2xl p-5"
              style={{
                background:
                  "#111D30",

                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-sm font-semibold text-white mb-5">
                Account Details
              </h2>

              <DetailRow
                label="Full Name"
                value={
                  employee
                    ?.fullName ||
                  "—"
                }
              />

              <DetailRow
                label="Email"
                value={
                  employee
                    ?.email ||
                  "—"
                }
              />

              <DetailRow
                label="Department"
                value={
                  employee
                    ?.department
                    ?.name ||
                  "Unassigned"
                }
              />

              <DetailRow
                label="Manager"
                value={
                  employee
                    ?.manager
                    ?.fullName ||
                  "Unassigned"
                }
              />

              <DetailRow
                label="Status"
                value={
                  employee
                    ? formatStatus(
                        employee.status
                      )
                    : "—"
                }
              />
            </div>

            {/* =============================================
                MANAGER CARD
            ============================================= */}

            <div
              className="rounded-2xl p-5"
              style={{
                background:
                  "#111D30",

                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">

                <UserRound
                  className="w-4 h-4"
                  style={{
                    color:
                      "#60A5FA",
                  }}
                />

                <h2 className="text-sm font-semibold text-white">
                  Reporting Manager
                </h2>
              </div>

              {employee
                ?.manager ? (
                <>
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white mb-4"
                    style={{
                      background:
                        "#7C3AED",
                    }}
                  >
                    {initials(
                      employee.manager.fullName
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {
                      employee.manager.fullName
                    }
                  </p>

                  <div className="flex items-center gap-2 mt-2">

                    <Mail
                      className="w-3.5 h-3.5"
                      style={{
                        color:
                          "#6B7280",
                      }}
                    />

                    <p
                      className="text-xs"
                      style={{
                        color:
                          "#6B7280",
                      }}
                    >
                      {
                        employee.manager.email
                      }
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-3 mt-4"
                    style={{
                      background:
                        "rgba(139,92,246,0.08)",

                      border:
                        "1px solid rgba(139,92,246,0.15)",
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{
                        color:
                          "#6B7280",
                      }}
                    >
                      Manager Department
                    </p>

                    <p
                      className="text-sm font-semibold mt-1"
                      style={{
                        color:
                          "#A78BFA",
                      }}
                    >
                      {employee
                        .manager
                        .department
                        ?.name ||
                        "Unassigned"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">

                  <UserRound
                    className="w-8 h-8 mx-auto mb-3"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  />

                  <p
                    className="text-sm"
                    style={{
                      color:
                        "#6B7280",
                    }}
                  >
                    No manager assigned yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              FUTURE MODULES
          ================================================= */}

          <div
            className="rounded-2xl p-5 mt-5"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-sm font-semibold text-white">
              Knowledge Workspace
            </h2>

            <p
              className="text-xs mt-2 leading-5"
              style={{
                color:
                  "#6B7280",
              }}
            >
              Document activity, knowledge access, saved resources,
              search history and AI interactions will appear here once
              those EKIP modules are connected. This dashboard currently
              displays only real account and organization data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background:
          "#111D30",

        border:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
        style={{
          background:
            `${color}18`,
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{
            color,
          }}
        />
      </div>

      <p
        className="text-[10px] uppercase tracking-wider font-semibold"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {
          title
        }
      </p>

      <p
        className="text-sm font-semibold mt-1 truncate"
        style={{
          color:
            "#E8EFF8",
        }}
        title={
          value
        }
      >
        {
          value
        }
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{
        borderBottom:
          "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        className="text-xs"
        style={{
          color:
            "#6B7280",
        }}
      >
        {
          label
        }
      </span>

      <span className="text-sm font-medium text-white">
        {
          value
        }
      </span>
    </div>
  );
}
