import { createContext, useContext, useState, useCallback } from "react";
import { apiPost } from "../api/apiHelpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("crm_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost("/auth/login", { email, password });
      const { token, user: loggedInUser } = res.data.data;

      localStorage.setItem("crm_token", token);
      localStorage.setItem("crm_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return loggedInUser;
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Invalid email or password";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
