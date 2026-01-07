import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi";
import BrandForm from "./BrandForm";
import AdminLayout from "./AdminLayout";

export default function BrandsAdmin() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thương hiệu này?")) return;
    try {
      await adminApi.deleteBrand(id);
      setBrands(brands.filter(b => b.id !== id));
    } catch (e) { alert("Lỗi: " + e.message); }
  };

  return (
    <AdminLayout title="Quản lý Thương hiệu">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="muted">{brands.length} thương hiệu trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowNew(true); }}>
          + Thêm Thương hiệu
        </button>
      </div>

      {(showNew || editing) && (
        <div className="admin-panel" style={{ border: "1px solid #2563eb" }}>
          <div className="admin-panel-top">
            <strong>{showNew ? "Tạo Brand Mới" : "Cập nhật Brand"}</strong>
            <button className="btn-icon" onClick={() => { setShowNew(false); setEditing(null); }}>✕</button>
          </div>
          <BrandForm 
            initial={editing} 
            onSaved={() => { loadBrands(); setShowNew(false); setEditing(null); }} 
            onCancel={() => { setShowNew(false); setEditing(null); }} 
          />
        </div>
      )}

      <div className="admin-panel">
        {loading ? <p>Đang tải...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên thương hiệu</th>
                  <th>Mô tả</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td><strong>{b.name}</strong></td>
                    <td className="muted">{b.description || "---"}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-icon" onClick={() => setEditing(b)}>✏️</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(b.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}