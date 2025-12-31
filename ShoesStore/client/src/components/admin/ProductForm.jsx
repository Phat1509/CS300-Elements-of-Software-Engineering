import React, { useState, useEffect } from "react";
import adminApi from "../../ultilities/adminApi";

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
      setForm((f) => ({ ...f, ...initial }));
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
      let result = null;
      const id =
        initial && (initial.product_id || initial.id || initial.productId);
      if (id) {
        result = await adminApi.updateProduct(id, payload);
      } else {
        result = await adminApi.createProduct(payload);
      }
      (onSaved || (() => {}))(result || payload);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <div>
        <label>Name</label>
        <input
          className="form-control"
          value={form.name || ""}
          onChange={change("name")}
          required
        />
      </div>
      <div>
        <label>Price</label>
        <input
          className="form-control"
          type="number"
          step="0.01"
          value={form.price ?? ""}
          onChange={change("price")}
          required
        />
      </div>
      <div>
        <label>Image URL</label>
        <input
          className="form-control"
          value={form.image_url || ""}
          onChange={change("image_url")}
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          className="form-control"
          value={form.description || ""}
          onChange={change("description")}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) =>
              setForm((s) => ({ ...s, is_active: e.target.checked }))
            }
          />{" "}
          Active
        </label>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
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
    </form>
  );
}
