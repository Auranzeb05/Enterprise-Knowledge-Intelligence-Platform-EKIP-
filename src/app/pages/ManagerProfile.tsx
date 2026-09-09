import {
  BarChart2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import AccountProfilePage from "../components/AccountProfilePage";

const NAV = [
  { path: "/manager", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/manager-profile", label: "Profile", icon: UserCircle },
];

export default function ManagerProfile() {
  return (
    <AccountProfilePage
      title="Manager Profile"
      subtitle="Manager"
      settingsPath="/manager-settings"
      nav={NAV}
      accent="#8B5CF6"
    />
  );
}
