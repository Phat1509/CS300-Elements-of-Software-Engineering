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
          setUser({
            ...userData,
            id: userData.id || userData.user_id,
          });
        } catch (error) {
          console.error("Token validation error:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);


  const login = async (email, password) => {
    try {
      const data = await loginAPI(email, password);

      const token = data.token || data.access_token;

      if (!token) {
        throw new Error("API không trả về 'token'.");
      }

      localStorage.setItem("token", token);

      const userInfo = {
        id: data.id || data.user_id,
        name: data.name,
        pid: data.pid,
        isVerified: data.is_verified,
        email: email,
        ...data
      };

      setUser(userInfo);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || error.message || "Login failed";
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      await registerAPI(name, email, password);
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
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

  const value = { user, isAuthenticated: !!user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}