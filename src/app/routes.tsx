import React, {
  Suspense,
  lazy,
} from "react";

import {
  createBrowserRouter,
} from "react-router";

import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const EmployeeDashboard =
  lazy(
    () =>
      import(
        "./pages/EmployeeDashboard"
      )
  );

const EmployeeProfile =
  lazy(
    () =>
      import(
        "./pages/EmployeeProfile"
      )
  );

const EmployeeSettings =
  lazy(
    () =>
      import(
        "./pages/EmployeeSettings"
      )
  );

const AIChatPage =
  lazy(
    () =>
      import(
        "./pages/AIChatPage"
      )
  );

const KnowledgeBasePage =
  lazy(
    () =>
      import(
        "./pages/KnowledgeBasePage"
      )
  );

const DocumentManagement =
  lazy(
    () =>
      import(
        "./pages/DocumentManagement"
      )
  );

const ManagerDashboard =
  lazy(
    () =>
      import(
        "./pages/ManagerDashboard"
      )
  );

const ManagerProfile =
  lazy(
    () =>
      import(
        "./pages/ManagerProfile"
      )
  );

const ManagerSettings =
  lazy(
    () =>
      import(
        "./pages/ManagerSettings"
      )
  );

const AnalyticsDashboard =
  lazy(
    () =>
      import(
        "./pages/AnalyticsDashboard"
      )
  );

const AdminDashboard =
  lazy(
    () =>
      import(
        "./pages/AdminDashboard"
      )
  );

const AdminProfile =
  lazy(
    () =>
      import(
        "./pages/AdminProfile"
      )
  );

const AdminSettings =
  lazy(
    () =>
      import(
        "./pages/AdminSettings"
      )
  );

const UserManagement =
  lazy(
    () =>
      import(
        "./pages/UserManagement"
      )
  );

const DepartmentManagement =
  lazy(
    () =>
      import(
        "./pages/DepartmentManagement"
      )
  );

const AuditLogs =
  lazy(
    () =>
      import(
        "./pages/AuditLogs"
      )
  );

function RouteLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "#F8FAFC",
      }}
    >
      <div
        className="text-center"
      >
        <div
          className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto"
        />

        <p
          className="mt-4 text-sm font-semibold text-slate-600"
        >
          Loading EKIP workspace…
        </p>

        <p
          className="mt-1 text-xs text-slate-400"
        >
          Preparing your secure workspace
        </p>
      </div>
    </div>
  );
}

function withSuspense(
  element:
    React.ReactNode
) {
  return (
    <Suspense
      fallback={
        <RouteLoading />
      }
    >
      {element}
    </Suspense>
  );
}

function protectedPage(
  element:
    React.ReactNode,
  allowedRoles:
    Array<
      | "employee"
      | "manager"
      | "admin"
    >
) {
  return (
    <ProtectedRoute
      allowedRoles={
        allowedRoles
      }
    >
      {withSuspense(
        element
      )}
    </ProtectedRoute>
  );
}

export const router =
  createBrowserRouter([
    {
      path:
        "/",

      Component:
        LoginPage,
    },

    /*
     * Employee routes
     */
    {
      path:
        "/dashboard",

      element:
        protectedPage(
          <EmployeeDashboard />,
          [
            "employee",
          ]
        ),
    },

    {
      path:
        "/profile",

      element:
        protectedPage(
          <EmployeeProfile />,
          [
            "employee",
          ]
        ),
    },

    {
      path:
        "/settings",

      element:
        protectedPage(
          <EmployeeSettings />,
          [
            "employee",
          ]
        ),
    },

    /*
     * Shared knowledge routes
     */
    {
      path:
        "/knowledge",

      element:
        protectedPage(
          <KnowledgeBasePage />,
          [
            "employee",
            "manager",
            "admin",
          ]
        ),
    },

    {
      path:
        "/ai-chat",

      element:
        protectedPage(
          <AIChatPage />,
          [
            "employee",
            "manager",
            "admin",
          ]
        ),
    },

    {
      path:
        "/documents",

      element:
        protectedPage(
          <DocumentManagement />,
          [
            "employee",
            "manager",
            "admin",
          ]
        ),
    },

    /*
     * Manager routes
     */
    {
      path:
        "/manager",

      element:
        protectedPage(
          <ManagerDashboard />,
          [
            "manager",
          ]
        ),
    },

    {
      path:
        "/manager-profile",

      element:
        protectedPage(
          <ManagerProfile />,
          [
            "manager",
          ]
        ),
    },

    {
      path:
        "/manager-settings",

      element:
        protectedPage(
          <ManagerSettings />,
          [
            "manager",
          ]
        ),
    },

    {
      path:
        "/analytics",

      element:
        protectedPage(
          <AnalyticsDashboard />,
          [
            "manager",
            "admin",
          ]
        ),
    },

    /*
     * Admin routes
     */
    {
      path:
        "/admin",

      element:
        protectedPage(
          <AdminDashboard />,
          [
            "admin",
          ]
        ),
    },

    {
      path:
        "/admin-profile",

      element:
        protectedPage(
          <AdminProfile />,
          [
            "admin",
          ]
        ),
    },

    {
      path:
        "/admin-settings",

      element:
        protectedPage(
          <AdminSettings />,
          [
            "admin",
          ]
        ),
    },

    {
      path:
        "/users",

      element:
        protectedPage(
          <UserManagement />,
          [
            "admin",
          ]
        ),
    },

    {
      path:
        "/departments",

      element:
        protectedPage(
          <DepartmentManagement />,
          [
            "admin",
          ]
        ),
    },

    {
      path:
        "/audit",

      element:
        protectedPage(
          <AuditLogs />,
          [
            "admin",
          ]
        ),
    },

    /*
     * Unknown frontend routes
     * return to login.
     */
    {
      path:
        "*",

      Component:
        LoginPage,
    },
  ]);
