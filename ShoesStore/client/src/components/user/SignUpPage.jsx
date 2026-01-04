import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [authority, setAuthority] = useState("USER"); // USER | ADMIN
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("You must agree to the Terms & Privacy Policy.");
      return;
    }

    if (password.length < 3) {
      setError("Password is too short.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        fullname,
        username,
        email,
        password,
        authority, // <- đây nè
      });

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Sign up failed.");
      }
    } catch (err) {
      setError(err?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <section className="men-head">
        <div className="container">
          <h1 className="men-title">Join StepStyle</h1>
          <p className="men-sub">
            Create your account to save favorites, track orders, and enjoy
            personalized recommendations.
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: "32px 0 64px" }}>
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  color: "red",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="auth-label">Full name</label>
              <input
                type="text"
                className="input"
                placeholder="Nguyen Van A"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                className="input"
                placeholder="khoa_nguyen"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

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

            {/* AUTHORITY / ROLE */}
            <div className="form-group">
              <label className="auth-label">Authority</label>
              <select
                className="input"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                (Dev mode) Chọn role để test phân quyền.
              </p>
            </div>

            <div className="form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="auth-label">Confirm password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <div
              className="form-group"
              style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
            >
              <input
                type="checkbox"
                style={{ marginTop: 4 }}
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="muted" style={{ fontSize: 13 }}>
                I agree to the{" "}
                <Link to="/legal" className="inline-link">
                  Terms of Service and Privacy Policy
                </Link>
                .
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Join us"}
            </button>

            <p
              className="muted"
              style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}
            >
              Already have an account?{" "}
              <Link to="/signin" className="link-btn">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
