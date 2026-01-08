import React, { useState, useEffect, useMemo } from "react";
import adminApi from "../../utilities/adminApi";

const FIXED_COLORS = [
  { label: "Black", value: "Black" },
  { label: "White", value: "White" },
  { label: "Grey", value: "Grey" },
  { label: "Red", value: "Red" },
  { label: "Blue", value: "Blue" },
  { label: "Yellow", value: "Yellow" },
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

  const sortedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const grouping = {};
    categories.forEach((cat) => {
      const pid = cat.parent_id || cat.parentId || "root";
      if (!grouping[pid]) grouping[pid] = [];
      grouping[pid].push(cat);
    });

    const result = [];
    const traverse = (parentId, level) => {
      const list = grouping[parentId] || [];
      list.forEach((cat) => {
        const prefix = level > 0 ? "— ".repeat(level) + " " : "";
        result.push({
          ...cat,
          displayName: prefix + cat.name,
        });
        traverse(cat.id, level + 1);
      });
    };

    if (grouping[null]) traverse(null, 0);
    else if (grouping[0]) traverse(0, 0);
    else if (grouping["root"]) traverse("root", 0); 

    return result.length > 0 ? result : categories;
  }, [categories]);
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
    const { size, color, stock } = variantForm;
    if (!size || !color) return alert("Please provide both Size and Color.");

    const exists = variants.some((v) => v.size === size && v.color === color);
    if (exists) return alert("This Size + Color variant already exists.");

    const newVariant = {
      size,
      color,
      stock: parseInt(stock) || 0,
      id: initial?.id ? null : `temp-${Date.now()}`,
      isTemp: !initial?.id, 
    };

    if (initial?.id) {
      try {
        const apiRes = await adminApi.createVariant(initial.id, {
          ...newVariant,
          sku: `SKU-${initial.id}-${size}-${color}`,
        });
        setVariants((prev) => [...prev, apiRes]);
        setVariantForm({ size: "", color: "", stock: 0 });
      } catch (err) {
        alert("Error: " + err.message);
      }
    } else {
      setVariants((prev) => [...prev, newVariant]);
      setVariantForm({ size: "", color: "", stock: 0 });
    }
  };

  const handleDeleteVariant = async (vId) => {
    if (!window.confirm("Delete this variant?")) return;

    const isTemp = vId.toString().startsWith("temp-");

    if (isTemp) {
      setVariants(variants.filter((v) => v.id !== vId));
    } else {
      try {
        await adminApi.deleteVariant(initial.id, vId);
        setVariants(variants.filter((v) => v.id !== vId));
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (variants.length === 0) {
      alert("Please add at least one Variant (Size & Color) before saving the product.");
      return; 
    }
    if (!form.category_id) {
      alert("Please select a Category.");
      return;
    }
    if (!form.brand_id) {
      alert("Please select a Brand.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: generateSlug(form.name),
        price: parseFloat(form.price), 
        discount_percentage: parseFloat(form.discount_percentage) || 0,
        brand_id: form.brand_id ? parseInt(form.brand_id) : null,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      };

      // 3. Tạo hoặc Update Product
      let productResult;
      if (initial) {
        productResult = await adminApi.updateProduct(initial.id, payload);
      } else {
        productResult = await adminApi.createProduct(payload);
      }

      const productId = productResult.id; 

      const tempVariants = variants.filter(
        (v) => v.isTemp || (typeof v.id === 'string' && v.id.startsWith("temp-"))
      );

      if (tempVariants.length > 0) {
        await Promise.all(
          tempVariants.map((v) => {
            return adminApi.createVariant(productId, {
              size: v.size,
              color: v.color,
              stock: parseInt(v.stock),
              sku: `SKU-${productId}-${v.size}-${v.color}`, // Tạo SKU tự động
            });
          })
        );
      }

      alert("Product & Variants saved successfully!");
      onSaved(productResult); 
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + (err.message || "Bad Request. Check your inputs."));
    } finally {
      setSaving(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="admin-form-grid">
      <div className="admin-form-left">
        <div className="form-group">
          <label>Product Name</label>
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
            <label>Brand</label>
            <select
              className="input"
              name="brand_id"
              value={form.brand_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Brand --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Category</label>
            <select
              className="input"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {sortedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row" style={{ display: "flex", gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Price ($)</label>
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
            <label>Discount (%)</label>
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
                Price after discount: $
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
          <strong>Variants (Size & Color)</strong>

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
              placeholder="Size (e.g., 42, L, XL)"
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
              <option value="">-- Color --</option>
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
              placeholder="Stock"
            />

            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleAddVariant}
            >
              + Add
            </button>
          </div>

          {/* LIST VARIANTS */}
          <table style={{ width: "100%", fontSize: "13px", marginTop: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
                <th>Size</th>
                <th>Color</th>
                <th>Stock</th>
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
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-group" style={{ marginTop: 15 }}>
          <label>Description</label>
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
            {saving ? "Saving..." : "Save Product"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            style={{ marginLeft: 10 }}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="admin-form-right">
        <label>Image URL</label>
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
            <span className="muted">Image preview</span>
          )}
        </div>
      </div>
    </form>
  );
}
