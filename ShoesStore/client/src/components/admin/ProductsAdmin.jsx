import React, { useEffect, useState } from "react";
import { getProducts } from "../../ultilities/api";
import adminApi from "../../ultilities/adminApi";
import ProductForm from "./ProductForm";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProducts()
      .then((p) => {
        if (mounted) setProducts(p);
      })
      .catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const handleSaved = (saved) => {
    // json-server may return created object; try to merge
    if (!saved) return;
    const id = saved.product_id || saved.id || saved.productId;
    setProducts((s) => {
      const exists = s.find((x) => x.product_id === id || x.id === id);
      if (exists)
        return s.map((x) =>
          x.product_id === id || x.id === id ? { ...x, ...saved } : x
        );
      return [saved, ...s];
    });
    setEditing(null);
    setShowNew(false);
  };

  const handleEdit = (p) => setEditing(p);

  if (loading) return <div className="container">Loading products...</div>;

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Products (Admin)</h1>
      <p>Basic list + create/edit/delete for local JSON Server.</p>
      <div style={{ marginBottom: 12 }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowNew((s) => !s)}
        >
          New Product
        </button>
      </div>
      {showNew && (
        <div
          style={{
            marginBottom: 12,
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <ProductForm
            onSaved={handleSaved}
            onCancel={() => setShowNew(false)}
          />
        </div>
      )}
      <div style={{ display: "grid", gap: 8 }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{p.name}</strong>
                <div className="muted">Price: ${p.price}</div>
              </div>
              <div>
                <button
                  className="btn btn-outline"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline"
                  style={{ marginLeft: 8 }}
                  onClick={() => handleDelete(p.product_id || p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            {editing &&
              (editing.product_id === p.product_id || editing.id === p.id) && (
                <div style={{ marginTop: 12 }}>
                  <ProductForm
                    initial={editing}
                    onSaved={handleSaved}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
