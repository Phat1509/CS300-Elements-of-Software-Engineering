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
    if (!window.confirm(`Delete product ID: ${id}?`)) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Deleted!");
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleSaved = () => {
    loadProducts(); 
    closeForm();
  };

  const closeForm = () => {
    setShowNew(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="Product Management">
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="input"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="admin-switch" style={{ marginLeft: 15 }}>
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>Active</span>
          </label>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditing(null); setShowNew(true); }}
        >
          + Add New
        </button>
      </div>

      {(showNew || editing) && (
        <div
          className="admin-panel"
          style={{ border: "1px solid #007bff", padding: 20, marginBottom: 20 }}
        >
          <h3>{showNew ? "Create Product" : "Edit Product"}</h3>
          <ProductForm
            key={editing ? editing.id : 'new'}
            initial={editing}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Info</th>
                <th>Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((p) => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.image_url}
                      alt=""
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <div className="small muted">ID: {p.id}</div>
                  </td>
                  <td>${Number(p.price).toFixed(2)}</td>
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
