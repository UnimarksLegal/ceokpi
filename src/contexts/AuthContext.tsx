import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  logout: () => {},
});

const EXPIRY_HOURS = 48; // 🔹 2 days

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Restore session if still valid
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedTime = localStorage.getItem("login_time");
    if (storedUser && storedTime) {
      const now = Date.now();
      const loginTime = parseInt(storedTime);
      const diffHours = (now - loginTime) / (1000 * 60 * 60);
      if (diffHours < EXPIRY_HOURS) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("login_time");
      }
    }
  }, []);

  // ✅ Login function (using your backend check)
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser({ username });
        localStorage.setItem("user", JSON.stringify({ username }));
        localStorage.setItem("login_time", Date.now().toString());
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid credentials" };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error" };
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("login_time");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
