import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
import { forgotPasswordAPI, resetPasswordAPI } from "../../utilities/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { notice, showNotice } = useNotice();

  const handleResend = async () => {
    if (!email.trim()) {
      showNotice("error", "Please enter your email to receive the code.");
      return;
    }
    try {
      setSending(true);
      await forgotPasswordAPI(email.trim());
      showNotice("success", "Verification code sent. Check your email.");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset email. Please try again.";
      showNotice("error", msg);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showNotice("error", "Email is required.");
      return;
    }
    if (!code.trim()) {
      showNotice("error", "Verification code is required.");
      return;
    }
    if (password.length < 3) {
      showNotice("error", "Password is too short.");
      return;
    }
    if (password !== confirm) {
      showNotice("error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordAPI(code.trim(), password);
      showNotice("success", "Password reset successful. You can now sign in.");
      navigate("/signin", { state: { email: email.trim() } });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Invalid or expired code. Please try again.";
      showNotice("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Reset password</h1>
          <p className="men-sub">
            Enter the verification code we emailed you and choose a new password.
            Codes expire in 5 minutes or when you request a new one.
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: "32px 0 64px" }}>
        {notice && <Notice type={notice.type} message={notice.message} />}
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="auth-label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="auth-label">Verification code</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleResend}
                  disabled={sending}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {sending ? "Resending..." : "Resend"}
                </button>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                Didn't get the code? Check spam or resend.
              </p>
            </div>

            <div className="form-group">
              <label className="auth-label">New password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Create a strong password"
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

            <div className="form-group">
              <label className="auth-label">Confirm new password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ paddingRight: "45px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>

            <p className="muted" style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
              Remembered it?{" "}
              <Link to="/signin" className="link-btn">
                Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
