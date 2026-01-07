import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, getMeAPI, registerAPI } from "../utilities/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check Login khi F5 trang (Giữ đăng nhập)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getMeAPI();
          console.log("🔄 Khôi phục user từ token:", userData);
          
          // Quan trọng: Map đúng ID để dùng cho Cart
          setUser({
            ...userData,
            id: userData.id || userData.user_id, // Ưu tiên lấy id
          });
        } catch (error) {
          console.log("Lỗi check token cũ:", error);
          logout(); // Token hết hạn hoặc lỗi thì logout luôn
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 2. Hàm Login
  const login = async (email, password) => {
    try {
      console.log("🚀 Đang gửi đăng nhập:", { email, password });
      
      const data = await loginAPI(email, password);
      console.log("Server trả về:", data); 

      // Kiểm tra xem server trả về token tên là gì (token hay access_token)
      const token = data.token || data.access_token;

      if (!token) {
        throw new Error("API không trả về 'token'.");
      }

      localStorage.setItem("token", token);
      
      // Tạo object user đầy đủ để lưu vào state
      // LƯU Ý: Phải lấy được ID để sau này truyền vào API Giỏ hàng
      const userInfo = {
        id: data.id || data.user_id, // <--- QUAN TRỌNG NHẤT
        name: data.name,
        pid: data.pid,
        isVerified: data.is_verified,
        email: email,
        ...data // Lưu dự phòng các trường khác
      };
      
      console.log("💾 Đang lưu user vào State:", userInfo);
      setUser(userInfo);
      
      return { success: true };
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại";
      return { success: false, message: msg };
    }
  };

  // 3. Hàm Register
  const register = async (name, email, password) => {
    try {
      console.log("Đang đăng ký:", { name, email, password });
      // Backend đã sửa để verified luôn, nên chỉ cần await là xong
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

  const value = { user, isAuthenticated: !!user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}