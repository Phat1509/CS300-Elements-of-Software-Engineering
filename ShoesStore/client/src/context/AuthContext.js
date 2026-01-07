import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, getMeAPI, registerAPI } from "../utilities/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Refresh user từ backend (dùng sau khi update profile)
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }

    const userData = await getMeAPI();
    const merged = {
      ...(user || {}),
      ...userData,
      // giữ id nếu backend không trả
      id: userData.id || userData.user_id || user?.id,
    };
    setUser(merged);
    return merged;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getMeAPI();
          console.log("🔄 Khôi phục user từ token:", userData);

          setUser({
            ...userData,
            id: userData.id || userData.user_id,
          });
        } catch (error) {
          console.log("Lỗi check token cũ:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Hàm Login
  const login = async (email, password) => {
    try {
      console.log("🚀 Đang gửi đăng nhập:", { email, password });

      const data = await loginAPI(email, password);
      console.log("Server trả về:", data);

      const token = data.token || data.access_token;

      if (!token) {
        throw new Error("API không trả về 'token'.");
      }

      localStorage.setItem("token", token);

      const userInfo = {
        id: data.id || data.user_id, // <--- QUAN TRỌNG NHẤT
        name: data.name,
        pid: data.pid,
        isVerified: data.is_verified,
        email: email,
        ...data,
      };

      console.log("💾 Đang lưu user vào State:", userInfo);
      setUser(userInfo);

      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại";
      return { success: false, message: msg };
    }
  };

  // 3. Hàm Register
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

  // 4. Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/signin";
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser, // ✅ thêm vào context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
