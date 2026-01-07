// client/src/components/admin/ProductForm.jsx
import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";

// Hàm hỗ trợ tạo slug từ tên sản phẩm (VD: "Giày Nike" -> "giay-nike")
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/\s+/g, "-")           // Thay khoảng trắng bằng -
    .replace(/[^\w-]+/g, "")        // Xóa ký tự đặc biệt
    .replace(/--+/g, "-")           // Xóa dấu gạch ngang dư thừa
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
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        price: initial.price || 0,
        description: initial.description || "",
        image_url: initial.image_url || "",
        is_active: initial.is_active ?? true,
      });
    } else {
      setForm({
        name: "",
        price: "",
        description: "",
        image_url: "",
        is_active: true,
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Chuẩn bị payload khớp với Rust struct
      const payload = {
        name: form.name,
        // Backend bắt buộc có slug khi tạo mới.
        // Nếu update thì slug là optional (theo ProductUpdateParams), nhưng gửi luôn cũng không sao.
        slug: generateSlug(form.name), 
        price: parseFloat(form.price), // Rust f64 cần số
        description: form.description || null, // Option<String>
        image_url: form.image_url || null,     // Option<String>
        is_active: !!form.is_active,
        // Tạm thời để null vì chưa làm UI chọn brand/category
        brand_id: null,
        category_id: null,
        discount_percentage: null
      };

      console.log("Submitting Payload:", payload);

      const id = initial ? initial.id : null;
      let result;

      if (id) {
        // UPDATE
        // Với update, backend Rust dùng Option<Option<T>>, gửi như trên vẫn ok
        result = await adminApi.updateProduct(id, payload);
      } else {
        // CREATE
        result = await adminApi.createProduct(payload);
      }

      // Backend trả về object Model trực tiếp
      onSaved(result);
      alert("Đã lưu thành công!");

    } catch (err) {
      console.error("Save failed:", err);
      alert("Lỗi khi lưu: " + err.message);
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
            placeholder="Nhập tên sản phẩm..."
          />
        </div>

        <div className="form-row" style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Giá (VNĐ)</label>
            <input
              className="input"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Trạng thái</label>
            <div style={{ marginTop: 8 }}>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: 8 }}>
                  {form.is_active ? "Đang bán" : "Ẩn"}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Link ảnh (URL)</label>
          <input
            className="input"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label>Mô tả chi tiết</label>
          <textarea
            className="input"
            name="description"
            rows="4"
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
            Hủy bỏ
          </button>
        </div>
      </div>

      <div className="admin-form-right">
        <label>Xem trước ảnh</label>
        <div className="admin-preview-box">
          {form.image_url ? (
            <img 
              src={form.image_url} 
              alt="Preview" 
              onError={(e) => e.target.style.display='none'} 
              style={{ maxWidth: '100%', borderRadius: 4 }}
            />
          ) : (
            <div className="muted" style={{ padding: 20, textAlign: 'center' }}>
              Chưa có ảnh
            </div>
          )}
        </div>
      </div>
    </form>
  );
}