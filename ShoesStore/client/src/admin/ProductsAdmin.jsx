import React, { useEffect, useState } from "react";
import { getProducts } from "../ultilities/api";
import adminApi from "../ultilities/adminApi";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="container">Loading products...</div>;

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1>Products (Admin)</h1>
      <p>Basic list + delete. Create/edit UI can be added later.</p>
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
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
