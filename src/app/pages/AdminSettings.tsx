import {
  BarChart2,
  Brain,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  UserCircle,
  Users,
} from "lucide-react";
import AccountSettingsPage from "../components/AccountSettingsPage";

const NAV = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/departments", label: "Departments", icon: Building2 },
  { path: "/documents", label: "Document Management", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/audit", label: "Audit Logs", icon: ClipboardList },
  { path: "/ai-monitoring", label: "AI Monitoring", icon: Brain },
  { path: "/admin-profile", label: "Profile", icon: UserCircle },
];

export default function AdminSettings() {
  return (
    <AccountSettingsPage
      title="Admin Settings"
      subtitle="Admin"
      profilePath="/admin-profile"
      settingsPath="/admin-settings"
      nav={NAV}
      accent="#EF4444"
    />
  );
}
