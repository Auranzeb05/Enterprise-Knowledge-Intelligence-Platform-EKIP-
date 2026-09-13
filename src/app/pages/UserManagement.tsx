import React, {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  ClipboardList,
  Brain,
  FileText,
  Search,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ChevronDown,
  UserCircle,
  RefreshCw,
  Edit2,
  Building2,
  Trash2,
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

type RoleLabel =
  | "Admin"
  | "Manager"
  | "Employee";

type StatusLabel =
  | "Active"
  | "Pending"
  | "Suspended";

interface Department {
  id: string;
  name: string;
}

interface DepartmentResponse {
  success: boolean;
  departments: Department[];
}

interface ApiUser {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;

  departmentId: string | null;

  managerId: string | null;

  department: Department | null;

  createdAt: string;
  updatedAt: string;
}

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: RoleLabel;
  status: StatusLabel;
  department: string;
  memberSince: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL;

const PAGE_SIZE = 8;

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

const ROLES: RoleLabel[] = [
  "Admin",
  "Manager",
  "Employee",
];

const STATUSES: StatusLabel[] = [
  "Active",
  "Pending",
  "Suspended",
];

const ROLE_COLORS: Record<
  RoleLabel,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  Admin: {
    bg: "rgba(239,68,68,0.15)",
    text: "#F87171",
    border: "rgba(239,68,68,0.3)",
  },

  Manager: {
    bg: "rgba(139,92,246,0.15)",
    text: "#A78BFA",
    border: "rgba(139,92,246,0.3)",
  },

  Employee: {
    bg: "rgba(37,99,235,0.15)",
    text: "#60A5FA",
    border: "rgba(37,99,235,0.3)",
  },
};

const STATUS_COLORS: Record<
  StatusLabel,
  {
    bg: string;
    text: string;
    dot: string;
  }
> = {
  Active: {
    bg: "rgba(34,197,94,0.12)",
    text: "#4ADE80",
    dot: "#22C55E",
  },

  Pending: {
    bg: "rgba(156,163,175,0.12)",
    text: "#9CA3AF",
    dot: "#6B7280",
  },

  Suspended: {
    bg: "rgba(239,68,68,0.12)",
    text: "#F87171",
    dot: "#EF4444",
  },
};

const ROLE_PERMISSIONS: Record<
  RoleLabel,
  string[]
> = {
  Admin: [
    "Manage users",
    "Manage departments",
    "Manage documents",
    "View analytics",
    "View audit logs",
    "Use AI Chat",
  ],

  Manager: [
    "View team data",
    "Access department knowledge",
    "View analytics",
    "Use AI Chat",
  ],

  Employee: [
    "Access assigned knowledge",
    "View documents",
    "Use AI Chat",
  ],
};

/* =========================================================
   HELPERS
========================================================= */

function roleToLabel(
  role: UserRole
): RoleLabel {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "manager") {
    return "Manager";
  }

  return "Employee";
}

function labelToRole(
  role: RoleLabel
): UserRole {
  if (role === "Admin") {
    return "admin";
  }

  if (role === "Manager") {
    return "manager";
  }

  return "employee";
}

function statusToLabel(
  status: UserStatus
): StatusLabel {
  if (status === "active") {
    return "Active";
  }

  if (status === "suspended") {
    return "Suspended";
  }

  return "Pending";
}

function labelToStatus(
  status: StatusLabel
): UserStatus {
  if (status === "Active") {
    return "active";
  }

  if (status === "Suspended") {
    return "suspended";
  }

  return "pending";
}

function getInitials(
  name: string
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getInitialBg(
  name: string
): string {
  const colors = [
    "#2563EB",
    "#7C3AED",
    "#0891B2",
    "#059669",
    "#D97706",
    "#DC2626",
  ];

  const firstCharacter =
    name.charCodeAt(0) || 0;

  return colors[
    firstCharacter % colors.length
  ];
}

function formatDate(
  value: string
): string {
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
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function UserManagement() {
  const navigate =
    useNavigate();

  const {
    logout,
    session,
  } = useAuth();

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [
    users,
    setUsers,
  ] = useState<ApiUser[]>([]);

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     TABLE STATE
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filterOpen,
    setFilterOpen,
  ] = useState(false);

  const [
    filterRole,
    setFilterRole,
  ] = useState<
    RoleLabel | ""
  >("");

  const [
    filterStatus,
    setFilterStatus,
  ] = useState<
    StatusLabel | ""
  >("");

  const [
    sortCol,
    setSortCol,
  ] = useState("name");

  const [
    sortDir,
    setSortDir,
  ] = useState<
    "asc" | "desc"
  >("asc");

  const [
    page,
    setPage,
  ] = useState(1);

  /* =======================================================
     CREATE USER STATE
  ======================================================= */

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveDone,
    setSaveDone,
  ] = useState(false);

  const [
    createError,
    setCreateError,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [
    form,
    setForm,
  ] = useState({
    fullName: "",
    email: "",
    password: "",
    role:
      "Employee" as RoleLabel,
    departmentId: "",
  });

  const [
    formErrors,
    setFormErrors,
  ] = useState<
    Record<string, string>
  >({});

  /* =======================================================
     EDIT USER STATE
  ======================================================= */

  const [
    editUser,
    setEditUser,
  ] =
    useState<DisplayUser | null>(
      null
    );

    const [
      editForm,
      setEditForm,
    ] = useState({
      fullName: "",
      role:
        "Employee" as RoleLabel,
      status:
        "Active" as StatusLabel,
      departmentId: "",
      managerId: "",
    });

  const [
    editError,
    setEditError,
  ] = useState("");

  const [
    deletingUserId,
    setDeletingUserId,
  ] = useState<string | null>(null);

  async function handleDeleteUser(user: DisplayUser) {
    if (!session?.access_token) return;

    const confirmed = window.confirm(
      `Delete ${user.name} (${user.email})? This removes the EKIP account and its authentication account. Existing uploaded documents will be reassigned to the current admin.`
    );
    if (!confirmed) return;

    try {
      setDeletingUserId(user.id);
      setError("");
      const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to delete user");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  }

  /* =======================================================
     AUTH
  ======================================================= */

  async function handleLogout() {
    await logout();

    navigate("/", {
      replace: true,
    });
  }

  /* =======================================================
     LOAD USERS
  ======================================================= */

  async function loadUsers() {
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
          `${API_URL}/api/admin/users`,
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load users"
        );
      }

      setUsers(
        Array.isArray(
          data.users
        )
          ? data.users
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     LOAD DEPARTMENTS
  ======================================================= */

  async function loadDepartments() {
    if (
      !session?.access_token
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/departments`,
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const data: DepartmentResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "Failed to load departments"
        );
      }

      setDepartments(
        Array.isArray(
          data.departments
        )
          ? data.departments
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load departments:",
        err
      );
    }
  }

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      !session?.access_token
    ) {
      return;
    }

    loadUsers();
    loadDepartments();
  }, [session?.access_token]);

  /* =======================================================
     DISPLAY USERS
  ======================================================= */

  const displayUsers =
    useMemo<DisplayUser[]>(
      () => {
        return users.map(
          (user) => ({
            id: user.id,

            name:
              user.fullName,

            email:
              user.email,

            avatar:
              getInitials(
                user.fullName
              ),

            role:
              roleToLabel(
                user.role
              ),

            status:
              statusToLabel(
                user.status
              ),

            department:
              user.role === "admin"
                ? "Organization-wide"
                : user.department
                    ?.name ||
                  "Unassigned",

            memberSince:
              formatDate(
                user.createdAt
              ),
          })
        );
      },
      [users]
    );

  /* =======================================================
     FILTER / SORT
  ======================================================= */

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return [
        ...displayUsers,
      ]
        .filter(
          (user) => {
            if (
              query &&
              !user.name
                .toLowerCase()
                .includes(
                  query
                ) &&
              !user.email
                .toLowerCase()
                .includes(
                  query
                ) &&
              !user.department
                .toLowerCase()
                .includes(
                  query
                )
            ) {
              return false;
            }

            if (
              filterRole &&
              user.role !==
                filterRole
            ) {
              return false;
            }

            if (
              filterStatus &&
              user.status !==
                filterStatus
            ) {
              return false;
            }

            return true;
          }
        )
        .sort(
          (a, b) => {
            const direction =
              sortDir ===
              "asc"
                ? 1
                : -1;

            if (
              sortCol ===
              "name"
            ) {
              return (
                direction *
                a.name.localeCompare(
                  b.name
                )
              );
            }

            if (
              sortCol ===
              "email"
            ) {
              return (
                direction *
                a.email.localeCompare(
                  b.email
                )
              );
            }

            if (
              sortCol ===
              "role"
            ) {
              return (
                direction *
                a.role.localeCompare(
                  b.role
                )
              );
            }

            if (
              sortCol ===
              "department"
            ) {
              return (
                direction *
                a.department.localeCompare(
                  b.department
                )
              );
            }

            if (
              sortCol ===
              "status"
            ) {
              return (
                direction *
                a.status.localeCompare(
                  b.status
                )
              );
            }

            return 0;
          }
        );
    }, [
      displayUsers,
      search,
      filterRole,
      filterStatus,
      sortCol,
      sortDir,
    ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          PAGE_SIZE
      )
    );

  const paginated =
    filtered.slice(
      (page - 1) *
        PAGE_SIZE,
      page * PAGE_SIZE
    );

  /* =======================================================
     KPI DATA
  ======================================================= */

  const activeUsers =
    displayUsers.filter(
      (user) =>
        user.status ===
        "Active"
    ).length;

  const managers =
    displayUsers.filter(
      (user) =>
        user.role ===
        "Manager"
    ).length;

  const admins =
    displayUsers.filter(
      (user) =>
        user.role ===
        "Admin"
    ).length;

  const suspendedUsers =
    displayUsers.filter(
      (user) =>
        user.status ===
        "Suspended"
    ).length;

  /* =======================================================
     SORT
  ======================================================= */

  function toggleSort(
    column: string
  ) {
    if (
      sortCol === column
    ) {
      setSortDir(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortCol(column);
      setSortDir("asc");
    }

    setPage(1);
  }

  /* =======================================================
     CREATE USER
  ======================================================= */

  function openCreate() {
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "Employee",
      departmentId: "",
    });
    setFormErrors({});
    setCreateError("");
    setShowPassword(false);
    setSaveDone(false);
    setCreateOpen(true);
  }

  function validateCreateForm() {
    const errors: Record<
      string,
      string
    > = {};

    if (
      !form.fullName.trim()
    ) {
      errors.fullName =
        "Full name is required";
    }

    if (
      !form.email.trim()
    ) {
      errors.email =
        "Email is required";
    } else if (
      !/\S+@\S+\.\S+/.test(
        form.email
      )
    ) {
      errors.email =
        "Enter a valid email";
    }

    if (!form.password) {
      errors.password =
        "Password is required";
    } else if (
      form.password.length <
      8
    ) {
      errors.password =
        "Password must contain at least 8 characters";
    }

    return errors;
  }

  async function handleCreateUser(
    event?: FormEvent
  ) {
    event?.preventDefault();

    const errors =
      validateCreateForm();

    if (
      Object.keys(
        errors
      ).length > 0
    ) {
      setFormErrors(
        errors
      );
      return;
    }

    if (
      !session?.access_token
    ) {
      setCreateError(
        "Your session is unavailable. Please sign in again."
      );
      return;
    }

    try {
      setSaving(true);
      setCreateError("");
      setSaveDone(false);

      const response =
        await fetch(
          `${API_URL}/api/admin/users`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
  JSON.stringify(
    {
      fullName:
        form.fullName.trim(),

      email:
        form.email
          .trim()
          .toLowerCase(),

      password:
        form.password,

      role:
        labelToRole(
          form.role
        ),

      departmentId:
        form.role === "Admin"
          ? null
          : form.departmentId || null,
    }
  ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create user"
        );
      }

      setSaveDone(true);

      await loadUsers();

      window.setTimeout(
        () => {
          setCreateOpen(
            false
          );

          setSaveDone(
            false
          );
        },
        600
      );
    } catch (err) {
      console.error(
        "Create user failed:",
        err
      );

      setCreateError(
        err instanceof Error
          ? err.message
          : "Failed to create user"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     EDIT USER
  ======================================================= */

  function openEditUser(
    user: DisplayUser
  ) {
    const apiUser =
      users.find(
        (item) =>
          item.id === user.id
      );

    setEditUser(user);

    setEditForm({
      fullName:
        user.name,
    
      role:
        user.role,
    
      status:
        user.status,
    
      departmentId:
        apiUser
          ?.departmentId ||
        "",
    
      managerId:
        apiUser
          ?.managerId ||
        "",
    });

    setEditError("");
  }

  async function handleUpdateUser() {
    if (!editUser) {
      return;
    }

    if (
      !session?.access_token
    ) {
      setEditError(
        "Your session is unavailable. Please sign in again."
      );
      return;
    }

    if (
      !editForm.fullName.trim()
    ) {
      setEditError(
        "Full name is required"
      );
      return;
    }

    try {
      setSaving(true);
      setEditError("");
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/admin/users/${editUser.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify(
                {
                  fullName:
                    editForm.fullName.trim(),

                  role:
                    labelToRole(
                      editForm.role
                    ),

                  status:
                    labelToStatus(
                      editForm.status
                    ),

                  departmentId:
                    editForm.role === "Admin"
                      ? null
                      : editForm.departmentId || null,

                  managerId:
                    editForm.role === "Employee"
                      ? editForm.managerId || null
                      : null,
                }
              ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update user"
        );
      }

      await loadUsers();

      setEditUser(null);
    } catch (err) {
      console.error(
        "Update user failed:",
        err
      );

      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     TABLE HEADER
  ======================================================= */

  const colHeader = (
    column: string,
    label: string
  ) => (
    <th
      className="px-4 py-3 text-left cursor-pointer select-none"
      onClick={() =>
        toggleSort(column)
      }
    >
      <span
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
        style={{
          color:
            "#3D5A78",
        }}
      >
        {label}

        <span
          style={{
            opacity:
              sortCol ===
              column
                ? 1
                : 0.3,
          }}
        >
          {sortCol !==
            column ||
          sortDir ===
            "asc"
            ? "↑"
            : "↓"}
        </span>
      </span>
    </th>
  );

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
          "'Plus Jakarta Sans',Inter,sans-serif",
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
            TOP BAR
        ================================================= */}

        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            background:
              "rgba(8,15,28,0.96)",

            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              User Management
            </h1>

            <p
              className="text-xs mt-0.5"
              style={{
                color:
                  "#3D5A78",
              }}
            >
              {
                displayUsers.length
              }{" "}
              total users ·{" "}
              {activeUsers}{" "}
              active
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{
                  color:
                    "#3D5A78",
                }}
              />

              <input
                value={
                  search
                }
                onChange={(
                  event
                ) => {
                  setSearch(
                    event
                      .target
                      .value
                  );

                  setPage(1);
                }}
                placeholder="Search users..."
                className="pl-9 pr-3 py-2 text-xs rounded-lg outline-none"
                style={{
                  background:
                    "#111D30",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  color:
                    "#E8EFF8",

                  width: 200,
                }}
              />
            </div>

            {/* Filter */}

            <div className="relative">
              <button
                onClick={() =>
                  setFilterOpen(
                    (
                      current
                    ) =>
                      !current
                  )
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
                <Filter className="w-3.5 h-3.5" />

                Filter

                <ChevronDown className="w-3 h-3" />
              </button>

              {filterOpen && (
                <div
                  className="absolute right-0 top-10 z-50 p-4 rounded-xl shadow-2xl"
                  style={{
                    background:
                      "#111D30",

                    border:
                      "1px solid rgba(255,255,255,0.1)",

                    minWidth:
                      280,
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Role
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <button
                      onClick={() => { setFilterRole(""); setPage(1); }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ background: filterRole === "" ? "rgba(37,99,235,0.20)" : "rgba(255,255,255,0.05)", color: filterRole === "" ? "#60A5FA" : "#6B7280", border: filterRole === "" ? "1px solid rgba(37,99,235,0.3)" : "1px solid transparent" }}
                    >
                      All
                    </button>
                    {ROLES.map(
                      (role) => (
                        <button
                          key={
                            role
                          }
                          onClick={() => {
                            setFilterRole(
                              filterRole ===
                                role
                                ? ""
                                : role
                            );

                            setPage(
                              1
                            );
                          }}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            background:
                              filterRole ===
                              role
                                ? ROLE_COLORS[
                                    role
                                  ].bg
                                : "rgba(255,255,255,0.05)",

                            color:
                              filterRole ===
                              role
                                ? ROLE_COLORS[
                                    role
                                  ].text
                                : "#6B7280",

                            border: `1px solid ${
                              filterRole ===
                              role
                                ? ROLE_COLORS[
                                    role
                                  ].border
                                : "transparent"
                            }`,
                          }}
                        >
                          {
                            role
                          }
                        </button>
                      )
                    )}
                  </div>

                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-3"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Status
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => { setFilterStatus(""); setPage(1); }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ background: filterStatus === "" ? "rgba(37,99,235,0.20)" : "rgba(255,255,255,0.05)", color: filterStatus === "" ? "#60A5FA" : "#6B7280" }}
                    >
                      All
                    </button>
                    {STATUSES.map(
                      (
                        status
                      ) => (
                        <button
                          key={
                            status
                          }
                          onClick={() => {
                            setFilterStatus(
                              filterStatus ===
                                status
                                ? ""
                                : status
                            );

                            setPage(
                              1
                            );
                          }}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            background:
                              filterStatus ===
                              status
                                ? STATUS_COLORS[
                                    status
                                  ].bg
                                : "rgba(255,255,255,0.05)",

                            color:
                              filterStatus ===
                              status
                                ? STATUS_COLORS[
                                    status
                                  ].text
                                : "#6B7280",
                          }}
                        >
                          {
                            status
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh */}

            <button
              onClick={async () => {
                await Promise.all([
                  loadUsers(),
                  loadDepartments(),
                ]);
              }}
              disabled={
                loading
              }
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
              style={{
                background:
                  "#111D30",

                border:
                  "1px solid rgba(255,255,255,0.08)",

                color:
                  "#E8EFF8",
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            {/* Create User */}

            <button
              onClick={
                openCreate
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{
                background:
                  "#2563EB",
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />

              Create User
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="flex-1 overflow-y-auto p-6">
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

          {/* KPI */}

          <div className="grid grid-cols-5 gap-3 mb-5">
            {[
              {
                label:
                  "Total Users",

                value:
                  displayUsers.length,

                color:
                  "#2563EB",
              },

              {
                label:
                  "Active",

                value:
                  activeUsers,

                color:
                  "#22C55E",
              },

              {
                label:
                  "Managers",

                value:
                  managers,

                color:
                  "#8B5CF6",
              },

              {
                label:
                  "Admins",

                value:
                  admins,

                color:
                  "#F59E0B",
              },

              {
                label:
                  "Suspended",

                value:
                  suspendedUsers,

                color:
                  "#EF4444",
              },
            ].map(
              (kpi) => (
                <div
                  key={
                    kpi.label
                  }
                  className="rounded-xl p-4"
                  style={{
                    background:
                      "#111D30",

                    borderLeft: `3px solid ${kpi.color}`,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    {
                      kpi.label
                    }
                  </p>

                  <p
                    className="text-2xl font-bold"
                    style={{
                      color:
                        kpi.color,
                    }}
                  >
                    {
                      kpi.value
                    }
                  </p>
                </div>
              )
            )}
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {colHeader(
                    "name",
                    "User"
                  )}

                  {colHeader(
                    "email",
                    "Email"
                  )}

                  {colHeader(
                    "role",
                    "Role"
                  )}

                  {colHeader(
                    "department",
                    "Department"
                  )}

                  {colHeader(
                    "status",
                    "Status"
                  )}

                  <th className="px-4 py-3 text-left">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        color:
                          "#3D5A78",
                      }}
                    >
                      Member Since
                    </span>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        color:
                          "#3D5A78",
                      }}
                    >
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                      className="py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />

                        <p
                          className="text-xs"
                          style={{
                            color:
                              "#6B7280",
                          }}
                        >
                          Loading
                          users...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={
                        7
                      }
                      className="py-16 text-center"
                    >
                      <Users
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
                        No users
                        found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginated.map(
                    (
                      user,
                      index
                    ) => (
                      <tr
                        key={
                          user.id
                        }
                        style={{
                          borderBottom:
                            index <
                            paginated.length -
                              1
                              ? "1px solid rgba(255,255,255,0.04)"
                              : undefined,
                        }}
                      >
                        {/* USER */}

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                                style={{
                                  background:
                                    getInitialBg(
                                      user.name
                                    ),
                                }}
                              >
                                {
                                  user.avatar
                                }
                              </div>

                              <div
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                style={{
                                  borderColor:
                                    "#111D30",

                                  background:
                                    STATUS_COLORS[
                                      user
                                        .status
                                    ]
                                      .dot,
                                }}
                              />
                            </div>

                            <span
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  "#E8EFF8",
                              }}
                            >
                              {
                                user.name
                              }
                            </span>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td className="px-4 py-3.5">
                          <span
                            className="text-xs font-mono"
                            style={{
                              color:
                                "#6B7280",
                            }}
                          >
                            {
                              user.email
                            }
                          </span>
                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-3.5">
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                            style={{
                              background:
                                ROLE_COLORS[
                                  user
                                    .role
                                ].bg,

                              color:
                                ROLE_COLORS[
                                  user
                                    .role
                                ].text,

                              border: `1px solid ${
                                ROLE_COLORS[
                                  user
                                    .role
                                ]
                                  .border
                              }`,
                            }}
                          >
                            {
                              user.role
                            }
                          </span>
                        </td>


                        {/* DEPARTMENT */}

                        <td className="px-4 py-3.5">
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                            style={{
                              background:
                                "rgba(255,255,255,0.05)",

                              color:
                                user.department ===
                                "Unassigned"
                                  ? "#6B7280"
                                  : "#9CA3AF",

                              border:
                                "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {
                              user.department
                            }
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background:
                                  STATUS_COLORS[
                                    user
                                      .status
                                  ].dot,
                              }}
                            />

                            <span
                              className="text-xs font-medium"
                              style={{
                                color:
                                  STATUS_COLORS[
                                    user
                                      .status
                                  ].text,
                              }}
                            >
                              {
                                user.status
                              }
                            </span>
                          </div>
                        </td>

                        {/* MEMBER SINCE */}

                        <td className="px-4 py-3.5">
                          <span
                            className="text-xs"
                            style={{
                              color:
                                "#6B7280",
                            }}
                          >
                            {
                              user.memberSince
                            }
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditUser(user)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{ background: "rgba(37,99,235,0.12)", color: "#60A5FA", border: "1px solid rgba(37,99,235,0.25)" }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDeleteUser(user)}
                              disabled={deletingUserId === user.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.10)", color: "#F87171", border: "1px solid rgba(239,68,68,0.22)" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingUserId === user.id ? "Deleting" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {!loading &&
            filtered.length >
              0 && (
              <div className="flex items-center justify-between mt-4">
                <span
                  className="text-xs"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Showing{" "}
                  {Math.min(
                    (page -
                      1) *
                      PAGE_SIZE +
                      1,
                    filtered.length
                  )}
                  –
                  {Math.min(
                    page *
                      PAGE_SIZE,
                    filtered.length
                  )}{" "}
                  of{" "}
                  {
                    filtered.length
                  }
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          Math.max(
                            1,
                            current -
                              1
                          )
                      )
                    }
                    disabled={
                      page ===
                      1
                    }
                    className="p-1.5 rounded-lg disabled:opacity-30"
                    style={{
                      background:
                        "#111D30",

                      color:
                        "#E8EFF8",
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (
                      _,
                      index
                    ) =>
                      index + 1
                  ).map(
                    (
                      pageNumber
                    ) => (
                      <button
                        key={
                          pageNumber
                        }
                        onClick={() =>
                          setPage(
                            pageNumber
                          )
                        }
                        className="w-8 h-8 rounded-lg text-xs font-semibold"
                        style={{
                          background:
                            pageNumber ===
                            page
                              ? "#2563EB"
                              : "#111D30",

                          color:
                            pageNumber ===
                            page
                              ? "#FFFFFF"
                              : "#6B7280",
                        }}
                      >
                        {
                          pageNumber
                        }
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setPage(
                        (
                          current
                        ) =>
                          Math.min(
                            totalPages,
                            current +
                              1
                          )
                      )
                    }
                    disabled={
                      page ===
                      totalPages
                    }
                    className="p-1.5 rounded-lg disabled:opacity-30"
                    style={{
                      background:
                        "#111D30",

                      color:
                        "#E8EFF8",
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* =====================================================
          CREATE USER MODAL
      ===================================================== */}

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background:
              "rgba(0,0,0,0.7)",
          }}
        >
          <form
            onSubmit={
              handleCreateUser
            }
            className="w-[540px] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                borderBottom:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <h2 className="text-base font-bold text-white">
                  Create User
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "#6B7280",
                  }}
                >
                  Create a
                  new EKIP
                  account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCreateOpen(
                    false
                  )
                }
                style={{
                  color:
                    "#3D5A78",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {createError && (
                <div
                  className="mb-4 px-3 py-2.5 rounded-lg text-xs"
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
                    createError
                  }
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}

                <div>
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    value={
                      form.fullName
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          fullName:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",

                      border: `1px solid ${
                        formErrors.fullName
                          ? "#EF4444"
                          : "rgba(255,255,255,0.08)"
                      }`,

                      color:
                        "#E8EFF8",
                    }}
                  />

                  {formErrors.fullName && (
                    <p
                      className="text-[10px] mt-1"
                      style={{
                        color:
                          "#EF4444",
                      }}
                    >
                      {
                        formErrors.fullName
                      }
                    </p>
                  )}
                </div>

                {/* Email */}

                <div>
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          email:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",

                      border: `1px solid ${
                        formErrors.email
                          ? "#EF4444"
                          : "rgba(255,255,255,0.08)"
                      }`,

                      color:
                        "#E8EFF8",
                    }}
                  />

                  {formErrors.email && (
                    <p
                      className="text-[10px] mt-1"
                      style={{
                        color:
                          "#EF4444",
                      }}
                    >
                      {
                        formErrors.email
                      }
                    </p>
                  )}
                </div>

                {/* Role */}

                <div>
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Role
                  </label>

                  <select
                    value={
                      form.role
                    }
                    onChange={(event) => {
                      const nextRole =
                        event.target.value as RoleLabel;

                      setForm((current) => ({
                        ...current,
                        role: nextRole,
                        departmentId:
                          nextRole === "Admin"
                            ? ""
                            : current.departmentId,
                      }));
                    }}
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none"
                    style={{
                      background:
                        "rgba(255,255,255,0.04)",

                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      color:
                        "#E8EFF8",
                    }}
                  >
                    {ROLES.map(
                      (role) => (
                        <option
                          key={
                            role
                          }
                          value={
                            role
                          }
                        >
                          {
                            role
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

              {/* Department */}

              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{
                    color: "#3D5A78",
                  }}
                >
                  Department
                </label>

                {form.role === "Admin" ? (
                  <div
                    className="w-full px-3 py-2.5 text-sm rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#9CA3AF",
                    }}
                  >
                    Organization-wide
                  </div>
                ) : (
                  <select
                    value={form.departmentId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        departmentId: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#E8EFF8",
                    }}
                  >
                    <option value="">Unassigned</option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
                {/* Password */}

                <div>
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        form.password
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            current
                          ) => ({
                            ...current,

                            password:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className="w-full px-3 py-2.5 pr-20 text-sm rounded-lg outline-none"
                      style={{
                        background:
                          "rgba(255,255,255,0.04)",

                        border: `1px solid ${
                          formErrors.password
                            ? "#EF4444"
                            : "rgba(255,255,255,0.08)"
                        }`,

                        color:
                          "#E8EFF8",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{
                        color:
                          "#60A5FA",
                      }}
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  {formErrors.password && (
                    <p
                      className="text-[10px] mt-1"
                      style={{
                        color:
                          "#EF4444",
                      }}
                    >
                      {
                        formErrors.password
                      }
                    </p>
                  )}
                </div>

                {/* Permissions */}

                <div
                  className="rounded-xl p-3"
                  style={{
                    background:
                      "rgba(255,255,255,0.03)",

                    border:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{
                      color:
                        "#3D5A78",
                    }}
                  >
                    Permissions
                    for{" "}
                    {form.role}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_PERMISSIONS[
                      form.role
                    ].map(
                      (
                        permission
                      ) => (
                        <span
                          key={
                            permission
                          }
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background:
                              ROLE_COLORS[
                                form
                                  .role
                              ].bg,

                            color:
                              ROLE_COLORS[
                                form
                                  .role
                              ].text,
                          }}
                        >
                          {
                            permission
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Create footer */}

            <div
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{
                borderTop:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setCreateOpen(
                    false
                  )
                }
                disabled={
                  saving
                }
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{
                  background:
                    "rgba(255,255,255,0.06)",

                  color:
                    "#E8EFF8",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving
                }
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white min-w-[125px] justify-center disabled:opacity-70"
                style={{
                  background:
                    saveDone
                      ? "#22C55E"
                      : "#2563EB",
                }}
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveDone ? (
                  <>
                    <Check className="w-4 h-4" />

                    Created
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />

                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}

      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background:
              "rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="w-[520px] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background:
                "#111D30",

              border:
                "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Header */}

            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                borderBottom:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <h2 className="text-base font-bold text-white">
                  Edit User
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      "#6B7280",
                  }}
                >
                  Update
                  user details,
                  role, status
                  and
                  department.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditUser(
                    null
                  )
                }
                style={{
                  color:
                    "#3D5A78",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}

            <div className="p-6 space-y-4">
              {editError && (
                <div
                  className="px-3 py-2.5 rounded-lg text-xs"
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
                    editError
                  }
                </div>
              )}

              {/* Name */}

              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Full Name
                </label>

                <input
                  value={
                    editForm.fullName
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm(
                      (
                        current
                      ) => ({
                        ...current,

                        fullName:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    color:
                      "#E8EFF8",
                  }}
                />
              </div>

              {/* Email read only */}

              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Email
                </label>

                <input
                  value={
                    editUser.email
                  }
                  disabled
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none opacity-60"
                  style={{
                    background:
                      "rgba(255,255,255,0.025)",

                    border:
                      "1px solid rgba(255,255,255,0.06)",

                    color:
                      "#9CA3AF",
                  }}
                />
              </div>

              {/* Role */}

              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Role
                </label>

                <select
                  value={
                    editForm.role
                  }
                  onChange={(event) => {
                    const nextRole =
                      event.target.value as RoleLabel;

                    setEditForm((current) => ({
                      ...current,
                      role: nextRole,
                      departmentId:
                        nextRole === "Admin"
                          ? ""
                          : current.departmentId,
                      managerId:
                        nextRole === "Employee"
                          ? current.managerId
                          : "",
                    }));
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none"
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    color:
                      "#E8EFF8",
                  }}
                >
                  {ROLES.map(
                    (role) => (
                      <option
                        key={
                          role
                        }
                        value={
                          role
                        }
                      >
                        {
                          role
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Status */}

              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Status
                </label>

                <select
                  value={
                    editForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm(
                      (
                        current
                      ) => ({
                        ...current,

                        status:
                          event
                            .target
                            .value as StatusLabel,
                      })
                    )
                  }
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none"
                  style={{
                    background:
                      "rgba(255,255,255,0.04)",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    color:
                      "#E8EFF8",
                  }}
                >
                  {STATUSES.map(
                    (
                      status
                    ) => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          status
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Department */}

              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{
                    color: "#3D5A78",
                  }}
                >
                  Department
                </label>

                {editForm.role === "Admin" ? (
                  <div
                    className="w-full px-3 py-2.5 text-sm rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#9CA3AF",
                    }}
                  >
                    Organization-wide
                  </div>
                ) : (
                  <select
                    value={editForm.departmentId}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        departmentId: event.target.value,
                        managerId: "",
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#E8EFF8",
                    }}
                  >
                    <option value="">Unassigned</option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                )}

                {editForm.role !== "Admin" &&
                  departments.length === 0 && (
                    <p
                      className="text-[10px] mt-1.5"
                      style={{ color: "#6B7280" }}
                    >
                      No departments have been created yet.
                    </p>
                  )}
              </div>
              {/* Manager */}

{editForm.role === "Employee" && (
  <div>
    <label
      className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block"
      style={{
        color: "#3D5A78",
      }}
    >
      Manager
    </label>

    <select
      value={editForm.managerId}
      onChange={(event) =>
        setEditForm((current) => ({
          ...current,
          managerId: event.target.value,
        }))
      }
      className="w-full px-3 py-2.5 text-sm rounded-lg outline-none appearance-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        border:
          "1px solid rgba(255,255,255,0.08)",
        color: "#E8EFF8",
      }}
    >
      <option value="">
        Unassigned
      </option>

      {users
        .filter(
          (user) =>
            user.role === "manager" &&
            Boolean(editForm.departmentId) &&
            user.departmentId ===
              editForm.departmentId
        )
        .map((manager) => (
          <option
            key={manager.id}
            value={manager.id}
          >
            {manager.fullName}
          </option>
        ))}
    </select>
  </div>
)}

              {/* Permission preview */}

              <div
                className="rounded-xl p-3"
                style={{
                  background:
                    "rgba(255,255,255,0.03)",

                  border:
                    "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{
                    color:
                      "#3D5A78",
                  }}
                >
                  Permissions
                  for{" "}
                  {
                    editForm.role
                  }
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PERMISSIONS[
                    editForm
                      .role
                  ].map(
                    (
                      permission
                    ) => (
                      <span
                        key={
                          permission
                        }
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          background:
                            ROLE_COLORS[
                              editForm
                                .role
                            ].bg,

                          color:
                            ROLE_COLORS[
                              editForm
                                .role
                            ].text,
                        }}
                      >
                        {
                          permission
                        }
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}

            <div
              className="flex items-center justify-end gap-3 px-6 py-4"
              style={{
                borderTop:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setEditUser(
                    null
                  )
                }
                disabled={
                  saving
                }
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{
                  background:
                    "rgba(255,255,255,0.06)",

                  color:
                    "#E8EFF8",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleUpdateUser
                }
                disabled={
                  saving
                }
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white min-w-[130px] justify-center disabled:opacity-70"
                style={{
                  background:
                    "#2563EB",
                }}
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />

                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}