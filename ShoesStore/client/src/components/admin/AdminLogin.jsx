import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AdminLogin() {
  const [email, setEmail] = useState(""); // Đổi tên biến thành email cho rõ nghĩa
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!API_BASE) {
        throw new Error("REACT_APP_API_URL is not configured in .env file");
      }

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email, // Backend mong đợi trường 'email'
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.description ||
            data.message ||
            "Invalid email or password."
        );
      }

      if (!data.token) {
        throw new Error("System Error: Backend did not return a Token.");
      }

      // Kiểm tra quyền Admin
      if (!data.is_staff) {
        throw new Error("Access Denied: You do not have permission to access the Admin Panel.");
      }

      localStorage.setItem("token", data.token); 
      localStorage.setItem("user", JSON.stringify(data));

      navigate("/admin"); 
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        {/* Brand */}
        <div className="admin-auth-brand">
          <div className="admin-auth-dot">S</div>
          <div>
            <div className="admin-auth-name">StepStyle</div>
            <div className="admin-auth-sub">Admin Panel</div>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 10, marginBottom: 18 }}>
          Sign in to manage products and orders.
        </p>

        <form onSubmit={handleLogin} className="admin-auth-form">
          <div className="form-group">
            <label className="muted">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="muted">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="admin-auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: 14 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="admin-auth-links">
            <Link to="/" className="link-btn">
              ← Back to Store
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}