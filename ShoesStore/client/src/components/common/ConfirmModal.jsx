import React from "react";

export default function ConfirmModal({ 
  isOpen, 
  title = "Confirm Action", 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = false 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", // Màn hình tối đi
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "12px",
        width: "400px",
        maxWidth: "90%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        textAlign: "center"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: "1.25rem", color: "#1f2937" }}>
          {title}
        </h3>
        <p style={{ color: "#6b7280", marginBottom: 25, lineHeight: 1.5 }}>
          {message}
        </p>
        
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button 
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: isDanger ? "#ef4444" : "#2563eb", // Đỏ nếu xóa, Xanh nếu khác
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}