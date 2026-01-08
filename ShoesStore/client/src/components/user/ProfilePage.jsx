import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMeAPI, updateProfileAPI, changePasswordAPI } from "../../utilities/api";

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);

  // Password change states
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateProfileAPI(trimmedName);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await changePasswordAPI(currentPassword, newPassword);
      
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      let msg = "Failed to change password. Please try again.";
      
      if (error.response?.status === 400) {
        msg = "Incorrect current password.";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      
      setPasswordError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setPasswordError("");
    setPasswordSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
                Profile
              </NavLink>
              <NavLink className="btn btn-outline" to="/orders">
                Orders
              </NavLink>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ color: "#dc2626" }}
              >
                Logout
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
                gap: 14,
                marginTop: 18,
              }}
            >
              <Field
                label="Full Name"
                value={name}
                onChange={setName}
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                readOnly
              />

              <div
                style={{
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

            {/* Change Password Section */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e2e8f0" }}>
              <h2 style={{ marginTop: 0 }}>Change Password</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Update your password to keep your account secure
              </p>

              {passwordError && (
                <div style={{ color: "#dc2626", marginBottom: 12 }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ color: "#16a34a", marginBottom: 12 }}>
                  {passwordSuccess}
                </div>
              )}

              <form
                onSubmit={handleChangePassword}
                style={{
                  display: "grid",
                  gap: 14,
                  marginTop: 18,
                }}
              >
                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  showPassword={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                />
                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  showPassword={showNewPassword}
                  onToggle={() => setShowNewPassword(!showNewPassword)}
                />
                <PasswordField
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  showPassword={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <button className="btn" type="submit" disabled={changingPassword}>
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancelPassword}
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, readOnly, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 13, color: "#64748b" }}>{label}</label>
      <input
        type={type}
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

function PasswordField({ label, value, onChange, showPassword, onToggle }) {
  return (
    <div>
      <label style={{ fontSize: 13, color: "#64748b" }}>{label}</label>
      <div style={{ position: "relative", marginTop: 6 }}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            paddingRight: 40,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 14,
            background: "#fff",
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            color: "#64748b",
          }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}