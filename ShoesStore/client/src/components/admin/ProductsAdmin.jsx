import React, { useEffect, useMemo, useState } from "react";
import adminApi from "../../utilities/adminApi";
import ProductForm from "./ProductForm";
import AdminLayout from "./AdminLayout";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => (onlyActive ? p.is_active : true))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .sort((a, b) => b.id - a.id);
  }, [products, query, onlyActive]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Xóa sản phẩm ID: ${id}?`)) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Đã xóa!");
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const handleSaved = () => {
    loadProducts(); // Load lại toàn bộ để đảm bảo đồng bộ Category/Brand name từ Backend
    closeForm();
  };

  const closeForm = () => {
    setShowNew(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="Quản lý Sản phẩm">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input className="input" placeholder="Tìm tên..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className="admin-switch" style={{ marginLeft: 15 }}>
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            <span style={{ marginLeft: 8 }}>Đang bán</span>
          </label>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowNew(true); }}>+ Thêm mới</button>
      </div>

      {(showNew || editing) && (
        <div className="admin-panel" style={{ border: "1px solid #007bff", padding: 20, marginBottom: 20 }}>
          <h3>{showNew ? "Tạo sản phẩm" : "Chỉnh sửa sản phẩm"}</h3>
          <ProductForm 
            key={editing ? editing.id : 'new'} 
            initial={editing} 
            onSaved={handleSaved} 
            onCancel={closeForm} 
          />
        </div>
      )}

      {loading ? <p>Đang tải...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Thông tin sản phẩm</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.image_url} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} /></td>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="small muted">ID: {p.id}</div>
                  </td>
                  <td>{Number(p.price).toLocaleString()}₫</td>
                  <td>{p.is_active ? "✅" : "❌"}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setEditing(p)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDelete(p.id)} className="btn-icon delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}