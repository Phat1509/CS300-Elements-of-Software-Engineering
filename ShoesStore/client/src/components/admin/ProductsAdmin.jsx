import React, { useEffect, useMemo, useState } from "react";
import { getProducts } from "../../ultilities/api";
import adminApi from "../../ultilities/adminApi";
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
    let mounted = true;
    setLoading(true);
    getProducts()
      .then((p) => mounted && setProducts(p || []))
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const normalized = useMemo(() => {
    return (products || []).map((p) => ({
      ...p,
      _id: p.product_id || p.id || p.productId,
      _name: (p.name || "").toString(),
      _price: Number(p.price) || 0,
      _active:
        typeof p.is_active === "boolean" ? p.is_active : !!p.isActive || true,
      _image: p.image_url || p.image || "",
    }));
  }, [products]);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalized
      .filter((p) => (onlyActive ? p._active : true))
      .filter((p) => (q ? p._name.toLowerCase().includes(q) : true))
      .sort((a, b) => (b._id || 0) - (a._id || 0));
  }, [normalized, query, onlyActive]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((s) => (s || []).filter((x) => (x.product_id || x.id) !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const handleSaved = (saved) => {
    if (!saved) return;
    const id = saved.product_id || saved.id || saved.productId;

    setProducts((s) => {
      const arr = s || [];
      const exists = arr.find((x) => (x.product_id || x.id) === id);
      if (exists) {
        return arr.map((x) =>
          (x.product_id || x.id) === id ? { ...x, ...saved } : x
        );
      }
      return [saved, ...arr];
    });

    setEditing(null);
    setShowNew(false);
  };

  const openNew = () => {
    setEditing(null);
    setShowNew(true);
  };

  const openEdit = (p) => {
    setShowNew(false);
    setEditing(p);
  };

  const closeForm = () => {
    setShowNew(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="Products">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            className="input"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <label className="admin-switch" style={{ marginLeft: 10 }}>
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span>Active only</span>
          </label>
        </div>

        <button className="btn btn-primary" onClick={openNew}>
          + New Product
        </button>
      </div>

      {/* Form panel */}
      {(showNew || editing) && (
        <div className="admin-panel">
          <div className="admin-panel-top">
            <div>
              <strong>
                {showNew ? "Create product" : `Edit: ${editing?._name || editing?.name || ""}`}
              </strong>
              <div className="muted" style={{ fontSize: 12 }}>
                Fill in the fields and hit Save.
              </div>
            </div>
            <button className="btn btn-outline" onClick={closeForm}>
              Close
            </button>
          </div>

          <ProductForm
            initial={showNew ? null : editing}
            onSaved={handleSaved}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="muted">Loading products...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 72 }}>Image</th>
                <th>Name</th>
                <th style={{ width: 140 }}>Price</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="admin-empty" style={{ margin: 10 }}>
                      <h3 style={{ marginTop: 0 }}>No products</h3>
                      <p className="muted" style={{ margin: 0 }}>
                        Try clearing filters or create a new product.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="admin-img">
                        {p._image ? (
                          <img src={p._image} alt={p._name} />
                        ) : (
                          <div className="admin-img-ph">—</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{p._name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        ID: {p._id}
                      </div>
                    </td>
                    <td>
                      <strong>${p._price.toFixed(2)}</strong>
                    </td>
                    <td>
                      {p._active ? (
                        <span className="admin-badge admin-badge-ok">
                          Active
                        </span>
                      ) : (
                        <span className="admin-badge admin-badge-off">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
        Showing {displayed.length} / {products.length} products
      </div>
    </AdminLayout>
  );
}
