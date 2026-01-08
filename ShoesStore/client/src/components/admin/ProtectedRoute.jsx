// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const userStr = localStorage.getItem("user");
  let isAuthenticated = false;
  let isStaff = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.token && user.is_staff === true) {
        isAuthenticated = true;
        isStaff = true;
      }
    } catch (e) {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
