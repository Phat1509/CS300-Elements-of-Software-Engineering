import React, { useState, useEffect } from "react";
import adminApi from "../../utilities/adminApi";

export default function BrandForm({ initial = null, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm({ name: initial.name, description: initial.description || "" });
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial) {
        await adminApi.updateBrand(initial.id, form);
      } else {
        await adminApi.createBrand(form);
      }
      onSaved();
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Tên thương hiệu</label>
        <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
      </div>
      <div className="form-group">
        <label>Mô tả ngắn</label>
        <textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" />
      </div>
      <div style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>Lưu lại</button>
        <button type="button" className="btn btn-outline" onClick={onCancel} style={{ marginLeft: 10 }}>Hủy</button>
      </div>
    </form>
  );
}