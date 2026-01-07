import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMeAPI, updateProfileAPI } from "../../utilities/api";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/signin");
      return;
    }

    const fetchMe = async () => {
      try {
        setError("");
        setSuccess("");

        const data = await getMeAPI();
        setMe(data);

        setName(data.name || "");
        setEmail(data.email || "");
      } catch {
        setError("Failed to load profile information.");
      }
    };

    if (!loading && user) fetchMe();
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      // POST /api/auth/profile
      const updated = await updateProfileAPI(name.trim());

      setMe(updated);
      await refreshUser();

      setSuccess("Profile updated successfully.");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");

    if (!me) return;
    setName(me.name || "");
    setEmail(me.email || "");
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ background: "#f7f9fc", minHeight: "calc(100vh - 80px)" }}>
      <div className="container" style={{ padding: "24px 16px 56px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Home
          </span>
          <span style={{ margin: "0 8px" }}>/</span>
          <b style={{ color: "#0f172a" }}>My Account</b>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 18,
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#0f172a",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  margin: "0 auto 8px",
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 800 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {user.email}
              </div>
            </div>

            <nav style={{ display: "grid", gap: 8 }}>
              <NavLink className="btn btn-outline" to="/profile">
                👤 Profile
              </NavLink>
              <NavLink className="btn btn-outline" to="/orders">
                📦 Orders
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ color: "#dc2626" }}
              >
                🚪 Logout
              </button>
            </nav>
          </aside>

          {/* Main */}
          <main
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Personal Information</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Update your account information
            </p>

            {error && (
              <div style={{ color: "#dc2626", marginBottom: 12 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ color: "#16a34a", marginBottom: 12 }}>
                {success}
              </div>
            )}

            <form
              onSubmit={handleSave}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginTop: 18,
              }}
            >
              <Field
                label="Name"
                value={name}
                onChange={setName}
                full
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                full
                readOnly
              />

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <button className="btn" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, full, readOnly }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ fontSize: 13, color: "#64748b" }}>{label}</label>
      <input
        value={value}
        readOnly={!!readOnly}
        onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
        style={{
          width: "100%",
          marginTop: 6,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          fontSize: 14,
          background: readOnly ? "#f8fafc" : "#fff",
          cursor: readOnly ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}