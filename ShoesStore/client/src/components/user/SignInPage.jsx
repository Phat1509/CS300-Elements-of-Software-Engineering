// client/src/components/user/SignInPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import Context

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State để hiển thị lỗi nếu có
  
  const { login } = useAuth(); // Lấy hàm login từ Context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Gọi hàm login từ AuthContext
    const result = await login(email, password);

    if (result.success) {
      // Đăng nhập thành công -> Chuyển hướng về trang chủ
      navigate("/");
    } else {
      // Đăng nhập thất bại -> Hiện lỗi
      setError(result.message);
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
          {/* Form cần có onSubmit */}
          <form className="auth-form" onSubmit={handleSubmit}>
            
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="auth-label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="admin@gmail.com" // Gợi ý user có sẵn để test
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="auth-label">Password</label>
              <input 
                type="password" 
                className="input" 
                placeholder="123" // Gợi ý pass để test
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="link-btn">
                Forgot password?
              </button>
            </div>

            {/* Đổi type="button" thành "submit" để kích hoạt onSubmit */}
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