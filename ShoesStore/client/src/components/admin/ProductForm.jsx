import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";

const FIXED_COLORS = [
  { label: "Đen", value: "Black" },
  { label: "Trắng", value: "White" },
  { label: "Xám", value: "Grey" },
  { label: "Đỏ", value: "Red" },
  { label: "Xanh dương", value: "Blue" },
  { label: "Vàng", value: "Yellow" },
];

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
  const [selectedColor, setSelectedColor] = useState("");
  const [variantForm, setVariantForm] = useState({
    size: "",
    color: "",
    stock: 0,
  });
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

  const handleVariantChange = (e) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVariant = async () => {
    if (!initial?.id)
      return alert("Vui lòng lưu sản phẩm trước khi thêm biến thể.");

    const { size, color, stock } = variantForm;

    if (!size || !color) return alert("Vui lòng nhập đầy đủ Size và Màu.");

    // Check trùng size + color
    const exists = variants.some((v) => v.size === size && v.color === color);
    if (exists) return alert("Biến thể Size + Màu này đã tồn tại.");

    try {
      const newV = await adminApi.createVariant(initial.id, {
        size,
        color,
        stock: parseInt(stock) || 0,
        sku: `SKU-${initial.id}-${size}-${color}`,
      });

      setVariants((prev) => [...prev, newV]);
      setVariantForm({ size: "", color: "", stock: 0 });
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

        <div
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "15px",
          }}
        >
          <strong>Biến thể (Size & Màu)</strong>

          {/* FORM ADD VARIANT */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "8px",
              marginTop: "10px",
              alignItems: "end",
            }}
          >
            <input
              className="input"
              placeholder="Size (VD: 42, L, XL)"
              name="size"
              value={variantForm.size}
              onChange={handleVariantChange}
            />

            <select
              className="input"
              name="color"
              value={variantForm.color}
              onChange={handleVariantChange}
            >
              <option value="">-- Màu sắc --</option>
              {FIXED_COLORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <input
              className="input"
              type="number"
              min="0"
              name="stock"
              value={variantForm.stock}
              onChange={handleVariantChange}
              placeholder="Tồn kho"
            />

            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleAddVariant}
            >
              + Thêm
            </button>
          </div>

          {/* LIST VARIANTS */}
          <table style={{ width: "100%", fontSize: "13px", marginTop: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                <th>Size</th>
                <th>Màu</th>
                <th>Tồn kho</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.size}</td>
                  <td>{v.color}</td>
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
