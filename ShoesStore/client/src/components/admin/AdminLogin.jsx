import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin"); // Mặc định để test cho nhanh
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users?username=${username}`);
      if (!res.ok) throw new Error("Lỗi kết nối server");
      
      const users = await res.json();
      const user = users[0]; 

      if (!user) {
        setError("Tài khoản không tồn tại.");
      } else if (user.password !== password) {
        setError("Sai mật khẩu.");
      } else if (!user.roles || !user.roles.includes("ADMIN")) {
        setError("Tài khoản này không có quyền truy cập Admin.");
      } else {
        localStorage.setItem("user", JSON.stringify(user));
        
        navigate("/admin");
      }

    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra, vui lòng thử lại sau.");
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