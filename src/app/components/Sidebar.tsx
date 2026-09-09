import { useState, type ComponentType, type ReactNode } from "react";
import { NavLink } from "react-router";
import {
  BarChart2,
  BookOpen,
  Brain,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface SidebarNavItem {
  path: string;
  label: string;
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  badge?: number;
}

interface SidebarProps {
  items?: SidebarNavItem[];
  subtitle?: string;
  subtitleColor?: string;
  badge?: ReactNode;
  children?: ReactNode;
  onLogout?: () => void;
  settingsPath?: string;
}

const MANAGER_NAV: SidebarNavItem[] = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

const ADMIN_NAV: SidebarNavItem[] = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/departments", label: "Departments", icon: Building2 },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

export function EKIPSidebar({
  items = [],
  subtitle = "Intelligence",
  subtitleColor = "#60A5FA40",
  badge,
  children,
  onLogout,
  settingsPath,
}: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ekip-sidebar-collapsed") === "true";
  });

  const toggleDesktopSidebar = () => {
    setDesktopCollapsed((previous) => {
      const next = !previous;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "ekip-sidebar-collapsed",
          String(next)
        );
      }

      return next;
    });
  };

  const navItems = isAdmin
    ? ADMIN_NAV
    : isManager
      ? MANAGER_NAV
      : items;

  const managerDepartment = user?.department?.name?.trim() || "Department";

  const effectiveSubtitle = isAdmin
    ? "Admin"
    : isManager
      ? `${managerDepartment} Manager`
      : user?.role === "employee"
        ? "Employee"
        : subtitle;

  const effectiveSettingsPath = isAdmin
    ? "/admin-settings"
    : isManager
      ? "/manager-settings"
      : settingsPath || "/settings";

  return (
    <aside
      className={`sticky top-0 self-start flex h-[100dvh] max-h-[100dvh] w-[64px] flex-shrink-0 flex-col overflow-hidden transition-[width] duration-200 ${
        desktopCollapsed ? "xl:w-[64px]" : "xl:w-[208px]"
      }`}
      style={{
        background: "#0A1220",
        borderRight: "1px solid rgba(255,255,255,0.065)",
      }}
    >
      <div
        className={`relative flex items-center justify-center gap-3 px-2 py-[18px] ${
          desktopCollapsed
            ? "xl:justify-center xl:px-2"
            : "xl:justify-start xl:px-4 xl:pr-10"
        }`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
            boxShadow:
              "0 0 0 1px rgba(96,165,250,0.18),0 4px 12px rgba(37,99,235,0.32)",
          }}
        >
          <Brain className="h-4 w-4 text-white" strokeWidth={1.9} />
        </div>

        {!desktopCollapsed && (
          <div className="hidden xl:block min-w-0">
            <p className="text-sm font-extrabold leading-none tracking-tight text-white">
              EKIP
            </p>
            <p
              className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.14em]"
              title={effectiveSubtitle}
              style={{
                color: isAdmin
                  ? "#60A5FA"
                  : isManager
                    ? "#A78BFA"
                    : subtitleColor,
              }}
            >
              {effectiveSubtitle}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className={`hidden h-7 w-7 items-center justify-center rounded-lg xl:flex ${
            desktopCollapsed
              ? "absolute left-1/2 top-[62px] -translate-x-1/2"
              : "absolute right-2 top-1/2 -translate-y-1/2"
          }`}
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(15,23,42,0.78)",
            color: "#94A3B8",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
          aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {desktopCollapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={1.9} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
          )}
        </button>
      </div>

      {badge && !isAdmin && !isManager && !desktopCollapsed && (
        <div className="hidden xl:block mx-3 mt-3">{badge}</div>
      )}

      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 xl:px-2.5 py-3">
        {!desktopCollapsed && (
          <div className="hidden xl:block mb-2 px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
            Workspace
          </div>
        )}

        <div className="flex flex-col gap-1">
          {navItems.map(({ path, label, icon: Icon, badge: itemBadge }) => (
            <NavLink key={path} to={path} end>
              {({ isActive }) => (
                <div
                  className={`group relative flex items-center justify-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[11px] font-semibold transition-all duration-150 ${
                    desktopCollapsed ? "xl:justify-center" : "xl:justify-start"
                  }`}
                  style={{
                    background: isActive
                      ? "rgba(37,99,235,0.12)"
                      : "transparent",
                    color: isActive ? "#93C5FD" : "#64748B",
                    boxShadow: isActive
                      ? "inset 0 0 0 1px rgba(96,165,250,0.10)"
                      : "none",
                  }}
                >
                  <span
                    className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full transition-opacity"
                    style={{
                      background: "#3B82F6",
                      opacity: isActive ? 1 : 0,
                    }}
                  />

                  <Icon
                    className="h-4 w-4 flex-shrink-0 transition-colors"
                    strokeWidth={isActive ? 2 : 1.75}
                  />

                  {!desktopCollapsed && (
                    <span
                      className="hidden xl:block min-w-0 flex-1 whitespace-nowrap"
                      title={label}
                    >
                      {label}
                    </span>
                  )}

                  {itemBadge ? (
                    <span
                      className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white"
                      style={{ background: "#EF4444" }}
                    >
                      {itemBadge}
                    </span>
                  ) : null}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {!isAdmin && !isManager && children && !desktopCollapsed ? (
        <div className="hidden xl:block">{children}</div>
      ) : null}

      <div
        className="px-1.5 xl:px-2.5 pb-3 pt-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <NavLink to={effectiveSettingsPath}>
          {({ isActive }) => (
            <div
              className={`flex w-full items-center justify-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[11px] font-semibold transition-all duration-150 ${
                desktopCollapsed ? "xl:justify-center" : "xl:justify-start"
              }`}
              style={{
                color: isActive ? "#93C5FD" : "#64748B",
                background: isActive ? "rgba(37,99,235,0.10)" : "transparent",
              }}
            >
              <Settings
                className="h-4 w-4 flex-shrink-0"
                strokeWidth={isActive ? 2 : 1.75}
              />
              {!desktopCollapsed && <span className="hidden xl:inline">Settings</span>}
            </div>
          )}
        </NavLink>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className={`group flex w-full items-center justify-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 py-2.5 text-[11px] font-semibold text-slate-500 transition-colors hover:text-red-400 ${
              desktopCollapsed ? "xl:justify-center" : "xl:justify-start"
            }`}
            style={{
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <LogOut
              className="h-4 w-4 flex-shrink-0"
              strokeWidth={1.75}
            />
            {!desktopCollapsed && <span className="hidden xl:inline">Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
