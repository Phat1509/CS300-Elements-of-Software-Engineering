import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../utilities/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check login khi F5 trang
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await loginUser(email, password);
            if (userData) {
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
                return { success: true };
            }
            return { success: false, message: "Invalid email or password" };
        } catch (error) {
            return { success: false, message: "Network error" };
        }
    };

    const register = async (userData) => {
        try {
            await registerUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
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