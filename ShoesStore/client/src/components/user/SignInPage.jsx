// client/src/components/user/SignInPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
import { useAuth } from "../../context/AuthContext"; 

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const { notice, showNotice } = useNotice();
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      const msg = String(result.message || "Sign in failed.");
      const friendly =
        msg.includes("401") || msg.toLowerCase().includes("unauthorized")
          ? "Email or password is incorrect."
          : msg;
      setError(friendly);
      showNotice("error", friendly);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Sign in</h1>
          <p className="men-sub">
            Welcome back. Log in to access your account and continue shopping.
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: "32px 0 64px" }}>
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {notice && <Notice type={notice.type} message={notice.message} />}

            <div className="form-group">
              <label className="auth-label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="admin@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ position: "relative" }}>
              <label className="auth-label">Password</label>
              <input 
                type={showPassword ? "text" : "password"}
                className="input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 2,
                  height: "calc(100% + 20px)",
                  display: "flex",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  padding: "6px 4px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div
              className="form-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="link-btn">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
            >
              Sign in
            </button>

            <p className="muted" style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
              New here?{" "}
              <Link to="/signup" className="link-btn">
                Join us
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}