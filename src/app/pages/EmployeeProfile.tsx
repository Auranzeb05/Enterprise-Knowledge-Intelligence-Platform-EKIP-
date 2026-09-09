import {
  BookOpen,
  FileText,
  LayoutDashboard,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import AccountProfilePage from "../components/AccountProfilePage";

const NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

export default function EmployeeProfile() {
  return (
    <AccountProfilePage
      title="Employee Profile"
      subtitle="Employee Portal"
      settingsPath="/settings"
      nav={NAV}
      accent="#2563EB"
    />
  );
}
