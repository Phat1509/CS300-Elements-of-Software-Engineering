import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../utilities/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const result = await loginUser(email, password); // { success, user, message }
      if (result?.success) {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true };
      }
      return {
        success: false,
        message: result?.message || "Invalid email or password",
      };
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };

  const register = async (payload) => {
    try {
      const result = await registerUser(payload); // { success, user, message }
      if (result?.success) {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, message: result?.message || "Register failed" };
    } catch (error) {
      return { success: false, message: error?.message || "Register failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);