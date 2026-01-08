import React, { useEffect, useMemo, useState } from "react";
import adminApi from "../../utilities/adminApi";
import ProductForm from "./ProductForm";
import AdminLayout from "./AdminLayout";
// 1. Import Notice & Hook
import Notice from "../common/Notice";
import useNotice from "../../hooks/useNotice";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const { notice, showNotice } = useNotice();

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
      showNotice("error", "Failed to load products list.");
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
    if (!window.confirm(`Are you sure you want to delete product ID: ${id}?`))
      return;

    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showNotice("success", "Product deleted successfully.");
    } catch (e) {
      showNotice(
        "error",
        "Error: " + (e.message || "Failed to delete product.")
      );
    }
  };

  const handleSaved = () => {
    loadProducts();
    closeForm();
    showNotice("success", "Product saved successfully.");
  };

  const closeForm = () => {
    setShowNew(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="Products Management">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="input"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="admin-switch" style={{ marginLeft: 15 }}>
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>Active Only</span>
          </label>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowNew(true);
          }}
        >
          + Add New Product
        </button>
      </div>

      {notice && (
        <div style={{ marginBottom: 20 }}>
          <Notice type={notice.type} message={notice.message} />
        </div>
      )}

      {(showNew || editing) && (
        <div
          className="admin-panel"
          style={{ border: "1px solid #007bff", padding: 20, marginBottom: 20 }}
        >
          <h3>{showNew ? "Create New Product" : "Edit Product"}</h3>
          <ProductForm
            key={editing ? editing.id : "new"}
            initial={editing}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Information</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                displayed.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.image_url}
                        alt=""
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #eee",
                        }}
                      />
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="small muted">ID: {p.id}</div>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      {p.is_active ? (
                        <span style={{ color: "green" }}>✅ Active</span>
                      ) : (
                        <span style={{ color: "red" }}>❌ Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setEditing(p)}
                        className="btn-icon"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn-icon delete"
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
    </AdminLayout>
  );
}