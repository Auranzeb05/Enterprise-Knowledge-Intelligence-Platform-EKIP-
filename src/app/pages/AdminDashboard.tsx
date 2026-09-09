import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";

import {
  LayoutDashboard,
  Users,
  BarChart2,
  ClipboardList,
  Brain,
  FileText,
  UserCircle,
  Building2,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserCog,
  BookOpen,
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

interface RecentUser {
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
}

interface DashboardDepartment {
  id: string;
  name: string;

  _count: {
    users: number;
  };
}

interface AdminDashboardResponse {
  success: boolean;

  stats: {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    suspendedUsers: number;
    totalDepartments: number;

    roles: {
      employee: number;
      manager: number;
      admin: number;
    };
  };

  recentUsers: RecentUser[];

  departments: DashboardDepartment[];

  message?: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL;

const NAV: SidebarNavItem[] = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/users",
    label: "User Management",
    icon: Users,
  },
  {
    path: "/departments",
    label: "Departments",
    icon: Building2,
  },
  {
    path: "/documents",
    label: "Document Management",
    icon: FileText,
  },
  {
    path: "/knowledge",
    label: "Knowledge Base",
    icon: BookOpen,
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: BarChart2,
  },
  {
    path: "/audit",
    label: "Audit Logs",
    icon: ClipboardList,
  },
  {
    path: "/ai-monitoring",
    label: "AI Monitoring",
    icon: Brain,
  },
  {
    path: "/admin-profile",
    label: "Profile",
    icon: UserCircle,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatRole(
  role: UserRole
) {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "manager") {
    return "Manager";
  }

  return "Employee";
}

function formatStatus(
  status: UserStatus
) {
  if (status === "active") {
    return "Active";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Suspended";
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

function roleColor(
  role: UserRole
) {
  if (role === "admin") {
    return {
      background:
        "rgba(239,68,68,0.12)",
      color: "#F87171",
    };
  }

  if (role === "manager") {
    return {
      background:
        "rgba(139,92,246,0.12)",
      color: "#A78BFA",
    };
  }

  return {
    background:
      "rgba(37,99,235,0.12)",
    color: "#60A5FA",
  };
}

function statusColor(
  status: UserStatus
) {
  if (status === "active") {
    return "#22C55E";
  }

  if (status === "pending") {
    return "#F59E0B";
  }

  return "#EF4444";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboard() {
  const navigate =
    useNavigate();

  const {
    session,
    logout,
    user,
  } = useAuth();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<AdminDashboardResponse | null>(
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

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

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
          `${API_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data: AdminDashboardResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load dashboard"
        );
      }

      setDashboard(data);
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard"
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
  }, [session?.access_token]);

  async function handleLogout() {
    await logout();

    navigate("/", {
      replace: true,
    });
  }

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const stats =
    dashboard?.stats;

  const largestDepartment =
    useMemo(() => {
      if (
        !dashboard?.departments
          .length
      ) {
        return null;
      }

      return [
        ...dashboard.departments,
      ].sort(
        (a, b) =>
          b._count.users -
          a._count.users
      )[0];
    }, [dashboard]);

  const roleTotal =
    stats
      ? stats.roles.admin +
        stats.roles.manager +
        stats.roles.employee
      : 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
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
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

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
        items={NAV}
        subtitle="Admin"
        subtitleColor="rgba(37,99,235,0.5)"
        settingsPath="/admin-settings"
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
              Admin Dashboard
            </h1>

            <p
              className="text-xs mt-1"
              style={{
                color:
                  "#6B7280",
              }}
            >
              Welcome back
              {user?.fullName
                ? `, ${user.fullName}`
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

          {/* Error */}

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
              {error}
            </div>
          )}

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

            <DashboardCard
              title="Total Users"
              value={
                stats?.totalUsers ??
                0
              }
              icon={Users}
              color="#60A5FA"
            />

            <DashboardCard
              title="Active Users"
              value={
                stats?.activeUsers ??
                0
              }
              icon={
                CheckCircle2
              }
              color="#4ADE80"
            />

            <DashboardCard
              title="Pending"
              value={
                stats?.pendingUsers ??
                0
              }
              icon={Clock3}
              color="#FBBF24"
            />

            <DashboardCard
              title="Suspended"
              value={
                stats?.suspendedUsers ??
                0
              }
              icon={
                ShieldCheck
              }
              color="#F87171"
            />

            <DashboardCard
              title="Departments"
              value={
                stats?.totalDepartments ??
                0
              }
              icon={
                Building2
              }
              color="#A78BFA"
            />
          </div>

          {/* =================================================
              SECONDARY INFO
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

            <InfoCard
              label="Admins"
              value={
                stats?.roles.admin ??
                0
              }
              sub="Administrative accounts"
              color="#F87171"
            />

            <InfoCard
              label="Managers"
              value={
                stats?.roles.manager ??
                0
              }
              sub="Manager accounts"
              color="#A78BFA"
            />

            <InfoCard
              label="Employees"
              value={
                stats?.roles.employee ??
                0
              }
              sub="Employee accounts"
              color="#60A5FA"
            />
          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* =============================================
                RECENT USERS
            ============================================= */}

            <div
              className="xl:col-span-2 rounded-2xl overflow-hidden"
              style={{
                background:
                  "#111D30",

                border:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  borderBottom:
                    "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Recent Users
                  </h2>

                  <p
                    className="text-xs mt-1"
                    style={{
                      color:
                        "#6B7280",
                    }}
                  >
                    Most recently created EKIP accounts
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/users"
                    )
                  }
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{
                    color:
                      "#60A5FA",
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5" />

                  Manage Users
                </button>
              </div>

              {!dashboard
                ?.recentUsers
                .length ? (
                <div className="py-14 text-center">
                  <Users
                    className="w-8 h-8 mx-auto mb-2"
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
                    No users found.
                  </p>
                </div>
              ) : (
                <div>
                  {dashboard.recentUsers.map(
                    (
                      recentUser
                    ) => (
                      <div
                        key={
                          recentUser.id
                        }
                        className="flex items-center justify-between px-5 py-4"
                        style={{
                          borderBottom:
                            "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div className="flex items-center gap-3">

                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{
                              background:
                                "#2563EB",
                            }}
                          >
                            {initials(
                              recentUser.fullName
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {
                                recentUser.fullName
                              }
                            </p>

                            <p
                              className="text-xs mt-0.5"
                              style={{
                                color:
                                  "#6B7280",
                              }}
                            >
                              {
                                recentUser.email
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5">

                          <div className="text-right">
                            <span
                              className="px-2 py-1 rounded-md text-[10px] font-semibold"
                              style={
                                roleColor(
                                  recentUser.role
                                )
                              }
                            >
                              {formatRole(
                                recentUser.role
                              )}
                            </span>

                            <p
                              className="text-[10px] mt-1"
                              style={{
                                color:
                                  "#6B7280",
                              }}
                            >
                              {recentUser
                                .department
                                ?.name ||
                                "Unassigned"}
                            </p>
                          </div>

                          <div className="text-right min-w-[90px]">

                            <div className="flex items-center justify-end gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background:
                                    statusColor(
                                      recentUser.status
                                    ),
                                }}
                              />

                              <span
                                className="text-xs"
                                style={{
                                  color:
                                    statusColor(
                                      recentUser.status
                                    ),
                                }}
                              >
                                {formatStatus(
                                  recentUser.status
                                )}
                              </span>
                            </div>

                            <p
                              className="text-[10px] mt-1"
                              style={{
                                color:
                                  "#3D5A78",
                              }}
                            >
                              {formatDate(
                                recentUser.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =============================================
                ROLE DISTRIBUTION
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
                <UserCog
                  className="w-4 h-4"
                  style={{
                    color:
                      "#60A5FA",
                  }}
                />

                <h2 className="text-sm font-semibold text-white">
                  Role Distribution
                </h2>
              </div>

              <RoleRow
                label="Admins"
                count={
                  stats?.roles.admin ??
                  0
                }
                total={
                  roleTotal
                }
                color="#EF4444"
              />

              <RoleRow
                label="Managers"
                count={
                  stats?.roles.manager ??
                  0
                }
                total={
                  roleTotal
                }
                color="#8B5CF6"
              />

              <RoleRow
                label="Employees"
                count={
                  stats?.roles.employee ??
                  0
                }
                total={
                  roleTotal
                }
                color="#2563EB"
              />
            </div>
          </div>

          {/* =================================================
              DEPARTMENTS
          ================================================= */}

          <div
            className="rounded-2xl mt-5 overflow-hidden"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Departments
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "#6B7280",
                  }}
                >
                  Real department membership across EKIP
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/departments"
                  )
                }
                className="text-xs font-medium"
                style={{
                  color:
                    "#60A5FA",
                }}
              >
                Manage Departments
              </button>
            </div>

            {!dashboard
              ?.departments
              .length ? (
              <div className="py-12 text-center">
                <Building2
                  className="w-8 h-8 mx-auto mb-2"
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
                  No departments found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-5">
                {dashboard.departments.map(
                  (
                    department
                  ) => (
                    <div
                      key={
                        department.id
                      }
                      className="rounded-xl p-4"
                      style={{
                        background:
                          "rgba(255,255,255,0.03)",

                        border:
                          "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                        style={{
                          background:
                            "rgba(37,99,235,0.12)",
                        }}
                      >
                        <Building2
                          className="w-4 h-4"
                          style={{
                            color:
                              "#60A5FA",
                          }}
                        />
                      </div>

                      <p className="text-sm font-semibold text-white">
                        {
                          department.name
                        }
                      </p>

                      <p
                        className="text-xs mt-1"
                        style={{
                          color:
                            "#6B7280",
                        }}
                      >
                        {
                          department
                            ._count
                            .users
                        }{" "}
                        {department
                          ._count
                          .users ===
                        1
                          ? "user"
                          : "users"}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div
            className="mt-5 rounded-2xl p-5"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-sm font-semibold text-white mb-4">
              Organization Summary
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              <SummaryItem
                label="Largest Department"
                value={
                  largestDepartment
                    ? `${largestDepartment.name} (${largestDepartment._count.users})`
                    : "No data"
                }
              />

              <SummaryItem
                label="Active Account Rate"
                value={
                  stats?.totalUsers
                    ? `${Math.round(
                        (stats.activeUsers /
                          stats.totalUsers) *
                          100
                      )}%`
                    : "0%"
                }
              />

              <SummaryItem
                label="Unresolved Accounts"
                value={`${
                  (stats?.pendingUsers ??
                    0) +
                  (stats?.suspendedUsers ??
                    0)
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
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
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
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
      </div>

      <p
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {title}
      </p>

      <p
        className="text-2xl font-bold mt-1"
        style={{
          color:
            "#E8EFF8",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background:
          "#111D30",

        borderLeft:
          `3px solid ${color}`,
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider font-semibold"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {label}
      </p>

      <p
        className="text-xl font-bold mt-1"
        style={{
          color,
        }}
      >
        {value}
      </p>

      <p
        className="text-[10px] mt-1"
        style={{
          color:
            "#6B7280",
        }}
      >
        {sub}
      </p>
    </div>
  );
}

/* =========================================================
   ROLE ROW
========================================================= */

function RoleRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (count /
            total) *
            100
        )
      : 0;

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs"
          style={{
            color:
              "#9CA3AF",
          }}
        >
          {label}
        </span>

        <span
          className="text-xs font-semibold"
          style={{
            color,
          }}
        >
          {count}
        </span>
      </div>

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          background:
            "rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width:
              `${percentage}%`,

            background:
              color,
          }}
        />
      </div>

      <p
        className="text-[10px] mt-1"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {percentage}% of users
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-wider font-semibold"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {label}
      </p>

      <p
        className="text-sm font-semibold mt-1"
        style={{
          color:
            "#E8EFF8",
        }}
      >
        {value}
      </p>
    </div>
  );
}
