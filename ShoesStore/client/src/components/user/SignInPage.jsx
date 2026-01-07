// client/src/components/user/SignInPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
import { useAuth } from "../../context/AuthContext"; 
import { forgotPasswordAPI } from "../../utilities/api";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const { notice, showNotice } = useNotice();
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showNotice("error", "Please enter your email to reset your password.");
      return;
    }

    try {
      setSendingReset(true);
      await forgotPasswordAPI(email.trim());
      showNotice("success", "Verification code sent. Check your email.");
      navigate("/reset-password", { state: { email: email.trim() } });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset email. Please try again.";
      showNotice("error", msg);
    } finally {
      setSendingReset(false);
    }
  };

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

            <div className="form-group">
              <label className="auth-label">Password</label>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "45px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                    color: "#6b7280",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
              <button
                type="button"
                className="link-btn"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                style={{ opacity: sendingReset ? 0.7 : 1 }}
              >
                {sendingReset ? "Sending..." : "Forgot password?"}
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