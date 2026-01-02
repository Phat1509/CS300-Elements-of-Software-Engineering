import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import auth from "../../ultilities/auth";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(username, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error.");
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
              placeholder="••••••••"
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
            <span className="muted" style={{ fontSize: 12 }}>
              Demo account: admin
            </span>
          </div>
        </form>
      </div>
    </main>
  );
}