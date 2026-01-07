import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";

const generateSlug = (text) => {
  return text.toString().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export default function CategoryForm({ initial = null, allCategories = [], onSaved, onCancel }) {
  const [form, setForm] = useState({ 
    name: "", 
    slug: "", 
    parent_id: "" 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({ 
        name: initial.name || "", 
        slug: initial.slug || "", 
        parent_id: initial.parent_id || "" 
      });
    } else {
      setForm({ name: "", slug: "", parent_id: "" });
    }
  }, [initial]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm({ 
      ...form, 
      name: val, 
      slug: generateSlug(val) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parent_id: form.parent_id ? parseInt(form.parent_id) : null
      };

      if (initial) {
        await adminApi.updateCategory(initial.id, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      onSaved();
      alert("Lưu danh mục thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally { 
      setSaving(false); 
    }
  };

  const parentOptions = allCategories.filter(c => initial ? c.id !== initial.id : true);

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>Tên danh mục</label>
        <input 
          className="input" 
          value={form.name} 
          onChange={handleNameChange} 
          required 
          placeholder="Ví dụ: Giày Chạy Bộ, Phụ Kiện..."
        />
      </div>

      <div className="form-group">
        <label>Slug (Tự động sinh)</label>
        <input 
          className="input" 
          value={form.slug} 
          onChange={(e) => setForm({...form, slug: e.target.value})}
          placeholder="giay-chay-bo"
        />
        <small className="muted">Đường dẫn thân thiện cho SEO.</small>
      </div>

      <div className="form-group">
        <label>Danh mục cha (Không bắt buộc)</label>
        <select 
          className="input" 
          value={form.parent_id} 
          onChange={(e) => setForm({...form, parent_id: e.target.value})}
        >
          <option value="">-- Là danh mục gốc --</option>
          {parentOptions.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-actions" style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu danh mục"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} style={{ marginLeft: 10 }}>
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}