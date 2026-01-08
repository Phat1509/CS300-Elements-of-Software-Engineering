import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi";
import CategoryForm from "./CategoryForm";
import AdminLayout from "./AdminLayout";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
// 1. Import ConfirmModal
import ConfirmModal from "../common/ConfirmModal";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  // 2. State quản lý Modal xóa
  const [deleteData, setDeleteData] = useState({ show: false, id: null });

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
      showNotice("error", "Failed to load categories list.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm mở Modal (thay thế handleDelete cũ)
  const openDeleteModal = (id) => {
    setDeleteData({ show: true, id });
  };

  // 4. Hàm thực thi xóa (gọi khi bấm Yes trong Modal)
  const executeDelete = async () => {
    const id = deleteData.id;
    if (!id) return;

    try {
      await adminApi.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      showNotice("success", "Category deleted successfully.");
    } catch (e) {
      showNotice("error", "Error: " + (e.message || "Failed to delete category."));
    } finally {
      // Đóng modal và reset
      setDeleteData({ show: false, id: null });
    }
  };

  const handleSaved = () => {
    loadData();
    setShowNew(false);
    setEditing(null);
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

      {/* Hiển thị Notice Area */}
      {notice && (
        <div style={{ marginBottom: 20 }}>
          <Notice type={notice.type} message={notice.message} />
        </div>
      )}

      {/* 5. Chèn ConfirmModal vào giao diện */}
      <ConfirmModal 
        isOpen={deleteData.show}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Sub-categories might also be affected."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteData({ show: false, id: null })}
      />

      {(showNew || editing) && (
        <div
          className="admin-panel"
          style={{ border: "2px solid #2563eb", marginBottom: 30 }}
        >
          <div className="admin-panel-top">
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
            onSaved={handleSaved}
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
                          // 6. Gọi hàm mở Modal tại đây
                          onClick={() => openDeleteModal(c.id)}
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