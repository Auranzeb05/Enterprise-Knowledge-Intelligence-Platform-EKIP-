import { createBrowserRouter } from "react-router";
import LoginPage from "./pages/LoginPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeSettings from "./pages/EmployeeSettings";
import AIChatPage from "./pages/AIChatPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import DocumentManagement from "./pages/DocumentManagement";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerProfile from "./pages/ManagerProfile";
import ManagerSettings from "./pages/ManagerSettings";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import AdminSettings from "./pages/AdminSettings";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
import AIMonitoring from "./pages/AIMonitoring";

export const router = createBrowserRouter([
  { path: "/",              Component: LoginPage },
  { path: "/dashboard",     Component: EmployeeDashboard },
  { path: "/profile",       Component: EmployeeProfile },
  { path: "/settings",      Component: EmployeeSettings },
  { path: "/ai-chat",       Component: AIChatPage },
  { path: "/knowledge",     Component: KnowledgeBasePage },
  { path: "/documents",     Component: DocumentManagement },
  { path: "/manager",       Component: ManagerDashboard },
  { path: "/manager-profile", Component: ManagerProfile },
  { path: "/manager-settings", Component: ManagerSettings },
  { path: "/analytics",     Component: AnalyticsDashboard },
  { path: "/admin",         Component: AdminDashboard },
  { path: "/admin-profile", Component: AdminProfile },
  { path: "/admin-settings",Component: AdminSettings },
  { path: "/users",         Component: UserManagement },
  { path: "/audit",         Component: AuditLogs },
  { path: "/ai-monitoring", Component: AIMonitoring },
  { path: "*",              Component: LoginPage },
]);
