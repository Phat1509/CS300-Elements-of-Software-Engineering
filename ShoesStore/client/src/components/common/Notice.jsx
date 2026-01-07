// client/src/components/common/Notice.jsx
import React from "react";

const styles = {
  base: {
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
  },
  success: {
    background: "#ecfdf5",
    color: "#065f46",
    border: "1px solid #a7f3d0",
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  },
  info: {
    background: "#eef2ff",
    color: "#1e3a8a",
    border: "1px solid #c7d2fe",
  },
};

export default function Notice({ type = "info", message, style }) {
  if (!message) return null;
  const variant = styles[type] || styles.info;
  return (
    <div style={{ ...styles.base, ...variant, ...(style || {}) }} role="alert">
      {message}
    </div>
  );
}
