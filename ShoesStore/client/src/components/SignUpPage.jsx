// src/components/SignUpPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function SignUpPage() {
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
          <form className="auth-form">
            <div className="form-group">
              <label className="auth-label">Full name</label>
              <input
                type="text"
                className="input"
                placeholder="Nguyen Van A"
              />
            </div>

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
                placeholder="Create a strong password"
              />
            </div>

            <div className="form-group">
              <label className="auth-label">Confirm password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat your password"
              />
            </div>

            <div
  className="form-group"
  style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
>
  <input type="checkbox" style={{ marginTop: 4 }} />
  <span className="muted" style={{ fontSize: 13 }}>
    I agree to the{" "}
    <Link to="/legal" className="inline-link">
      Terms of Service and Privacy Policy
    </Link>
    .
  </span>
</div>


            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
            >
              Join us
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
