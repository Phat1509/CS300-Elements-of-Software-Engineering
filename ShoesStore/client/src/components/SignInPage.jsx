// src/components/SignInPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function SignInPage() {
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
          <form className="auth-form">
            <div className="form-group">
              <label className="auth-label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
              />
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
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="link-btn">
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
            >
              Sign in
            </button>

            <p
              className="muted"
              style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}
            >
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
