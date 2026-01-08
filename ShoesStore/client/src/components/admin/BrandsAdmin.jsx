import React, { useEffect, useState } from "react";
import adminApi from "../../utilities/adminApi";
import BrandForm from "./BrandForm";
import AdminLayout from "./AdminLayout";
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";
// 1. Import ConfirmModal
import ConfirmModal from "../common/ConfirmModal";

export default function BrandsAdmin() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  
  const [deleteData, setDeleteData] = useState({ show: false, id: null });
  
  const { notice, showNotice } = useNotice();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBrands();
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showNotice("error", "Failed to load brands list.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteData({ show: true, id });
  };

  const executeDelete = async () => {
    const id = deleteData.id;
    if (!id) return;

    try {
      await adminApi.deleteBrand(id);
      setBrands(brands.filter((b) => b.id !== id));
      showNotice("success", "Brand deleted successfully.");
    } catch (e) {
      showNotice("error", "Error: " + (e.message || "Failed to delete brand."));
    } finally {
      setDeleteData({ show: false, id: null });
    }
  };

  const handleSaved = () => {
    loadBrands();
    setShowNew(false);
    setEditing(null);
    showNotice("success", "Brand saved successfully.");
  };

  return (
    <AdminLayout title="Brands Management">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <p className="muted">{brands.length} brands in the system</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowNew(true);
          }}
        >
          + Add New Brand
        </button>
      </div>

      {/* Notice Area */}
      {notice && (
        <div style={{ marginBottom: 20 }}>
          <Notice type={notice.type} message={notice.message} />
        </div>
      )}

      {/* 5. Chèn ConfirmModal vào giao diện */}
      <ConfirmModal 
        isOpen={deleteData.show}
        title="Delete Brand?"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteData({ show: false, id: null })}
      />

      {(showNew || editing) && (
        <div className="admin-panel" style={{ border: "1px solid #2563eb" }}>
          <div className="admin-panel-top">
            <strong>{showNew ? "Create New Brand" : "Update Brand"}</strong>
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
          <BrandForm
            initial={editing}
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
          <p>Loading...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Brand Name</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>
                        <strong>{b.name}</strong>
                      </td>
                      <td className="muted">{b.description || "---"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn-icon"
                          title="Edit"
                          onClick={() => setEditing(b)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete"
                          // 6. Gọi hàm mở Modal tại đây
                          onClick={() => openDeleteModal(b.id)}
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