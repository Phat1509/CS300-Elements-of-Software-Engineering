import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../../ultilities/auth";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.login(username, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin} style={{ maxWidth: 420 }}>
        <div>
          <label className="muted">Username</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label className="muted">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="muted" style={{ color: "red", marginTop: 8 }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="submit">
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
