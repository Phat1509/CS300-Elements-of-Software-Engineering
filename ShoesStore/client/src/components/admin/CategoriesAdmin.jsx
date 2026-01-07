import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi";
import CategoryForm from "./CategoryForm";
import AdminLayout from "./AdminLayout";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setCategories(list);
    } catch (err) { 
      console.error("Load categories failed:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      alert("Đã xóa danh mục thành công!");
    } catch (e) { 
      alert("Lỗi khi xóa: " + e.message); 
    }
  };

  return (
    <AdminLayout title="Quản lý Danh mục">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="muted">Tổng cộng: {categories.length} danh mục</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowNew(true); }}>
          + Thêm Danh mục
        </button>
      </div>

      {(showNew || editing) && (
        <div className="admin-panel" style={{ border: "2px solid #2563eb", marginBottom: 30 }}>
          <div className="admin-panel-top">
            <strong>{showNew ? "Tạo Danh mục mới" : `Sửa danh mục: ${editing?.name}`}</strong>
            <button className="btn-icon" onClick={() => { setShowNew(false); setEditing(null); }}>✕</button>
          </div>
          <CategoryForm 
            initial={editing} 
            allCategories={categories} // Truyền danh sách để chọn Parent Category
            onSaved={() => { loadData(); setShowNew(false); setEditing(null); }} 
            onCancel={() => { setShowNew(false); setEditing(null); }} 
          />
        </div>
      )}

      <div className="admin-panel">
        {loading ? <p>Đang tải dữ liệu...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Tên danh mục</th>
                  <th>Slug</th>
                  <th>Danh mục cha</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Chưa có danh mục nào.</td></tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td className="muted">{c.slug}</td>
                      <td>
                        {c.parent_id 
                          ? categories.find(p => p.id === c.parent_id)?.name || `ID: ${c.parent_id}`
                          : <span className="muted">---</span>
                        }
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-icon" onClick={() => setEditing(c)} title="Sửa">✏️</button>
                        <button className="btn-icon delete" onClick={() => handleDelete(c.id)} title="Xóa">🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}