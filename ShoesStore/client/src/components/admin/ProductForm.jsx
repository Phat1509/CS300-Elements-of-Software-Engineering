import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function ProductForm({ initial = null, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    is_active: true,
    brand_id: "",
    category_id: "",
    discount_percentage: 0,
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getBrands()
      .then((res) => setBrands(Array.isArray(res) ? res : []));
    adminApi
      .getCategories()
      .then((res) => setCategories(Array.isArray(res) ? res : []));

    if (initial) {
      setForm({
        name: initial.name || "",
        price: initial.price || 0,
        description: initial.description || "",
        image_url: initial.image_url || "",
        is_active: initial.is_active ?? true,
        brand_id: initial.brand_id || "",
        category_id: initial.category_id || "",
        discount_percentage: initial.discount_percentage || 0,
      });
      adminApi
        .getVariants(initial.id)
        .then((res) => setVariants(Array.isArray(res) ? res : []));
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddVariant = async () => {
    if (!initial?.id)
      return alert(
        "Vui lòng lưu thông tin cơ bản của sản phẩm trước khi thêm biến thể."
      );
    const size = prompt("Nhập Size (ví dụ: 42, L, XL...):");
    const stock = prompt("Nhập số lượng tồn kho:", "10");
    if (!size) return;

    try {
      const newV = await adminApi.createVariant(initial.id, {
        size,
        stock: parseInt(stock) || 0,
        sku: `SKU-${initial.id}-${Date.now()}`,
        color: null,
      });
      setVariants([...variants, newV]);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeleteVariant = async (vId) => {
    if (!window.confirm("Xóa biến thể này?")) return;
    try {
      await adminApi.deleteVariant(initial.id, vId);
      setVariants(variants.filter((v) => v.id !== vId));
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: generateSlug(form.name),
        price: parseFloat(form.price),
        brand_id: form.brand_id ? parseInt(form.brand_id) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        discount_percentage: parseFloat(form.discount_percentage) || 0,
      };

      const result = initial
        ? await adminApi.updateProduct(initial.id, payload)
        : await adminApi.createProduct(payload);

      onSaved(result);
      alert("Lưu thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form-grid">
      <div className="admin-form-left">
        <div className="form-group">
          <label>Tên sản phẩm</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row" style={{ display: "flex", gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Thương hiệu</label>
            <select
              className="input"
              name="brand_id"
              value={form.brand_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn Brand --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Danh mục</label>
            <select
              className="input"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row" style={{ display: "flex", gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Giá niêm yết ($)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Giảm giá (%)</label>
            <input
              className="input"
              type="number"
              name="discount_percentage"
              value={form.discount_percentage}
              onChange={handleChange}
            />
            {form.discount_percentage > 0 && (
              <div
                style={{ fontSize: "12px", color: "#10b981", marginTop: "4px" }}
              >
                Giá sau giảm: $
                {(form.price * (1 - form.discount_percentage / 100)).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* VARIANTS UI */}
        <div
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <strong>Biến thể (Size & Kho)</strong>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleAddVariant}
            >
              + Thêm Size
            </button>
          </div>
          <table style={{ width: "100%", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                <th>Size</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.size}</td>
                  <td>{v.stock}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      style={{
                        color: "red",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-group" style={{ marginTop: 15 }}>
          <label>Mô tả chi tiết</label>
          <textarea
            className="input"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions" style={{ marginTop: 20 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            style={{ marginLeft: 10 }}
          >
            Hủy
          </button>
        </div>
      </div>

      <div className="admin-form-right">
        <label>URL Hình ảnh</label>
        <input
          className="input"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://..."
        />
        <div
          className="admin-preview-box"
          style={{
            marginTop: 15,
            border: "1px dashed #ccc",
            height: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {form.image_url ? (
            <img
              src={form.image_url}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <span className="muted">Xem trước ảnh</span>
          )}
        </div>
      </div>
    </form>
  );
}
