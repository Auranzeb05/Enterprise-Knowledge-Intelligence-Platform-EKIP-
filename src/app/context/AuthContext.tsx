import type { ReactNode } from "react";

export type UserRole = "employee" | "manager" | "admin";

const _auth = { role: "employee" as UserRole };

export function getRole(): UserRole {
  return _auth.role;
}

export function setAuthRole(r: UserRole) {
  _auth.role = r;
}

export function clearAuth() {
  _auth.role = "employee";
}

export function useAuth() {
  return {
    role: _auth.role,
    setRole: setAuthRole,
    logout: clearAuth,
  };
}

// No-op wrapper kept so App.tsx imports don't need to change
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  return children;
}
