import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Restore user on reload
  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        const loggedUser = { username: data.user };
        setUser(loggedUser);
        localStorage.setItem("authUser", JSON.stringify(loggedUser));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: "Server unreachable" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
