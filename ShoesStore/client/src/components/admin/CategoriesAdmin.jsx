import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi";
import CategoryForm from "./CategoryForm";
import AdminLayout from "./AdminLayout";
// 1. Import Notice & Hook
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // 2. Khởi tạo hook
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      const list = Array.isArray(data) ? data : data?.items || [];
      setCategories(list);
    } catch (err) {
      console.error("Load categories failed:", err);
      // Tiếng Anh: Thông báo lỗi tải trang
      showNotice("error", "Failed to load categories list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Tiếng Anh: Xác nhận xóa
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await adminApi.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      // 3. Thay alert bằng showNotice success (Tiếng Anh)
      showNotice("success", "Category deleted successfully.");
    } catch (e) {
      // 4. Thay alert lỗi bằng showNotice error
      showNotice("error", "Error: " + (e.message || "Failed to delete category."));
    }
  };

  // Hàm xử lý khi lưu thành công
  const handleSaved = () => {
    loadData();
    setShowNew(false);
    setEditing(null);
    // Tiếng Anh: Thông báo lưu thành công
    showNotice("success", "Category saved successfully.");
  };

  return (
    <AdminLayout title="Categories Management">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="muted">Total: {categories.length} categories</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowNew(true);
          }}
        >
          + Add New Category
        </button>
      </div>

      {/* 5. Hiển thị Notice Area */}
      {notice && (
        <div style={{ marginBottom: 20 }}>
          <Notice type={notice.type} message={notice.message} />
        </div>
      )}

      {(showNew || editing) && (
        <div
          className="admin-panel"
          style={{ border: "2px solid #2563eb", marginBottom: 30 }}
        >
          <div className="admin-panel-top">
            {/* Tiếng Anh: Header Form */}
            <strong>
              {showNew ? "Create New Category" : `Edit Category: ${editing?.name}`}
            </strong>
            <button
              className="btn-icon"
              onClick={() => {
                setShowNew(false);
                setEditing(null);
              }}
            >
              ✕
            </button>
          </div>
          <CategoryForm
            initial={editing}
            allCategories={categories}
            onSaved={handleSaved} // Gọi hàm handleSaved mới
            onCancel={() => {
              setShowNew(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <div className="admin-panel">
        {loading ? (
          <p>Loading data ...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Parent Category</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td className="muted">{c.slug}</td>
                      <td>
                        {c.parent_id ? (
                          categories.find((p) => p.id === c.parent_id)?.name ||
                          `ID: ${c.parent_id}`
                        ) : (
                          <span className="muted">---</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn-icon"
                          onClick={() => setEditing(c)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(c.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
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