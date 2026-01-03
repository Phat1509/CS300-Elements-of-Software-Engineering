import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";

export default function ProductForm({ initial = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm((f) => ({
        ...f,
        ...initial,
        // normalize common fields
        image_url: initial.image_url || initial.image || "",
        is_active:
          typeof initial.is_active === "boolean"
            ? initial.is_active
            : !!initial.isActive,
        price: initial.price ?? "",
      }));
    }
  }, [initial]);

  const change = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setForm((s) => ({ ...s, [k]: v }));
  };

  const submit = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        is_active: !!form.is_active,
      };

      const id =
        initial && (initial.product_id || initial.id || initial.productId);

      const result = id
        ? await adminApi.updateProduct(id, payload)
        : await adminApi.createProduct(payload);

      (onSaved || (() => {}))(result || payload);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const img = (form.image_url || "").trim();

  return (
    <form onSubmit={submit} className="admin-form">
      <div className="admin-form-grid">
        <div className="admin-form-left">
          <div className="admin-field">
            <label className="admin-label">Product name</label>
            <input
              className="input"
              value={form.name || ""}
              onChange={change("name")}
              placeholder="e.g., Air Runner Pro"
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Price</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.price ?? ""}
              onChange={change("price")}
              placeholder="e.g., 129.99"
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Image URL</label>
            <input
              className="input"
              value={form.image_url || ""}
              onChange={change("image_url")}
              placeholder="https://..."
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Description</label>
            <textarea
              className="input"
              style={{ minHeight: 96, resize: "vertical" }}
              value={form.description || ""}
              onChange={change("description")}
              placeholder="Short product description..."
            />
          </div>

          <label className="admin-switch">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) =>
                setForm((s) => ({ ...s, is_active: e.target.checked }))
              }
            />
            <span>Active</span>
          </label>

          <div className="admin-form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="admin-form-right">
          <div className="admin-preview">
            <div className="admin-preview-title">Preview</div>
            {img ? (
              <img
                src={img}
                alt="Preview"
                className="admin-preview-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="admin-preview-empty">
                Add an image URL to preview here.
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
