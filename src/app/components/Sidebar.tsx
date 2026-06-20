import { NavLink } from "react-router";
import { Brain, Settings, LogOut } from "lucide-react";

export interface SidebarNavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
}

interface SidebarProps {
  items?: SidebarNavItem[];
  subtitle?: string;
  subtitleColor?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  onLogout?: () => void;
  settingsPath?: string;
}

export function EKIPSidebar({ items = [], subtitle = "Intelligence", subtitleColor = "#60A5FA40", badge, children, onLogout, settingsPath = "/admin" }: SidebarProps) {
  return (
    <aside
      className="flex flex-col flex-shrink-0 w-[200px]"
      style={{ background: "#0A1220", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 0 0 1px rgba(96,165,250,0.2),0 4px 12px rgba(37,99,235,0.4)" }}
        >
          <Brain className="w-4 h-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="font-extrabold text-sm text-white leading-none tracking-tight">EKIP</p>
          <p className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: subtitleColor }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Optional badge */}
      {badge && <div className="mx-3 mt-3">{badge}</div>}

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2 pt-4 flex-1">
        {items.map(({ path, label, icon: Icon, badge: itemBadge }) => (
          <NavLink key={label} to={path} end>
            {({ isActive }) => (
              <div
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
                style={{
                  background: isActive ? "linear-gradient(90deg,rgba(37,99,235,0.22),rgba(37,99,235,0.07))" : "transparent",
                  color: isActive ? "#60A5FA" : "#3D5A78",
                  borderLeft: isActive ? "2px solid #2563EB" : "2px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2 : 1.7} />
                <span className="flex-1 truncate">{label}</span>
                {itemBadge ? (
                  <span className="w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white" style={{ background: "#EF4444" }}>
                    {itemBadge}
                  </span>
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                ) : null}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Optional extra content */}
      {children}

      {/* Settings + Logout */}
      <div className="px-2 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <NavLink to={settingsPath}>
          {() => (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold w-full" style={{ color: "#3D5A78" }}>
              <Settings className="w-4 h-4" strokeWidth={1.7} />
              Settings
            </div>
          )}
        </NavLink>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold w-full transition-colors"
            style={{ background: "transparent", border: "none", color: "#3D5A78", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#EF4444"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#3D5A78"; }}
          >
            <LogOut className="w-4 h-4" strokeWidth={1.7} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
