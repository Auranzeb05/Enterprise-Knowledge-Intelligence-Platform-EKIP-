import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

const ROLE_HOME: Record<UserRole, string> = {
  employee: "/dashboard",
  manager: "/manager",
  admin: "/admin",
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    session,
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8FAFC" }}
      >
        <div className="text-center">
          <div className="w-9 h-9 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Verifying your EKIP session…
          </p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={ROLE_HOME[user.role]}
        replace
      />
    );
  }

  return <>{children}</>;
}
