import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, getMeAPI, registerAPI } from "../utilities/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getMeAPI();
          console.log("🔄 Restored user from token:", userData);

          setUser({
            ...userData,
            id: userData.id || userData.user_id || userData.pid,
          });
        } catch (error) {
          console.log("Error checking old token:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);


  const login = async (email, password) => {
    try {
      console.log("🚀 Sending login:", { email, password });

      const data = await loginAPI(email, password);
      console.log("Server returned:", data);

      const token = data.token || data.access_token;

      if (!token) {
        throw new Error("API did not return 'token'.");
      }

      localStorage.setItem("token", token);

      const userInfo = {
        id: data.id || data.user_id || data.pid, // Support all formats
        name: data.name,
        pid: data.pid,
        isVerified: data.is_verified,
        email: email,
        ...data
      };

      console.log("💾 Saving user to State:", userInfo);
      setUser(userInfo);

      return { success: true };
    } catch (error) {
      console.error("❌ Login error:", error);
      const msg = error.response?.data?.message || error.message || "Login failed";
      return { success: false, message: msg };
    }
  };

  // 3. Register function
  const register = async (name, email, password) => {
    try {
      console.log("Registering:", { name, email, password });
      await registerAPI(name, email, password);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const msg = error.response?.data?.message || "Registration failed";
      return { success: false, message: msg };
    }
  };

  // 4. Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/signin";
  };

  // 5. Refresh user data
  const refreshUser = async () => {
    try {
      const userData = await getMeAPI();
      setUser({
        ...userData,
        id: userData.id || userData.user_id || userData.pid,
      });
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value = { user, isAuthenticated: !!user, loading, login, register, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}