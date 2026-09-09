import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type UserRole = "employee" | "manager" | "admin";

export type EkipUser = {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: "active" | "pending" | "suspended";
  departmentId: string | null;
  managerId: string | null;
  department?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  session: Session | null;
  user: EkipUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<EkipUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<EkipUser | null>;
  updateProfile: (fullName: string) => Promise<EkipUser>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

function isEkipUser(value: unknown): value is EkipUser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<EkipUser>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.supabaseUserId === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.fullName === "string" &&
    (candidate.role === "employee" ||
      candidate.role === "manager" ||
      candidate.role === "admin") &&
    (candidate.status === "active" ||
      candidate.status === "pending" ||
      candidate.status === "suspended")
  );
}

async function readJson(response: Response) {
  return response.json().catch(() => null);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<EkipUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCurrentUser(accessToken: string): Promise<EkipUser> {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data?.message === "string"
          ? data.message
          : "Failed to load EKIP account."
      );
    }

    if (!isEkipUser(data?.user)) {
      throw new Error("Invalid EKIP user response.");
    }

    return data.user;
  }

  async function clearLocalAuth() {
    setSession(null);
    setUser(null);
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }

  async function login(email: string, password: string): Promise<EkipUser> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) throw new Error("Email address is required.");
    if (!password) throw new Error("Password is required.");

    await clearLocalAuth();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || "Invalid email or password.");
    }

    if (!data.session) {
      await clearLocalAuth();
      throw new Error("Authentication did not return a valid session.");
    }

    try {
      const ekipUser = await fetchCurrentUser(data.session.access_token);
      setSession(data.session);
      setUser(ekipUser);
      return ekipUser;
    } catch (error) {
      await clearLocalAuth();
      throw error;
    }
  }

  async function logout() {
    await clearLocalAuth();
  }

  async function refreshUser(): Promise<EkipUser | null> {
    if (!session?.access_token) {
      setUser(null);
      return null;
    }

    const currentUser = await fetchCurrentUser(session.access_token);
    setUser(currentUser);
    return currentUser;
  }

  async function updateProfile(fullName: string): Promise<EkipUser> {
    const cleanedName = fullName.trim();

    if (cleanedName.length < 2) {
      throw new Error("Full name must contain at least 2 characters.");
    }

    if (cleanedName.length > 100) {
      throw new Error("Full name cannot exceed 100 characters.");
    }

    if (!session?.access_token) {
      throw new Error("Your session is unavailable. Please sign in again.");
    }

    const response = await fetch(`${API_URL}/api/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ fullName: cleanedName }),
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(
        typeof data?.message === "string"
          ? data.message
          : "Failed to update profile."
      );
    }

    if (!isEkipUser(data?.user)) {
      throw new Error("Invalid profile update response.");
    }

    setUser(data.user);
    return data.user;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (!user) throw new Error("No authenticated EKIP user is available.");
    if (!currentPassword) throw new Error("Current password is required.");
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }
    if (currentPassword === newPassword) {
      throw new Error("New password must be different from your current password.");
    }

    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (verifyError) {
      throw new Error("Current password is incorrect.");
    }

    const { error: updateError } =
      await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      throw new Error(updateError.message || "Failed to update password.");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function applySession(nextSession: Session | null) {
      if (!mounted) return;

      if (!nextSession) {
        setSession(null);
        setUser(null);
        return;
      }

      try {
        const ekipUser = await fetchCurrentUser(nextSession.access_token);
        if (!mounted) return;
        setSession(nextSession);
        setUser(ekipUser);
      } catch (error) {
        console.error("Auth session validation failed:", error);
        if (!mounted) return;
        setSession(null);
        setUser(null);
        await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      }
    }

    async function initializeAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        await applySession(data.session);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;
      void applySession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        login,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
