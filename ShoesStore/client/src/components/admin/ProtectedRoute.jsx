// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Lấy user từ localStorage (giống cách adminApi.js lấy token)
  const userStr = localStorage.getItem("user");
  let isAuthenticated = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // Kiểm tra: Phải có object user VÀ có token bên trong
      if (user && user.token) {
        isAuthenticated = true;
      }
    } catch (e) {
      isAuthenticated = false;
    }
  }

  // Nếu đã login -> Cho đi tiếp (Outlet)
  // Nếu chưa login -> Đá về trang Admin Login
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;