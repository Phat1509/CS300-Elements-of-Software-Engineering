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

  // Load dữ liệu khi mở form Edit
  useEffect(() => {
    if (initial) {
      // Vì ProductsAdmin đã chuẩn hóa dữ liệu thành _name, _price, _image...
      // Nên ta phải map ngược lại vào state của form
      setForm({
        name: initial.name || initial._name || "",
        price: initial.price || initial._price || 0,
        description: initial.description || "",
        // Kiểm tra cả field 'image' và 'image_url' và '_image'
        image_url: initial.image_url || initial.image || initial._image || "",
        // Kiểm tra logic active
        is_active: initial.hasOwnProperty("_active") 
          ? initial._active 
          : (initial.is_active ?? true),
      });
    } else {
      // Reset form khi tạo mới
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
      // 1. Chuẩn bị dữ liệu gửi lên Server (Payload)
      // Backend cần field tên gì thì phải để đúng tên đó (ví dụ: image_url hay image)
      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        image_url: form.image_url, // Nếu DB của bạn tên là 'image' thì sửa dòng này thành image: form.image_url
        is_active: !!form.is_active,
      };

      console.log("Submitting Payload:", payload);

      // 2. Lấy ID chuẩn xác
      // ProductsAdmin đã gán id vào _id, nên ta ưu tiên lấy _id
      const id = initial ? (initial._id || initial.product_id || initial.id) : null;

      console.log("Target ID:", id);

      let result;
      if (id) {
        // --- UPDATE ---
        console.log("Action: UPDATE");
        // Gọi API update
        result = await adminApi.updateProduct(id, payload);
      } else {
        // --- CREATE ---
        console.log("Action: CREATE");
        result = await adminApi.createProduct(payload);
      }

      // 3. Xử lý kết quả để cập nhật UI
      // Nếu API trả về object kết quả thì dùng, nếu không thì dùng payload + id
      const savedData = result && typeof result === 'object' 
        ? result 
        : { ...payload, id: id, product_id: id }; // Fallback

      // Gọi callback để ProductsAdmin cập nhật list
      onSaved(savedData);
      
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
      {/* Cột trái: Input fields */}
      <div className="admin-form-left">
        <div className="form-group">
          <label>Product Name</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Product Name"
          />
        </div>

        <div className="form-row" style={{ display: 'flex', gap: 10 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Price</label>
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
            <label>Status</label>
            <div style={{ marginTop: 8 }}>
              <label className="admin-switch">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <span style={{ marginLeft: 8 }}>
                  {form.is_active ? "Active" : "Hidden"}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            className="input"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
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

      {/* Cột phải: Preview ảnh */}
      <div className="admin-form-right">
        <label>Preview</label>
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
              No Image Preview
            </div>
          )}
        </div>
      </div>
    </form>
  );
}