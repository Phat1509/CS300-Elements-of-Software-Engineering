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
          setUser(userData);
        } catch (error) {
          console.log("Lỗi check token cũ:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🚀 Đang gửi đăng nhập:", { email, password }); // Log 1
      
      const data = await loginAPI(email, password);
      
      console.log("Server trả về:", data); 

      if (!data.token) {
        throw new Error("API không trả về 'token'. Kiểm tra lại Log xem nó tên là gì?");
      }

      localStorage.setItem("token", data.token);
      
      const userInfo = {
        name: data.name,
        pid: data.pid,
        isVerified: data.is_verified,
        email: email 
      };
      
      console.log("💾 Đang lưu user:", userInfo); // Log 3
      setUser(userInfo);
      
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error); // Log 4
      
      const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại";
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("Đang đăng ký:", { name, email, password });
      await registerAPI(name, email, password);
      return { success: true };
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      const msg = error.response?.data?.message || "Đăng ký thất bại";
      return { success: false, message: msg };
    }
  };

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