import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL;

export default function AdminLogin() {
  const [username, setUsername] = useState("");
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
        throw new Error("Chưa cấu hình REACT_APP_API_URL trong file .env");
      }

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.description ||
            data.message ||
            "Tài khoản hoặc mật khẩu không đúng."
        );
      }

      if (!data.token) {
        throw new Error("Lỗi hệ thống: Backend không trả về Token.");
      }
      if (!data.is_staff) {
        throw new Error("Bạn không có quyền truy cập vào trang quản trị!");
      }

      localStorage.setItem("user", JSON.stringify(data));

      navigate("/admin/products");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
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
            <label className="muted">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginTop: 10 }}>
            <label className="muted">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập password admin..."
              autoComplete="current-password"
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
              ← Back to store
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
